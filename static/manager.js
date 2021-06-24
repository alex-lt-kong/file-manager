class ModalVideoInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appAddress: props.appAddress,
      assetDir: props.assetDir,
      dialogueShouldClose: props.dialogueShouldClose,
      jsonHTML: (<div className="d-flex align-items-center justify-content-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>),
      videoName: props.videoName,
      videoInfo: null
    };
    this.handleOKClick = this.handleOKClick.bind(this);
    this.fetchDataFromServer();
  }

  componentDidMount() {
    $(this.modal).modal('show');
    window.onpopstate = e => {
      this.handleOKClick();
    }
  }

  fetchDataFromServer() {                    
    URL = this.state.appAddress + '/get-video-info/?asset_dir=' + encodeURIComponent(this.state.assetDir) + '&video_name=' + encodeURIComponent(this.state.videoName);
      axios.get(URL)
        .then(response => {
          this.setState({
           videoInfo: null
          });
          this.setState({
           videoInfo: response.data,
           jsonHTML: syntaxHighlight(JSON.stringify(response.data.content, null, 2))
         });
        })
        .catch(error => {
          console.log(error);     
          this.setState({
            jsonHTML: (
              <div className="alert alert-danger my-2" role="alert" style={{ wordBreak: "break-all" }}>
                Unable to fetch information from video <strong>{this.state.videoName}</strong>:
                <br />{error.response.data}
              </div>
            ),
            videoInfo: false            
           });
        });
  }

  handleOKClick() {
    $(this.modal).modal('hide');
    if (this.state.dialogueShouldClose != null) {
      this.state.dialogueShouldClose();
    }
    /* When we want to close it, we need to do two things:
      1. we set hide to the modal within this component;
      2. we need to call a callback function to notify the parent component that the children component wants itself to be closed.
      We canNOT only do the 1st thing; otherwise the modal dialogue will be hidden, but it is not destroyed.
    */
  }

  render() {

    return (
    <div className="modal fade" ref={modal=> this.modal = modal} role="dialog" aria-labelledby="videoInformationModalTitle"
         aria-hidden="true" data-bs-backdrop="static">
        <div className="modal-dialog  modal-dialog-scrollable" role="document">
          {/* Turned out that modal-dialog-scrollable is buggy on smartphone devices... */}
        <div className="modal-content">
            <div className="modal-header">
            <h5 className="modal-title" id="videoInformationModalTitle" >Video Information</h5>
            </div>
            <div className="modal-body">
              <div className="mb-3">{this.state.jsonHTML}</div>
            </div>
            <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={this.handleOKClick}>OK</button>
            </div>
        </div>
      </div>
    </div>
    );
  }
}

