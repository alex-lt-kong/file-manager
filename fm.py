#!/usr/bin/python3

from flask import Flask, render_template, Response, request, redirect, url_for
from flask_cors import CORS
from flask import request
from PIL import Image, ImageFile
from waitress import serve

import argparse
import base64
import datetime
import flask
import json
import logging
import math
import mimetypes
import os
import re
import signal
import smtplib
import socket
import subprocess
import sys
import threading
import time
import urllib

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


@app.route('/rename/', methods=['POST'])
def rename():

    if ('asset_dir' not in request.form or 'oldname' not in request.form or
            'newname' not in request.form):
        return Response('asset_dir, old_filepath or new_filepath is missing',
                        400)

    try:
        asset_dir = request.form['asset_dir']
        oldname = request.form['oldname']
        newname = request.form['newname']
        abs_path, asset_dir = get_absolute_path(asset_dir)
        old_filepath = flask.safe_join(abs_path, oldname)
        new_filepath = flask.safe_join(abs_path, newname)
        print(newname)
        # safe_join can prevent base directory escaping

        if (os.path.isfile(old_filepath) is False and
                os.path.isdir(old_filepath) is False):
            raise FileNotFoundError('old filename not found')
        if os.path.isfile(new_filepath) or os.path.isdir(new_filepath):
            raise FileExistsError('new filename occupied by an existing file')

        os.rename(old_filepath, new_filepath)
        logging.info('File/Dir renamed from'
                     f'[{old_filepath}] to [{new_filepath}]')
    except (FileNotFoundError, FileExistsError, PermissionError) as e:
        return Response(f'Error: {e}', 400)
    except Exception as e:
        logging.error(f'{e}')
        return Response(f'Internal Error: {e}', 500)

    return Response('success', 200)


@app.route('/rm/', methods=['GET', 'POST'])
def rm():

    asset_dir = request.args.get('asset_dir')
    video_name = request.args.get('video_name')

    try:
        abs_path, asset_dir = get_absolute_path(asset_dir)

        file_path = os.path.join(abs_path, video_name)

        if ('/' in video_name or
            os.path.commonprefix([os.path.realpath(file_path), root_dir]) != root_dir):
            return Response('value error (file_path)', 400)

        if os.path.isfile(file_path):
            os.remove(file_path)
            logging.info(f'File removed: [{file_path}]')
        elif os.path.isdir(file_path):
            os.rmdir(file_path)
            logging.info(f'Dir removed: [{file_path}]')
        else:
            return Response('File/Dir does not exist!', 400)

    except Exception as e:
        logging.error("{}".format(sys.exc_info()))
        return Response(f'Internal Error: {e}', 500)

    return Response('success', 200)


