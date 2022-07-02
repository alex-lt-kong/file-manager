import React from 'react';

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
        responseMessage: (<div className="alert alert-danger my-2" role="alert" style={{ wordBreak: "break-word" }}>
                            Unable to remove <strong style={{ wordBreak: "break-all" }}>{this.state.fileInfo.filename}</strong>:<br />{error.response.data}
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
                <span className="form-label" style={{ wordBreak: "break-all" }}>
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

export {ModalRemove};
