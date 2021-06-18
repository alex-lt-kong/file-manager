class ModalRemove extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appAddress: props.appAddress,
            fileInfo: props.fileInfo,
            refreshFileList: props.refreshFileList,
            show: props.show
        };
        this.handleCloseClick = this.handleCloseClick.bind(this);
        this.handleSubmitClick = this.handleSubmitClick.bind(this);
    }

    componentDidMount() {
        $(this.modal).modal('show');
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
            alert('Unable to remove\n' + error);
        });
    }

    handleCloseClick() {
        $(this.modal).modal('hide');
    }

    render() {
        
        if (this.state.show === false) {
            return null;
        }

        return (
                <div className="modal fade" ref={modal=> this.modal = modal} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" >Remove File</h5>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <span className="form-label" style={{ wordWrap: "break-word" }}>
                                        Remoe file <b>{this.state.fileInfo.asset_dir + this.state.fileInfo.filename}</b>?
                                    </span> 
                                    <div style={{ marginTop: "1em"}}>
                                        Notes:<br />
                                        1. The server returns an error message if <a href="https://docs.python.org/3/library/os.path.html#os.path.ismount" target="_blank">
                                        os.path.ismount()</a> returns true;<br />
                                        2. The server calls <a href="https://docs.python.org/3/library/os.html#os.unlink" target="_blank">
                                        os.unlink()</a> if <a href="https://docs.python.org/3/library/os.path.html#os.path.islink" target="_blank">
                                        os.path.islink()</a> returns true;<br />
                                        3. The server calls <a href="https://docs.python.org/3/library/os.html#os.remove" target="_blank">
                                        os.remove()</a> if <a href="https://docs.python.org/3/library/os.path.html#os.path.isfile" target="_blank">
                                        os.path.isfile()</a> returns true;<br />
                                        4. The server calls <a href="https://docs.python.org/3/library/os.html#os.rmdir" target="_blank">
                                        shutil.rmtree()</a> if <a href="https://docs.python.org/3/library/shutil.html#shutil.rmtree" target="_blank">
                                        os.path.isdir()</a> returns true;<br />
                                        5. The serve returns an error if all of the above conditions are not met.
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
            fileInfo: props.fileInfo,
            crf: 30,
            refreshFileList: props.refreshFileList,
            resolution: -1,
            show: props.show
        };
        this.handleCloseClick = this.handleCloseClick.bind(this);
        this.onCRFChange = this.onCRFChange.bind(this);
        this.onResolutionChange = this.onResolutionChange.bind(this);
        this.handleSubmitClick = this.handleSubmitClick.bind(this);
        
    }

    componentDidMount() {
        $(this.modal).modal('show');
    }

    handleSubmitClick() {
        this.postDataToServer();        
    }

    postDataToServer() {                                      
        const payload = new FormData();
        payload.append('asset_dir', this.state.fileInfo.asset_dir);
        payload.append('video_name', this.state.fileInfo.filename);
        payload.append('crf', this.state.crf);
        payload.append('resolution', this.state.resolution);
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
            alert('Unable to rename\n' + error);
        });
    }
    
    onResolutionChange(event){
        this.setState({
            resolution: event.target.value
        });
    }

    onCRFChange(event) {
        this.setState({
            crf: event.target.value
          });
    }

    handleCloseClick() {
        $(this.modal).modal('hide');
    }

    render() {
        
        if (this.state.show === false) {
            return null;
        }

        return (
                <div className="modal fade" ref={modal=> this.modal = modal} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Video Transcode</h5>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <span htmlFor="exampleFormControlInput1" className="form-label">
                                        Transcode video <b>{this.state.fileInfo.filename}</b> to WebM format (VP9) with the following CRF:
                                    </span>  
                                    <div class="input-group mb-3">
                                        <span class="input-group-text">CRF</span>
                                        <input type="text" className="form-control"
                                        placeholder="CRF Here" value={this.state.crf} onChange={this.onCRFChange}/>
                                    </div>

                                    <div class="input-group mb-3">
                                        <label class="input-group-text" htmlFor="inputGroupSelect01">Resolution</label>
                                        <select class="form-select" id="inputGroupSelect01" defaultValue={-1}
                                                onChange={this.onResolutionChange} value={this.state.resolution}>
                                            <option value="-1">Original</option>
                                            <option value="1080" >1080p</option>
                                            <option value="720">720p</option>
                                            <option value="480">480p</option>
                                            <option value="360">360p</option>
                                            <option value="240">240p</option>
                                            <option value="144">144p</option>
                                        </select>
                                    </div>
                                    <div style={{ marginTop: "1em"}}>
                                        Notes:<br />
                                        1. The server will start a separate ffmpeg process to do the conversion in a separate thread;<br />
                                        2. FFMPEG will overwrite the existing file with the same name;
                                        3. A log file will be generated at the end of the conversion;
                                           Note that FFMPEG will output all the log to stderr instead of stdout for whateve reason.<br />
                                        4. The constant rate factor (CRF) can be from 0-63. Lower values mean better quality;
                                           According to <a href="https://trac.ffmpeg.org/wiki/Encode/VP9" target="_blank">FFMPEG's manual</a>, for
                                           WebM format (VP9 video encoder), recommended values range from 15-35;<br />
                                        5. According to <a href="https://developers.google.com/media/vp9/settings/vod/" target="_blank">
                                           Google's recommendation</a>, the CRF for different resolutions are: 36 for 360p, 33 for 480p, 32 for 720p and 31 for 1080p;<br />
                                        6. According to <a href="https://developers.google.com/media/vp9/the-basics" target="_blank">
                                           Google's manual</a>, for VP9, 480p is considered a safe resolution for a broad range of mobile and web devices.
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
            fileInfo: props.fileInfo,
            newFilepath: props.fileInfo.asset_dir + props.fileInfo.filename,
            refreshFileList: props.refreshFileList,
            show: props.show
        };
        this.handleCloseClick = this.handleCloseClick.bind(this);
        this.onFilepathChange = this.onFilepathChange.bind(this);
        this.handleSubmitClick = this.handleSubmitClick.bind(this);
    }

    componentDidMount() {
        $(this.modal).modal('show');
    }

    handleSubmitClick() {
        this.fetchDataFromServer();        
    }

    fetchDataFromServer() {                                      
        const payload = new FormData();
       // payload.append('asset_dir', this.state.fileInfo.asset_dir);
        payload.append('old_filepath', this.state.fileInfo.asset_dir + this.state.fileInfo.filename);
        payload.append('new_filepath', this.state.newFilepath);
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
            alert('Unable to move\n' + error);
        });
    }
    
    onFilepathChange(event) {
        this.setState({
            newFilepath: event.target.value
          });
    }

    handleCloseClick() {
        $(this.modal).modal('hide');
    }

    render() {
        
        if (this.state.show === false) {
            return null;
        }

        return (
                <div className="modal fade" ref={modal=> this.modal = modal} id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Move File</h5>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="move-destination-input" className="form-label">
                                        Move the file from <b>{this.state.fileInfo.asset_dir + this.state.fileInfo.filename}</b> to:
                                    </label>
                                    <input id="move-destination-input" type="text" className="form-control"
                                           placeholder="Input new filename" value={this.state.newFilepath} onChange={this.onFilepathChange}/>   
                                    <div style={{ marginTop: "1em"}}>
                                        Notes:<br />
                                        1. The server calls returns an error message if <a href="https://docs.python.org/3/library/os.path.html#os.path.ismount" target="_blank">
                                        os.path.ismount()</a> returns true;<br />
                                        2. the server calls <a href="https://docs.python.org/3/library/shutil.html#shutil.move" target="_blank">
                                        shutil.move()</a> to do the move;<br />
                                        3. If the destination is on a different filesystem, source file is copied to destination and then removed.
                                        (It could take a long time, consider a duplicate->move->remove approach instead!)<br />
                                        4. In case of symlinks, a new symlink pointing to the target of src will be created in or as dst and src will be removed.
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
            modalKey: 0,
            refreshFileList: props.refreshFileList,
            showModal: false,
            fileInfo: props.fileInfo
        };
        this.onMoveButtonClick = this.onMoveButtonClick.bind(this);
        this.onRemoveButtonClick = this.onRemoveButtonClick.bind(this);
        this.onTranscodeButtonClick = this.onTranscodeButtonClick.bind(this);
        this.Modal = null;
    }
    
    onRemoveButtonClick(event) {
        this.Modal = (
            <ModalRemove key={this.state.modalKey} 
                   fileInfo={this.state.fileInfo}
                   appAddress={this.state.appAddress}
                   refreshFileList={this.state.refreshFileList}
                   show={true}/>
              // By adding a key attribute, Modal will be created each time, so we
              //    can pass different show attribute to it.
        );
        this.setState(prevState => ({
            showModal: true,
            modalKey: prevState.modalKey + 1
        }));
    }

    onMoveButtonClick(event) {
        this.Modal = (
            <ModalMove key={this.state.modalKey} 
                   fileInfo={this.state.fileInfo}
                   appAddress={this.state.appAddress}
                   refreshFileList={this.state.refreshFileList}
                   show={true}/>
              // By adding a key attribute, Modal will be created each time, so we
              //    can pass different show attribute to it.
        );
        this.setState(prevState => ({
            showModal: true,
            modalKey: prevState.modalKey + 1
        }));
    }
    
    onTranscodeButtonClick(event) {
        this.Modal = (
            <ModalTranscode key={this.state.modalKey} 
                   fileInfo={this.state.fileInfo}
                   appAddress={this.state.appAddress}
                   refreshFileList={this.state.refreshFileList}
                   show={true}/>
              // By adding a key attribute, Modal will be created each time, so we
              //    can pass different show attribute to it.
        );
        this.setState(prevState => ({
            showModal: true,
            modalKey: prevState.modalKey + 1
        }));
    }

    render() {
        return (
            <div className="dropdown"  style={{ float: "right" }}>
                <svg className="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style={{ float: "right", cursor: "pointer" }}
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                </svg>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li><a className="dropdown-item" style={{ float: "right", cursor: "pointer" }} onClick={this.onMoveButtonClick}>Move</a></li>
                    <li><a className="dropdown-item" style={{ float: "right", cursor: "pointer" }} onClick={this.onTranscodeButtonClick}>Transcode to WebM</a></li>
                    <li><a className="dropdown-item" style={{ float: "right", cursor: "pointer" }} onClick={this.onRemoveButtonClick}>Remove</a></li>
                </ul>
                {this.Modal}
            </div>
        );
    }
}

