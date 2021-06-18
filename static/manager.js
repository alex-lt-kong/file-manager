class ModalTranscode extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            appAddress: props.appAddress,
            fileInfo: props.fileInfo,
            crf: 30,
            refreshFileList: props.refreshFileList,
            show: props.show
        };
        this.handleCloseClick = this.handleCloseClick.bind(this);
        this.onCRFChange = this.onCRFChange.bind(this);
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
        payload.append('asset_dir', this.state.fileInfo.asset_dir);
        payload.append('video_name', this.state.fileInfo.filename);
        payload.append('crf', this.state.crf);
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
                                <h5 className="modal-title" id="exampleModalLabel">Video Transcode</h5>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label for="exampleFormControlInput1" className="form-label">
                                        Transcode video <b>{this.state.fileInfo.filename}</b> to WebM format (VP9) with the following CRF
                                        (The CRF value can be from 0–63. Lower values mean better quality. Recommended values range from 15–35, with 31 being recommended for 1080p HD video.
                                            https://developers.google.com/media/vp9/settings/vod/):
                                    </label>
                                    <input type="text" className="form-control"
                                           placeholder="Input CRF" value={this.state.crf} onChange={this.onCRFChange}/>
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
                                    <label for="exampleFormControlInput1" className="form-label">
                                        Move the file from <b>{this.state.fileInfo.asset_dir + this.state.fileInfo.filename}</b> to:
                                    </label>
                                    <input type="text" className="form-control"
                                           placeholder="Input new filename" value={this.state.newFilepath} onChange={this.onFilepathChange}/>   
                                    <div style={{ marginTop: "1em"}}>
                                        Notes:<br />
                                        1. After parameters validation, the server calls&nbsp;<a href="https://docs.python.org/3/library/shutil.html#shutil.move" target="_blank">
                                        shutil.move()</a>&nbsp;to do the move;<br />
                                        2. If the destination is on a different filesystem, source file is copied to destination and then removed.
                                        (It could take a long time, consider a duplicate->move->remove approach instead!)<br />
                                        3. In case of symlinks, a new symlink pointing to the target of src will be created in or as dst and src will be removed.
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
        this.onTranscodeButtonClick = this.onTranscodeButtonClick.bind(this);
        this.Modal = null;
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
            <div class="dropdown"  style={{ float: "right" }}>
                <svg class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style={{ float: "right", cursor: "pointer" }}
                    xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                </svg>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                    <li><a class="dropdown-item" onClick={this.onMoveButtonClick}>Move</a></li>
                    <li><a class="dropdown-item" onClick={this.onTranscodeButtonClick}>Transcode to WebM</a></li>
                    <li><a class="dropdown-item" href="#">Something else here</a></li>
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
        this.onClickItem = this.onClickItem.bind(this);
        this.onClickMore = this.onClickMore.bind(this);
        this.onClickAddressBarGo = this.onClickAddressBarGo.bind(this);
        this.onAddressBarChange = this.onAddressBarChange.bind(this);
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
            console.log('ordinary directory [' + value + '] clicked');
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
        console.log('fetchDataFromServer(asset_dir)');
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
                <div className="input-group mb-3 fixed-top">
                    <input type="text" className="form-control" placeholder="Address" aria-label="Recipient's username" aria-describedby="button-addon2"
                    value={this.state.addressBar} onChange={this.onAddressBarChange} />
                    <button className="btn btn-primary" type="button" onClick={this.onClickAddressBarGo} >Go</button>
                </div>
                <ul className="list-group" style={{ marginTop: "2em"}}>
                {fileList}
                </ul>
            </div>
        );
    }
}