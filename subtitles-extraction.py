#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Jun 19 02:18:07 2021

@author: Alex K.
"""

# Reference: https://superuser.com/questions/583393/how-to-extract-subtitle-from-video-using-ffmpeg

import click
import os
import subprocess


@click.command()
@click.option('--path', prompt='directory to search for videos')
@click.option('--stream', default=0, prompt='ID of subtitles stream ')
def main(path, stream):

    scanner = os.scandir(path)
    for entry in scanner:
        print(entry.name)
        src = os.path.join(path, entry.name)
        dst = src + '.vtt'
        print(src, dst)
        ffmpeg_cmd = ['/usr/bin/ffmpeg','-y', '-i', src,
                      '-map', f'0:s:{stream}', '-f', 'webvtt', dst]
        p = subprocess.Popen(args=ffmpeg_cmd,
                             stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        output, error = p.communicate()


if __name__ == '__main__':

    main()
