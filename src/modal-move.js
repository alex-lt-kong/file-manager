import React from 'react';

class ModalMove extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dialogueShouldClose: props.dialogueShouldClose,
      disableSubmitByDirName: false,
      disableSubmitByFileName: false,
      disableSubmitBySubmit: false,
      fileInfo: props.fileInfo,
      newFileDir: props.fileInfo.asset_dir,
      newFileName: props.fileInfo.filename,
      refreshFileList: props.refreshFileList,
      responseMessage: null
    };
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleRegularizationClick = this.handleRegularizationClick.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);    
    this.onFileDirChange = this.onFileDirChange.bind(this);
    this.onFileNameChange = this.onFileNameChange.bind(this);
  }

  componentDidMount() {
    $(this.modal).modal('show');
    window.onpopstate = e => {
      this.handleCloseClick();
    };
  }

  handleSubmitClick() {
    this.setState({
      disableSubmitBySubmit: true
    });
    // The move operation is different from many other methods because it is synchronous.
    // So we disable the submit button to prevent users from clicking it twice--by rights,
    // clicking it twice should not cause any issue since the second move will be blocked (FileExistsError) anyway.
    // It is mainly used to reduce users confusion.
    this.fetchDataFromServer();    
  }

  handleRegularizationClick() {
    this.setState(prevState => ({
      newFileName: prevState.newFileName.toLowerCase().replace(/[&\/\\#,+()$~%'":*?<>{}\[\]]/g, '-').replace(/\s+/g, '-').replace('---', '_')
    }));
  }

  fetchDataFromServer() {                    
    const payload = new FormData();
    payload.append('old_filepath', this.state.fileInfo.asset_dir + this.state.fileInfo.filename);
    payload.append('new_filepath', this.state.newFileDir + this.state.newFileName);
    axios({
      method: "post",
      url: "./move/",
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
        responseMessage: (<div className="alert alert-danger my-2" role="alert" style={{ wordBreak: "break-word" }}>
                            Unable to move file from <strong style={{ wordBreak: "break-all" }}>{payload.get('old_filepath')}
                            </strong> to <strong style={{ wordBreak: "break-all" }}>{payload.get('new_filepath')}</strong>:
                            <br />{error.response.data}
                          </div>)
      });   
    });
  }
  
  onFileDirChange(event) {
    var newVal = event.target.value.replace('\n', '').replace('\r', '');
    if (newVal.endsWith('/')) {
      this.setState({
        responseMessage: null,
        disableSubmitByDirName: false
      });

    } else {
      this.setState({
        responseMessage: (<div className="alert alert-warning mb-3" role="alert" style={{ wordBreak: "break-word" }}>
                            New directory <strong style={{ wordBreak: "break-all" }}>{newVal}</strong> does not end with a <code>/</code>.
                            If submitted, the section after the last <code>/</code> will be interpreted as a part of the new filename by the server,
                            which is usually not desired. To avoid the ambiguity, you need to append a <code>/</code> to the end of the directory to submit.
                          </div>),
        disableSubmitByDirName: true
      });
    }
    this.setState({
      newFileDir: newVal
      });
  }
  
  onFileNameChange(event) {
    var newVal = event.target.value.replace('\n', '').replace('\r', '');
    if (newVal.includes('/')) {
      this.setState({
        responseMessage: (<div className="alert alert-warning mb-3" role="alert" style={{ wordBreak: "break-word" }}>
                            New filename <strong style={{ wordBreak: "break-all" }}>{newVal}</strong> contains <code>/</code>, which will be interpreted as 
                            a separate directory by the server. To avoid ambiguity, this value cannot be submitted.
                          </div>),
        disableSubmitByFileName: true
      });
    } else {
      this.setState({
        responseMessage: null,
        disableSubmitByFileName: false
      });
    }
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
                  <label className="form-label" style={{wordBreak: 'break-word'}}>
                    Move the file from <strong style={{wordBreak: 'break-all'}}>{this.state.fileInfo.asset_dir + this.state.fileInfo.filename}</strong> to:
                  </label>
                  <div className="input-group mb-1">
                    <span className="input-group-text font-monospace">Directory</span>
                    <textarea type="text" className="form-control" rows="2"  style={{ wordBreak: "break-all" }}
                              placeholder="Input new filename" value={this.state.newFileDir} onChange={this.onFileDirChange} />
                  </div>
                  <div className="input-group mb-3">
                    <span className="input-group-text font-monospace">Filename&nbsp;</span>
                    <textarea type="text" className="form-control" rows="2" style={{ wordBreak: "break-all" }}
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
                          <ol>
                            <li>The server returns an error message if <a href="https://docs.python.org/3/library/os.path.html#os.path.ismount" target="_blank">
                                os.path.ismount()</a> returns true;</li>
                            <li>The server calls <a href="https://docs.python.org/3/library/shutil.html#shutil.move" target="_blank">
                                shutil.move()</a> to do the move;</li>
                            <li>If the destination is on a different filesystem, source file is copied to destination and then removed <strong>
                              (It could take a long time!)</strong>;</li>
                            <li>In case of symlinks, a new symlink pointing to the target of src will be created in or as dst and src will be removed.</li>
                            <li><code>Regularize Filename</code> is used to make a filename more machine-friendly: it converts all letters to lowercase, replaces
                                each special character (including space) with a <code>-</code> and then replaces a <code>---</code> with a <code>_</code></li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={this.handleCloseClick}>Close</button>
                <button type="button" className="btn btn-primary"  onClick={this.handleRegularizationClick}>Regularize Filename</button>
                <button type="button" className="btn btn-primary"
                        disabled={this.state.disableSubmitByFileName || this.state.disableSubmitByDirName || this.state.disableSubmitBySubmit}
                        onClick={this.handleSubmitClick}>OK</button>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

export {ModalMove};
