import Offcanvas from 'react-bootstrap/Offcanvas';
import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';

class OffcanvasFileUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      show: props.show,
      currentPath: props.currentPath
    };
    this.handleClose = this.handleClose.bind(this);
    this.onFileUpload = this.onFileUpload.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentPath !== this.props.currentPath) {
      this.setState({
        currentPath: this.props.currentPath
      });
    }
  }

  onFileChange(event) {
    const maxUploadFileSize = 1024 * 1024 * 1024 * 4;
    for (let i = 0; i < event.target.files.length; i++) {
      if (event.target.files[0].size > maxUploadFileSize) {
        alert(`The file to be uploaded canNOT be larger than ${maxUploadFileSize / 1024 / 1024} MB`);
        return;
      };
      this.setState({
        selectedFile: event.target.files[i]
      });
      this.onFileUpload(event.target.files[i]);
    }
  }

  onFileUpload(selectedFiles) {
    const payload = new FormData();
    payload.append('selected_files', selectedFiles);
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
        if (percentCompleted < 100) {
          this.setState({uploadProgress: percentCompleted}); // How set state with percentCompleted?
        } else {
          this.setState({
            selectedFile: null,
            uploadProgress: null
          });
        }
        console.log(percentCompleted);
      }.bind(this)
    };

    axios.post('./upload/', payload, config)
        .then((response) => {
          alert('File uploaded! You need to manually refresh the file list to see the new file.');
          // Auto refresh when the offcanvas is still opened causes issues...
          // to make it simpler, I just remove the auto refresh function.
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
          <Offcanvas.Title>Server Info</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{fontSize: '0.85em'}}>
          {/* d-flex align-items-center justify-content-center: used to center
            this.serverInfoPanel horizontally and vertically
                However, after adding d-flex align-items-center justify-content-center,
                the scroll function of offcanvas will be broken. So now these attributes are
                NOT added. */}
          <div className="">
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
          </div>
          <div className="progress">
            <div className="progress-bar" role="progressbar"
              style={{width: this.state.uploadProgress != null ? this.state.uploadProgress + '%' : '0%'}}
              aria-valuenow={this.state.uploadProgress} aria-valuemin="0" aria-valuemax="100">
              {this.state.uploadProgress != null ? this.state.uploadProgress + '%' : ''}
            </div>
          </div>
          <div>
            <input onChange={this.onFileChange} type="file" className="my-3"></input>
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
  currentPath: PropTypes.string
};

export {OffcanvasFileUpload};
