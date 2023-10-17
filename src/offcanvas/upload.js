import Offcanvas from 'react-bootstrap/Offcanvas';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import ProgressBar from 'react-bootstrap/ProgressBar';
import React from 'react';
import PropTypes from 'prop-types';
import ListGroup from 'react-bootstrap/ListGroup';

class OffcanvasFileUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      show: props.show,
      currentPath: props.currentPath,
      progressBars: [],
      uploadProgresses: [],
      selectedFiles: [],
      selectedFileSizes: [],
      selectedFileNames: [],
      selectedFileCount: 0
    };
    this.handleClose = this.handleClose.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.onSelectedFilesChanged = this.onSelectedFilesChanged.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentPath !== this.props.currentPath) {
      this.setState({
        currentPath: this.props.currentPath
      });
    }
  }

  updateProgressbars(fileId) {
    const progressBars = this.state.progressBars;
    if (fileId >= this.state.progressBars.length) {
      progressBars.push(
          <ProgressBar key={fileId} now={this.state.uploadProgresses[fileId]}
            label={
              `${this.state.uploadProgresses[fileId]}% of ` +
              `${(this.state.selectedFiles[fileId].size / 1024 / 1024).toFixed(2)}MB`
            }
          />
      );
    } else {
      progressBars[fileId] = (
        <ProgressBar key={fileId} now={this.state.uploadProgresses[fileId]}
          label={
            `${this.state.uploadProgresses[fileId]}% of ` +
            `${(this.state.selectedFiles[fileId].size / 1024 / 1024).toFixed(2)}MB`
          }
        />
      );
    }
    this.setState({
      progressBars: progressBars
    });
  }

  generateProgressBarsGroupItems() {
    if (this.state.progressBars === null) {
      return null;
    }
    const progressBarItems = new Array(this.state.progressBars.length);
    for (let i = 0; i < this.state.progressBars.length; ++i) {
      progressBarItems[i] = (
        <ListGroup.Item key={i}>
          <Row>
            <Col xs={3} style={{wordBreak: 'break-all'}}>{this.state.selectedFiles[i].name}</Col>
            <Col>{this.state.progressBars[i]}</Col>
          </Row>
        </ListGroup.Item>
      );
    }
    return <ListGroup>{progressBarItems}</ListGroup>;
  }

  onSelectedFilesChanged(event) {
    const maxUploadFileSize = 1024 * 1024 * 1024 * 8;
    const selectedFileSizes = new Array(this.state.selectedFileCount + event.target.files.length);
    const selectedFileNames = new Array(this.state.selectedFileCount + event.target.files.length);
    const selectedFiles = new Array(this.state.selectedFileCount + event.target.files.length);
    for (let i = 0; i < this.state.selectedFiles.length; i++) {
      selectedFiles[i] = this.state.selectedFiles[i];
      selectedFileNames[i] = this.state.selectedFileNames[i];
      selectedFileSizes[i] = this.state.selectedFileSizes[i];
    }
    for (let i = 0; i < event.target.files.length; i++) {
      selectedFiles[this.state.selectedFileCount + i] = event.target.files[i];
      selectedFileSizes[this.state.selectedFileCount + i] = event.target.files[i].size;
      selectedFileNames[this.state.selectedFileCount + i] = event.target.files[i].name;
      if (event.target.files[i].size > maxUploadFileSize) {
        alert(
            `File [${selectedFiles[i].name}] is too large ` +
            `(size: ${(selectedFiles[i].size / 1024 / 1024).toFixed(2)}MB, ` +
            `allowed: ${maxUploadFileSize / 1024 / 1024}MB)`
        );
        return;
      };
    }
    this.setState((prevProps) => ({
      selectedFiles: selectedFiles,
      selectedFileSizes: selectedFileSizes,
      selectedFileNames: selectedFileNames,
      selectedFileCount: prevProps.selectedFileCount + event.target.files.length
    }), ()=>{
      for (let i = this.state.selectedFileCount - event.target.files.length; i < this.state.selectedFileCount; ++i) {
        this.uploadFile(this.state.selectedFiles[i], i);
      }
    });
  }

  uploadFile(selectedFile, fileId) {
    // typeof selectedFile === 'object'
    const payload = new FormData();
    payload.append('selected_files', selectedFile);
    payload.append('asset_dir', this.state.currentPath);
    const config = {
      onUploadProgress: function(progressEvent) {
        const percentCompleted = ((progressEvent.loaded * 100) / progressEvent.total).toFixed(2);
        const uploadProgresses = this.state.uploadProgresses;
        if (this.state.uploadProgresses.length <= fileId) {
          uploadProgresses.push(0);
        }
        uploadProgresses[fileId] = percentCompleted;
        this.setState({
          uploadProgresses: uploadProgresses
        }, ()=>{
          this.updateProgressbars(fileId);
        });
      }.bind(this)
    };

    axios.post('./upload/', payload, config)
        .then((response) => {
          if (this.props.refreshFileList !== null) {
            this.props.refreshFileList();
          }
        })
        .catch((error) => {
          console.error(error);
          alert('Unable to upload files:\n' + error.response.data);
        });
  }

  handleClose() {
    this.setState({
      show: false
    });
  }

  render() {
    return (
      <Offcanvas show={this.state.show} onHide={this.handleClose} placement="bottom" backdrop="true">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Files Upload</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{fontSize: '0.85em'}}>
          {this.generateProgressBarsGroupItems()}
          <Form.Control onChange={this.onSelectedFilesChanged} type="file" className="my-3" multiple/>
        </Offcanvas.Body>
      </Offcanvas>
    );
  }
}

OffcanvasFileUpload.propTypes = {
  show: PropTypes.bool,
  refreshFileList: PropTypes.func,
  currentPath: PropTypes.string
};

export {OffcanvasFileUpload};
