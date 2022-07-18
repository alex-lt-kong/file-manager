import Offcanvas from 'react-bootstrap/Offcanvas';
import axios from 'axios';
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
      uploadProgresses: []
    };
    this.handleClose = this.handleClose.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentPath !== this.props.currentPath) {
      this.setState({
        currentPath: this.props.currentPath
      });
    }
  }

  updateProgressbars(barId) {
    const progressBars = this.state.progressBars;
    if (barId >= this.state.progressBars.length) {
      progressBars.push(
          <ProgressBar key={barId} now={this.state.uploadProgresses[barId]}
            label={`${this.state.uploadProgresses[barId]}%`} />
      );
    } else {
      progressBars[barId] = (
        <ProgressBar key={barId} now={this.state.uploadProgresses[barId]}
          label={`${this.state.uploadProgresses[barId]}%`} />
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
          {this.state.progressBars[i]}
        </ListGroup.Item>
      );
    }
    return <ListGroup>{progressBarItems}</ListGroup>;
  }

  onFileChange(event) {
    const maxUploadFileSize = 1024 * 1024 * 1024 * 4;
    for (let i = 0; i < event.target.files.length; i++) {
      if (event.target.files[0].size > maxUploadFileSize) {
        alert(`The file to be uploaded canNOT be larger than ${maxUploadFileSize / 1024 / 1024} MB`);
        continue;
      };
      this.setState({
        selectedFile: event.target.files[i]
      });
      this.uploadFile(event.target.files[i], i);
    }
  }

  uploadFile(selectedFile, fileId) {
    console.log(typeof selectedFile);
    const payload = new FormData();
    payload.append('selected_files', selectedFile);
    payload.append('asset_dir', this.state.currentPath);
    const config = {
      onUploadProgress: function(progressEvent) {
        const percentCompleted = ((progressEvent.loaded * 100) / progressEvent.total).toFixed(2);
        /*
        Here we ceil() the percentage point to an integer. If we don't round it, the number will changevery freqneutly.
        As a result, the page will be re-render()ed and for whatever reason the context menu may jump a little bit
        if it is clicked when the page is render()ed. Note that we use Math.ceil() instead of round() so that the page
        will show 1% immediately after the upload starts

        However, the above issue appears to have been solved by limiting the height of filelist ul to 100vh. So now
        we keep two decimal places to make the update more frequent--so that users will notice smaller upload progress
        if the file being uploaded is large.
        */
        console.log('onUploadProgress', this.state.uploadProgresses, fileId);
        if (this.state.uploadProgresses.length <= fileId) {
          const uploadProgresses = this.state.uploadProgresses;
          uploadProgresses.push(0);
          this.setState({
            uploadProgresses: uploadProgresses
          });
          return;
        }
        const uploadProgresses = this.state.uploadProgresses;
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
          <Offcanvas.Title>File Upload</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{fontSize: '0.85em'}}>
          <div>
            <p style={{wordBreak: 'break-all'}}>
              <b>Name: </b>{this.state.selectedFile === null ? 'NA' : this.state.selectedFile.name}
            </p>
            <p>
              <b>Size: </b>
              {
                this.state.selectedFile === null ?
                '0' : (this.state.selectedFile.size / 1024 / 1024).toFixed(2) + 'MB'
              }
            </p>
          </div>{/*
          <div className="progress">
            <div className="progress-bar" role="progressbar"
              style={{width: this.state.uploadProgress != null ? this.state.uploadProgress + '%' : '0%'}}
              aria-valuenow={this.state.uploadProgress} aria-valuemin="0" aria-valuemax="100">
              {this.state.uploadProgress != null ? this.state.uploadProgress + '%' : ''}
            </div>
          </div>*/}
          {this.generateProgressBarsGroupItems()}
          <div>
            <Form.Control onChange={this.onFileChange} type="file" className="my-3" multiple/>
            <p>
              Interestingly, while it may appear that the page only supports single-file upload, you
              can actually upload more files even if previous ones are still being transferred.
              (But multiple upload processes will share the same progress bar ¯\_(ツ)_/¯)
            </p>
          </div>
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
