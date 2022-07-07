import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

class ModalExtractSubtitles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: props.show,
      assetDir: props.assetDir,
      refreshFileList: props.refreshFileList,
      responseMessage: null,
      streamNo: 0,
      videoName: props.videoName
    };
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.onstreamNoChange = this.onstreamNoChange.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
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
      method: 'post',
      url: './extract-subtitles/',
      data: payload
    })
        .then((response) => {
          this.handleCloseClick();
          if (this.state.refreshFileList != null) {
            this.state.refreshFileList();
          }
        })
        .catch((error) => {
          console.log(error);
          this.setState({
            responseMessage: (
              <div className="alert alert-danger my-2" role="alert" style={{wordBreak: 'break-word'}}>
                Unable to extract subtitles from <strong style={{wordBreak: 'break-all'}}>
                  {this.state.videoName}
                </strong>:<br />{error.response.data}
              </div>
            )
          });
        });
  }

  onstreamNoChange(event) {
    this.setState({
      streamNo: event.target.value
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
        <Modal.Header><Modal.Title>Media Metadata</Modal.Title></Modal.Header>
        <Modal.Body mb={3}>{this.state.jsonHTML}
          <Form.Group>
            <Form.Label>
              Specify the stream ID (starting from 0) of the subtitles to be extracted:
            </Form.Label>
            <Form.Control type="text" placeholder="Input stream number"
              value={this.state.streamNo} onChange={this.onstreamNoChange} />
          </Form.Group>
          {this.state.responseMessage}
          <Accordion className="my-2">
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                What&apos;s Happening Under the Hood?
              </Accordion.Header>
              <Accordion.Body>
                <ol>
                  <li>
                    Subtitle extraction is much less expensive compared with transcoding.
                    You could expect the result within minutes;
                  </li>
                  <li>You can check the ID of a stream by using the Video Info function;</li>
                  <li>
                    The server uses <code>ffmpeg</code> to do the extraction.
                    If <code>ffmpeg</code> returns a non-zero exit code, a log file will be generated.
                  </li>
                </ol>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleCloseClick}>Close</Button>
          <Button variant="primary" onClick={this.handleSubmitClick}>Submit</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

ModalExtractSubtitles.propTypes = {
  show: PropTypes.bool,
  assetDir: PropTypes.string,
  refreshFileList: PropTypes.func,
  videoName: PropTypes.string
};

export {ModalExtractSubtitles};
