import axios from 'axios';
import React from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';

class ModalMkdir extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: props.show,
      assetDir: props.assetDir,
      folderName: 'New Folder',
      responseMessage: null
    };
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.onFolderNameChange = this.onFolderNameChange.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
  }

  handleCloseClick() {
    this.setState({
      show: false
    });
  }

  handleSubmitClick() {
    this.postDataToServer();
  }

  postDataToServer() {
    const payload = new FormData();
    payload.append('asset_dir', this.state.assetDir);
    payload.append('folder_name', this.state.folderName);
    axios({
      method: 'post',
      url: './make-dir/',
      data: payload
    })
        .then((response) => {
          this.handleCloseClick();
          if (this.props.refreshFileList !== null) {
            this.props.refreshFileList();
          }
        })
        .catch((error) => {
          console.error(error);
          this.setState({
            responseMessage: (
              <Alert variant="danger" className="my-2" style={{wordBreak: 'break-word'}}>
                Unable to create new folder <strong style={{wordBreak: 'break-all'}}>{payload.get('folder_name')}
                </strong>:
                <br />{error.response.data}
              </Alert>
            )
          });
        });
  }

  onFolderNameChange(event) {
    this.setState({
      folderName: event.target.value
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
          <Modal.Title>New Directory</Modal.Title>
        </Modal.Header>
        <Modal.Body className="mb-3">
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Input the name of the folder to be created:</Form.Label>
            <Form.Control type="text" placeholder="Input directory name"
              value={this.state.folderName} onChange={this.onFolderNameChange} />
          </Form.Group>
          {this.state.responseMessage}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleCloseClick}>Close</Button>
          <Button variant="primary" onClick={this.handleSubmitClick}>Submit</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

ModalMkdir.propTypes = {
  show: PropTypes.bool,
  assetDir: PropTypes.string,
  refreshFileList: PropTypes.func
};

export {ModalMkdir};
