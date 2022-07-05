import React from 'react';
import axios from 'axios';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';
import Accordion from 'react-bootstrap/Accordion';

class ModalRemove extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: props.show,
      fileInfo: props.fileInfo,
      refreshFileList: props.refreshFileList,
      responseMessage: null
    };
    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.show !== this.props.show) {
      this.setState({
        show: this.props.show
      });
    }
  }

  handleSubmitClick() {
    this.postDataToServer();
  }

  postDataToServer() {
    const payload = new FormData();
    payload.append('filepath', this.state.fileInfo.asset_dir + this.state.fileInfo.filename);
    axios({
      method: 'post',
      url: './remove/',
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
              <Alert key='danger' className="my-2" style={{wordBreak: 'break-word'}}>
                Unable to remove <strong style={{wordBreak: 'break-all'}}>
                  {this.state.fileInfo.filename}
                </strong>:<br />{error.response.data}
              </Alert>
            )
          });
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
          <Modal.Title>Remove File</Modal.Title>
        </Modal.Header>
        <Modal.Body md={3}>
          <span className="form-label" style={{wordBreak: 'break-all'}}>
          Remove file <strong>{this.state.fileInfo.asset_dir + this.state.fileInfo.filename}</strong>?
          </span>
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
                    </a>
                    &nbsp;returns true;
                  </li>
                  <li>
                    The server calls&nbsp;
                    <a href="https://docs.python.org/3/library/os.html#os.unlink" target="_blank" rel="noreferrer">
                      os.unlink()
                    </a>
                    &nbsp;if&nbsp;
                    <a href="https://docs.python.org/3/library/os.path.html#os.path.islink"
                      target="_blank" rel="noreferrer">
                      os.path.islink()
                    </a>
                    &nbsp;returns true;
                  </li>
                  <li>
                    The server calls&nbsp;
                    <a href="https://docs.python.org/3/library/os.html#os.remove" target="_blank" rel="noreferrer">
                      os.remove()
                    </a>
                    &nbsp;if&nbsp;
                    <a href="https://docs.python.org/3/library/os.path.html#os.path.isfile" target="_blank"
                      rel="noreferrer">
                      os.path.isfile()
                    </a>
                    &nbsp;returns true;
                  </li>
                  <li>
                    The server calls&nbsp;
                    <a href="https://docs.python.org/3/library/os.html#os.rmdir" target="_blank"
                      rel="noreferrer">
                      shutil.rmtree()
                    </a>
                    &nbsp;if&nbsp;
                    <a href="https://docs.python.org/3/library/shutil.html#shutil.rmtree" target="_blank"
                      rel="noreferrer">
                      os.path.isdir()
                    </a>
                    &nbsp;returns true;
                  </li>
                  <li>The serve returns an error if all of the above conditions are not met.</li>
                </ol>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleCloseClick}>No</Button>
          <Button variant="primary" onClick={this.handleSubmitClick}>YES!</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

ModalRemove.propTypes = {
  show: PropTypes.bool,
  fileInfo: PropTypes.object,
  refreshFileList: PropTypes.func
};


export {ModalRemove};
