import axios from 'axios';
import React from 'react';

class ModalTranscode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      audioID: -1,
      crf: 30,
      dialogueShouldClose: props.dialogueShouldClose,
      fileInfo: props.fileInfo,
      refreshFileList: props.refreshFileList,
      resolution: -1,
      threads: 0
    };
    this.onAudioIDChange = this.onAudioIDChange.bind(this);
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.onCRFChange = this.onCRFChange.bind(this);
    this.onResolutionChange = this.onResolutionChange.bind(this);
    this.onThreadsChange = this.onThreadsChange.bind(this);
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
    payload.append('asset_dir', this.state.fileInfo.asset_dir);
    payload.append('audio_id', this.state.audioID);
    payload.append('video_name', this.state.fileInfo.filename);
    payload.append('crf', this.state.crf);
    payload.append('resolution', this.state.resolution);
    payload.append('threads', this.state.threads);
    axios({
      method: 'post',
      url: "./video-transcode/",
      data: payload,
    })
        .then((response) => {
          this.handleCloseClick();
          if (this.state.refreshFileList != null) {
            this.state.refreshFileList();
          }
        })
        .catch(error => {
          this.setState({
            responseMessage: (
              <div className="alert alert-danger my-2" role="alert" style={{wordBreak: 'break-word'}}>
                Unable to transcode <strong style={{ wordBreak: "break-all" }}>
                  {payload.get('video_name')}
                </strong>:<br />{error.response.data}
              </div>)
          });
        });
  }

  onResolutionChange(event) {
    this.setState({
      resolution: event.target.value
    });

    let autoCRF = 0;
    if (event.target.value === '1080') { autoCRF = 31; }
    else if (event.target.value === '720') { autoCRF = 32; }
    else if (event.target.value === '480') { autoCRF = 33; }
    else if (event.target.value === '360') { autoCRF = 36; }
    else if (event.target.value === '240') { autoCRF = 37; }
    if (autoCRF != 0) {
      this.setState({
        crf: autoCRF
      });
    }
  }

  onCRFChange(event) {
    this.setState({
      crf: event.target.value
    });
  }

  onThreadsChange(event) {
    this.setState({
      threads: event.target.value
    });
  }

  onAudioIDChange(event) {
    this.setState({
      audioID: event.target.value
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
        aria-labelledby="modal-video-transcode-title" aria-hidden="true">
        {/* Always set data-bs-backdrop="static" so clients can only close the dialogue with the close button,
        so the proper close methods will always be called.  */}
        <div className="modal-dialog modal-dialog-scrollable" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="modal-video-transcode-title">Video Transcode</h5>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <span htmlFor="exampleFormControlInput1" className="form-label" style={{wordBreak: "break-word"}}>
                  Transcode video <b style={{ wordBreak: "break-all" }}>{this.state.fileInfo.filename}</b> to WebM format (VP9) with the following parameters:
                </span>
                <div className="input-group my-1">
                  <span className="input-group-text">CRF</span>
                  <input type="text" className="form-control"
                    placeholder="CRF" value={this.state.crf} onChange={this.onCRFChange} />
                  <span className="input-group-text">Audio ID</span>
                  <input type="text" className="form-control"
                    placeholder="Audio stream ID" value={this.state.audioID} onChange={this.onAudioIDChange} />
                </div>

                <div className="input-group my-1">
                  <label className="input-group-text" htmlFor="inputSelectResolution">Resolution</label>
                  <select className="form-select" id="inputSelectResolution" defaultValue={-1}
                    onChange={this.onResolutionChange} >
                    <option value="-1">Original</option>
                    <option value="1080" >1080p</option>
                    <option value="720">720p</option>
                    <option value="480">480p</option>
                    <option value="360">360p</option>
                    <option value="240">240p</option>
                    <option value="144">144p</option>
                  </select>
                </div>

                <div className="input-group my-1">
                  <span className="input-group-text">Threads</span>
                  <input type="number" className="form-control" placeholder="Number of threads"
                    min="1" max="8" value={this.state.threads} onChange={this.onThreadsChange} />
                </div>

                {this.state.responseMessage}
                <div className="accordion my-2" id="accordionRemove">
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="headingRemove">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapseRemoveOne" aria-expanded="false" aria-controls="collapseRemoveOne">
                        What's Happening Under the Hood?
                      </button>
                    </h2>
                    <div id="collapseRemoveOne" className="accordion-collapse collapse" aria-labelledby="headingRemove"
                      data-bs-parent="#accordionRemove">
                      <div className="accordion-body">
                        <ol>
                          <li>The server will start a separate <code>ffmpeg</code> process to do the conversion;</li>
                          <li>The constant rate factor (CRF) can be from 0-63. Lower values mean better quality;
                          According to <a href="https://trac.ffmpeg.org/wiki/Encode/VP9" target="_blank">ffmpeg's manual</a>, for
                          WebM format (VP9 video encoder), recommended values range from 15-35;</li>
                          <li>After selecting the video quality, a CRF value will be automatically set according 
                            to <a href="https://developers.google.com/media/vp9/settings/vod/" target="_blank">
                          Google's recommendation</a>;</li>
                          <li>According to <a href="https://developers.google.com/media/vp9/the-basics" target="_blank">
                          Google's manual</a>, for VP9, 480p is considered a safe resolution for a broad range of mobile and web devices.</li>
                          <li>Since modern browsers will pick the first audio stream (ID==0) and manual audio stream selection is usually not possible,
                              you can pick the preferred audio stream by its ID before transcoding so that it becomes the only audio stream which
                              will definitely be selected by browsers. You can find the ID using <code>Video Info</code> function.</li>
                          <li><code>threads</code> can only be from 0 to 8 where 0 means ffmpeg selects the optimal value by itself. Note that
                          a large <code>threads</code> value may or may not translate to high performance but a
                          small <code>threads</code> will guarantee lower CPU usage.</li>
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

export {ModalTranscode};
