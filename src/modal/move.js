import axios from 'axios';
import React from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import PropTypes from 'prop-types';
import Accordion from 'react-bootstrap/Accordion';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

class ModalMove extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: props.show,
      disableSubmitByDirName: false,
      disableSubmitByFileName: false,
      disableSubmitBySubmit: false,
      fileInfo: props.fileInfo,
      newFileDir: props.fileInfo.asset_dir,
      newFileName: props.fileInfo.filename,
      refreshFileList: props.refreshFileList,
      responseMessage: null
    };
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleRegularizationClick = this.handleRegularizationClick.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
    this.onFileDirChange = this.onFileDirChange.bind(this);
    this.onFileNameChange = this.onFileNameChange.bind(this);
  }

  handleSubmitClick() {
    this.setState({
      disableSubmitBySubmit: true
    });
    // The move operation is different from many other methods because it is synchronous.
    // So we disable the submit button to prevent users from clicking it twice--by rights,
    // clicking it twice should not cause any issue since the second move will be blocked (FileExistsError) anyway.
    // It is mainly used to reduce users confusion.
    this.fetchDataFromServer();
  }

  handleRegularizationClick() {
    this.setState((prevState) => ({
      newFileName: prevState.newFileName
          .toLowerCase().replace(/[&\/\\#,+()$~%'":*?<>{}\[\]]/g, '-').replace(/\s+/g, '-').replace('---', '_')
    }));
  }

  fetchDataFromServer() {
    const payload = new FormData();
    payload.append('old_filepath', this.state.fileInfo.asset_dir + this.state.fileInfo.filename);
    payload.append('new_filepath', this.state.newFileDir + this.state.newFileName);
    axios({
      method: 'post',
      url: './move/',
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
              <Alert variant="danger" my={2} style={{wordBreak: 'break-word'}}>
                Unable to move file from <strong style={{wordBreak: 'break-all'}}>{payload.get('old_filepath')}
                </strong> to <strong style={{wordBreak: 'break-all'}}>{payload.get('new_filepath')}</strong>:
                <br />{error.response.data}
              </Alert>
            )
          });
        });
  }

  onFileDirChange(event) {
    const newVal = event.target.value.replace('\n', '').replace('\r', '');
    if (newVal.endsWith('/')) {
      this.setState({
        responseMessage: null,
        disableSubmitByDirName: false
      });
    } else {
      this.setState({
        responseMessage: (
          <Alert variant="warning" mb={3} style={{wordBreak: 'break-word'}}>
            New directory <strong style={{wordBreak: 'break-all'}}>{newVal}</strong>&nbsp;
            does not end with a <code>/</code>.
            If submitted, the section after the last <code>/</code>&nbsp;
            will be interpreted as a part of the new filename by the server,
            which is usually not desired. To avoid the ambiguity, you need to append a <code>/</code>&nbsp;
            to the end of the directory to submit.
          </Alert>
        ),
        disableSubmitByDirName: true
      });
    }
    this.setState({
      newFileDir: newVal
    });
  }

  onFileNameChange(event) {
    const newVal = event.target.value.replace('\n', '').replace('\r', '');
    if (newVal.includes('/')) {
      this.setState({
        responseMessage: (
          <Alert variant="warning" mb={3} style={{wordBreak: 'break-word'}}>
            New filename <strong style={{wordBreak: 'break-all'}}>{newVal}</strong> contains <code>/</code>
            , which will be interpreted as
            a separate directory by the server. To avoid ambiguity, this value cannot be submitted.
          </Alert>
        ),
        disableSubmitByFileName: true
      });
    } else {
      this.setState({
        responseMessage: null,
        disableSubmitByFileName: false
      });
    }
    this.setState({
      newFileName: newVal
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
          <Modal.Title>Move File</Modal.Title>
        </Modal.Header>
        <Modal.Body md={3}>
          <label className="form-label" style={{wordBreak: 'break-word'}}>
            Move the file from
            <strong style={{wordBreak: 'break-all'}}>
              {this.state.fileInfo.asset_dir + this.state.fileInfo.filename}
            </strong> to:
          </label>
          <Form.Group as={Row} className="mb-1">
            <Form.Label column xs={3}>Directory</Form.Label>
            <Col xs={9}>
              <textarea type="text" className="form-control" rows="2" style={{wordBreak: 'break-all'}}
                placeholder="Input new filename" value={this.state.newFileDir} onChange={this.onFileDirChange} />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3">
            <Form.Label column xs={3}>Filename&nbsp;</Form.Label>
            <Col xs={9}>
              <textarea type="text" className="form-control" rows="2" style={{wordBreak: 'break-all'}}
                placeholder="Input new filename" value={this.state.newFileName} onChange={this.onFileNameChange} />
            </Col>
          </Form.Group>
          {this.state.responseMessage}
          <Accordion className="my-2">
            <Accordion.Item eventKey="0">
              <Accordion.Header>What&apos;s Happening Under the Hood?</Accordion.Header>
              <Accordion.Body>
                <ol>
                  <li>
                    The server returns an error message if&nbsp;
                    <a href="https://docs.python.org/3/library/os.path.html#os.path.ismount"
                      target="_blank" rel="noreferrer">
                      os.path.ismount()
                    </a>&nbsp;
                    returns true;
                  </li>
                  <li>
                    The server calls&nbsp;
                    <a href="https://docs.python.org/3/library/shutil.html#shutil.move"
                      target="_blank" rel="noreferrer">
                      shutil.move()
                    </a>&nbsp;
                    to do the move;
                  </li>
                  <li>
                    If the destination is on a different filesystem,
                    source file is copied to destination and then removed
                    <strong>(It could take a long time!)</strong>;
                  </li>
                  <li>
                    In case of symlinks, a new symlink pointing to the target of
                    src will be created in or as dst and src will be removed.
                  </li>
                  <li>
                    <code>Regularize Filename</code>&nbsp;
                    is used to make a filename more machine-friendly: it converts all letters to lowercase, replaces
                    each special character (including a space) with a
                    <code>-</code>&nbsp;
                    and then replaces a
                    <code>---</code>&nbsp;
                    with a
                    <code>_</code>.
                  </li>
                </ol>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleCloseClick}>Close</Button>
          <Button variant="primary" onClick={this.handleRegularizationClick}>Regularize Filename</Button>
          <Button variant="primary" onClick={this.handleSubmitClick}
            disabled={
              this.state.disableSubmitByFileName ||
              this.state.disableSubmitByDirName ||
              this.state.disableSubmitBySubmit
            }>
              OK
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

ModalMove.propTypes = {
  show: PropTypes.bool,
  fileInfo: PropTypes.object,
  refreshFileList: PropTypes.func
};

export {ModalMove};