class ModalExtractSubtitles extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      appAddress: props.appAddress,
      assetDir: props.assetDir,
      dialogueShouldClose: props.dialogueShouldClose,
      refreshFileList: props.refreshFileList,
      responseMessage: null,
      streamNo: 0,
      videoName: props.videoName,
    };
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.onstreamNoChange = this.onstreamNoChange.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
  }

  componentDidMount() {
    $(this.modal).modal('show');
    window.onpopstate = e => {
      this.handleCloseClick();
    }   
  }

  handleSubmitClick() {
    this.postDataToServer();    
  }

  postDataToServer() {                    
    const payload = new FormData();
    payload.append('asset_dir', this.state.assetDir);
    payload.append('video_name', this.state.videoName);
    payload.append('stream_no', this.state.streamNo);
    axios({
      method: "post",
      url: this.state.appAddress + "/extract-subtitles/",
      data: payload,
    })
    .then(response => {
      this.handleCloseClick();
      if (this.state.refreshFileList != null) {
        this.state.refreshFileList();
      }
    })
    .catch(error => {
      console.log(error);
      this.setState({
        responseMessage: (<div className="alert alert-danger my-2" role="alert" style={{ wordBreak: "break-all" }}>
                            Unable to extract subtitles from <strong>{this.state.videoName}</strong>:<br />{error.response.data}
                          </div>)
      });  
    });
  }
  
  onstreamNoChange(event) {
    this.setState({
      streamNo: event.target.value
    });
  }

  handleCloseClick() {
    $(this.modal).modal('hide');
    if (this.state.dialogueShouldClose != null) {
      this.state.dialogueShouldClose();
    }
    /* When we want to close it, we need to do two things:
      1. we set hide to the modal within this component;
      2. we need to call a callback function to notify the parent component that the children component wants itself to be closed.
      We canNOT only do the 1st thing; otherwise the modal dialogue will be hidden, but it is not destroyed.
    */
  }
  
  render() {
    return (
      <div className="modal fade" ref={modal=> this.modal = modal} role="dialog" aria-labelledby="modal-extract-subtitles-title"
           aria-hidden="true" data-bs-backdrop="static" >
          {/* Always set data-bs-backdrop="static" so clients can only close the dialogue with the close button,
          so the proper close methods will always be called.  */}
        <div className="modal-dialog modal-dialog-scrollable" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modal-extract-subtitles-title">Extract Subtitles</h5>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="folder-name-input" className="form-label">
                  Specify the stream ID (starting from 0) of the subtitles to be extracted:
                </label>
                <input id="folder-name-input" type="text" className="form-control"
                    placeholder="Input folder name" value={this.state.streamNo} onChange={this.onstreamNoChange}/>
                {this.state.responseMessage}
                <div className="accordion my-2" id="accordionRemove">
                  <div className="accordion-item">
                      <h2 className="accordion-header" id="headingRemove">
                      <button className="accordion-button collapsed" type="button"
                          data-bs-toggle="collapse" data-bs-target="#collapseRemoveOne" aria-expanded="false" aria-controls="collapseRemoveOne">
                      What's Happening Under the Hood?
                      </button>
                      </h2>
                      <div id="collapseRemoveOne" className="accordion-collapse collapse" aria-labelledby="headingRemove" data-bs-parent="#accordionRemove">
                      <div className="accordion-body">
                        <ol>
                          <li>Subtitle extraction is much less expensive compared with transcoding. You could expect the result within minutes;</li>
                          <li>You can check the ID of a stream by using the Video Info function;</li>
                          <li>The server uses <code>ffmpeg</code> to do the extraction. If <code>ffmpeg</code> returns a non-zero exit code, a log file will be generated.</li>
                        </ol>
                      </div>
                      </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={this.handleCloseClick}>Close</button>
              <button type="button" className="btn btn-primary" onClick={this.handleSubmitClick}>Submit</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}


class ModalMkdir extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      appAddress: props.appAddress,
      assetDir: props.assetDir,
      dialogueShouldClose: props.dialogueShouldClose,
      folderName: 'New Folder',
      refreshFileList: props.refreshFileList,
      modalClose: props.closed
    };
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.onFolderNameChange = this.onFolderNameChange.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
  }

  componentDidMount() {
    $(this.modal).modal('show');     
  }

  componentDidUpdate() {
    window.onpopstate = e => {
      $(this.modal).modal('hide');
    }
  }

  handleSubmitClick() {
    this.postDataToServer();    
  }

  postDataToServer() {                    
    const payload = new FormData();
    payload.append('asset_dir', this.state.assetDir);
    payload.append('folder_name', this.state.folderName);
    axios({
      method: "post",
      url: this.state.appAddress + "/create-folder/",
      data: payload,
    })
    .then(response => {
      this.handleCloseClick();
      if (this.state.refreshFileList != null) {
        this.state.refreshFileList();
      }
    })
    .catch(error => {
      console.log(error);
      alert('Unable to create new folder:\n' + error.response.data);      
    });
  }
  
  onFolderNameChange(event) {
    this.setState({
      folderName: event.target.value
    });
  }

  handleCloseClick() {
    $(this.modal).modal('hide');
    if (this.state.dialogueShouldClose != null) {
      this.state.dialogueShouldClose();
    }
  }

  render() {
    return (
      <div className="modal fade" ref={modal=> this.modal = modal} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-scrollable" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">New Folder</h5>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="folder-name-input" className="form-label">
                  Input the name of the folder to be created:
                </label>
                <input id="folder-name-input" type="text" className="form-control"
                    placeholder="Input folder name" value={this.state.folderName} onChange={this.onFolderNameChange}/>   
                <div style={{ marginTop: "1em"}}>
                  Notes:<br />
                  1. The server calls returns an error message if <a href="https://docs.python.org/3/library/os.path.html#os.path.ismount" target="_blank">
                  os.path.ismount()</a> returns true;<br />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={this.handleCloseClick}>Close</button>
              <button type="button" className="btn btn-primary" onClick={this.handleSubmitClick}>Submit</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class ModalRemove extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appAddress: props.appAddress,
      dialogueShouldClose: props.dialogueShouldClose,
      fileInfo: props.fileInfo,
      refreshFileList: props.refreshFileList,
      responseMessage: null
    };
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
  }

  componentDidMount() {
    $(this.modal).modal('show');
    window.onpopstate = e => {
      this.handleCloseClick();
    }
  }

  handleSubmitClick() {
    this.postDataToServer();    
  }

  postDataToServer() {                    
    const payload = new FormData();
    payload.append('filepath', this.state.fileInfo.asset_dir + this.state.fileInfo.filename);
    axios({
      method: "post",
      url: this.state.appAddress + "/remove/",
      data: payload,
    })
    .then(response => {
      this.handleCloseClick();
      if (this.state.refreshFileList != null) {
        this.state.refreshFileList();
      }
    })
    .catch(error => {
      console.log(error);
      this.setState({
        responseMessage: (<div className="alert alert-danger my-2" role="alert" style={{ wordBreak: "break-all" }}>
                            Unable to remove <strong>{this.state.fileInfo.filename}</strong>:<br />{error.response.data}
                          </div>)
      }); 
    });
  }

  handleCloseClick() {
    $(this.modal).modal('hide');
    if (this.state.dialogueShouldClose != null) {
      this.state.dialogueShouldClose();
    }
    /* When we want to close it, we need to do two things:
      1. we set hide to the modal within this component;
      2. we need to call a callback function to notify the parent component that the children component wants itself to be closed.
      We canNOT only do the 1st thing; otherwise the modal dialogue will be hidden, but it is not destroyed.
    */
  }

  render() {
    
    if (this.state.show === false) {
      return null;
    }

    return (
    <div className="modal fade" ref={modal=> this.modal = modal} role="dialog" data-bs-backdrop="static" 
         aria-labelledby="modal-remove-file-title" aria-hidden="true">
           {/* Always set data-bs-backdrop="static" so clients can only close the dialogue with the close button,
               so the proper close methods will always be called.  */}
        <div className="modal-dialog modal-dialog-scrollable" role="document">
        <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modal-remove-file-title" >Remove File</h5>
            </div>
            <div className="modal-body">
            <div className="mb-3">
                <span className="form-label" style={{ wordWrap: "break-word", wordBreak: "break-all" }}>
                Remove file <strong>{this.state.fileInfo.asset_dir + this.state.fileInfo.filename}</strong>?
                </span>
                {this.state.responseMessage}
                <div className="accordion my-2" id="accordionRemove">
                  <div className="accordion-item">
                      <h2 className="accordion-header" id="headingRemove">
                      <button className="accordion-button collapsed" type="button"
                          data-bs-toggle="collapse" data-bs-target="#collapseRemoveOne" aria-expanded="false" aria-controls="collapseRemoveOne">
                      What's Happening Under the Hood?
                      </button>
                      </h2>
                      <div id="collapseRemoveOne" className="accordion-collapse collapse" aria-labelledby="headingRemove" data-bs-parent="#accordionRemove">
                      <div className="accordion-body">
                        <ol>
                          <li>The server returns an error message if <a href="https://docs.python.org/3/library/os.path.html#os.path.ismount" target="_blank">
                          os.path.ismount()</a> returns true;</li>
                          <li>The server calls <a href="https://docs.python.org/3/library/os.html#os.unlink" target="_blank">
                          os.unlink()</a> if <a href="https://docs.python.org/3/library/os.path.html#os.path.islink" target="_blank">
                          os.path.islink()</a> returns true;</li>
                          <li>The server calls <a href="https://docs.python.org/3/library/os.html#os.remove" target="_blank">
                          os.remove()</a> if <a href="https://docs.python.org/3/library/os.path.html#os.path.isfile" target="_blank">
                          os.path.isfile()</a> returns true;</li>
                          <li>The server calls <a href="https://docs.python.org/3/library/os.html#os.rmdir" target="_blank">
                          shutil.rmtree()</a> if <a href="https://docs.python.org/3/library/shutil.html#shutil.rmtree" target="_blank">
                          os.path.isdir()</a> returns true;</li>
                          <li>The serve returns an error if all of the above conditions are not met.</li>
                        </ol>
                      </div>
                      </div>
                  </div>
                </div>
            </div>
            </div>
            <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={this.handleCloseClick}>No</button>
            <button type="button" className="btn btn-primary" onClick={this.handleSubmitClick}>YES!</button>
            </div>
        </div>
        </div>
    </div>
    );
  }
}

