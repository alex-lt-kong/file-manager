import React from 'react';

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
        responseMessage: (<div className="alert alert-danger my-2" role="alert" style={{ wordBreak: "break-word" }}>
                            Unable to extract subtitles from <strong style={{ wordBreak: "break-all" }}>{this.state.videoName}</strong>:<br />{error.response.data}
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

export {ModalExtractSubtitles};