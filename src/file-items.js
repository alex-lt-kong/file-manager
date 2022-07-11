import React from 'react';
import {ContextMenu} from './ctx-menu.js';
import PropTypes from 'prop-types';
import moment from 'moment';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import {
  DirectoryThumbnail,
  ImageThumbnail,
  VideoThumbnail,
  NonMediaFileThumbnail,
  SpecialDirectoryThumbnail} from './thumbnails';

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
      fileMetadata: props.fileMetadata,
      thumbnailSize: props.thumbnailSize
    };
    this.onFileItemClicked = this.onFileItemClicked.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fileMetadata !== this.props.fileMetadata || prevProps.thumbnailSize !== this.props.thumbnailSize) {
      this.setState({
        fileMetadata: this.props.fileMetadata,
        thumbnailSize: this.props.thumbnailSize
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
        thumbnail = (
          <NonMediaFileThumbnail fileMetadata={this.state.fileMetadata} onFileItemClicked={this.onFileItemClicked} />
        );
      }
      fileMetaData = (
        <span>
          <b>size:</b>{humanFileSize(this.state.fileMetadata.size)},&nbsp;
          <b>views:</b>{this.state.fileMetadata.stat.downloads},&nbsp;
          <b>modified:</b>{moment.unix(this.state.fileMetadata.last_modified_at).format('YYYY-MM-DD hh:mm')}
        </span>
      );
    } else if (this.state.fileMetadata.file_type === 2) { // file_type == 2: mountpoint
      fileMetaData = 'mountpoint';
      thumbnail = <SpecialDirectoryThumbnail onFileItemClicked={this.onFileItemClicked} />;
    } else if (this.state.fileMetadata.file_type === 3) { // file_type == 3: symbolic link
      fileMetaData = 'symbolic link';
      thumbnail = <SpecialDirectoryThumbnail onFileItemClicked={this.onFileItemClicked} />;
    } else {
      fileMetaData = '??Unknown file type??';
      thumbnail = <SpecialDirectoryThumbnail onFileItemClicked={this.onFileItemClicked} />;
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
      <Row>
        <Col xs={this.state.thumbnailSize} className='d-flex align-items-center justify-content-center'>
          {thumbnail}
        </Col>
        <Col style={{display: 'flex', flexFlow: 'column'}} >
          <Row>
            <Col>
              <div style={{flex: '1 1 auto', wordBreak: 'break-all'}}>
                <a value={this.state.fileMetadata.filename}
                  style={{textDecoration: 'none', display: 'block', cursor: 'pointer'}}
                  onClick={() => this.onFileItemClicked()}>
                  {this.state.fileMetadata.filename}
                </a>
              </div>
              <div style={{flex: '0 1 1.5em'}} >
                <div style={{fontSize: '0.7em', color: '#808080'}}>{fileMetaData}</div>
              </div>
            </Col>
            <Col xs={1}>
              <ContextMenu refreshFileList={this.props.refreshFileList} fileInfo={this.state.fileMetadata} />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

FileItem.propTypes = {
  refreshFileList: PropTypes.func,
  fileMetadata: PropTypes.object,
  thumbnailSize: PropTypes.number
};

class FileItems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filesInfo: props.filesInfo,
      currentPath: props.currentPath,
      thumbnailSize: props.thumbnailSize
    };
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.filesInfo !== this.props.filesInfo ||
      prevProps.thumbnailSize !== this.props.thumbnailSize ||
      prevProps.currentPath !== this.props.currentPath
    ) {
      this.setState({
        filesInfo: this.props.filesInfo,
        thumbnailSize: this.props.thumbnailSize,
        currentPath: this.props.currentPath
      });
    }
  }

  sortFileItems(sortByFileTypeFirst) {
    const filesInfoCopy = this.state.filesInfo.content.slice();
    if (sortByFileTypeFirst === true) {
      filesInfoCopy.sort((a, b)=>{
        if (a['file_type'] === b['file_type']) {
          return a['filename'] > b['filename'] ? 1 : -1;
        } else {
          return a['file_type'] - b['file_type'];
        }
      });
    } else {
      filesInfoCopy.sort((a, b)=>{
        return a['filename'] > b['filename'] ? 1 : -1;
      });
    }
    return filesInfoCopy;
  }

  render() {
    const fileList = new Array(this.state.filesInfo.content.length);
    const sortedfilesInfo = this.sortFileItems(true);
    for (let i = 0; i < fileList.length; ++i) {
      fileList[i] = (
        <ListGroup.Item key={i}>
          <FileItem refreshFileList={this.props.refreshFileList} fileMetadata={sortedfilesInfo[i]}
            thumbnailSize={this.state.thumbnailSize}/>
        </ListGroup.Item>
      );
    }

    return fileList;
  }
}

FileItems.propTypes = {
  refreshFileList: PropTypes.func,
  currentPath: PropTypes.string,
  filesInfo: PropTypes.object,
  thumbnailSize: PropTypes.number
};

export {FileItems};
