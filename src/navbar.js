import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import {ModalMkdir} from './modal/mkdir.js';

class NavigationBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      currentPath: props.currentPath,
      onFileItemClicked: props.onFileItemClicked,
      modalDialogue: null
    };
    this.onNewFolderClick = this.onNewFolderClick.bind(this);
    this.onServerInfoClick = this.onServerInfoClick.bind(this);
    this.onClickAddressBarGo = this.onClickAddressBarGo.bind(this);
    this.onAddressBarEnterPress = this.onAddressBarEnterPress.bind(this);
    this.onFileUpload = this.onFileUpload.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentPath !== this.props.currentPath) {
      this.setState({
        currentPath: this.props.currentPath
      });
    }
  }

  onAddressBarEnterPress(event) {
    if (event.key !== 'Enter') {
      return;
    }
    this.setState({
      currentPath: this.state.addressBar
    }, ()=>{
      this.props.refreshFileList();
    });
  }

  onClickAddressBarGo(event) {
    this.setState({
      currentPath: this.state.addressBar
    }, ()=>{
      this.props.refreshFileList();
    });
  }

  onServerInfoClick(event) {
    this.fetchServerInfo();
  }

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
                <p><b>CPU Usage: </b>{this.state.serverInfo.cpu.percent.map((p) => p.toString() + '% ')}</p>
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
          console.error(error);
          alert(`Unable to fetch server info. Reason:` +
          (error.response !== undefined) ? JSON.stringify(error.response): error);
        });
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
        const percentCompleted = ((progressEvent.loaded * 100) / progressEvent.total).toFixed(2);
        /*
        Here we ceil() the percentage point to an integer. If we don't round it, the number will changevery freqneutly.
        As a result, the page will be re-render()ed and for whatever reason the context menu may jump a little bit
        if it is clicked when the page is render()ed. Note that we use Math.ceil() instead of round() so that the page
        will show 1% immediately after the upload starts

        However, the above issue appears to have been solved by limiting the height of filelist ul to 100vh. So now
        we keep two decimal places to make the update more frequent--so that users will notice smaller upload progress
        if the file being uploaded is large.
        */
        if (percentCompleted < 100) {
          this.setState({uploadProgress: percentCompleted}); // How set state with percentCompleted?
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
          console.error(error);
          alert('Unable to upload files:\n' + error.response.data);
        });
  }

  onNewFolderClick(event) {
    this.setState({
      modalDialogue: null
    }, () => {
      this.setState({
        modalDialogue: (
          <ModalMkdir assetDir={this.state.currentPath} refreshFileList={this.props.refreshFileList} show={true} />
        )
      });
    });
  }

  render() {
    return (
      <div className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
        {this.state.modalDialogue}
        <div className="row container-fluid">
          <div className="col-md-auto">
            {/* Use col-{breakpoint}-auto classes to size columns based on the natural width of their content. */}
            <div className="btn-group">
              <button type="button" className="btn btn-primary dropdown-toggle mx-1 my-1"
                data-bs-toggle="dropdown" aria-expanded="false">
                <i className="bi bi-plus-circle"></i> New..
              </button>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#" data-bs-toggle="offcanvas" data-bs-target="#offcanvasBottom"
                  aria-controls="offcanvasBottom"><i className="bi bi-upload"></i>  Upload File</a></li>
                <li>
                  <a className="dropdown-item" onClick={this.onNewFolderClick}>
                    <i className="bi bi-folder-plus"></i>  Create Folder
                  </a>
                </li>
              </ul>
            </div>
            <div className="offcanvas offcanvas-bottom h-auto"
              id="offcanvasBottom" aria-labelledby="offcanvasBottomLabel">
              <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="offcanvasBottomLabel"><b>File Upload</b></h5>
                <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close" />
              </div>
              <div className="offcanvas-body" style={{fontSize: '0.85em'}}>
                {/* d-flex align-items-center justify-content-center: used to center
                this.serverInfoPanel horizontally and vertically
                    However, after adding d-flex align-items-center justify-content-center,
                    the scroll function of offcanvas will be broken. So now these attributes are
                    NOT added. */}
                <div className="">
                  <p style={{wordBreak: 'break-all'}}>
                    <b>Name: </b>{this.state.selectedFile === null ? 'NA' : this.state.selectedFile.name}
                  </p>
                  <p>
                    <b>Size: </b>
                    {
                      this.state.selectedFile === null ?
                      '0' : (this.state.selectedFile.size / 1024 / 1024).toFixed(2) + 'MB'
                    }
                  </p>
                </div>
                <div className="progress">
                  <div className="progress-bar" role="progressbar"
                    style={{width: this.state.uploadProgress != null ? this.state.uploadProgress + '%' : '0%'}}
                    aria-valuenow={this.state.uploadProgress} aria-valuemin="0" aria-valuemax="100">
                    {this.state.uploadProgress != null ? this.state.uploadProgress + '%' : ''}
                  </div>
                </div>
                <div>
                  <input onChange={this.onFileChange} type="file" className="my-3"></input>
                  <p>
                    Interestingly, while it may appear that the page only supports single-file upload, you
                    can actually upload more files even if previous ones are still being transferred.
                    (But multiple upload processes will share the same progress bar ¯\_(ツ)_/¯)
                  </p>
                </div>
              </div>
            </div>
            <button className="btn btn-primary mx-1 my-1" type="button" data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasBottomServerInfo"aria-controls="offcanvasBottomServerInfo"
              onClick={this.onServerInfoClick}>
              <i className="bi bi-gear"></i> Info
            </button>
            <div className="offcanvas offcanvas-bottom h-auto" id="offcanvasBottomServerInfo"
              aria-labelledby="offcanvasBottomServerInfoLabel">
              <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="offcanvasBottomServerInfoLabel"><b>Server Info</b></h5>
                <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close" />
              </div>
              <div className="offcanvas-body" style={{fontSize: '0.85em'}}>
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
                value={this.state.addressBar} onChange={this.onAddressBarChange}
                onKeyPress={this.onAddressBarEnterPress}  id="address-input" />
              <button className="btn btn-primary" type="button"
                onClick={this.onClickAddressBarGo} htmlFor="address-input" >
                <i className="bi bi-caret-right-fill"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

NavigationBar.propTypes = {
  onFileItemClicked: PropTypes.func,
  refreshFileList: PropTypes.func,
  currentPath: PropTypes.string
};

export {NavigationBar};
