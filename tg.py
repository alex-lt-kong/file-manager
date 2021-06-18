#!/usr/bin/python3

from PIL import Image, ImageFile

import argparse
import datetime
import glob
import json
import logging
import math
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

# app_dir: the app's real address on the filesystem
app_dir = os.path.dirname(os.path.realpath(__file__))
app_name = 'file-manager-thumbnail-generator'
image_extensions = None
log_path = ''
settings_path = os.path.join(app_dir, 'settings.json')
root_dir = ''
thumbnails_path = ''
video_extensions = None


def main():

    global log_path, settings_path, thumbnails_path
    global image_extensions, video_extensions
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
        print(f'{e}')
        return

    debug_mode = True
    logging.basicConfig(
        filename=log_path,
        level=logging.DEBUG if debug_mode else logging.INFO,
        format='%(asctime)s %(levelname)s %(module)s - %(funcName)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S',
    )

    logging.info('[{app_name}] started')

    # root_dir needs a trailing slash (i.e. /root/dir/)
    for file_path in glob.iglob(root_dir + '/' + '**/*', recursive=True):
        print(file_path)
        file_name = os.path.basename(file_path)
        file_dir = os.path.dirname(file_path)
        file_ext = os.path.splitext(file_path)[1].lower()
        file_size = os.path.getsize(file_path)
        print(file_size)
        tn_path = os.path.join(thumbnails_path, file_name) + '.jpg'

        if os.path.isfile(tn_path):
            logging.debug(f'Thumbnail for [{file_path}] exists')
            continue

        if file_ext in video_extensions:
            logging.info(f'Generating thumbnail for video [{file_name}]')
            if file_size < 1024 * 1024 * 10:
                timestamp = '00:00:10.000'
            elif file_size < 1024 * 1024 * 50:
                timestamp = '00:00:30.000'
            elif file_size < 1024 * 1024 * 100:
                timestamp = '00:01:30.000'
            else:
                timestamp = '00:02:00.000'
            delay = file_size / 1024 / 1024 / 100
            print(f'Wait for {delay} sec before thumbnail generation')
            time.sleep(delay)
            cmdline = ['/usr/bin/ffmpeg', '-i', file_path,
                       '-loglevel', 'fatal',
                       '-ss', timestamp, '-vframes', '1', tn_path]
            subprocess.call(cmdline)

            if os.path.isfile(tn_path):
                try:
                    basewidth = 320
                    img = Image.open(tn_path)
                    wpercent = (basewidth/float(img.size[0]))
                    hsize = int((float(img.size[1])*float(wpercent)))
                    img = img.resize((basewidth, hsize), Image.ANTIALIAS)
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")
                    img.save(tn_path)
                except Exception as e:
                    logging.error(f"{e}")
        if file_ext in image_extensions:
            try:
                logging.info(f'Generating thumbnail for image [{file_name}]')
                basewidth = 640
                img = Image.open(file_path)
                wpercent = (basewidth/float(img.size[0]))
                hsize = int((float(img.size[1])*float(wpercent)))
                img = img.resize((basewidth, hsize), Image.ANTIALIAS)
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                img.save(tn_path)
            except Exception as e:
                logging.error(f"{e}")


if __name__ == '__main__':

    main()
