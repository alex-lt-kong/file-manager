#!/usr/bin/python3

from flask import Flask, render_template, Response, request, redirect, url_for
from flask_cors import CORS
from flask import request
from PIL import Image, ImageFile
from waitress import serve

import click
import flask
import json
import logging
import os
import shutil
import signal
import subprocess
import sys
import threading

import werkzeug

import importlib.machinery
loader = importlib.machinery.SourceFileLoader('emailer',
                                              '/root/bin/emailer/emailer.py')
emailer = loader.load_module()

app = Flask(__name__)
ImageFile.LOAD_TRUNCATED_IMAGES = True
thread_lock = threading.Lock()

CORS(app)
# This necessary for javascript to access a telemetry link without opening it:
# https://stackoverflow.com/questions/22181384/javascript-no-access-control-allow-origin-header-is-present-on-the-requested

allowed_ext = None
# app_address: the app's address on the Internet
app_address = ''
# app_dir: the app's real address on the filesystem
app_dir = os.path.dirname(os.path.realpath(__file__))
app_name = 'file-manager'
external_script_dir = ''
image_extensions = None
log_path = f'/var/log/mamsds/{app_name}.log'
root_dir = ''
stop_signal = False
settings_path = os.path.join(app_dir, 'settings.json')
thumbnails_path = ''
thread_counter = 0
video_extensions = None


@app.route('/create-folder/', methods=['POST'])
def create_folder():

    if 'asset_dir' not in request.form or 'folder_name' not in request.form:
        return Response('asset_dir or not folder_name specified', 400)
    asset_dir = request.form['asset_dir']
    folder_name = request.form['folder_name']

    try:
        folder_path = flask.safe_join(root_dir, asset_dir[1:], folder_name)
    except werkzeug.exceptions.NotFound:
        return Response('Potential chroot escape', 400)

    if (os.path.isfile(folder_path) or os.path.isdir(folder_path) or
            os.path.islink(folder_path) or os.path.ismount(folder_path)):
        return Response('Folder name occupied', 400)

    try:
        os.mkdir(folder_path)
    except Exception:
        logging.exception('')
        return Response('Internal error', 500)

    return Response('Folder created', 200)


@app.route('/upload/', methods=['POST'])
def upload():

    if 'asset_dir' not in request.form:
        return Response('asset_dir not specified', 400)

    if 'selected_files' not in request.files:
        return Response('No files are received', 400)
    if request.files['selected_files'] is None:
        return Response('No files are received', 400)

    asset_dir = request.form['asset_dir']
    selected_files = flask.request.files.getlist("selected_files")
    for selected_file in selected_files:
        basename, ext = os.path.splitext(selected_file.filename)
        if (ext.lower() not in allowed_ext):
            return Response(f'{ext} is not among the allowed extensions: '
                            f'{allowed_ext}', 400)

        try:
            filepath = flask.safe_join(root_dir, asset_dir[1:],
                                       selected_file.filename)
        except werkzeug.exceptions.NotFound:
            return Response('Potential chroot escape', 400)
        # safe_join can prevent base directory escaping
        # [1:] is used to get ride of the initial /

        selected_file.seek(0)
        # seek(0) means to go back to the start of the file.
        # but I am not quite sure why we are not at the start before seeking...
        selected_file.save(filepath)

    return Response('Upload done', 200)


@app.route('/move/', methods=['POST'])
def move():

    if ('old_filepath' not in request.form or
            'new_filepath' not in request.form):
        return Response('old_filepath or new_filepath not specified', 400)

    try:
        old_filepath = request.form['old_filepath']
        new_filepath = request.form['new_filepath']
        old_real_filepath = flask.safe_join(root_dir, old_filepath[1:])
        new_real_filepath = flask.safe_join(root_dir, new_filepath[1:])
        # safe_join can prevent base directory escaping
        # [1:] is used to get ride of the initial /:
        # On the client side, old_filepath/new_filepath are considered real
        # path, so they have to start with a slash. However, when we need
        # to convert them into real_filepath on the server, a preceding slash
        # will make flask think that it is an escape attempt and raise a
        # NotFound exception.
        if os.path.ismount(old_real_filepath):
            return Response(
                (f'{old_filepath} is a mountpoint.The move of mountpoint is '
                 'disabled to prevent accidental massive data loss'), 400)
        if (os.path.isfile(old_real_filepath) is False and
                os.path.isdir(old_real_filepath) is False):
            raise Response(f'{old_filepath} not found', 400)
        if (os.path.isfile(new_real_filepath) or
                os.path.isdir(new_real_filepath)):
            raise Response(f'{new_filepath} occupied by an existing file', 400)

        shutil.move(src=old_real_filepath, dst=new_real_filepath)
        # If the destination is on the current filesystem, then os.rename()
        # is used. Otherwise, src is copied to dst and then removed. In case
        # of symlinks, a new symlink pointing to the target of src will be
        # created in or as dst and src will be removed.
        logging.debug('File moved from'
                      f'[{old_real_filepath}] to [{new_real_filepath}]')
    except (FileNotFoundError, FileExistsError, PermissionError,
            werkzeug.exceptions.NotFound):
        logging.exception('')
        return Response('Client-side error', 400)
    except Exception:
        logging.exception('')
        return Response('Internal Error', 500)

    return Response('success', 200)