class ModalTranscode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {      
      appAddress: props.appAddress,
      audioID: -1,
      crf: 30,
      dialogueShouldClose: props.dialogueShouldClose,
      fileInfo: props.fileInfo,
      refreshFileList: props.refreshFileList,
      resolution: -1,
      threads: 0
    };
    this.onAudioIDChange = this.onAudioIDChange.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.onCRFChange = this.onCRFChange.bind(this);
    this.onResolutionChange = this.onResolutionChange.bind(this);
    this.onThreadsChange = this.onThreadsChange.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
    
  }

  componentDidMount() {
    $(this.modal).modal('show');
    window.onpopstate = e => {
      this.handleCloseClick();
    }
  }

  handleSubmitClick() {
    this.postDataToServer();    
  }

  postDataToServer() {                    
    const payload = new FormData();
    payload.append('asset_dir', this.state.fileInfo.asset_dir);
    payload.append('audio_id', this.state.audioID);
    payload.append('video_name', this.state.fileInfo.filename);
    payload.append('crf', this.state.crf);
    payload.append('resolution', this.state.resolution);
    payload.append('threads', this.state.threads);
    axios({
      method: "post",
      url: this.state.appAddress + "/video-transcode/",
      data: payload,
    })
    .then(response => {
      this.handleCloseClick();
      if (this.state.refreshFileList != null) {
        this.state.refreshFileList();
      }
    })
    .catch(error => {
      this.setState({
        responseMessage: (<div className="alert alert-danger my-2" role="alert" style={{ wordBreak: "break-all" }}>
                            Unable to transcode <strong>{payload.get('video_name')}</strong>:<br />{error.response.data}
                          </div>)
      });
    });
  }
  
  onResolutionChange(event){
    this.setState({
      resolution: event.target.value
    });

    var autoCRF = 0;
    if (event.target.value === '1080') { autoCRF = 31; }
    else if (event.target.value === '720') { autoCRF = 32; }
    else if (event.target.value === '480') { autoCRF = 33; }
    else if (event.target.value === '360') { autoCRF = 36; }
    else if (event.target.value === '240') { autoCRF = 37; }
    if (autoCRF != 0) {
      this.setState({
        crf: autoCRF
      });
    }
  }

  onCRFChange(event) {
    this.setState({
      crf: event.target.value
      });
  }

  onThreadsChange(event) {
    this.setState({
      threads: event.target.value
      });
  }
  
  onAudioIDChange(event) {
    this.setState({
      audioID: event.target.value
      });
  }
  
  handleCloseClick() {
    $(this.modal).modal('hide');
    if (this.state.dialogueShouldClose != null) {
      this.state.dialogueShouldClose();
    }
    /* When we want to close it, we need to do two things:
      1. we set hide to the modal within this component;
      2. we need to call a callback function to notify the parent component that the children component wants itself to be closed.
      We canNOT only do the 1st thing; otherwise the modal dialogue will be hidden, but it is not destroyed.
    */
  }

  render() {    
    if (this.state.show === false) {
      return null;
    }
   
    return (
        <div className="modal fade" ref={modal=> this.modal = modal} role="dialog" data-bs-backdrop="static" 
             aria-labelledby="modal-video-transcode-title" aria-hidden="true">
            {/* Always set data-bs-backdrop="static" so clients can only close the dialogue with the close button,
          so the proper close methods will always be called.  */}
          <div className="modal-dialog modal-dialog-scrollable" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="modal-video-transcode-title">Video Transcode</h5>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <span htmlFor="exampleFormControlInput1" className="form-label">
                    Transcode video <b>{this.state.fileInfo.filename}</b> to WebM format (VP9) with the following parameters:
                  </span>  
                  <div className="input-group my-1">
                    <span className="input-group-text">CRF</span>
                    <input type="text" className="form-control"
                           placeholder="CRF" value={this.state.crf} onChange={this.onCRFChange} />
                    <span className="input-group-text">Audio ID</span>
                    <input type="text" className="form-control"
                           placeholder="Audio stream ID" value={this.state.audioID} onChange={this.onAudioIDChange} />
                  </div>

                  <div className="input-group my-1">
                    <label className="input-group-text" htmlFor="inputSelectResolution">Resolution</label>
                    <select className="form-select" id="inputSelectResolution" defaultValue={-1}
                        onChange={this.onResolutionChange} >
                      <option value="-1">Original</option>
                      <option value="1080" >1080p</option>
                      <option value="720">720p</option>
                      <option value="480">480p</option>
                      <option value="360">360p</option>
                      <option value="240">240p</option>
                      <option value="144">144p</option>
                    </select>
                  </div>

                  <div className="input-group my-1">
                    <span className="input-group-text">Threads</span>
                    <input type="number" className="form-control"
                           placeholder="Number of threads" min="1" max="8" value={this.state.threads} onChange={this.onThreadsChange} />
                  </div>

                  {this.state.responseMessage}
                  <div className="accordion my-2" id="accordionRemove">
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="headingRemove">
                      <button className="accordion-button collapsed" type="button"
                          data-bs-toggle="collapse" data-bs-target="#collapseRemoveOne" aria-expanded="false" aria-controls="collapseRemoveOne">
                        What's Happening Under the Hood?
                      </button>
                      </h2>
                      <div id="collapseRemoveOne" className="accordion-collapse collapse" aria-labelledby="headingRemove" data-bs-parent="#accordionRemove">
                        <div className="accordion-body">
                          <ol>
                            <li>The server will start a separate <code>ffmpeg</code> process to do the conversion;</li>
                            <li>The constant rate factor (CRF) can be from 0-63. Lower values mean better quality;
                            According to <a href="https://trac.ffmpeg.org/wiki/Encode/VP9" target="_blank">FFMPEG's manual</a>, for
                            WebM format (VP9 video encoder), recommended values range from 15-35;</li>
                            <li>After selecting the video quality, a CRF value will be automatically set according to <a href="https://developers.google.com/media/vp9/settings/vod/" target="_blank">
                            Google's recommendation</a>;</li>
                            <li>According to <a href="https://developers.google.com/media/vp9/the-basics" target="_blank">
                            Google's manual</a>, for VP9, 480p is considered a safe resolution for a broad range of mobile and web devices.</li>
                            <li>Since modern browsers will pick the first audio stream (ID==0) and manual audio stream selection is usually not possible,
                                you can pick the preferred audio stream by its ID before transcoding so that it becomes the only audio stream which
                                will definitely be selected by browsers. You can find the ID using <code>Video Info</code> function.</li>
                            <li><code>threads</code> can only be from 0 to 8 where 0 means ffmpeg selects the optimal value by itself. Note that
                            a large <code>threads</code> value may or may not translate to high performance but a
                            small <code>threads</code> will guarantee lower CPU usage.</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={this.handleCloseClick}>Close</button>
                <button type="button" className="btn btn-primary" onClick={this.handleSubmitClick}>Submit</button>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

class ModalMove extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appAddress: props.appAddress,
      dialogueShouldClose: props.dialogueShouldClose,
      fileInfo: props.fileInfo,
      newFileDir: props.fileInfo.asset_dir,
      newFileName: props.fileInfo.filename,
      refreshFileList: props.refreshFileList,
      responseMessage: null
    };
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
    this.onFileDirChange = this.onFileDirChange.bind(this);
    this.onFileNameChange = this.onFileNameChange.bind(this);
  }

  componentDidMount() {
    $(this.modal).modal('show');
    window.onpopstate = e => {
      this.handleCloseClick();
    }
  }

  handleSubmitClick() {
    this.fetchDataFromServer();    
  }

  fetchDataFromServer() {                    
    const payload = new FormData();
    payload.append('old_filepath', this.state.fileInfo.asset_dir + this.state.fileInfo.filename);
    payload.append('new_filepath', this.state.newFileDir + this.state.newFileName);
    axios({
      method: "post",
      url: this.state.appAddress + "/move/",
      data: payload,
    })
    .then(response => {
      this.handleCloseClick();
      if (this.state.refreshFileList != null) {
        this.state.refreshFileList();
      }
    })
    .catch(error => {
      console.log(error);
      this.setState({
        responseMessage: (<div className="alert alert-danger my-2" role="alert" style={{ wordBreak: "break-all" }}>
                            Unable to move file from <strong>{payload.get('old_filepath')}</strong> to <strong>{payload.get('new_filepath')}</strong>:
                            <br />{error.response.data}
                          </div>)
      });   
    });
  }
  
  onFileDirChange(event) {
    var newVal = event.target.value.replace('\n', '').replace('\r', '');
    this.setState({
      newFileDir: newVal
      });
  }
  
  onFileNameChange(event) {
    var newVal = event.target.value.replace('\n', '').replace('\r', '');
    this.setState({
      newFileName: newVal
      });
  }

  handleCloseClick() {
    $(this.modal).modal('hide');
    if (this.state.dialogueShouldClose != null) {
      this.state.dialogueShouldClose();
    }
    /* When we want to close it, we need to do two things:
      1. we set hide to the modal within this component;
      2. we need to call a callback function to notify the parent component that the children component wants itself to be closed.
      We canNOT only do the 1st thing; otherwise the modal dialogue will be hidden, but it is not destroyed.
    */
  }

  render() {

    return (
        <div className="modal fade" ref={modal=> this.modal = modal} id="exampleModal" role="dialog"
             aria-labelledby="modal-move-file-title" aria-hidden="true" data-bs-backdrop="static" >
          {/* Always set data-bs-backdrop="static" so clients can only close the dialogue with the close button,
              so the proper close methods will always be called.  */}
          <div className="modal-dialog modal-dialog-scrollable" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="modal-move-file-title">Move File</h5>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label" style={{ wordBreak: "break-all" }}>
                    Move the file from <b>{this.state.fileInfo.asset_dir + this.state.fileInfo.filename}</b> to:
                  </label>
                  <div className="input-group mb-1">
                    <span className="input-group-text font-monospace">Directory</span>
                    <textarea type="text" className="form-control" rows="2"
                              placeholder="Input new filename" value={this.state.newFileDir} onChange={this.onFileDirChange} />
                  </div>
                  <div className="input-group mb-3">
                    <span className="input-group-text font-monospace">Filename</span>
                    <textarea type="text" className="form-control" rows="2"
                              placeholder="Input new filename" value={this.state.newFileName} onChange={this.onFileNameChange} />
                  </div>
                  {this.state.responseMessage}
                  <div className="accordion my-2" id="accordionMove">
                    <div className="accordion-item">
                      <h2 className="accordion-header" id="headingRemove">
                      <button className="accordion-button collapsed" type="button"
                          data-bs-toggle="collapse" data-bs-target="#collapseMoveOne" aria-expanded="false" aria-controls="collapseMoveOne">
                        What's Happening Under the Hood?
                      </button>
                      </h2>
                      <div id="collapseMoveOne" className="accordion-collapse collapse" aria-labelledby="headingRemove" data-bs-parent="#accordionMove">
                        <div className="accordion-body">
                        1. The server calls returns an error message if <a href="https://docs.python.org/3/library/os.path.html#os.path.ismount" target="_blank">
                        os.path.ismount()</a> returns true;<br />
                        2. The server calls <a href="https://docs.python.org/3/library/shutil.html#shutil.move" target="_blank">
                        shutil.move()</a> to do the move;<br />
                        3. If the destination is on a different filesystem, source file is copied to destination and then removed
                        <strong>(It could take a long time!)</strong>;<br />
                        4. In case of symlinks, a new symlink pointing to the target of src will be created in or as dst and src will be removed.
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={this.handleCloseClick}>Close</button>
                <button type="button" className="btn btn-primary" onClick={this.handleSubmitClick}>Submit</button>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

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
    this.onVideoInfoButtonClick = this.onVideoInfoButtonClick.bind(this);
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

  onVideoInfoButtonClick(event) {
    this.setState({
      modalDialogue: (<ModalVideoInfo
           appAddress={this.state.appAddress}
           assetDir={this.state.fileInfo.asset_dir}
           dialogueShouldClose={this.dialogueShouldClose}
           videoName={this.state.fileInfo.filename} />)
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
          <li><a className="dropdown-item py-1" style={{ cursor: "pointer" }} onClick={this.onMoveButtonClick}>Move</a></li>
          <li><a className="dropdown-item py-1" style={{ cursor: "pointer" }} onClick={this.onRemoveButtonClick}>Remove</a></li>
          <li><a className="dropdown-item py-1" style={{ cursor: "pointer" }} onClick={this.onVideoInfoButtonClick}>Video Info</a></li>
          <li><a className="dropdown-item py-1" style={{ cursor: "pointer" }} onClick={this.onTranscodeButtonClick}>Transcode to WebM</a></li>
          <li><a className="dropdown-item py-1" style={{ cursor: "pointer" }} onClick={this.onExtractSubtitlesButtonClick}>Extract Subtitles</a></li>
        </ul>
        {this.state.modalDialogue}
      </div>
    );
  }
}

/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *       binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
 function humanFileSize(bytes, si=false, dp=1) {
  const thresh = si ? 1000 : 1024;
  
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
  
  const units = si 
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;
  
  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  
  
  return bytes.toFixed(dp) + ' ' + units[u];
  }
  

class FileManager extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      appAddress: 'https://media.sz.lan',
      addressBar: '',
      currentPath: '/',
      fileInfo: null,
      pathStack: [],
      selectedFile: null,
      serverInfo: null,
      showNewFolderModal: false,
      uploadProgress: 0,
      username: null
    };

    this.onAddressBarChange = this.onAddressBarChange.bind(this);
    this.onClickItem = this.onClickItem.bind(this);
    this.onClickMore = this.onClickMore.bind(this);
    this.onClickAddressBarGo = this.onClickAddressBarGo.bind(this);
    this.onAddressBarEnterPress = this.onAddressBarEnterPress.bind(this);
    this.onFileUpload = this.onFileUpload.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
    this.onNewFolderClick = this.onNewFolderClick.bind(this);    
    this.onServerInfoClick = this.onServerInfoClick.bind(this);
    
    this.Modal = null;
    this.serverInfoPanel;
  }


  onServerInfoClick(event) { 
    this.fetchServerInfo();
  }

  onFileChange(event) { 
    for (let i = 0; i < event.target.files.length; i++) {
      if(event.target.files[0].size > 2048000000){
        alert("The file to be uploaded canNOT be larger than 2048 MB");
        return;
        };
        this.setState(
          {
            selectedFile: event.target.files[i]
          }
        );
      this.onFileUpload(event.target.files[i]);
    }    
  }; 

  onFileUpload(selectedFiles) {
    const payload = new FormData();
    

    payload.append('selected_files', selectedFiles);
    payload.append('asset_dir', this.state.currentPath); 
    var config = {
      onUploadProgress: function(progressEvent) {
        var percentCompleted = ((progressEvent.loaded * 100) / progressEvent.total).toFixed(2);
        // Here we ceil() the percentage point to an integer. If we don't round it, the number will change very freqneutly.
        // As a result, the page will be re-render()ed and for whatever reason the context menu may jump a little bit 
        // if it is clicked when the page is render()ed.
        // Note that we use Math.ceil() instead of round() so that the page will show 1% immediately after the upload starts

        // However, the above issue appears to have been solved by limiting the height of filelist ul to 100vh. So now
        // we keep two decimal places to make the update more frequent--so that users will notice smaller upload progress
        // if the file being uploaded is large.
        if (percentCompleted < 100)
          this.setState({uploadProgress: percentCompleted}); //How set state with percentCompleted?
        else
          this.setState({
            selectedFile: null,
            uploadProgress: null
            
          });
        console.log(percentCompleted);
      }.bind(this)
    };
  
    axios.post(this.state.appAddress + "/upload/", payload, config)
    .then(response => {
      // an alert is not needed since the user will see the change of the files list.
      this.fetchDataFromServer(this.state.currentPath)
    })
    .catch(error => {
      console.log(error);
      alert('Unable to upload files:\n' + error.response.data);
    });
  }

  componentDidMount() {
    
    this.fetchDataFromServer(this.state.currentPath);
     // this.Modal = null;

    window.history.pushState(null, document.title, window.location.href);
    const self = this;
    // to make "this" work inside a eventlistener callback function,
    // we need to define self...
    window.addEventListener('popstate', function (event){
      console.log('back button clicked!');
      if (self.state.pathStack.length >= 2) {
        self.setState(prevState => ({
          currentPath: prevState.pathStack[prevState.pathStack.length - 2],
          pathStack: prevState.pathStack.slice(0, -1).slice(0, -1)
        }), () => self.fetchDataFromServer(self.state.currentPath));
      }
      window.history.pushState(null, document.title,  window.location.href);
    });
  }

  fileListShouldRefresh = () => this.fetchDataFromServer(this.state.fileInfo.metadata.asset_dir);

  dialogueShouldClose = () => this.Modal = null;

  onNewFolderClick(event) {
    this.Modal = (
      <ModalMkdir assetDir={this.state.currentPath}
            appAddress={this.state.appAddress}
            refreshFileList={this.fileListShouldRefresh} 
            dialogueShouldClose={this.dialogueShouldClose} />
            // Tried many different solutions, a callback
            // to destory the Modal is still the best way 
            // to handle the close() event.
    ); 
    this.forceUpdate();
    // A forceUpdate() is needed; otherwise, react.js won't know
    // that a render() is needed since there isn't a state change.
    // What if we make Modal a member of the state?
    // Haven't tried!
  }

  onAddressBarChange(event) {
    this.setState({
      addressBar: event.target.value
    });
  }
  
  onClickAddressBarGo(event) {
    this.fetchDataFromServer(this.state.addressBar);
  } 
  
  onAddressBarEnterPress(event) {
    console.log('onAddressBarEnterPress');
    this.fetchDataFromServer(this.state.addressBar);
  } 
  
  onClickItem(value) { 
    if (this.state.fileInfo.content[value].file_type != 1) {
      this.fetchDataFromServer(this.state.currentPath + value + '/');
    /*  this.setState(prevState => ({
        currentPath: prevState.currentPath + value + '/'
      }), () => this.fetchDataFromServer(this.state.currentPath));

      No, you canNOT set currentPath here--sometimes tthe fetchDataFromServer() will fail.
      In this situtaion, we want to keep the original currentPath. */
    } else if (this.state.fileInfo.content[value].file_type === 1) {
      console.log('ordinary file [' + value + '] clicked');
      if (this.state.fileInfo.content[value].media_type < 2) {
        window.open(this.state.appAddress + '/download/?asset_dir=' + encodeURIComponent(this.state.fileInfo.metadata.asset_dir) +
                               '&filename=' + encodeURIComponent(value)); 
      } else if (this.state.fileInfo.content[value].media_type === 2) {
        window.open(this.state.appAddress + '/play-video/?asset_dir=' + encodeURIComponent(this.state.fileInfo.metadata.asset_dir) +
                               '&video_name=' + encodeURIComponent(value)); 
      }
    } else {
      console.log('special file [' + value + '] clicked');
    }
  }

  onClickMore(event) { 
    console.log('onClickMore!');
  };
    
  fetchServerInfo() {

    URL = this.state.appAddress + '/get-server-info/';
    this.serverInfoPanel = (
      <div className="d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
    this.forceUpdate();
    // You set it to a spinner before fetching data from the server.
    axios.get(URL)
      .then(response => {
        this.setState({
          serverInfo: null
          // make it empty before fill it in again to force a re-rendering.
        });
        this.setState({
          serverInfo: response.data
          // make it empty before fill it in again to force a re-rendering.
        });

        const ffmpegItems = this.state.serverInfo.ffmpeg.map((ffmpegItem) =>
          <li key={ffmpegItem.pid} style={{ wordBreak: "break-all" }}>
            {ffmpegItem.cmdline} <b>(since {ffmpegItem.since})</b>
          </li>
        );

        this.serverInfoPanel = (
          <div>
            <p><b>CPU Usage: </b>{this.state.serverInfo.cpu.percent.map((p) => p.toString() + "% ")}</p>            
            <p>
              <b>Memory: </b>
              {Math.round(this.state.serverInfo.memory.physical_total / 1024 / 1024).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} MB in total,&nbsp;
              {Math.round(this.state.serverInfo.memory.physical_available / 1024 / 1024).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} MB free
              {/* The fancy regex is used to add a thousands separator */}
            </p>
            <b>System:</b>
            <ul>
              <li><b>OS:</b> {this.state.serverInfo.version.os}</li>
              <li><b>Python:</b> {this.state.serverInfo.version.python}</li>
              <li><b>Flask:</b> {this.state.serverInfo.version.flask}</li>
            </ul>
            <b>FFMPEG:</b>
            <ol>{ffmpegItems}</ol>            
          </div>
        );

        this.forceUpdate();
        })
      .catch(error => {
        console.log(error);
        alert('Unable to fetch server info:\n' + error.response.data);        
      });
  }
  
  fetchDataFromServer(asset_dir) {

    URL = this.state.appAddress + '/get-file-list/?asset_dir=' + encodeURIComponent(asset_dir);

    axios.get(URL)
      .then(response => {
        // handle success
        this.setState({
          fileInfo: null
          // make it empty before fill it in again to force a re-rendering.
        });
        this.setState(prevState => ({
          addressBar: response.data.metadata.asset_dir,
          fileInfo: response.data,
          currentPath: response.data.metadata.asset_dir,
          pathStack:  [...prevState.pathStack, response.data.metadata.asset_dir]
        }));
      })
      .catch(error => {
        console.log(error);
        alert('Unable to fetch fileInfo:\n' + error.response.data);
        
      });
  }

  ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
  }

  render() {
    if (this.state.fileInfo === null) { return null; }
    let fi = this.state.fileInfo;
    const keys = Object.keys(fi.content);
    let fileList = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let thumbnail = null;
      let fileMetaData = null;
      /* The following block is about thumbnail generation and formatting. It is tricky because:
        1. For those files with preview, we want the thumbnail to be large so that we can take a good look;
        2. For those files withOUT preview, we want the thumbnaul to be small since we dont have anything to look anyway;
        3. The aspect ratios of preview and default icons are different--default icons tend to have a lower aspect ratio
           movies and images tend to have a higher aspect ratio...If we fixed the width of thumbnail according to one type of
           typical 
        4. We want the layout to be consistent.
        These three goals cannot be achieved in the same time. The compromise turns out to be hard to find.
      */
      if (fi.content[key].file_type === 0) { // file_type == 0: ordinary directory
        thumbnail = (
          <img src={`${this.state.appAddress}/static/icons/folder.svg`} style={{ width: "100%", cursor: "pointer" }}
               onClick={() => this.onClickItem(key)} />
          );
          // For svg <img>, we specify width: 100%;
          // For ordinary image we specify maxWidth: 100%
      } else if (fi.content[key].file_type === 1) { // file_type == 1: ordinary file
        if (fi.content[key].media_type === 1) { // image
          thumbnail = (
            <img src={`${this.state.appAddress}/get-thumbnail/?filename=${encodeURIComponent(key)}.jpg`}
               style={{ maxWidth: "100%", maxHeight: "90vh", "display":"block", cursor: "pointer" }}
               onClick={() => this.onClickItem(key)}
               onError={(e)=>{e.target.onerror = null; e.target.src=this.state.appAddress + "/static/icons/image.svg"; e.target.style="width: 100%"}} />);
              // For svg <img>, we specify width: 100%;
              // For ordinary image we specify maxWidth: 100%;
              // Note for onError we need to specify a special style;
        } else if (fi.content[key].media_type === 2) { // video
          thumbnail = (
            <img src={`${this.state.appAddress}/get-thumbnail/?filename=${encodeURIComponent(key)}.jpg`}
               style={{ maxWidth: "100%", cursor: "pointer" }}
               onClick={() => this.onClickItem(key)}
               onError={(e)=>{e.target.onerror = null; e.target.src=this.state.appAddress + "/static/icons/video.svg"; e.target.style="width: 100%"}} />);
              // For svg <img>, we specify width: 100%;
              // For ordinary image we specify maxWidth: 100%;
              // Note for onError we need to specify a special style;
        } else if (fi.content[key].media_type === 0) { // not a media file
          let url = null;
          if ([".doc", ".docx", ".odt", ".rtf", ".docm", ".docx", "wps"].includes(fi.content[key].extension.toLowerCase())) {
            url = this.state.appAddress + "/static/icons/word.svg"; 
          } else if ([".htm", ".html", ".mht"].includes(fi.content[key].extension.toLowerCase())) {
            url = this.state.appAddress + "/static/icons/html.svg"; 
          } else if ([".pdf"].includes(fi.content[key].extension.toLowerCase())) {
            url = this.state.appAddress + "/static/icons/pdf.svg";
          } else if ([".7z", ".zip", ".rar", ".tar", ".gz"].includes(fi.content[key].extension.toLowerCase())) {
            url = this.state.appAddress + "/static/icons/archive.svg"; 
          } else if ([".mka", ".mp3", ".wma", ".wav", ".ogg", ".flac"].includes(fi.content[key].extension.toLowerCase())) {
            url = this.state.appAddress + "/static/icons/music.svg"; 
          } else {
            url = this.state.appAddress + "/static/icons/misc.svg"; 
          }
          thumbnail = (<img src={url} style={{ width: "100%", "display":"block", float:"left", cursor: "pointer" }}
                    onClick={() => this.onClickItem(key)} />);
                // For svg <img>, we specify width: 100%;
                // For ordinary image we specify maxWidth: 100%
        }
        fileMetaData = (<span><b>size:</b> {humanFileSize(fi.content[key].size)}, <b>views</b>: {fi.content[key].stat.downloads}</span>);
      } else if (fi.content[key].file_type === 2) { // file_type == 2: mountpoint
        fileMetaData = 'mountpoint';
        thumbnail = (
          <img src={`${this.state.appAddress}/static/icons/special-folder.svg`} style={{ width: "100%", cursor: "pointer" }}
               onClick={() => this.onClickItem(key)} />
          );
          // For svg <img>, we specify width: 100%;
          // For ordinary image we specify maxWidth: 100%
      } else if (fi.content[key].file_type === 3) { // file_type == 3: symbolic link
        fileMetaData = 'symbolic link';
        thumbnail = (
          <img src={`${this.state.appAddress}/static/icons/special-folder.svg`} style={{ width: "100%", cursor: "pointer" }}
               onClick={() => this.onClickItem(key)} />
          );
      } else {
        fileMetaData = '??Unknown file type??';
        thumbnail = (
          <img src={`${this.state.appAddress}/static/icons/special-folder.svg`} style={{ width: "100%", cursor: "pointer" }}
               onClick={() => this.onClickItem(key)} />
          );
      }
      fileList[i] = (
      <li key={i} className="list-group-item">            
        <div className="row" style={{ display: "grid", gridTemplateColumns: "8em 8fr 2.5em" }} >
          {/* Note that for gridTemplateColumns we canNOT use relative width for thumbnail. The reason is that
            common monitors are wide screen but smartphones are usually tall screen, so the preferred thumbnail
            size is not the same. */}
          <div className="col d-flex align-items-center justify-content-center">
            {thumbnail}
          </div>
          <div className="col" style={{ display: "flex", flexFlow: "column" }} >
            <div style={{flex: "1 1 auto", wordBreak: "break-all" }}>
              <a value={key} style={{ textDecoration: "none", display: "block", cursor: "pointer" }} onClick={() => this.onClickItem(key)}>
              {key}
              </a>
            </div>
            <div style={{  flex: "0 1 1.5em"}} >
            <div style={{ fontSize: "0.8em", color: "#808080" }}>{fileMetaData}</div>
            </div>
          </div>
          <div className="col">
            <ContextMenu refreshFileList={this.fileListShouldRefresh} fileInfo={fi.content[key]} appAddress={this.state.appAddress} /> 
          </div>
        </div>     
      </li>
      );
    }

    return (      
      <div>
        <div className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
          <div className="row container-fluid">
            <div className="col-md-auto">
            {/* Use col-{breakpoint}-auto classes to size columns based on the natural width of their content. */}
              
            <button className="btn btn-primary mx-1 my-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottom" aria-controls="offcanvasBottom" >
                <i className="bi bi-upload"></i> Upload
              </button>
              <div className="offcanvas offcanvas-bottom h-auto" id="offcanvasBottom" aria-labelledby="offcanvasBottomLabel">
                <div className="offcanvas-header">
                  <h5 className="offcanvas-title" id="offcanvasBottomLabel"><b>File Upload</b></h5>
                  <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close" />
                </div>
                <div className="offcanvas-body" style={{ fontSize: "0.85em" }}>
                  {/* d-flex align-items-center justify-content-center: used to center
                  this.serverInfoPanel horizontally and vertically 
                      However, after adding d-flex align-items-center justify-content-center,
                      the scroll function of offcanvas will be broken. So now these attributes are
                      NOT added. */}
                      <div className="">
                        <p style={{ wordBreak: "break-all" }}><b>Name: </b>{this.state.selectedFile === null ? "NA" : this.state.selectedFile.name}</p>
                        <p><b>Size: </b>{this.state.selectedFile === null ? "0" : (this.state.selectedFile.size / 1024 / 1024).toFixed(2) + "MB"}</p>
                      </div>
                      <div className="progress">
                        <div className="progress-bar" role="progressbar"
                             style={{ width: this.state.uploadProgress != null ? this.state.uploadProgress + "%" : "0%"  }}
                             aria-valuenow={this.state.uploadProgress} aria-valuemin="0" aria-valuemax="100">
                               {this.state.uploadProgress != null ? this.state.uploadProgress + "%" : "" }
                               </div>
                      </div>
                      <div>
                        <input onChange={this.onFileChange} type="file" className="my-3"></input>
                        <p>Note: Interestingly, while it may appear that the page only supports single-file upload, you can actually upload more
                           files even if previous ones are still being transferred. (But multiple upload processes will share the same progress bar ¯\_(ツ)_/¯)</p>
                      </div>                    
                </div>
              </div>

              {/* button and input is bound using jQuery... */}
              <button type="button" className="btn btn-primary mx-1 my-1" onClick={this.onNewFolderClick}><i className="bi bi-folder-plus"></i> New</button>               
              <button className="btn btn-primary mx-1 my-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottomServerInfo" aria-controls="offcanvasBottomServerInfo"
                  onClick={this.onServerInfoClick}>
                <i className="bi bi-gear"></i> Info
              </button>
              <div className="offcanvas offcanvas-bottom h-auto" id="offcanvasBottomServerInfo" aria-labelledby="offcanvasBottomServerInfoLabel">
              <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="offcanvasBottomServerInfoLabel"><b>Server Info</b></h5>
                <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close" />
              </div>
              <div className="offcanvas-body" style={{ fontSize: "0.85em" }}>
                {/* d-flex align-items-center justify-content-center: used to center
                this.serverInfoPanel horizontally and vertically 
                    However, after adding d-flex align-items-center justify-content-center,
                    the scroll function of offcanvas will be broken. So now these attributes are
                    NOT added. */}
                {this.serverInfoPanel}
              </div>
              </div>
            </div>
            <div className="col">
              <div className="input-group d-flex justify-content-between mx-1 my-1">
                {/* d-flex and justify-content-between keep components in one line*/}
                <span className="input-group-text" id="basic-addon1">Path</span>
                <input type="text" className="form-control" placeholder="Address"
                    aria-label="Recipient's username" aria-describedby="button-addon2"
                    value={this.state.addressBar} onChange={this.onAddressBarChange} onKeyPress={this.onAddressBarEnterPress}  id="address-input" />
                <button className="btn btn-primary" type="button" onClick={this.onClickAddressBarGo} htmlFor="address-input" >
                  <i className="bi bi-caret-right-fill"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <ul className="list-group overflow-auto"
              style={{ maxWidth: "1000px", maxHeight: "100%", minHeight: "60vh", marginLeft: "auto", marginRight: "auto" }}>
            {/* The maxHeight: 100% is used to solve a very nasty bug. The bug is like this:
                First, it only happens on smartphone and will not happen on desktop browser. On a mobile device, if you have a long file list and
                you try to open the context menu for the file items shown on the last page of the list (i.e. not necessarily the last one, but the ones
                could be shown on the last page of the screen) you will notice that the poge will scroll up a little bit at the moment you click the
                "more" button. I failed to find any solutions or even references to this bug online.
                After a lot of trial-and-error, it turns out that if we set the maxHeight of the file list to the height of the monitor,
                the bug disappears... 
                minHeight is used to fix another issue: suppose we set maxHeight only, if the content height is too small,
                the context menu can actually be higher than the content height, forcing the browser to show a scrollbar
                in order to accommodate the height of the context menu. If we set minHeight == 60vh, the content height
                will never to too small to accomodate the context menu.*/}
          {fileList}
          </ul>
        </div>
        {this.Modal}
      </div>
    );
  }
}

ReactDOM.render(
  <div>
      <FileManager />
  </div>,
  document.querySelector('#root'),
);