def scale_video_resolution(input_path: str, resolution: int):

    extension = os.path.splitext(input_path)[1]
    output_path = input_path[:-1 * len(extension)] + '_{}p{}'.format(resolution, extension)
    output_log_path = input_path + '.log'
    ffmpeg_cmd = [
            '/usr/bin/ffmpeg',
            '-y',
            '-i', input_path,
            '-filter:v', 'scale={}:-1'.format(resolution),
            '-c:a', 'copy',
            '-crf', '23',
            '-threads', '2',
            output_path]
    p = subprocess.Popen(ffmpeg_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    # the 'max_muxing_queue_size' parameter can be used to solve the error of 'Too many packets buffered for output stream'
    output, error = p.communicate()
    if p.returncode != 0:
        with open(output_log_path, 'w+') as f:
            f.write('return_code: {}\n\n'.format(p.returncode))
            f.write('std_output:\n{}\n\n'.format(output.decode("utf-8")))
            f.write('std_err:\n{}\n\n'.format(error.decode("utf-8")))


@app.route('/scale/', methods=['GET', 'POST'])
def scale():

    asset_dir = request.args.get('asset_dir')
    video_name = request.args.get('video_name')
    resolution = request.args.get('resolution')

    try:

        resolution = int(resolution)
        abs_path, asset_dir = get_absolute_path(asset_dir)

        video_path = os.path.join(abs_path, video_name)

        if ('/' in video_name or
            os.path.commonprefix([os.path.realpath(video_path), root_dir]) != root_dir or
            os.path.isfile(video_path) == False):
            return Response('value error (video_path)', 400)
        threading.Thread(target=scale_video_resolution, args=(video_path, resolution)).start()

    except Exception as e:
        logging.error("{}".format(sys.exc_info()))
        return Response(f'Internal Error: {e}', 500)

    return Response('success', 200)

def convert_video_format(input_path: str, output_path: str, crf: int):


    ffmpeg_cmd = ['/usr/bin/ffmpeg',
            '-y',
            '-i', input_path,
            '-map', '0:v', '-map', '0:a', '-c:v', 'libvpx-vp9',
            '-crf', str(crf),
            '-b:v', '0',
            '-max_muxing_queue_size', '8192', # the 'max_muxing_queue_size' parameter can be used to solve the error of 'Too many packets buffered for output stream'
            '-threads', '2',
            output_path]
    p = subprocess.Popen(ffmpeg_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    output, error = p.communicate()
    output_log_path = output_path + '.log'
    if p.returncode != 0:
        with open(output_log_path, 'w+') as f:
            f.write('return_code: {}\n\n'.format(p.returncode))
            f.write('std_output:\n{}\n\n'.format(output.decode("utf-8")))
            f.write('std_err:\n{}\n\n'.format(error.decode("utf-8")))


@app.route('/video-transcode/', methods=['POST'])
def video_transcode():

    if ('asset_dir' not in request.form or 'video_name' not in request.form or
            'crf' not in request.form):
        return Response('asset_dir, video_name or crf is missing', 400)

    try:
        asset_dir = request.form['asset_dir']
        video_name = request.form['video_name']
        crf = request.form['crf']

        crf = int(crf)
        if crf < 0 or crf > 63:
            raise ValueError(f'Invalid crf value {crf}', 400)

        abs_path, asset_dir = get_absolute_path(asset_dir)

        video_path = flask.safe_join(abs_path, video_name)
        if os.path.isfile(video_path) is False:
            raise FileNotFoundError(f'video {video_name} not found')
        output_path = video_path + f'_crf{crf}.webm'
        if os.path.isfile(output_path) or os.path.isdir(output_path):
            raise FileExistsError('target video name occupied')
        threading.Thread(target=convert_video_format,
                         args=(video_path, output_path, crf)).start()

    except (FileExistsError, FileNotFoundError, ValueError) as e:
        return Response(f'Error: {e}', 400)
    except Exception as e:
        logging.error(f'{e}')
        return Response(f'Internal Error: {e}', 500)

    return Response('success', 200)


@app.route('/image_list/', methods=['GET', 'POST'])
def image_list():
    return


@app.route('/play-video/', methods=['GET'])
def play_video():

    if 'asset_dir' not in request.args or 'video_name' not in request.args:
        return Response('Parameters asset_dir or video_name not specified',
                        400)
    asset_dir = request.args.get('asset_dir')
    video_name = request.args.get('video_name')

    return render_template('playback.html',
                           video_url=f'https://media.sz.lan/download/?asset_dir={asset_dir}&filename={video_name}&as_attachment=0',
                           subtitles_url=f'https://media.sz.lan/download/?asset_dir={asset_dir}&filename={video_name}.vtt')


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
        abs_path, asset_dir = get_absolute_path(asset_dir)
    except (FileNotFoundError, PermissionError) as e:
        return Response(f'Error: {e}', 400)

    return flask.send_from_directory(directory=abs_path, filename=filename,
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


def generate_thumbnail(abs_path, file_list, filesize_list):

    for i in range(len(file_list)):

        file_name = file_list[i]
        file_input_path = os.path.join(abs_path, file_name)
        img_output_path = os.path.join(thumbnails_path, file_name) + '.jpg'
        video_size = filesize_list[i]
        extension = os.path.splitext(file_input_path)[1]

        if os.path.isfile(img_output_path):
            logging.debug('Thumbnail for [{}] exists'.format(file_input_path))
            continue

        if extension.lower() in video_extensions:
            logging.info(f'Generating thumbnail for video [{file_name}]')
            if video_size < 1024 * 1024 * 10:
                timestamp = '00:00:10.000'
            elif video_size < 1024 * 1024 * 50:
                timestamp = '00:00:30.000'
            elif video_size < 1024 * 1024 * 100:
                timestamp = '00:01:30.000'
            else:
                timestamp = '00:01:50.000'
            time.sleep(video_size / 1024 / 1024 / 100)
            subprocess.call(['/usr/bin/ffmpeg', '-i', file_input_path, '-loglevel', 'fatal', '-ss', timestamp, '-vframes', '1', img_output_path])

            if os.path.isfile(img_output_path):
                try:
                    basewidth = 320
                    img = Image.open(img_output_path)
                    wpercent = (basewidth/float(img.size[0]))
                    hsize = int((float(img.size[1])*float(wpercent)))
                    img = img.resize((basewidth,hsize), Image.ANTIALIAS)
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")
                    img.save(img_output_path)
                except:
                    logging.error("{}".format(sys.exc_info()))
        if extension.lower() in image_extensions:
            try:
                logging.info(f'Generating thumbnail for image [{file_name}]')
                basewidth = 640
                img = Image.open(file_input_path)
                wpercent = (basewidth/float(img.size[0]))
                hsize = int((float(img.size[1])*float(wpercent)))
                img = img.resize((basewidth,hsize), Image.ANTIALIAS)
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                img.save(img_output_path)
            except Exception as e:
                logging.error(f"{e}")


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

    if 'page' in request.args:
        if request.args['page'] == 'new':
            return render_template('index.html')

    try:
        abs_path, asset_dir = get_absolute_path(request.args.get('asset_dir'))

        file_list = []
        filesize_list = []
        video_list = []
        videosize_list = []
        image_list = []
        imagesize_list = []
        dir_list = []

        scanner = os.scandir(abs_path)
        for entry in scanner:
            if entry.is_file():
                extension = os.path.splitext(entry.name)[1]
                if extension.lower() in video_extensions:
                    video_list.append(entry.name)
                elif extension.lower() in image_extensions:
                    image_list.append(entry.name)
                else:
                    file_list.append(entry.name)
            elif entry.is_dir():
                dir_list.append(entry.name)
        scanner.close()

        video_list.sort()
        image_list.sort()
        file_list.sort()
        dir_list.sort()

        for videopath in video_list:
            videosize_list.append(int(os.path.getsize(os.path.join(abs_path, videopath)) / 1024 / 1024))
        for imagepath in image_list:
            imagesize_list.append(int(os.path.getsize(os.path.join(abs_path, imagepath)) / 1024))
        for filepath in file_list:
            filesize_list.append(int(os.path.getsize(os.path.join(abs_path, filepath)) / 1024 / 1024))

        threading.Thread(target=generate_thumbnail, args=(abs_path, video_list, videosize_list)).start()
        threading.Thread(target=generate_thumbnail, args=(abs_path, image_list, imagesize_list)).start()

        return render_template('manager.html',
                asset_dir = asset_dir,
                video_list = video_list, videosize_list = videosize_list,
                image_list = image_list, imagesize_list = imagesize_list,
                file_list = file_list, filesize_list = filesize_list,
                dir_list = dir_list)
    except FileNotFoundError as e:
        return Response(f'Error: {e}', 400)
    except Exception as e:
        logging.error("{}".format(sys.exc_info()))
        return Response(f'Internal Error: {e}', 500)


def cleanup(*args):

    global stop_signal
    stop_signal = True
    logging.info('Stop signal received, exiting')
    sys.exit(0)


def main():

    ap = argparse.ArgumentParser()
    ap.add_argument('--debug', dest='debug', action='store_true')
    args = vars(ap.parse_args())
    debug_mode = args['debug']

    port = -1
    global app_address, root_dir, thumbnails_path
    global external_script_dir, log_path
    global image_extensions, video_extensions

    try:
        with open(settings_path, 'r') as json_file:
            json_str = json_file.read()
            data = json.loads(json_str)
        port = data['flask']['port']
        external_script_dir = data['app']['external_script_dir']
        image_extensions = data['app']['image_extensions']
        root_dir = data['app']['root_dir']
        thumbnails_path = data['app']['thumbnails_path']
        log_path = data['app']['log_path']
        video_extensions = data['app']['video_extensions']
        logging.debug(f'data: {data}')
    except Exception as e:
        data = None
        print(f'{e}')
        return

    logging.basicConfig(
        filename=log_path,
        level=logging.DEBUG if debug_mode else logging.INFO,
        format=('%(asctime)s %(levelname)s '
                '%(module)s-%(funcName)s: %(message)s'),
        datefmt='%Y-%m-%d %H:%M:%S',
    )
    logging.info(f'{app_name} started')

    if debug_mode is True:
        print('Running in debug mode')
        logging.info('Running in debug mode')
    else:
        logging.info('Running in production mode')

    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    th_email = threading.Thread(target=emailer.send_service_start_notification,
                                kwargs={'settings_path': settings_path,
                                        'service_name': f'{app_name}',
                                        'log_path': log_path,
                                        'delay': 0 if debug_mode else 300})
    th_email.start()

    serve(app, host="127.0.0.1", port=port)


if __name__ == '__main__':

    main()
