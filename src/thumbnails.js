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

export {DirectoryThumbnail, ImageThumbnail, VideoThumbnail};
