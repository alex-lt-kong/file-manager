import React from 'react';
import PropTypes from 'prop-types';

class Thumbnail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      onFileItemClicked: props.onFileItemClicked
    };
  }
}

Thumbnail.propTypes = {
  onFileItemClicked: PropTypes.func
};

class DirectoryThumbnail extends Thumbnail {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <img src={`./static/icons/folder.svg`} style={{width: '100%', cursor: 'pointer'}}
        onClick={() => this.state.onFileItemClicked()} />
      // For svg <img>, we specify width: 100%;
      // For ordinary image we specify maxWidth: 100%
    );
  }
}

class SpecialDirectoryThumbnail extends Thumbnail {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <img src={`./static/icons/special-folder.svg`} style={{width: '100%', cursor: 'pointer'}}
        onClick={() => this.onFileItemClicked()} />
    );
    // For svg <img>, we specify width: 100%;
    // For ordinary image we specify maxWidth: 100%
  }
}

class FileThumbnail extends Thumbnail {
  constructor(props) {
    super(props);
    this.state = {
      fileMetadata: props.fileMetadata
    };
  }
}

class ImageThumbnail extends FileThumbnail {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <img
        src={
          `./get-thumbnail/?filename=` +
            `${encodeURIComponent(this.state.fileMetadata.filename)}_${this.state.fileMetadata.size}.jpg`
        }
        style={{maxWidth: '100%', cursor: 'pointer'}}
        onClick={() => this.onFileItemClicked()}
        onError={(e)=>{
          e.target.onerror = null;
          e.target.src='./static/icons/image.svg';
          e.target.style='width: 100%';
        }}
      />
      // For svg <img>, we specify width: 100%;
      // For ordinary image we specify maxWidth: 100%;
      // Note for onError we need to specify a special style;
    );
  }
}

class VideoThumbnail extends FileThumbnail {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <img
        src={
          `./get-thumbnail/?filename=` +
          `${encodeURIComponent(this.state.fileMetadata.filename)}_${this.state.fileMetadata.size}.jpg`
        }
        style={{maxWidth: '100%', cursor: 'pointer'}}
        onClick={() => this.onFileItemClicked(this.state.fileMetadata.filename)}
        onError={(e)=>{
          e.target.onerror = null;
          e.target.src = './static/icons/video.svg';
          e.target.style='width: 100%';
        }}
      />
    );
    // For svg <img>, we specify width: 100%;
    // For ordinary image we specify maxWidth: 100%;
    // Note for onError we need to specify a special style;
  }
}

class NonMediaFileThumbnail extends FileThumbnail {
  constructor(props) {
    super(props);
  }

  render() {
    const fileExtLowerCase = this.state.fileMetadata.extension.toLowerCase();
    let url = null;
    if (['.doc', '.docx', '.odt', '.rtf', '.docm', '.docx', 'wps'].includes(fileExtLowerCase)) {
      url = './static/icons/word.svg';
    } else if (['.htm', '.html', '.mht', '.xml'].includes(fileExtLowerCase)) {
      url = './static/icons/ml.svg';
    } else if (['.csv', '.xls', '.xlsm', '.xlsx'].includes(fileExtLowerCase)) {
      url = './static/icons/xls.svg';
    } else if (['.pdf'].includes(fileExtLowerCase)) {
      url = './static/icons/pdf.svg';
    } else if (['.7z', '.zip', '.rar', '.tar', '.gz'].includes(fileExtLowerCase)) {
      url = './static/icons/archive.svg';
    } else if (['.mka', '.mp3', '.wma', '.wav', '.ogg', '.flac'].includes(fileExtLowerCase)) {
      url = './static/icons/music.svg';
    } else if (['.c'].includes(fileExtLowerCase)) {
      url = './static/icons/c.svg';
    } else if (['.cpp'].includes(fileExtLowerCase)) {
      url = './static/icons/cpp.svg';
    } else if (['.py', '.pyc', '.ipynb'].includes(fileExtLowerCase)) {
      url = './static/icons/python.svg';
    } else if (['.apk', '.whl', '.rpm', '.deb'].includes(fileExtLowerCase)) {
      url = './static/icons/package.svg';
    } else if (['.exe', '.bat'].includes(fileExtLowerCase)) {
      url = './static/icons/exe.svg';
    } else if (['.js'].includes(fileExtLowerCase)) {
      url = './static/icons/javascript.svg';
    } else if (['.json'].includes(fileExtLowerCase)) {
      url = './static/icons/json.svg';
    } else if (['.css'].includes(fileExtLowerCase)) {
      url = './static/icons/css.svg';
    } else if (['.o'].includes(fileExtLowerCase)) {
      url = './static/icons/object.svg';
    } else if (['.jar', '.java'].includes(fileExtLowerCase)) {
      url = './static/icons/java.svg';
    } else if (['.pem', '.cert', '.crt', '.key', '.pub', '.p12', '.pfx'].includes(fileExtLowerCase)) {
      url = './static/icons/java.svg';
    } else {
      url = './static/icons/misc.svg';
    }
    return (
      <img src={url} style={{width: '100%', display: 'block', float: 'left', cursor: 'pointer'}}
        onClick={() => this.onFileItemClicked()} />
    );
    // For svg <img>, we specify width: 100%;
    // For ordinary image we specify maxWidth: 100%
  }
}

export {DirectoryThumbnail, ImageThumbnail, VideoThumbnail, NonMediaFileThumbnail, SpecialDirectoryThumbnail};
