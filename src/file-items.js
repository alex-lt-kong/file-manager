import React from 'react';
import {ContextMenu} from './ctx-menu.js';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {DirectoryThumbnail, ImageThumbnail, VideoThumbnail} from './thumbnails';

function humanFileSize(bytes, si=false, dp=1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si ?
  ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] :
  ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(dp) + ' ' + units[u];
}

class FileItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileMetadata: props.fileMetadata
    };
    this.onFileItemClicked = this.onFileItemClicked.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fileMetadata !== this.props.fileMetadata) {
      this.setState({
        fileMetadata: this.props.fileMetadata
      });
    }
  }

  generateThumbnailAndMetaDataComponents() {
    let thumbnail = null;
    let fileMetaData = null;
    /* The following block is about thumbnail generation and formatting. It is tricky because:
        1. For those files with a preview, we want the thumbnail to be large so that we can take a good look;
        2. For those files withOUT a preview, we want the thumbnaul to be small since we dont have anything to
           see anyway;
        3. The aspect ratios of preview and default icons are different--default icons tend to have a lower
           aspect ratio (i.e. a tall icon) but movies and images tend to have a higher aspect ratio
           (i.e., a wide icon)...If we fixed the width of thumbnail according to one type of typical.
        4. We want the layout to be consistent.
        These goals cannot be achieved in the same time. The compromise turns out to be hard to find.
      */
    if (this.state.fileMetadata.file_type === 0 || this.state.fileMetadata.file_type === -1) {
      // file_type == -1: double-dot directory; file_type == 0: ordinary directory
      thumbnail = <DirectoryThumbnail onFileItemClicked={this.onFileItemClicked}/>;
    } else if (this.state.fileMetadata.file_type === 1) { // file_type == 1: ordinary file
      if (this.state.fileMetadata.media_type === 1) { // image
        thumbnail = (
          <ImageThumbnail fileMetadata={this.state.fileMetadata} onFileItemClicked={this.onFileItemClicked} />
        );
      } else if (this.state.fileMetadata.media_type === 2) { // video
        thumbnail = (
          <VideoThumbnail fileMetadata={this.state.fileMetadata} onFileItemClicked={this.onFileItemClicked} />
        );
      } else if (this.state.fileMetadata.media_type === 0) { // not a media file
        let url = null;
        if (
          ['.doc', '.docx', '.odt', '.rtf', '.docm', '.docx', 'wps'].includes(
              this.state.fileMetadata.extension.toLowerCase()
          )
        ) {
          url = './static/icons/word.svg';
        } else if (['.htm', '.html', '.mht', '.xml'].includes(this.state.fileMetadata.extension.toLowerCase())) {
          url = './static/icons/ml.svg';
        } else if (['.csv', '.xls', '.xlsm', '.xlsx'].includes(this.state.fileMetadata.extension.toLowerCase())) {
          url = './static/icons/xls.svg';
        } else if (['.pdf'].includes(this.state.fileMetadata.extension.toLowerCase())) {
          url = './static/icons/pdf.svg';
        } else if (['.7z', '.zip', '.rar', '.tar', '.gz'].includes(this.state.fileMetadata.extension.toLowerCase())) {
          url = './static/icons/archive.svg';
        } else if (
          ['.mka', '.mp3', '.wma', '.wav', '.ogg', '.flac'].includes(this.state.fileMetadata.extension.toLowerCase())
        ) {
          url = './static/icons/music.svg';
        } else if (['.c'].includes(this.state.fileMetadata.extension.toLowerCase())) {
          url = './static/icons/c.svg';
        } else if (['.py', '.pyc', '.ipynb'].includes(this.state.fileMetadata.extension.toLowerCase())) {
          url = './static/icons/python.svg';
        } else if (['.apk', '.whl', '.rpm', '.deb'].includes(this.state.fileMetadata.extension.toLowerCase())) {
          url = './static/icons/package.svg';
        } else if (['.exe', '.bat'].includes(this.state.fileMetadata.extension.toLowerCase())) {
          url = './static/icons/exe.svg';
        } else if (['.css'].includes(this.state.fileMetadata.extension.toLowerCase())) {
          url = './static/icons/css.svg';
        } else {
          url = './static/icons/misc.svg';
        }
        thumbnail = (
          <img src={url} style={{width: '100%', display: 'block', float: 'left', cursor: 'pointer'}}
            onClick={() => this.onFileItemClicked()} />
        );
        // For svg <img>, we specify width: 100%;
        // For ordinary image we specify maxWidth: 100%
      }
      fileMetaData = (
        <span>
          <b>size:</b> {humanFileSize(this.state.fileMetadata.size)},
          <b>views</b>: {this.state.fileMetadata.stat.downloads}
        </span>
      );
    } else if (this.state.fileMetadata.file_type === 2) { // file_type == 2: mountpoint
      fileMetaData = 'mountpoint';
      thumbnail = (
        <img src={`./static/icons/special-folder.svg`} style={{width: '100%', cursor: 'pointer'}}
          onClick={() => this.onFileItemClicked()} />
      );
      // For svg <img>, we specify width: 100%;
      // For ordinary image we specify maxWidth: 100%
    } else if (this.state.fileMetadata.file_type === 3) { // file_type == 3: symbolic link
      fileMetaData = 'symbolic link';
      thumbnail = (
        <img src={`./static/icons/special-folder.svg`} style={{width: '100%', cursor: 'pointer'}}
          onClick={() => this.onFileItemClicked()} />
      );
    } else {
      fileMetaData = '??Unknown file type??';
      thumbnail = (
        <img src={`./static/icons/special-folder.svg`} style={{width: '100%', cursor: 'pointer'}}
          onClick={() => this.onFileItemClicked()} />
      );
    }

    return {
      thumbnail: thumbnail,
      fileMetaData: fileMetaData
    };
  }

  onFileItemClicked() {
    if (this.state.fileMetadata.file_type != 1) {
      if (this.props.refreshFileList === null) {
        logging.error(`Callback function this.state.fetchDataFromServer is null, this should be impossible!`);
      } else {
        this.props.refreshFileList(this.state.fileMetadata.asset_dir + this.state.fileMetadata.filename + '/');
      }
    } else if (this.state.fileMetadata.file_type === 1) {
      if (this.state.fileMetadata.media_type < 2) {
        window.open('./download/?asset_dir=' + encodeURIComponent(this.state.fileMetadata.asset_dir) +
                               '&filename=' + encodeURIComponent(this.state.fileMetadata.filename));
      } else if (this.state.fileMetadata.media_type === 2) {
        const params = {
          asset_dir: this.state.fileMetadata.asset_dir,
          filename: this.state.fileMetadata.filename
        };
        const url = `./?page=viewer-video&params=${encodeURIComponent(JSON.stringify(params))}`;
        window.open(url);
      }
    } else {
      console.warn('special file [' + this.state.fileMetadata.filename + '] clicked');
    }
  }

  render() {
    const retval = this.generateThumbnailAndMetaDataComponents();
    const thumbnail = retval.thumbnail;
    const fileMetaData = retval.fileMetaData;
    return (
      <Row style={{display: 'grid', gridTemplateColumns: '8em 8fr 2.5em'}} >
        {/* Note that for gridTemplateColumns we canNOT use relative width for thumbnail. The reason is that
          common monitors are wide screen but smartphones usually have tall screen, so the preferred thumbnail
          size is not the same. */}
        <Col className='d-flex align-items-center justify-content-center'>
          {thumbnail}
        </Col>
        <Col style={{display: 'flex', flexFlow: 'column'}} >
          <div style={{flex: '1 1 auto', wordBreak: 'break-all'}}>
            <a value={this.state.fileMetadata.filename}
              style={{textDecoration: 'none', display: 'block', cursor: 'pointer'}}
              onClick={() => this.onFileItemClicked()}>
              {this.state.fileMetadata.filename}
            </a>
          </div>
          <div style={{flex: '0 1 1.5em'}} >
            <div style={{fontSize: '0.8em', color: '#808080'}}>{fileMetaData}</div>
          </div>
        </Col>
        <Col>
          <ContextMenu refreshFileList={this.props.refreshFileList} fileInfo={this.state.fileMetadata} />
        </Col>
      </Row>
    );
  }
}

