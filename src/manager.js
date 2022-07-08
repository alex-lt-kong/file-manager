import axios from 'axios';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {ModalMkdir} from './modal/mkdir.js';
import {FileItems} from './file-items';
import path from 'path';

class FileManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addressBar: '/',
      currentPath: '/',
      // CanNOT use currentPath as addressBar's value--addressBar's value has to change as user types while
      // currentPath should be set only after user presses Enter.
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
    this.onClickMore = this.onClickMore.bind(this);
    this.onClickAddressBarGo = this.onClickAddressBarGo.bind(this);
    this.onAddressBarEnterPress = this.onAddressBarEnterPress.bind(this);
    this.onFileUpload = this.onFileUpload.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
    this.onNewFolderClick = this.onNewFolderClick.bind(this);
    this.onServerInfoClick = this.onServerInfoClick.bind(this);
    this.fetchDataFromServer = this.fetchDataFromServer.bind(this);
    this.fileListShouldRefresh = this.fileListShouldRefresh.bind(this);
    this.serverInfoPanel;
    this.navigationBar = null;
  }


  onServerInfoClick(event) {
    this.fetchServerInfo();
  }

  onFileChange(event) {
    const maxUploadFileSize = 1024 * 1024 * 1024 * 4;
    for (let i = 0; i < event.target.files.length; i++) {
      if (event.target.files[0].size > maxUploadFileSize) {
        alert(`The file to be uploaded canNOT be larger than ${maxUploadFileSize / 1024 / 1024} MB`);
        return;
      };
      this.setState({
        selectedFile: event.target.files[i]
      });
      this.onFileUpload(event.target.files[i]);
    }
  }

  onFileUpload(selectedFiles) {
    const payload = new FormData();
    payload.append('selected_files', selectedFiles);
    payload.append('asset_dir', this.state.currentPath);
    const config = {
      onUploadProgress: function(progressEvent) {
        let percentCompleted = ((progressEvent.loaded * 100) / progressEvent.total).toFixed(2);
        // Here we ceil() the percentage point to an integer. If we don't round it, the number will change very freqneutly.
        // As a result, the page will be re-render()ed and for whatever reason the context menu may jump a little bit
        // if it is clicked when the page is render()ed.
        // Note that we use Math.ceil() instead of round() so that the page will show 1% immediately after the upload starts

        // However, the above issue appears to have been solved by limiting the height of filelist ul to 100vh. So now
        // we keep two decimal places to make the update more frequent--so that users will notice smaller upload progress
        // if the file being uploaded is large.
        if (percentCompleted < 100) {
          this.setState({uploadProgress: percentCompleted}); //How set state with percentCompleted?
        } else {
          this.setState({
            selectedFile: null,
            uploadProgress: null
          });
        }
        console.log(percentCompleted);
      }.bind(this)
    };

    axios.post('./upload/', payload, config)
        .then((response) => {
          alert('File uploaded! You need to manually refresh the file list to see the new file.');
          // Auto refresh when the offcanvas is still opened causes issues...
          // to make it simpler, I just remove the auto refresh function.
        })
        .catch((error) => {
          console.log(error);
          alert('Unable to upload files:\n' + error.response.data);
        });
  }

  componentDidMount() {
    this.fetchDataFromServer();
    // this.Modal = null;

    window.history.pushState(null, document.title, window.location.href);
    const self = this;
    // to make "this" work inside a eventlistener callback function,
    // we need to define self...
    window.addEventListener('popstate', function(event) {
      console.log('back button clicked!');
      if (self.state.pathStack.length >= 2) {
        self.setState((prevState) => ({
          currentPath: prevState.pathStack[prevState.pathStack.length - 2],
          pathStack: prevState.pathStack.slice(0, -1).slice(0, -1)
        }), () => self.fetchDataFromServer());
      }
      window.history.pushState(null, document.title, window.location.href);
    });
  }

  fileListShouldRefresh(newCurrentPath) {
    if (newCurrentPath === null) {
      this.fetchDataFromServer();
    } else {
      let formattedNewCurrentPath = path.resolve(newCurrentPath);
      formattedNewCurrentPath += (formattedNewCurrentPath.endsWith('/') ? '' : '/');
      this.setState({
        currentPath: formattedNewCurrentPath,
        addressBar: formattedNewCurrentPath
      }, ()=> {
        this.fetchDataFromServer();
      });
    }
  }

  dialogueShouldClose() {
    this.setState({
      modalDialogue: null
    });
  }

  onNewFolderClick(event) {
    this.setState({
      modalDialogue: null
    }, () => {
      console.log('onNewFolderClick()\'s callback fired!');
      this.setState({
        modalDialogue: (
          <ModalMkdir assetDir={this.state.currentPath} refreshFileList={this.fileListShouldRefresh} show={true} />
        )
      });
    });
  }

  onAddressBarChange(event) {
    this.setState({
      addressBar: event.target.value
    });
  }

  onClickAddressBarGo(event) {
    this.setState({
      currentPath: this.state.addressBar
    }, ()=>{
      this.fetchDataFromServer();
    });
  }

  onAddressBarEnterPress(event) {
    if (event.key !== 'Enter') {
      return;
    }
    this.setState({
      currentPath: this.state.addressBar
    }, ()=>{
      this.fetchDataFromServer();
    });
  }

  onClickMore(event) {
    console.log('onClickMore!');
  };

  fetchServerInfo() {
    this.serverInfoPanel = (
      <div className="d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
    this.forceUpdate();
    // You set it to a spinner before fetching data from the server.
    axios.get('./get-server-info/')
        .then((response) => {
          this.setState({
            serverInfo: response.data
          }, ()=> {
            const ffmpegItems = this.state.serverInfo.ffmpeg.map((ffmpegItem) =>
              <li key={ffmpegItem.pid} style={{wordBreak: 'break-all'}}>
                {ffmpegItem.cmdline} <b>(since {ffmpegItem.since})</b>
              </li>
            );
            this.serverInfoPanel = (
              <div>
                <p><b>CPU Usage: </b>{this.state.serverInfo.cpu.percent.map((p) => p.toString() + "% ")}</p>
                <p>
                  <b>Memory: </b>
                  {
                    Math.round(this.state.serverInfo.memory.physical_total / 1024 / 1024)
                        .toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  } MB in total,&nbsp;
                  {
                    Math.round(this.state.serverInfo.memory.physical_available / 1024 / 1024)
                        .toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  } MB free
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
          });
        })
        .catch((error) => {
          console.log(error);
          alert(`Unable to fetch server info. Reason:` +
          (error.response !== undefined) ? JSON.stringify(error.response): error);
        });
  }

  fetchDataFromServer() {
    const URL = './get-file-list/?asset_dir=' + encodeURIComponent(this.state.currentPath);

    axios.get(URL)
        .then((response) => {
          this.setState((prevState) => ({
            fileInfo: response.data,
            pathStack: [...prevState.pathStack, response.data.metadata.asset_dir]
          }));
        })
        .catch((error) => {
          console.error(error);
          alert('Unable to fetch fileInfo:\n' + error.response.data);
        });
  }

  ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
  }

  renderNavigationBar() {
    this.navigationBar = (
      <div className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
        <div className="row container-fluid">
          <div className="col-md-auto">
          {/* Use col-{breakpoint}-auto classes to size columns based on the natural width of their content. */}            
            <div className="btn-group">
              <button type="button" className="btn btn-primary dropdown-toggle mx-1 my-1" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="bi bi-plus-circle"></i> New..  
              </button>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottom"
                      aria-controls="offcanvasBottom"><i className="bi bi-upload"></i>  Upload File</a></li>
                <li><a className="dropdown-item" onClick={this.onNewFolderClick}><i className="bi bi-folder-plus"></i>  Create Folder</a></li>
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
    if (this.state.fileInfo === null) {
      return null;
    }
   // let fileList = this.generateFilesList(this.state.fileInfo.content);
    this.renderNavigationBar();

    return (
      <div>
        {this.navigationBar}
        <div>
          <ul className="list-group overflow-auto"
            style={{
              maxWidth: '1000px', maxHeight: '100%', minHeight: '60vh', marginLeft: 'auto', marginRight: 'auto'
            }}>
            {/* The maxHeight: 100% is used to solve a very nasty bug. The bug is like this:
                First, it only happens on smartphone and will not happen on desktop browser.
                On a mobile device, if you have a long file list and you try to open the
                menu for the file items shown on the last page of the list (i.e. not necessarily
                the last one, but the ones could be shown on the last page of the screen) you will
                notice that the poge will scroll up a little bit at the moment you click the
                "more" button. I failed to find any solutions or even references to this bug online.
                After a lot of trial-and-error, it turns out that if we set the maxHeight of the file
                list to the height of the monitor, the bug disappears...
                minHeight is used to fix another issue: suppose we set maxHeight only, if the content
                height is too small, the context menu can actually be higher than the content height,
                forcing the browser to show a scrollbar in order to accommodate the height of the context
                menu. If we set minHeight == 60vh, the content height will never to too small to accomodate
                the context menu.*/}
            <FileItems fileInfo={this.state.fileInfo} refreshFileList={this.fileListShouldRefresh}
              currentPath={this.state.currentPath}/>
          </ul>
        </div>
        {this.state.modalDialogue}
      </div>
    );
  }
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<div>
  <FileManager />
</div>);
