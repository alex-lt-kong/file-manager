import axios from 'axios';
import React from 'react';
import Alert from 'react-bootstrap/Alert';
import {syntaxHighlight} from '../utils';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

class ModalMediaMetadata extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: props.show,
      assetDir: props.assetDir,
      jsonHTML: (
        <div className="d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ),
      mediaFilename: props.mediaFilename,
      mediaInfo: null
    };
    this.handleOKClick = this.handleOKClick.bind(this);
    this.fetchDataFromServer();
  }

  fetchDataFromServer() {
    axios.get(
        `./get-media-info/?asset_dir=${encodeURIComponent(this.state.assetDir)}&` +
        `media_filename=${encodeURIComponent(this.state.mediaFilename)}`
    )
        .then((response) => {
          this.setState({
            mediaInfo: response.data,
            jsonHTML: syntaxHighlight(JSON.stringify(response.data.content, null, 2))
          });
        })
        .catch((error) => {
          console.error(error);
          this.setState({
            jsonHTML: (
              <Alert variant="danger" my={2} style={{wordBreak: 'break-word'}}>
                Unable to fetch information from media file
                <strong style={{wordBreak: 'break-all'}}>{this.state.mediaFilename}</strong>:
                <br />{error.response.data}
              </Alert>
            ),
            mediaInfo: false
          });
        });
  }

  handleOKClick() {
    this.setState({
      show: false
    });
  }

  render() {
    return (
      <Modal show={this.state.show}>
        <Modal.Header><Modal.Title>Media Metadata</Modal.Title></Modal.Header>
        <Modal.Body md={3}>{this.state.jsonHTML}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={this.handleOKClick}>OK</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

ModalMediaMetadata.propTypes = {
  show: PropTypes.bool,
  assetDir: PropTypes.string,
  mediaFilename: PropTypes.string
};

export {ModalMediaMetadata};
