# file-manager

## Introduction

A web-based file manager with a focus on video manipulation and streaming.

### Tech Stack:

* Backend: Python(Flask) + FFmpeg (for video manipulation)
* Frontend: React.js + Bootstrap

## Environment

### Base system

* ffmpeg for video manipulation: `apt install ffmpeg`

* Tested versions:
    * Python: `3.9`
    * Node.js: `14.19`, `18.04`
    * npm: `6.14`, `8.12`

### Python environment

```
python3 -m venv ./.venv/
source ./.venv/bin/activate
pip3 install -r requirements.txt
```

### Node.js environment

```
npm install
```

## Deployment

* Compile/Transpile : `node babelify.js [--dev|--prod]`

## Screenshots

* File List
<p float="left">
  <img src="https://raw.githubusercontent.com/alex-lt-kong/file-manager/main/screenshots/filelist_desktop.png" width="74%" />
  <img src="https://raw.githubusercontent.com/alex-lt-kong/file-manager/main/screenshots/filelist_mobile.png" width="24%"  /> 
</p>

* File Upload

<p float="left">
  <img src="https://github.com/alex-lt-kong/file-manager/blob/main/screenshots/fileupload_desktop.png" width="74%" />
  <img src="https://github.com/alex-lt-kong/file-manager/blob/main/screenshots/fileupload_mobile.png" width="24%" /> 
</p>

* Check Video Information

<p float="left">
  <img src="https://github.com/alex-lt-kong/file-manager/blob/main/screenshots/examine-video-information_desktop.png" width="74%" />
  <img src="https://github.com/alex-lt-kong/file-manager/blob/main/screenshots/examine-video-information_mobile.png" width="24%" /> 
</p>

* Video Transcoding

<p float="left">
  <img src="https://github.com/alex-lt-kong/file-manager/blob/main/screenshots/video-transcoding_desktop.png" width="74%" />
  <img src="https://github.com/alex-lt-kong/file-manager/blob/main/screenshots/video-transcoding_mobile.png" width="24%" /> 
</p>

* Check Server Information

<p float="left">
  <img src="https://github.com/alex-lt-kong/file-manager/blob/main/screenshots/check-server-info_desktop.png" width="74%" />
  <img src="https://github.com/alex-lt-kong/file-manager/blob/main/screenshots/check-server-info_mobile.png" width="24%" /> 
</p>

* Streaming

<p float="left">
  <img src="https://github.com/alex-lt-kong/file-manager/blob/main/screenshots/streaming_desktop.png" width="74%" />
  <img src="https://github.com/alex-lt-kong/file-manager/blob/main/screenshots/streaming_mobile.png" width="24%" /> 
</p>
