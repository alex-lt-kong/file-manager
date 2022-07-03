import {ModalMove} from './modal-move';
import {ModalRemove} from './modal-remove';
import {ModalExtractSubtitles} from './modal-extract-subtitles';
import {ModalMediaInfo} from './modal-media-info';
import {ModalTranscode} from './modal-transcode';
import React from 'react';
import PropTypes from 'prop-types';

class ContextMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalDialogue: null,
      refreshFileList: props.refreshFileList,
      fileInfo: props.fileInfo
    };
    this.dialogueShouldClose = this.dialogueShouldClose.bind(this);
    this.onExtractSubtitlesButtonClick = this.onExtractSubtitlesButtonClick.bind(this);
    this.onMoveButtonClick = this.onMoveButtonClick.bind(this);
    this.onViewTextButtonClick = this.onViewTextButtonClick.bind(this);
    this.onRemoveButtonClick = this.onRemoveButtonClick.bind(this);
    this.onTranscodeButtonClick = this.onTranscodeButtonClick.bind(this);
    this.onMediaInfoButtonClick = this.onMediaInfoButtonClick.bind(this);
  }

  componentDidUpdate(prevProps) {
    // If you component <ContextMenu /> as an object, React could re-use an existing
    // <ContextMenu /> for different file items. Therefore, we canNOT rely on
    // ContextMenu's constructor to fill in the fileInfo member.
    if (prevProps.fileInfo !== this.props.fileInfo) {
      this.setState({
        fileInfo: this.props.fileInfo
      });
    }
  }

  dialogueShouldClose() {
    this.setState({
      modalDialogue: null
    });
    this.forceUpdate();
  }

  onRemoveButtonClick(event) {
    this.setState({
      modalDialogue: (
        <ModalRemove fileInfo={this.state.fileInfo} appAddress='.'
          dialogueShouldClose={this.dialogueShouldClose} refreshFileList={this.state.refreshFileList} />
      )
    });
    this.forceUpdate();
  }


  onViewTextButtonClick() {
    const params = {
      asset_dir: encodeURIComponent(this.state.fileInfo.asset_dir),
      filename: encodeURIComponent(this.state.fileInfo.filename)
    };
    const url = `./?page=viewer-text&params=${JSON.stringify(params)}`;
    console.log(url);
    window.open(url);
  }

  onExtractSubtitlesButtonClick(event) {
    this.setState({
      modalDialogue: (<ModalExtractSubtitles
        appAddress='.'
        assetDir={this.state.fileInfo.asset_dir}
        dialogueShouldClose={this.dialogueShouldClose}
        videoName={this.state.fileInfo.filename}
        refreshFileList={this.state.refreshFileList} />)
    });
    this.forceUpdate();
  }

  onMediaInfoButtonClick(event) {
    this.setState({
      modalDialogue: (<ModalMediaInfo
        appAddress='.'
        assetDir={this.state.fileInfo.asset_dir}
        dialogueShouldClose={this.dialogueShouldClose}
        mediaFilename={this.state.fileInfo.filename} />)
    });
    this.forceUpdate();
  }

  onMoveButtonClick(event) {
    this.setState({
      modalDialogue: (
        <ModalMove dialogueShouldClose={this.dialogueShouldClose}
          fileInfo={this.state.fileInfo} refreshFileList={this.state.refreshFileList}/>
      )
    });
    this.forceUpdate();
  }

  onTranscodeButtonClick(event) {
    this.setState({
      modalDialogue: (<ModalTranscode
        fileInfo={this.state.fileInfo}
        appAddress='.'
        dialogueShouldClose={this.dialogueShouldClose}
        refreshFileList={this.state.refreshFileList} />)
      // By adding a key attribute, Modal will be created each time, so we
      // can pass different show attribute to it.
    });
    this.forceUpdate();
  }

  render() {
    return (
      <div className="dropdown" href="javascript:return false;" style={{position: 'relative'}} >
        <i id="dropdownContextMenuButton" className="bi bi-three-dots-vertical" data-bs-toggle="dropdown"
          aria-expanded="false" style={{cursor: 'pointer', fontSize: '1.2em'}} ></i>
        <ul className="dropdown-menu" aria-labelledby="dropdownContextMenuButton">
          <li>
            <a className="dropdown-item py-2" style={{cursor: 'pointer'}} onClick={this.onViewTextButtonClick}>
              View As Text
            </a>
          </li>
          <li>
            <a className="dropdown-item py-2" style={{cursor: 'pointer'}} onClick={this.onMoveButtonClick}>Move</a>
          </li>
          <li>
            <a className="dropdown-item py-2" style={{cursor: 'pointer'}} onClick={this.onRemoveButtonClick}>
              Remove
            </a>
          </li>
          <li>
            <a className="dropdown-item py-2" style={{cursor: 'pointer'}} onClick={this.onMediaInfoButtonClick}>
              Media Info
            </a>
          </li>
          <li>
            <a className="dropdown-item py-2" style={{cursor: 'pointer'}} onClick={this.onTranscodeButtonClick}>
              Transcode to WebM
            </a>
          </li>
          <li>
            <a className="dropdown-item py-2" style={{cursor: 'pointer'}} onClick={this.onExtractSubtitlesButtonClick}>
              Extract Subtitles
            </a>
          </li>
        </ul>
        {this.state.modalDialogue}
      </div>
    );
  }
}

ContextMenu.propTypes = {
  refreshFileList: PropTypes.func,
  fileInfo: PropTypes.object,
  enableUpload: PropTypes.bool
};

export {ContextMenu};
