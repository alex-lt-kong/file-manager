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
      appAddress: props.appAddress,
      addressBar: '',
      currentPath: '/',
      fileInfo: null,
      modalDialogue: null,
      pathStack: [],
      selectedFile: null,
      serverInfo: null,
      showNewFolderModal: false,
      uploadProgress: 0,
      username: null
    };
    this.dialogueShouldClose = this.dialogueShouldClose.bind(this);
    this.onAddressBarChange = this.onAddressBarChange.bind(this);
    this.onClickItem = this.onClickItem.bind(this);
    this.onClickMore = this.onClickMore.bind(this);
    this.onClickAddressBarGo = this.onClickAddressBarGo.bind(this);
    this.onAddressBarEnterPress = this.onAddressBarEnterPress.bind(this);
    this.onFileUpload = this.onFileUpload.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
    this.onNewFolderClick = this.onNewFolderClick.bind(this);    
    this.onServerInfoClick = this.onServerInfoClick.bind(this);

    this.serverInfoPanel;
    this.navigationBar = null;
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
      alert('File uploaded! You need to manually refresh the file list to see the new file.');
      // Auto refresh when the offcanvas is still opened causes issues...
      // to make it simpler, I just remove the auto refresh function.
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

  dialogueShouldClose() {
    this.setState({
      modalDialogue: null
    });
  }

  onNewFolderClick(event) {
    this.setState({
      modalDialogue: (<ModalMkdir assetDir={this.state.currentPath}
                                  appAddress={this.state.appAddress}
                                  refreshFileList={this.fileListShouldRefresh} 
                                  dialogueShouldClose={this.dialogueShouldClose} />)
      // Tried many different solutions, a callback
      // to destory the Modal is still the best way 
      // to handle the close() event.
    });
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
            <b>FFmpeg:</b>
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

  generateThumbnailAndMetaData(key, content) {
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
    if (content.file_type === 0) { // file_type == 0: ordinary directory
      thumbnail = (
        <img src={`${this.state.appAddress}/static/icons/folder.svg`} style={{ width: "100%", cursor: "pointer" }}
              onClick={() => this.onClickItem(key)} />
        );
        // For svg <img>, we specify width: 100%;
        // For ordinary image we specify maxWidth: 100%
    } else if (content.file_type === 1) { // file_type == 1: ordinary file
      if (content.media_type === 1) { // image
        thumbnail = (
          <img src={`${this.state.appAddress}/get-thumbnail/?filename=${encodeURIComponent(key)}_${content.size}.jpg`}
              style={{ maxWidth: "100%", maxHeight: "90vh", "display":"block", cursor: "pointer" }}
              onClick={() => this.onClickItem(key)}
              onError={(e)=>{e.target.onerror = null; e.target.src=this.state.appAddress + "/static/icons/image.svg"; e.target.style="width: 100%"}} />);
            // For svg <img>, we specify width: 100%;
            // For ordinary image we specify maxWidth: 100%;
            // Note for onError we need to specify a special style;
      } else if (content.media_type === 2) { // video
        thumbnail = (
          <img src={`${this.state.appAddress}/get-thumbnail/?filename=${encodeURIComponent(key)}_${content.size}.jpg`}
              style={{ maxWidth: "100%", cursor: "pointer" }}
              onClick={() => this.onClickItem(key)}
              onError={(e)=>{e.target.onerror = null; e.target.src=this.state.appAddress + "/static/icons/video.svg"; e.target.style="width: 100%"}} />);
            // For svg <img>, we specify width: 100%;
            // For ordinary image we specify maxWidth: 100%;
            // Note for onError we need to specify a special style;
      } else if (content.media_type === 0) { // not a media file
        let url = null;
        if ([".doc", ".docx", ".odt", ".rtf", ".docm", ".docx", "wps"].includes(content.extension.toLowerCase())) {
          url = this.state.appAddress + "/static/icons/word.svg"; 
        } else if ([".htm", ".html", ".mht"].includes(content.extension.toLowerCase())) {
          url = this.state.appAddress + "/static/icons/html.svg"; 
        } else if ([".pdf"].includes(content.extension.toLowerCase())) {
          url = this.state.appAddress + "/static/icons/pdf.svg";
        } else if ([".7z", ".zip", ".rar", ".tar", ".gz"].includes(content.extension.toLowerCase())) {
          url = this.state.appAddress + "/static/icons/archive.svg"; 
        } else if ([".mka", ".mp3", ".wma", ".wav", ".ogg", ".flac"].includes(content.extension.toLowerCase())) {
          url = this.state.appAddress + "/static/icons/music.svg"; 
        } else {
          url = this.state.appAddress + "/static/icons/misc.svg"; 
        }
        thumbnail = (<img src={url} style={{ width: "100%", "display":"block", float:"left", cursor: "pointer" }}
                  onClick={() => this.onClickItem(key)} />);
              // For svg <img>, we specify width: 100%;
              // For ordinary image we specify maxWidth: 100%
      }
      fileMetaData = (<span><b>size:</b> {humanFileSize(content.size)}, <b>views</b>: {content.stat.downloads}</span>);
    } else if (content.file_type === 2) { // file_type == 2: mountpoint
      fileMetaData = 'mountpoint';
      thumbnail = (
        <img src={`${this.state.appAddress}/static/icons/special-folder.svg`} style={{ width: "100%", cursor: "pointer" }}
              onClick={() => this.onClickItem(key)} />
        );
        // For svg <img>, we specify width: 100%;
        // For ordinary image we specify maxWidth: 100%
    } else if (content.file_type === 3) { // file_type == 3: symbolic link
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

    return {
      thumbnail: thumbnail,
      fileMetaData: fileMetaData,
    };
  }

  generateFilesList(fic) {
    const keys = Object.keys(fic);
    let fileList = new Array(keys.length);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];     
      
      let retval = this.generateThumbnailAndMetaData(key, fic[key]);
      let thumbnail = retval.thumbnail;
      let fileMetaData = retval.fileMetaData;

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
            <ContextMenu refreshFileList={this.fileListShouldRefresh} fileInfo={fic[key]} appAddress={this.state.appAddress} /> 
          </div>
        </div>     
      </li>
      );
    }

    return fileList;
  }

  renderNavigationBar() {
    this.navigationBar = (
      <div className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
        <div className="row container-fluid">
          <div className="col-md-auto">
          {/* Use col-{breakpoint}-auto classes to size columns based on the natural width of their content. */}            
            <div class="btn-group">
              <button type="button" class="btn btn-primary dropdown-toggle mx-1 my-1" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-plus-circle"></i> New..  
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottom"
                      aria-controls="offcanvasBottom"><i className="bi bi-upload"></i>  Upload File</a></li>
                <li><a class="dropdown-item" onClick={this.onNewFolderClick}><i className="bi bi-folder-plus"></i>  Create Folder</a></li>
              </ul>
            </div>
            <div className="offcanvas offcanvas-bottom h-auto"
                 id="offcanvasBottom" aria-labelledby="offcanvasBottomLabel">
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
                      <p>Interestingly, while it may appear that the page only supports single-file upload, you can actually upload more
                        files even if previous ones are still being transferred. (But multiple upload processes will share the same progress bar ¯\_(ツ)_/¯)</p>
                    </div>                    
              </div>
            </div>        
            <button className="btn btn-primary mx-1 my-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottomServerInfo"
                    aria-controls="offcanvasBottomServerInfo"
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
              <span className="input-group-text" id="basic-addon1"></span>
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
    );
  }


  render() {
    if (this.state.fileInfo === null) { return null; }
    let fileList = this.generateFilesList(this.state.fileInfo.content);
    this.renderNavigationBar();

    return (      
      <div>
        {this.navigationBar}
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
        {this.state.modalDialogue}
      </div>
    );
  }
}

ReactDOM.render(
  <div>
      <FileManager appAddress={app_address} />
  </div>,
  document.querySelector('#root'),
);
