import React from 'react';
import {ContextMenu} from './ctx-menu.js';
import PropTypes from 'prop-types';

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

class FileItems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileInfo: props.fileInfo,
      currentPath: props.currentPath
    };
    this.onFileItemClicked = this.onFileItemClicked.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fileInfo !== this.props.fileInfo || prevProps.currentPath !== this.props.currentPath) {
      this.setState({
        fileInfo: this.props.fileInfo,
        currentPath: this.props.currentPath
      });
    }
  }

  onFileItemClicked(value) {
    if (this.state.fileInfo.content[value].file_type != 1) {
      if (this.props.refreshFileList === null) {
        logging.error(`Callback function this.state.fetchDataFromServer is null, this should be impossible!`);
      } else {
        this.props.refreshFileList(this.state.currentPath + value + '/');
      }
    } else if (this.state.fileInfo.content[value].file_type === 1) {
      if (this.state.fileInfo.content[value].media_type < 2) {
        window.open('./download/?asset_dir=' + encodeURIComponent(this.state.fileInfo.metadata.asset_dir) +
                               '&filename=' + encodeURIComponent(value));
      } else if (this.state.fileInfo.content[value].media_type === 2) {
        const params = {
          asset_dir: this.state.fileInfo.metadata.asset_dir,
          filename: value
        };
        const url = `./?page=viewer-video&params=${encodeURIComponent(JSON.stringify(params))}`;
        window.open(url);
      }
    } else {
      console.log('special file [' + value + '] clicked');
    }
  }

  generateThumbnailAndMetaData(key, content) {
    let thumbnail = null;
    let fileMetaData = null;
    /* The following block is about thumbnail generation and formatting. It is tricky because:
        1. For those files with preview, we want the thumbnail to be large so that we can take a good look;
        2. For those files withOUT preview, we want the thumbnaul to be small since we dont have anything to
           look anyway;
        3. The aspect ratios of preview and default icons are different--default icons tend to have a lower
           aspect ratio movies and images tend to have a higher aspect ratio...If we fixed the width of
           thumbnail according to one type of typical.
        4. We want the layout to be consistent.
        These three goals cannot be achieved in the same time. The compromise turns out to be hard to find.
      */
    if (content.file_type === 0) { // file_type == 0: ordinary directory
      thumbnail = (
        <img src={`./static/icons/folder.svg`} style={{width: '100%', cursor: 'pointer'}}
          onClick={() => this.onFileItemClicked(key)} />
      );
      // For svg <img>, we specify width: 100%;
      // For ordinary image we specify maxWidth: 100%
    } else if (content.file_type === 1) { // file_type == 1: ordinary file
      if (content.media_type === 1) { // image
        thumbnail = (
          <img src={`./get-thumbnail/?filename=${encodeURIComponent(key)}_${content.size}.jpg`}
            style={{maxWidth: '100%', maxHeight: '90vh', display: 'block', cursor: 'pointer'}}
            onClick={() => this.onFileItemClicked(key)}
            onError={(e)=>{
              e.target.onerror = null; e.target.src='./static/icons/image.svg'; e.target.style='width: 100%';
            }} />);
        // For svg <img>, we specify width: 100%;
        // For ordinary image we specify maxWidth: 100%;
        // Note for onError we need to specify a special style;
      } else if (content.media_type === 2) { // video
        thumbnail = (
          <img src={`./get-thumbnail/?filename=${encodeURIComponent(key)}_${content.size}.jpg`}
            style={{maxWidth: '100%', cursor: 'pointer'}} onClick={() => this.onFileItemClicked(key)}
            onError={(e)=>{
              e.target.onerror = null; e.target.src = './static/icons/video.svg'; e.target.style='width: 100%';
            }} />);
        // For svg <img>, we specify width: 100%;
        // For ordinary image we specify maxWidth: 100%;
        // Note for onError we need to specify a special style;
      } else if (content.media_type === 0) { // not a media file
        let url = null;
        if (['.doc', '.docx', '.odt', '.rtf', '.docm', '.docx', 'wps'].includes(content.extension.toLowerCase())) {
          url = './static/icons/word.svg';
        } else if (['.htm', '.html', '.mht', '.xml'].includes(content.extension.toLowerCase())) {
          url = './static/icons/ml.svg';
        } else if (['.csv', '.xls', '.xlsm', '.xlsx'].includes(content.extension.toLowerCase())) {
          url = './static/icons/xls.svg';
        } else if (['.pdf'].includes(content.extension.toLowerCase())) {
          url = './static/icons/pdf.svg';
        } else if (['.7z', '.zip', '.rar', '.tar', '.gz'].includes(content.extension.toLowerCase())) {
          url = './static/icons/archive.svg';
        } else if (['.mka', '.mp3', '.wma', '.wav', '.ogg', '.flac'].includes(content.extension.toLowerCase())) {
          url = './static/icons/music.svg';
        } else if (['.c'].includes(content.extension.toLowerCase())) {
          url = './static/icons/c.svg';
        } else if (['.py', '.pyc', '.ipynb'].includes(content.extension.toLowerCase())) {
          url = './static/icons/python.svg';
        } else if (['.apk', '.whl', '.rpm', '.deb'].includes(content.extension.toLowerCase())) {
          url = './static/icons/package.svg';
        } else if (['.exe', '.bat'].includes(content.extension.toLowerCase())) {
          url = './static/icons/exe.svg';
        } else if (['.css'].includes(content.extension.toLowerCase())) {
          url = './static/icons/css.svg';
        } else {
          url = './static/icons/misc.svg';
        }
        thumbnail = (
          <img src={url} style={{width: '100%', display: 'block', float: 'left', cursor: 'pointer'}}
            onClick={() => this.onFileItemClicked(key)} />
        );
        // For svg <img>, we specify width: 100%;
        // For ordinary image we specify maxWidth: 100%
      }
      fileMetaData = (<span><b>size:</b> {humanFileSize(content.size)}, <b>views</b>: {content.stat.downloads}</span>);
    } else if (content.file_type === 2) { // file_type == 2: mountpoint
      fileMetaData = 'mountpoint';
      thumbnail = (
        <img src={`./static/icons/special-folder.svg`} style={{width: '100%', cursor: 'pointer'}}
          onClick={() => this.onFileItemClicked(key)} />
      );
      // For svg <img>, we specify width: 100%;
      // For ordinary image we specify maxWidth: 100%
    } else if (content.file_type === 3) { // file_type == 3: symbolic link
      fileMetaData = 'symbolic link';
      thumbnail = (
        <img src={`./static/icons/special-folder.svg`} style={{width: '100%', cursor: 'pointer'}}
          onClick={() => this.onFileItemClicked(key)} />
      );
    } else {
      fileMetaData = '??Unknown file type??';
      thumbnail = (
        <img src={`./static/icons/special-folder.svg`} style={{width: '100%', cursor: 'pointer'}}
          onClick={() => this.onFileItemClicked(key)} />
      );
    }

    return {
      thumbnail: thumbnail,
      fileMetaData: fileMetaData
    };
  }

  generateFilesList() {
    const fic = this.state.fileInfo.content;
    const keys = Object.keys(fic);
    const fileList = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const retval = this.generateThumbnailAndMetaData(key, fic[key]);
      const thumbnail = retval.thumbnail;
      const fileMetaData = retval.fileMetaData;
      fileList[i] = (
        <li key={i} className='list-group-item'>
          <div className='row' style={{display: 'grid', gridTemplateColumns: '8em 8fr 2.5em'}} >
            {/* Note that for gridTemplateColumns we canNOT use relative width for thumbnail. The reason is that
              common monitors are wide screen but smartphones are usually tall screen, so the preferred thumbnail
              size is not the same. */}
            <div className='col d-flex align-items-center justify-content-center'>
              {thumbnail}
            </div>
            <div className='col' style={{display: 'flex', flexFlow: 'column'}} >
              <div style={{flex: '1 1 auto', wordBreak: 'break-all'}}>
                <a value={key} style={{textDecoration: 'none', display: 'block', cursor: 'pointer'}}
                  onClick={() => this.onFileItemClicked(key)}>
                  {key}
                </a>
              </div>
              <div style={{flex: '0 1 1.5em'}} >
                <div style={{fontSize: '0.8em', color: '#808080'}}>{fileMetaData}</div>
              </div>
            </div>
            <div className='col'>
              <ContextMenu refreshFileList={this.props.refreshFileList} fileInfo={fic[key]} />
            </div>
          </div>
        </li>
      );
    }

    return fileList;
  }
  render() {
    return this.generateFilesList();
  }
}

FileItems.propTypes = {
  refreshFileList: PropTypes.func,
  currentPath: PropTypes.string,
  fileInfo: PropTypes.object
};

export {FileItems};
