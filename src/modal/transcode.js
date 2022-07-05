import axios from 'axios';
import React from 'react';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';
import Form from 'react-bootstrap/Form';
import Accordion from 'react-bootstrap/Accordion';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class ModalTranscode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: props.show,
      audioID: -1,
      crf: 30,
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
      url: './video-transcode/',
      data: payload
    })
        .then((response) => {
          this.handleCloseClick();
          if (this.state.refreshFileList != null) {
            this.state.refreshFileList();
          }
        })
        .catch((error) => {
          this.setState({
            responseMessage: (
              <div className="alert alert-danger my-2" role="alert" style={{wordBreak: 'break-word'}}>
                Unable to transcode <strong style={{wordBreak: 'break-all'}}>
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
    if (event.target.value === '1080') {
      autoCRF = 31;
    } else if (event.target.value === '720') {
      autoCRF = 32;
    } else if (event.target.value === '480') {
      autoCRF = 33;
    } else if (event.target.value === '360') {
      autoCRF = 36;
    } else if (event.target.value === '240') {
      autoCRF = 37;
    }
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
    this.setState({
      show: false
    });
  }

  render() {
    return (
      <Modal show={this.state.show}>
        <Modal.Header>
          <Modal.Title>Transcode video to WebM</Modal.Title>
        </Modal.Header>
        <Modal.Body md={3}>
          <span className="form-label" style={{wordBreak: 'break-word'}}>
            Transcode video
            <strong style={{wordBreak: 'break-all'}}>{this.state.fileInfo.filename}</strong>
            to WebM format (VP9) with the following parameters:
          </span>
          <Form.Group as={Row} className="my-3">
            <Form.Label column sm={3}>CRF</Form.Label>
            <Col sm={9}>
              <Form.Control type="text" placeholder="CRF" value={this.state.crf} onChange={this.onCRFChange} />
            </Col>
            <Form.Label column sm={3}>Audio ID</Form.Label>
            <Col sm={9}>
              <Form.Control type="text" placeholder="Audio stream ID"
                value={this.state.audioID} onChange={this.onAudioIDChange} />
            </Col>
            <Form.Label column sm={3}>Resolution</Form.Label>
            <Col sm={9}>
              <Form.Select className="form-select" id="inputSelectResolution" defaultValue={-1}
                onChange={this.onResolutionChange} >
                <option value="-1">Original</option>
                <option value="1080" >1080p</option>
                <option value="720">720p</option>
                <option value="480">480p</option>
                <option value="360">360p</option>
                <option value="240">240p</option>
                <option value="144">144p</option>
              </Form.Select>
            </Col>
            <Form.Label column sm={3}>Threads</Form.Label>
            <Col sm={9}>
              <Form.Control type="number" placeholder="Number of threads" value={this.state.threads}
                onChange={this.onThreadsChange} />
            </Col>
          </Form.Group>
          {this.state.responseMessage}
          <Accordion className="my-2">
            <Accordion.Item eventKey="0">
              <Accordion.Header>What&apos;s Happening Under the Hood?</Accordion.Header>
              <Accordion.Body>
                <ol>
                  <li>The server will start a separate <code>ffmpeg</code> process to do the conversion;</li>
                  <li>
                    The constant rate factor (CRF) can be from 0-63. Lower values mean better quality;
                    According to&nbsp;
                    <a href="https://trac.ffmpeg.org/wiki/Encode/VP9" target="_blank" rel="noreferrer">
                      ffmpeg&apos;s manual
                    </a>&nbsp;
                    , for WebM format (VP9 video encoder), recommended values range from 15-35;
                  </li>
                  <li>
                    After selecting the video quality, a CRF value will be automatically set according to&nbsp;
                    <a href="https://developers.google.com/media/vp9/settings/vod/" target="_blank" rel="noreferrer">
                      Google&apos;s recommendation
                    </a>;
                  </li>
                  <li>
                    According to&nbsp;
                    <a href="https://developers.google.com/media/vp9/the-basics" target="_blank" rel="noreferrer">
                      Google&apos;s manual
                    </a>&nbsp;
                    , for VP9, 480p is considered a safe resolution for a broad range of mobile and web devices.
                  </li>
                  <li>
                    Since modern browsers will pick the first audio stream (ID==0) and manual audio stream selection is
                    usually not possible, you can pick the preferred audio stream by its ID before transcoding so that
                    it becomes the only audio stream which will definitely be selected by browsers. You can find the
                    ID using <code>Video Info</code> function.
                  </li>
                  <li>
                    <code>threads</code>&nbsp;
                    can only be from 0 to 8 where 0 means ffmpeg selects the optimal value by itself. Note that
                    a large <code>threads</code> value may or may not translate to high performance but a
                    small <code>threads</code> will guarantee lower CPU usage.
                  </li>
                </ol>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Modal.Body>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={this.handleCloseClick}>Close</button>
          <button type="button" className="btn btn-primary" onClick={this.handleSubmitClick}>Submit</button>
        </div>
      </Modal>
    );
  }
}

ModalTranscode.propTypes = {
  show: PropTypes.bool,
  fileInfo: PropTypes.object,
  refreshFileList: PropTypes.func
};

export {ModalTranscode};
