import axios from 'axios';
import React from 'react';
import Alert from 'react-bootstrap/Alert';
import {createRoot} from 'react-dom/client';
import {syntaxHighlight} from '../utils';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup'

class VideoViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: props.params,
      assetDir: props.params.asset_dir,
      jsonHTML: null,
      videoName: props.params.filename,
      subtitlesURL: `../download/?asset_dir=${encodeURIComponent(props.params.asset_dir)}&` +
        `filename=${encodeURIComponent(props.params.filename)}.vtt`,
      videoPlaybackRate: 1,
      username: null,
      fileStats: {}
    };

    this.onPlaybackSpeedInputChange = this.onPlaybackSpeedInputChange.bind(this);
    this.onPlayFasterButtonClick = this.onPlayFasterButtonClick.bind(this);
    this.onPlaySlowerButtonClick = this.onPlaySlowerButtonClick.bind(this);
    this.onSubtitlesURLTextareaChange = this.onSubtitlesURLTextareaChange.bind(this);
    this.onCanPlayEvent = this.onCanPlayEvent.bind(this);
    this.videoURL = '../download/?asset_dir=' +
                    encodeURIComponent(this.state.assetDir) + '&filename=' +
                    encodeURIComponent(this.state.videoName) + '&as_attachment=0';
    this.videoRef = React.createRef();
  }

  onPlaybackSpeedInputChange(event) {
    if (isNaN(parseFloat(event.target.value)) || parseFloat(event.target.value) <= 0.2 ||
        parseFloat(event.target.value) > 10) {
      return;
    }
    this.setState({
      videoPlaybackRate: parseFloat(event.target.value)
    }, () => {
      this.videoRef.current.playbackRate = this.state.videoPlaybackRate;
    });
  }

  onPlayFasterButtonClick(event) {
    this.setState((prevState) =>({
      videoPlaybackRate: prevState.videoPlaybackRate + 0.1
    }), () => {
      this.videoRef.current.playbackRate = this.state.videoPlaybackRate;
    });
  }

  onPlaySlowerButtonClick(event) {
    if (this.state.videoPlaybackRate <= 0.2) {
      return;
    }

    this.setState((prevState) =>({
      videoPlaybackRate: prevState.videoPlaybackRate - 0.1
    }), () => {
      this.videoRef.current.playbackRate = this.state.videoPlaybackRate;
    });
  }

  onCanPlayEvent(event) {
    this.videoRef.current.playbackRate = 3;
  }

  onSubtitlesURLTextareaChange(event) {
    this.setState({
      subtitlesURL: event.target.value
    });
  }

  componentDidMount() {
    this.fetchDataFromServer(this.state.currentPath);
  }

  fetchDataFromServer() {
    axios.get(
        `../get-media-info/?asset_dir=${encodeURIComponent(this.state.assetDir)}&` +
        `media_filename=${encodeURIComponent(this.state.videoName)}`
    )
        .then((response) => {
          this.setState({
            videoInfo: response.data,
            jsonHTML: syntaxHighlight(JSON.stringify(response.data.content, null, 2))
          });
        })
        .catch((error) => {
          console.error(error);
          this.setState({
            jsonHTML: (
              <Alert variant='danger'>
                Unable to fetch information from media <strong style={{wordBreak: 'break-all'}}>
                  {this.state.mediaFilename}
                </strong>:
                <br />{error.response.data}
              </Alert>
            ),
            mediaInfo: false
          });
        });

    axios.get(
        `../get-file-stats/?asset_dir=${encodeURIComponent(this.state.assetDir)}&` +
      `filename=${encodeURIComponent(this.state.videoName)}`
    )
        .then((response) => {
          this.setState({
            fileStats: response.data
          });
        })
        .catch((error) => {
          this.setState({
            fileStats: {}
          });
          console.error(error);
        });
  }

  render() {
    return (
      <Container fluid className="my-2">
        <Row className="flex-row-reverse">
          <Col sm={3}>
            <Accordion mb={2} defaultActiveKey="0" alwaysOpen>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Basic Information</Accordion.Header>
                <Accordion.Body>
                  <p className="my-1" style={{wordBreak: 'break-all'}}><b>Name: </b>{this.state.fileStats.filename}</p>
                  <p className="my-1" style={{wordBreak: 'break-all'}}>
                    <strong>URL: </strong><a href={this.videoURL}>{this.videoURL}</a>
                  </p>
                  <p className="my-1" style={{wordBreak: 'break-all'}}><b>Views: </b>{this.state.fileStats.views}</p>
                  <p className="my-1" style={{wordBreak: 'break-all'}}>
                    <b>Last View: </b>{this.state.fileStats.last_view}
                  </p>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Technical Information</Accordion.Header>
                <Accordion.Body>{this.state.jsonHTML}</Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>

          <Col sm={9}>
            <video style={{width: '100%', maxHeight: '90vh', backgroundColor: 'black'}} ref={this.videoRef}
              autoPlay={true} controls>
              <source src={this.videoURL} />
              <textarea className="form-control" style={{wordBreak: 'break-all'}} aria-label="With textarea"
                onChange={this.onSubtitlesURLTextareaChange} value={this.state.subtitlesURL} />
              <track label="English" kind="subtitles" srcLang="en" src={this.state.subtitlesURL} default />
              Your browser does not support the video tag.
            </video>

            <Container fluid className="px-0">
              <Row>
                <Col xl={9}>
                  <InputGroup>
                    <InputGroup.Text className="font-monospace">Subs&nbsp;</InputGroup.Text>
                    <Form.Control type="text" placeholder="subtitles url" value={this.state.subtitlesURL}
                      onChange={this.onSubtitlesURLTextareaChange} />
                  </InputGroup>
                </Col>
                <Col xl={3}>
                  <InputGroup>
                    <InputGroup.Text className="font-monospace">Speed</InputGroup.Text>
                    <Form.Control type="text" placeholder="Playback speed"
                      value={this.state.videoPlaybackRate.toFixed(1)} onChange={this.onPlaybackSpeedInputChange} />
                    <Button onClick={this.onPlaySlowerButtonClick}>
                      <i className="bi bi-chevron-double-left"></i>
                    </Button>
                    <Button onClick={this.onPlayFasterButtonClick}>
                      <i className="bi bi-chevron-double-right"></i>
                    </Button>
                  </InputGroup>
                </Col>
              </Row>
            </Container>
          </Col>
        </Row>
      </Container>
    );
  }
}

VideoViewer.propTypes = {
  params: PropTypes.object,
  assetDir: PropTypes.string,
  videoName: PropTypes.string,
  lastView: PropTypes.string,
  views: PropTypes.number
};

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<div>
  <VideoViewer params={params} />
</div>);
