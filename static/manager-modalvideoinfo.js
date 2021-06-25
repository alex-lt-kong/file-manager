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
              <div className="alert alert-danger my-2" role="alert" style={{ wordBreak: "break-word" }}>
                Unable to fetch information from video <strong style={{ wordBreak: "break-all" }}>{this.state.videoName}</strong>:
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