/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
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
            username: null
        };
        this.onFileUpload = this.onFileUpload.bind(this);
        this.onFileChange = this.onFileChange.bind(this);
        this.onClickItem = this.onClickItem.bind(this);
        this.onClickMore = this.onClickMore.bind(this);
        this.onClickAddressBarGo = this.onClickAddressBarGo.bind(this);
        this.onAddressBarChange = this.onAddressBarChange.bind(this);
        this.handleUploadAttachmentButtonClick = this.handleUploadAttachmentButtonClick.bind(this);  
    }

    handleUploadAttachmentButtonClick(event) {
        $('#input-fileupload-attachment').click();
        // It is used to apply unified button style to file upload button...
        // It is jQuery...but ...it works!
    }

    onFileChange(event) { 
        for (let i = 0; i < event.target.files.length; i++) {
            if(event.target.files[0].size > 1024000000){
                alert("The file to be uploaded canNOT be larger than 1024 MB");
                return;
              };
            this.onFileUpload(event.target.files[i]);
        }        
    }; 

    onFileUpload(selectedFiles) {
        const payload = new FormData(); 
        payload.append('selected_files', selectedFiles);
        payload.append('asset_dir', this.state.currentPath); 
        var config = {
            onUploadProgress: function(progressEvent) {
                var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
               // if (percentCompleted < 100)
                    //this.setState({uploadProgress: percentCompleted}); //How set state with percentCompleted?
                //else
                    //this.setState({uploadProgress: null});
                console.log(percentCompleted);
            }.bind(this)
        };
    
        axios.post("https://media.sz.lan/upload/", payload, config)
        .then(response => {
            // an alert is not needed since the user will see the change of the files list.
            this.fetchDataFromServer(this.state.currentPath)
        })
        .catch(error => {
            console.log(error);
            alert('附件上传错误\n' + error);
            // You canNOT write error.response or whatever similar here.
            // The reason is that this catch() catches both network error and other errors,
            // which may or may not have a response property.
        });
    }

    componentDidMount() {
        this.fetchDataFromServer(this.state.currentPath);

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
    
    
    onAddressBarChange(event) {
        this.setState({
            addressBar: event.target.value
        });
    }
    
    onClickAddressBarGo(event) {
        this.fetchDataFromServer(this.state.addressBar);
    } 
    
    onClickItem(value) { 
        if (this.state.fileInfo.content[value].file_type === 0) {
            this.setState(prevState => ({
                currentPath: prevState.currentPath + value + '/'
            }), () => this.fetchDataFromServer(this.state.currentPath));
           // console.log(prevState.currentPath + value + '/');
        } else if (this.state.fileInfo.content[value].file_type === 1) {
            console.log('ordinary file [' + value + '] clicked');
            if (this.state.fileInfo.content[value].media_type < 2) {
                window.open('https://media.sz.lan/download/?asset_dir=' + this.state.fileInfo.metadata.asset_dir + '&filename=' + value); 
            } else if (this.state.fileInfo.content[value].media_type === 2) {
                window.open('https://media.sz.lan/play-video/?asset_dir=' + this.state.fileInfo.metadata.asset_dir + '&video_name=' + value); 
            }
        } else {
            console.log('special file [' + value + '] clicked');
        }
    }

    onClickMore(event) { 
        console.log('onClickMore!');
    };
      
    fetchDataFromServer(asset_dir) {
        if (asset_dir === null) {
            asset_dir = this.state.fileInfo.metadata.asset_dir;
        }
        URL = this.state.appAddress + '/get-file-list/?asset_dir=' + encodeURIComponent(asset_dir);
        console.log('Fetching: ' + URL);
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
            console.log(this.state.pathStack);
          })
          .catch(error => {
            alert('Unable to fetch fileInfo\n' + error);
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
            let filesize = null;
            if (fi.content[key].file_type === 0) {
                thumbnail = (
                    <img src='https://media.sz.lan/static/icons/folder.svg'
                         style={{ maxWidth: "100%", width: "10em", display:"block", float:"left", cursor: "pointer" }}
                         onClick={() => this.onClickItem(key)} />);
            }
            else if (fi.content[key].file_type === 1) {
                if (fi.content[key].media_type === 1) { // image
                    thumbnail = (
                        <img src={`https://media.sz.lan/get-thumbnail/?filename=${key}.jpg`}
                             style={{ maxWidth: "100%", maxHeight: "90vh", "display":"block", cursor: "pointer" }}
                             onClick={() => this.onClickItem(key)} />);
                } else if (fi.content[key].media_type === 2) { // video
                    thumbnail = (
                        <img src={`https://media.sz.lan/get-thumbnail/?filename=${key}.jpg`}
                             style={{ width: "10em", maxHeight: "50vh", "display":"block", float:"left", cursor: "pointer" }}
                             onClick={() => this.onClickItem(key)}
                             onError={(e)=>{e.target.onerror = null; e.target.src="https://media.sz.lan/static/icons/video.svg"}} />);
                } else if (fi.content[key].media_type === 0) { // not a media file
                    let url = null;
                    if ([".doc", ".docx", ".odt", ".rtf", ".docm", ".docx", "wps"].includes(fi.content[key].extension.toLowerCase())) {
                        url = "https://media.sz.lan/static/icons/word.svg"; 
                    } else if ([".htm", ".html", ".mht"].includes(fi.content[key].extension.toLowerCase())) {
                        url = "https://media.sz.lan/static/icons/html.svg"; 
                    } else if ([".7z", ".zip", ".rar", ".tar", ".gz"].includes(fi.content[key].extension.toLowerCase())) {
                        url = "https://media.sz.lan/static/icons/archive.svg"; 
                    } else if ([".mp3", ".wma", ".wav", ".ogg", ".flac"].includes(fi.content[key].extension.toLowerCase())) {
                        url = "https://media.sz.lan/static/icons/music.svg"; 
                    } else {
                        url = "https://media.sz.lan/static/icons/misc.svg"; 
                    }
                    thumbnail = (<img src={url} style={{ width: "10em", maxHeight: "50vh", "display":"block", float:"left", cursor: "pointer" }}
                                      onClick={() => this.onClickItem(key)} />);
                }
                filesize = (<p style={{ position: "absolute", bottom: "1px" }}>{humanFileSize(fi.content[key].size)}</p>);
            }
            fileList[i] = (
            <li key={i} className="list-group-item">                      
                <div class="row">
                    <div class="col" style={{ maxWidth: "11em" }}>
                        {thumbnail}
                    </div>
                    <div class="col">
                        <a value={key} style={{ textDecoration: "none", display: "block", cursor: "pointer" }} onClick={() => this.onClickItem(key)}>
                        {key}
                        </a>
                        {filesize}
                    </div>
                    <div class="col"  style={{ maxWidth: "2em" }}>
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

                            <input id="input-fileupload-attachment" onChange={this.onFileChange} type="file" style={{ display: "none" }} multiple></input>
                            <button id="button-addfile-attachment" type="button" className="btn btn-primary mx-2 my-1"
                                    onClick={this.handleUploadAttachmentButtonClick} >
                                <i className="bi bi-upload"></i> Upload
                            </button>
                            {/* button and input is bound using jQuery... */}

                            <button type="button" className="btn btn-primary mx-2 my-1"><i className="bi bi-folder-plus"></i> New Folder</button>
                            <button type="button" className="btn btn-primary mx-2 my-1"><i className="bi bi-gear"></i> Info</button>
                        </div>
                        <div className="col">
                            <div className="input-group d-flex justify-content-between mx-2 my-1">
                                {/* d-flex and justify-content-between keep components in one line*/}
                                <span className="input-group-text" id="basic-addon1">Path</span>
                                <input type="text" style={{ }} className="form-control" placeholder="Address"
                                        aria-label="Recipient's username" aria-describedby="button-addon2"
                                        value={this.state.addressBar} onChange={this.onAddressBarChange} id="address-input" />
                                <button className="btn btn-primary" type="button" onClick={this.onClickAddressBarGo} htmlFor="address-input" >
                                    <i className="bi bi-caret-right-fill"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <ul className="list-group" style={{ maxWidth: "1000px", marginLeft: "auto", marginRight: "auto" }}>
                    {fileList}
                    </ul>
                </div>
            </div>
        );
    }
}