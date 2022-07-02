class ModalMkdir extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      appAddress: props.appAddress,
      assetDir: props.assetDir,
      dialogueShouldClose: props.dialogueShouldClose,
      folderName: 'New Folder',
      refreshFileList: props.refreshFileList,
      responseMessage: null
    };
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.onFolderNameChange = this.onFolderNameChange.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
  }

  componentDidMount() {
    $(this.modal).modal('show');
    window.onpopstate = e => {
      this.handleCloseClick();
    }
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
      this.setState({
        responseMessage: (<div className="alert alert-danger my-2" role="alert" style={{ wordBreak: "break-word" }}>
                            Unable to create new folder <strong style={{ wordBreak: "break-all" }}>{payload.get('folder_name')}
                            </strong>:
                            <br />{error.response.data}
                          </div>)
      }); 
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
      <div className="modal fade" ref={modal=> this.modal = modal} role="dialog" aria-labelledby="exampleModalLabel"
           aria-hidden="true" data-bs-backdrop="static" >
      {/* Always set data-bs-backdrop="static" so clients can only close the dialogue with the close button,
          so the proper close methods will always be called.  */}
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
              </div>
              {this.state.responseMessage}
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