FileItem.propTypes = {
  refreshFileList: PropTypes.func,
  fileMetadata: PropTypes.object
};

class FileItems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filesInfo: props.filesInfo,
      currentPath: props.currentPath
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.filesInfo !== this.props.filesInfo || prevProps.currentPath !== this.props.currentPath) {
      this.setState({
        filesInfo: this.props.filesInfo,
        currentPath: this.props.currentPath
      });
    }
  }

  sortFileItems(classifyByFileType) {
    return this.state.filesInfo.content.sort((a, b)=>{
      if (classifyByFileType) {
        if (a['file_type'] === b['file_type']) {
          return (a['filename'] > b['filename']);
        } else {
          a['file_type'] > b['file_type'];
        }
      } else {
        return (a['filename'] > b['filename']);
      }
    });
  }

  render() {
    const fileList = new Array(this.state.filesInfo.content.length);
    const sortedfilesInfo = this.sortFileItems(true);
    for (let i = 0; i < fileList.length; ++i) {
      fileList[i] = (
        <li key={i} className='list-group-item'>
          <FileItem refreshFileList={this.props.refreshFileList} fileMetadata={sortedfilesInfo[i]}/>
        </li>
      );
    }

    return fileList;
  }
}

FileItems.propTypes = {
  refreshFileList: PropTypes.func,
  currentPath: PropTypes.string,
  filesInfo: PropTypes.object
};

export {FileItems};