@app.route('/remove/', methods=['POST'])
def remove():

    if ('filepath' not in request.form):
        return Response('filepath not specified', 400)
    filepath = request.form['filepath']

    try:
        real_filepath = flask.safe_join(root_dir, filepath[1:])
        # safe_join can prevent base directory escaping
        # [1:] is used to get ride of the initial /:
        # On the client side, filepath is considered real path, so it has
        # to start with a slash. However, when we need to convert it into
        # real_filepath on the server, a preceding slash will make flask
        # think that it is an escape attempt and raise a NotFound exception.

        if os.path.ismount(real_filepath):
            return Response(
                (f'{filepath} is a mountpoint.The removal of mountpoint is '
                 'disabled to prevent accidental massive data loss'), 400)
            logging.info(f'Mountpoint [{real_filepath}] NOT removed')
        elif os.path.islink(real_filepath):
            os.unlink(real_filepath)
            logging.debug(f'Symlink removed: [{real_filepath}]')
        elif os.path.isfile(real_filepath):
            os.remove(real_filepath)
            logging.debug(f'File removed: [{real_filepath}]')
        elif os.path.isdir(real_filepath):
            shutil.rmtree(real_filepath)
            logging.debug(f'Directory removed: [{real_filepath}]')
        else:
            return Response(f'{filepath} does not exist or'
                            'cannot be handled by the server', 400)

    except (FileNotFoundError, PermissionError, werkzeug.exceptions.NotFound):
        logging.exception('')
        return Response('Client-side error', 400)
    except Exception:
        logging.exception('')
        return Response('Internal Error', 500)

    return Response('success', 200)


