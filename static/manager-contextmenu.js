class ContextMenu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {      
      appAddress: props.appAddress,
      modalDialogue: null,
      refreshFileList: props.refreshFileList,
      fileInfo: props.fileInfo
    };
    this.dialogueShouldClose = this.dialogueShouldClose.bind(this);
    this.onExtractSubtitlesButtonClick = this.onExtractSubtitlesButtonClick.bind(this);
    this.onMoveButtonClick = this.onMoveButtonClick.bind(this);
    this.onRemoveButtonClick = this.onRemoveButtonClick.bind(this);    
    this.onTranscodeButtonClick = this.onTranscodeButtonClick.bind(this);
    this.onMediaInfoButtonClick = this.onMediaInfoButtonClick.bind(this);
  }
  
  dialogueShouldClose() {
    this.state.modalDialogue = null;
    this.forceUpdate();
  }
  
  onRemoveButtonClick(event) {
    this.setState({
      modalDialogue: (<ModalRemove
                fileInfo={this.state.fileInfo}
                appAddress={this.state.appAddress}
                dialogueShouldClose={this.dialogueShouldClose}
                refreshFileList={this.state.refreshFileList} />)
    });
    this.forceUpdate();
  }
  
  onExtractSubtitlesButtonClick(event) {
    this.setState({
      modalDialogue: (<ModalExtractSubtitles
        appAddress={this.state.appAddress}
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
           appAddress={this.state.appAddress}
           assetDir={this.state.fileInfo.asset_dir}
           dialogueShouldClose={this.dialogueShouldClose}
           mediaFilename={this.state.fileInfo.filename} />)
    });
    this.forceUpdate();
  }

  onMoveButtonClick(event) {
    this.setState({
      modalDialogue: (<ModalMove 
          dialogueShouldClose={this.dialogueShouldClose}
           fileInfo={this.state.fileInfo}
           appAddress={this.state.appAddress}
           refreshFileList={this.state.refreshFileList}/>)
    });
    this.forceUpdate();
  }
  
  onTranscodeButtonClick(event) {
    this.setState({
      modalDialogue: (<ModalTranscode
           fileInfo={this.state.fileInfo}
           appAddress={this.state.appAddress}
           dialogueShouldClose={this.dialogueShouldClose}
           refreshFileList={this.state.refreshFileList} />)
        // By adding a key attribute, Modal will be created each time, so we
        // can pass different show attribute to it.
    });
    this.forceUpdate();
  }

  render() {
    return (
      <div className="dropdown"  href = "javascript:return false;" style={{position: "relative" }} >
        <i id="dropdownContextMenuButton" className="bi bi-three-dots-vertical" data-bs-toggle="dropdown"
           aria-expanded="false" style={{ cursor: "pointer", fontSize: "1.2em" }} ></i>
        <ul className="dropdown-menu" aria-labelledby="dropdownContextMenuButton">
          <li><a className="dropdown-item py-2" style={{ cursor: "pointer" }} onClick={this.onMoveButtonClick}>Move</a></li>
          <li><a className="dropdown-item py-2" style={{ cursor: "pointer" }} onClick={this.onRemoveButtonClick}>Remove</a></li>
          <li><a className="dropdown-item py-2" style={{ cursor: "pointer" }} onClick={this.onMediaInfoButtonClick}>Media Info</a></li>
          <li><a className="dropdown-item py-2" style={{ cursor: "pointer" }} onClick={this.onTranscodeButtonClick}>Transcode to WebM</a></li>
          <li><a className="dropdown-item py-2" style={{ cursor: "pointer" }} onClick={this.onExtractSubtitlesButtonClick}>Extract Subtitles</a></li>
        </ul>
        {this.state.modalDialogue}
      </div>
    );
  }
}