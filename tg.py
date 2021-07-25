#!/usr/bin/python3

from PIL import Image, ImageFile

import click
import datetime as dt
import glob
import json
import logging
import os
import subprocess
import time


ImageFile.LOAD_TRUNCATED_IMAGES = True
# It is said to be used to solve the issue OSError: image file is truncated
# https://stackoverflow.com/questions/12984426/python-pil-ioerror-image-file-truncated-with-big-images

# app_dir: the app's real address on the filesystem
app_dir = os.path.dirname(os.path.realpath(__file__))
app_name = 'file-manager-thumbnail-generator'
debug_mode = False
image_extensions = None
settings_path = os.path.join(app_dir, 'settings.json')
thumbnails_path = ''
video_extensions = None


def get_dir_size(path: str, rotate_diff=3600*24*90):

    logging.info(f'Getting size of {path}, ' + '' if rotate_diff is None
                 else 'files older than '
                 f'{rotate_diff / 3600 / 24:.1f} days will be removed')
    total_size, files_count = 0, 0
    for dirpath, dirnames, filenames in os.walk(path):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            # skip if it is symbolic link
            if not os.path.islink(fp):
                total_size += os.path.getsize(fp)
                files_count += 1

            ctime = os.path.getctime(fp)
            diff = dt.datetime.now().timestamp() - ctime
            if rotate_diff is not None and diff >= rotate_diff:
                if os.path.islink(fp):
                    os.unlink(fp)
                elif os.path.isfile(fp):
                    os.remove(fp)
                logging.info(f'File [{fp[len(thumbnails_path):]}] removed '
                             'since it was changed '
                             f'{diff / 3600 / 24:.1f} days ago')

    return total_size, files_count


def resize_image(basewidth: int, src_path: str, dst_path: str):

    try:
        img = Image.open(src_path)
        wpercent = (basewidth / float(img.size[0]))
        hsize = int((float(img.size[1]) * float(wpercent)))
        img = img.resize((basewidth, hsize), Image.ANTIALIAS)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        img.save(dst_path)
    except Exception:
        logging.exception(f'resizing {src_path}')
        return False
    return True


def generate_thumbnails(root_dir: str):

    global thumbnails_path
    image_count, video_count, error_count, skip_count = 0, 0, 0, 0

    # root_dir needs a trailing slash (i.e. /root/dir/)
    for file_path in glob.iglob(root_dir + '/' + '**/*', recursive=True):

        file_name = os.path.basename(file_path)
        file_ext = os.path.splitext(file_path)[1].lower()
        file_size = os.path.getsize(file_path)

        tn_path = os.path.join(thumbnails_path, f'{file_name}_{file_size}.jpg')

        if os.path.isfile(tn_path):
            logging.debug('Thumbnail for [{}] exists'.format(
                file_path[len(root_dir):]
                ))
            skip_count += 1
            continue

        if file_ext in video_extensions:
            logging.info('Generating thumbnail for video [{}]'.format(
                file_path[len(root_dir):]
                ))

            if file_size > 512 * 1024 * 1024:
                timestamp = '00:08:30.000'
            elif file_size > 128 * 1024 * 1024:
                timestamp = '00:02:08.000'
            elif file_size > 64 * 1024 * 1024:
                timestamp = '00:01:04.000'
            elif file_size > 16 * 1024 * 1024:
                timestamp = '00:00:16.000'
            elif file_size > 4 * 1024 * 1024:
                timestamp = '00:00:04.000'
            else:
                timestamp = '00:00:01.000'

            if debug_mode is False:
                delay = file_size / 1024 / 1024 / 100
                logging.debug(f'Wait for {delay:.1f} sec...')
                time.sleep(delay)

            ffmpeg_cmd = ['/usr/bin/ffmpeg', '-i', file_path,
                          '-loglevel', 'warning',
                          '-ss', timestamp, '-vframes', '1', tn_path]
            p = subprocess.Popen(args=ffmpeg_cmd,
                                 stdout=subprocess.PIPE,
                                 stderr=subprocess.PIPE)
            stdout, stderr = p.communicate()

            if p.returncode != 0:
                error_count += 1
                # ffmpeg output will only be saved if debug mode is enabled;
                # otherwise there will be too much of it.
                logging.info(f'ffmpeg non-zero exist code: {p.returncode}')
                logging.debug(f'stdout: {stderr.decode("utf-8")}')

            elif os.path.isfile(tn_path):
                retval = resize_image(basewidth=240,
                                      src_path=tn_path, dst_path=tn_path)
                video_count += 1 if retval else 0
                error_count += 0 if retval else 1

        if file_ext in image_extensions:
            logging.info('Generating thumbnail for image [{}]'.format(
                file_path[len(root_dir):]
                ))
            image_count += 1
            retval = resize_image(basewidth=480,
                                  src_path=file_path, dst_path=tn_path)
            image_count += 1 if retval else 0
            error_count += 0 if retval else 1

    logging.info(f'File scanning done,{image_count} image and '
                 f'{video_count} video thumbnails generated; '
                 f'{error_count} errors occurred; '
                 f'{skip_count} existing thumbnails skipped.')


@click.command()
@click.option('--debug', is_flag=True)
def main(debug):

    global debug_mode, settings_path, thumbnails_path
    global image_extensions, video_extensions

    debug_mode = debug
    try:
        with open(settings_path, 'r') as json_file:
            json_str = json_file.read()
            data = json.loads(json_str)
        image_extensions = data['app']['image_extensions']
        root_dir = data['app']['root_dir']
        thumbnails_path = data['app']['thumbnails_path']
        log_path = data['app']['log_path']
        video_extensions = data['app']['video_extensions']
    except Exception as e:
        data = None
        print(e)
        return

    logging.basicConfig(
        filename=log_path,
        level=logging.DEBUG if debug_mode else logging.INFO,
        format=('%(asctime)s %(levelname)s '
                '%(module)s - %(funcName)s: %(message)s'),
        datefmt='%Y-%m-%d %H:%M:%S',
    )

    logging.info(f'[{app_name}] started')
    if debug_mode:
        print('Running in debug mode')
        logging.info('Running in debug mode')
    else:
        logging.info('Running in production mode')

    size, count = get_dir_size(thumbnails_path, rotate_diff=3600*24*15)
    logging.info('Before thumbnail generation, the size of the thumbnail dir '
                 f'[{thumbnails_path}] is {size/1024/1024:.2f} MB and '
                 f'it contains {count} files.')

    generate_thumbnails(root_dir=root_dir)

    size, count = get_dir_size(thumbnails_path, rotate_diff=None)
    logging.info('After thumbnail generation, the size of the thumbnail dir '
                 f'[{thumbnails_path}] is {size/1024/1024:.2f} MB and '
                 f'it contains {count} files.')


if __name__ == '__main__':

    main()