def convert_video_format(input_path: str, output_path: str,
                         crf: int, resolution: int):

    ffmpeg_cmd = ['/usr/bin/ffmpeg', '-y',  # -y: overwrite output file
                  '-i', input_path, '-vf', f'scale={resolution}:-1',
                  '-map', '0:v',
                  '-map', '0:a?',
                  # -map 0:a: ffmpeg will keep all the audio streams, the
                  # trailing ? means ffmpeg will ignore this option if there
                  # are no audio streams, otherwise ffmpeg will complaint
                  # and quit
                  # https://trac.ffmpeg.org/wiki/Map#Examples
                  '-c:v', 'libvpx-vp9', '-c:a', 'libopus',
                  # use libvpx-vp9 video encoder and libopus audio codec
                  # for whatever reason the terms for them are different...
                  '-crf', str(crf), '-b:v', '0',
                  # to use crf to control a video's compression level,
                  # you must use a combination of -crf and -b:v 0.
                  # Note that -b:v MUST be 0.
                  # Also note that in ffmpeg, crf could be interpreted
                  # differently among different video encoders.
                  '-max_muxing_queue_size', '8192',
                  # the 'max_muxing_queue_size' parameter can be used to
                  # solve the error of
                  # 'Too many packets buffered for output stream'
                  '-threads', '2',
                  output_path]
    # According to this link: https://trac.ffmpeg.org/wiki/Encode/VP9 , VP9
    # supports a so-called two-pass mode. But according to the following link:
    # https://superuser.com/questions/1362800/ffmpeg-2-pass-encoding
    # specifying a CRF value is usually good enough

    p = subprocess.Popen(args=ffmpeg_cmd,
                         stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output, error = p.communicate()
    # communicate() returns a tuple (stdout_data, stderr_data).
    # The data will be strings if streams were opened in text mode;
    # otherwise, bytes.
    # To get anything other than None in the result tuple,
    # you need to give stdout=PIPE and/or stderr=PIPE.
    output_log_path = output_path + '.txt'

    # if p.returncode != 0:
    # Seems that ffmpeg's exit code canNOT be used to reliably check
    # if the conversion is a failure. So let's just output all the log!
    with open(output_log_path, 'w+') as f:
        f.write(f'===== return_code =====\n{p.returncode}\n\n\n')
        f.write(f'===== std_output =====\n{output.decode("utf-8")}\n\n\n')
        f.write(f'===== std_err =====\n{error.decode("utf-8")}')


@app.route('/video-transcode/', methods=['POST'])
def video_transcode():

    if ('asset_dir' not in request.form or 'video_name' not in request.form or
            'crf' not in request.form):
        return Response('asset_dir, video_name, crf or resolution is missing',
                        400)

    try:
        asset_dir = request.form['asset_dir']
        video_name = request.form['video_name']
        crf = int(request.form['crf'])
        res = int(request.form['resolution'])

        if crf < 0 or crf > 63:
            raise ValueError(f'Invalid crf value {crf}', 400)
        if res < 144 or res > 1080:
            res = -1
        # Why the treatments of crf and res are different?
        # For crf, we have to pass a positive integer to ffmpeg and there
        # isn't a universal default value for all resolutions
        # For resolution, however, we can simply pass -1 to ffmpeg, meaning
        # that we keep the original resolution of the video.

        abs_path, asset_dir = get_absolute_path(asset_dir)

        video_path = flask.safe_join(abs_path, video_name)
        if os.path.isfile(video_path) is False:
            raise FileNotFoundError(f'video {video_name} not found')
        if res == -1:
            output_path = video_path + f'_crf{crf}.webm'
        else:
            output_path = video_path + f'_{res}p_crf{crf}.webm'
        if os.path.isfile(output_path) or os.path.isdir(output_path):
            raise FileExistsError('target video name occupied')
        threading.Thread(target=convert_video_format,
                         args=(video_path, output_path, crf, res)).start()

    except (FileExistsError, FileNotFoundError, ValueError):
        logging.exception('')
        return Response('Client-side error', 400)
    except Exception:
        logging.exception('')
        return Response('Internal error', 500)

    return Response('success', 200)


@app.route('/play-video/', methods=['GET'])
def play_video():

    if 'asset_dir' not in request.args or 'video_name' not in request.args:
        return Response('Parameters asset_dir or video_name not specified',
                        400)
    asset_dir = request.args.get('asset_dir')
    video_name = request.args.get('video_name')

    tricky_paras = werkzeug.url_encode({'asset_dir': asset_dir,
                                        'filename': video_name})
    # you need this URL encoding to handle some tricky characters...
    return render_template(
        'playback.html',
        video_url=f'{app_address}/download/?{tricky_paras}&as_attachment=0',
        subtitles_url=f'{app_address}/download/?{tricky_paras}.vtt')


@app.route('/get-thumbnail/', methods=['GET'])
def get_thumbnail():

    if 'filename' not in request.args:
        return Response('Parameter filename not specified', 400)

    filename = request.args.get('filename')
    return flask.send_from_directory(directory=thumbnails_path,
                                     filename=filename,
                                     as_attachment=False,
                                     attachment_filename=filename)


@app.route('/download/', methods=['GET'])
def download():

    if 'asset_dir' not in request.args or 'filename' not in request.args:
        return Response('Parameters asset_dir or filename not specified', 400)
    asset_dir = request.args.get('asset_dir')
    filename = request.args.get('filename')

    if 'as_attachment' in request.args:
        as_attachment = bool(request.args.get('as_attachment'))
    else:
        as_attachment = True

    try:
        file_dir = flask.safe_join(root_dir, asset_dir[1:])
        # safe_join can prevent base directory escaping
        # [1:] is used to get ride of the initial /:
        # otherwise safe_join will consider it a chroot escape attempt
    except werkzeug.exceptions.NotFound:
        logging.exception(f'Parameters are {root_dir}, {asset_dir}')
        return Response('Potential chroot escape', 400)

    return flask.send_from_directory(directory=file_dir, filename=filename,
                                     as_attachment=as_attachment,
                                     attachment_filename=filename,
                                     conditional=True)
# conditional=True allows the sending of partial content
# That is, allowing users to seek an html5 video.)


def get_absolute_path(asset_dir: str):

    if asset_dir is None:
        asset_dir = ''

    if len(asset_dir) > 0 and asset_dir[0] == '/':
        # This removal is necessary: The idea is that, on the client side,
        # we treat asset_dir as real root, so it should start with a slash.
        # However, on the server side, we try to get the abs_path, i.e., the
        # real path of file on the server using os.path.join(). We have to
        # remove the preceding "/" from asset_dir to make it work.
        asset_dir = asset_dir[1:]

    abs_path = flask.safe_join(root_dir, asset_dir)
    abs_path = os.path.realpath(abs_path)
    asset_dir = abs_path[len(root_dir):]

    if asset_dir.endswith('/') is False:
        # We should add the / back!
        # This parameter will be returned to client!
        asset_dir += '/'
    if os.path.isdir(abs_path) is False:
        raise FileNotFoundError(f'Path [{asset_dir}] does not exist')

    if os.path.commonprefix([abs_path, root_dir]) != root_dir:
        # os.path.realpath(): Return the canonical path of the specified
        # filename, eliminating any symbolic links encountered in the path.
        # also tested myself, if you input "/tmp/../" the method will return
        # "/"
        raise PermissionError(f'[{asset_dir}] tries to do chroot escape!')

    return abs_path, asset_dir


def generate_file_list_json(abs_path: str, asset_dir: str):

    # file_type == 0: ordinary directory
    # file_type == 1: ordinary file
    # file_type == 2: others

    # media_type == -1: not an ordinary file
    # media_type == 0: not a media file
    # media_type == 1: image
    # media_type == 2: video
    file_info = {}
    file_info['metadata'] = {}
    file_info['metadata']['asset_dir'] = asset_dir
    file_info['content'] = {}

    if asset_dir != '/':
        file_info['content']['..'] = {}
        file_info['content']['..']['file_type'] = 0
        file_info['content']['..']['media_type'] = -1
        file_info['content']['..']['extension'] = ''

    scanner = os.scandir(abs_path)
    for entry in scanner:
        fn = entry.name
        file_info['content'][fn] = {}
        file_info['content'][fn]['filename'] = fn
        # Repeat the name here so that we can just pass an
        # file_info['content'][fn] object.
        file_info['content'][fn]['file_type'] = 2
        file_info['content'][fn]['asset_dir'] = asset_dir
        file_info['content'][fn]['media_type'] = -1
        file_info['content'][fn]['extension'] = ''
        if entry.is_file():
            file_info['content'][fn]['file_type'] = 1
            basename, ext = os.path.splitext(entry.name)
            file_info['content'][fn]['basename'] = basename
            file_info['content'][fn]['extension'] = ext
            file_path = flask.safe_join(abs_path, fn)
            if file_path is None:
                # implies chroot escape attempt!
                raise PermissionError('chroot escape attempt detected???')
            file_info['content'][fn]['size'] = os.path.getsize(file_path)
            if ext.lower() in video_extensions:
                file_info['content'][fn]['media_type'] = 2
            elif ext.lower() in image_extensions:
                file_info['content'][fn]['media_type'] = 1
            else:
                file_info['content'][fn]['media_type'] = 0
        elif entry.is_dir():
            file_info['content'][fn]['file_type'] = 0
    scanner.close()

    return file_info


@app.route('/get-file-list/', methods=['GET'])
def get_file_list():

    if 'asset_dir' not in request.args:
        return Response('parameter [asset_dir] not specified', 400)
    try:
        abs_path, asset_dir = get_absolute_path(request.args.get('asset_dir'))
        file_info = generate_file_list_json(abs_path, asset_dir)
    except (FileNotFoundError, PermissionError) as e:
        return Response(f'Error: {e}', 400)
    except Exception as e:
        return Response(f'Internal Error: {e}', 500)

    return flask.jsonify(file_info)


@app.route('/', methods=['GET', 'POST'])
def index():

    return render_template('index.html')


def stop_signal_handler(*args):

    global stop_signal
    stop_signal = True
    logging.info(f'Signal [{args[0]}] received, exiting')
    sys.exit(0)


@click.command()
@click.option('--debug', is_flag=True)
def main(debug):

    port = -1
    global allowed_ext, app_address, root_dir, thumbnails_path
    global external_script_dir, log_path
    global image_extensions, video_extensions

    try:
        with open(settings_path, 'r') as json_file:
            json_str = json_file.read()
            data = json.loads(json_str)
        port = data['flask']['port']
        allowed_ext = data['app']['allowed_ext']
        app_address = data['app']['address']
        external_script_dir = data['app']['external_script_dir']
        image_extensions = data['app']['image_extensions']
        root_dir = data['app']['root_dir']
        thumbnails_path = data['app']['thumbnails_path']
        log_path = data['app']['log_path']
        video_extensions = data['app']['video_extensions']
    except Exception as e:
        data = None
        print(f'{e}')
        return

    logging.basicConfig(
        filename=log_path,
        level=logging.DEBUG if debug else logging.INFO,
        format=('%(asctime)s %(levelname)s '
                '%(module)s-%(funcName)s: %(message)s'),
        datefmt='%Y-%m-%d %H:%M:%S',
    )
    logging.info(f'{app_name} started')

    if debug:
        print('Running in debug mode')
        logging.info('Running in debug mode')
    else:
        logging.info('Running in production mode')

    signal.signal(signal.SIGINT, stop_signal_handler)
    signal.signal(signal.SIGTERM, stop_signal_handler)

    th_email = threading.Thread(target=emailer.send_service_start_notification,
                                kwargs={'settings_path': settings_path,
                                        'service_name': f'{app_name}',
                                        'log_path': log_path,
                                        'delay': 0 if debug else 300})
    th_email.start()

    serve(app, host="127.0.0.1", port=port)


if __name__ == '__main__':

    main()
