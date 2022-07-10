import Offcanvas from 'react-bootstrap/Offcanvas';
import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';

class OffcanvasServerInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: props.show,
      serverInfo: null
    };
    this.handleClose = this.handleClose.bind(this);
    this.fetchServerInfo();
  }

  fetchServerInfo() {
    axios.get('./get-server-info/')
        .then((response) => {
          this.setState({
            serverInfo: response.data
          });
        })
        .catch((error) => {
          console.error(error);
          alert(`Unable to fetch server info. Reason:` +
          (error.response !== undefined) ? JSON.stringify(error.response): error);
        });
  }

  handleClose() {
    console.log('handleClose() fired!');
    this.setState({
      show: false
    });
  }

  render() {
    let serverInfoPanel = (
      <div className="d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

    if (this.state.serverInfo !== null) {
      const ffmpegItems = this.state.serverInfo.ffmpeg.map((ffmpegItem) =>
        <li key={ffmpegItem.pid} style={{wordBreak: 'break-all'}}>
          {ffmpegItem.cmdline} <b>(since {ffmpegItem.since})</b>
        </li>
      );

      serverInfoPanel = (
        <div>
          <p><b>CPU Usage: </b>{this.state.serverInfo.cpu.percent.map((p) => p.toString() + '% ')}</p>
          <p>
            <b>Memory: </b>
            {
              Math.round(this.state.serverInfo.memory.physical_total / 1024 / 1024)
                  .toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            } MB in total,&nbsp;
            {
              Math.round(this.state.serverInfo.memory.physical_available / 1024 / 1024)
                  .toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            } MB free
            {/* The fancy regex is used to add a thousands separator */}
          </p>
          <b>System:</b>
          <ul>
            <li><b>OS:</b> {this.state.serverInfo.version.os}</li>
            <li><b>Python:</b> {this.state.serverInfo.version.python}</li>
            <li><b>Flask:</b> {this.state.serverInfo.version.flask}</li>
          </ul>
          <b>FFmpeg:</b>
          <ol>{ffmpegItems}</ol>
        </div>
      );
    }

    return (
      <Offcanvas show={this.state.show} onHide={this.handleClose} placement="bottom">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Server Info</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body style={{fontSize: '0.85em'}}>
          {serverInfoPanel}
        </Offcanvas.Body>
      </Offcanvas>
    );
  }
}

OffcanvasServerInfo.propTypes = {
  show: PropTypes.bool
};

export {OffcanvasServerInfo};
