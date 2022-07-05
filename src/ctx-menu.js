import {ModalMove} from './modal/move';
import {ModalRemove} from './modal/remove';
import {ModalExtractSubtitles} from './modal-extract-subtitles';
import {ModalMediaInfo} from './modal-media-info';
import {ModalTranscode} from './modal-transcode';
import Dropdown from 'react-bootstrap/Dropdown';
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

  onRemoveButtonClick() {
    // Note this funny design: we firstly set modalDialogue to NULL and then, in its callback, we set modalDialogue
    // to a component, so that we make sure React knows this update.
    this.setState({
      modalDialogue: null
    }, ()=> {
      this.setState({
        modalDialogue: (
          <ModalRemove fileInfo={this.state.fileInfo} refreshFileList={this.state.refreshFileList} show={true} />
        )
      });
    });
  }


  onViewTextButtonClick() {
    const params = {
      asset_dir: encodeURIComponent(this.state.fileInfo.asset_dir),
      filename: encodeURIComponent(this.state.fileInfo.filename)
    };
    const url = `./?page=viewer-text&params=${JSON.stringify(params)}`;
    window.open(url);
  }

  onExtractSubtitlesButtonClick() {
    this.setState({
      modalDialogue: (<ModalExtractSubtitles
        assetDir={this.state.fileInfo.asset_dir}
        dialogueShouldClose={this.dialogueShouldClose}
        videoName={this.state.fileInfo.filename}
        refreshFileList={this.state.refreshFileList} />)
    });
    this.forceUpdate();
  }

  onMediaInfoButtonClick() {
    this.setState({
      modalDialogue: (<ModalMediaInfo
        assetDir={this.state.fileInfo.asset_dir}
        dialogueShouldClose={this.dialogueShouldClose}
        mediaFilename={this.state.fileInfo.filename} />)
    });
    this.forceUpdate();
  }

  onMoveButtonClick() {
    console.log(`onMoveButtonClick()`);
    this.setState({
      modalDialogue: null
    }, ()=> {
      this.setState({
        modalDialogue: (
          <ModalMove fileInfo={this.state.fileInfo} refreshFileList={this.state.refreshFileList} show={true} />
        )
      });
    });
  }

  onTranscodeButtonClick() {
    this.setState({
      modalDialogue: (<ModalTranscode
        fileInfo={this.state.fileInfo}
        dialogueShouldClose={this.dialogueShouldClose}
        refreshFileList={this.state.refreshFileList} />)
      // By adding a key attribute, Modal will be created each time, so we
      // can pass different show attribute to it.
    });
    this.forceUpdate();
  }

  render() {
    const ContextMenuToggle = React.forwardRef(({onClick}, ref) => (
      <a href="" ref={ref} onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      >
        <span className="bi bi-three-dots-vertical" />
      </a>
    ));
    ContextMenuToggle.displayName = 'ContextMenuToggle';
    return (
      <>
        {this.state.modalDialogue}
        <Dropdown>
          <Dropdown.Toggle as={ContextMenuToggle} />
          <Dropdown.Menu>
            {
              this.state.fileInfo.file_type !== 1 ? null : // 1 means it is an ordinary file
              <><Dropdown.Item onClick={this.onViewTextButtonClick}>View As Text</Dropdown.Item><Dropdown.Divider /></>
            }
            <Dropdown.Item onClick={this.onMoveButtonClick}>Move</Dropdown.Item>
            <Dropdown.Item onClick={this.onRemoveButtonClick}>Remove</Dropdown.Item>
            {
              (this.state.fileInfo.file_type === 1 && // 1 means it is an ordinary file
                [
                  '.3gp', '.asf', '.avi', '.flv', '.m4v', '.mkv', '.mov', 'mp2', '.mp4', 'mpg', 'mpg', 'mpeg',
                  '.rm', '.wmv', '.rmvb', '.srt'
                ].includes(
                    this.state.fileInfo.extension.toLowerCase())
              ) ?
              <>
                <Dropdown.Divider />
                <Dropdown.Item onClick={this.onMediaInfoButtonClick}>Media Info</Dropdown.Item>
                <Dropdown.Item onClick={this.onTranscodeButtonClick}>Transcode to WebM</Dropdown.Item>
                <Dropdown.Item onClick={this.onExtractSubtitlesButtonClick}>Extract Subtitles</Dropdown.Item>
              </> : null
            }
          </Dropdown.Menu>
        </Dropdown>
      </>
    );
  }
}

ContextMenu.propTypes = {
  refreshFileList: PropTypes.func,
  fileInfo: PropTypes.object,
  enableUpload: PropTypes.bool
};

export {ContextMenu};
