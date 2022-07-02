import axios from 'axios';
import React from 'react';

class OffcanvasServerInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appAddress: props.appAddress,
      serverInfoPanel: null
    };
  }

  componentDidMount() {
  //  $(this.offcanvas).offcanvas('show');
    console.log('componentDidMount');
  //  this.fetchServerInfo();
  }

  fetchServerInfo() {
    this.setState({
      serverInfoPanel: (
        <div className="d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )
    });
    this.forceUpdate();

    // You set it to a spinner before fetching data from the server.
    axios.get('./get-server-info/')
        .then((response) => {
          this.setState({
            serverInfo: null
            // make it empty before fill it in again to force a re-rendering.
          });
          this.setState({
            serverInfo: response.data
            // make it empty before fill it in again to force a re-rendering.
          });

          const ffmpegItems = this.state.serverInfo.ffmpeg.map((ffmpegItem) =>
            <li key={ffmpegItem.pid} style={{wordBreak: 'break-all'}}>
              {ffmpegItem.cmdline} <b>(since {ffmpegItem.since})</b>
            </li>
          );

          this.setState({
            serverInfoPanel: (
              <div>
                <p><b>CPU Usage: </b>{this.state.serverInfo.cpu.percent.map((p) => p.toString() + "% ")}</p>
                <p>
                  <b>Memory: </b>
                  {Math.round(this.state.serverInfo.memory.physical_total / 1024 / 1024).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} MB in total,&nbsp;
                  {Math.round(this.state.serverInfo.memory.physical_available / 1024 / 1024).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} MB free
                  {/* The fancy regex is used to add a thousands separator */}
                </p>
                <b>System:</b>
                <ul>
                  <li><b>OS:</b> {this.state.serverInfo.version.os}</li>
                  <li><b>Python:</b> {this.state.serverInfo.version.python}</li>
                  <li><b>Flask:</b> {this.state.serverInfo.version.flask}</li>
                </ul>
                <b>FFMPEG:</b>
                <ol>{ffmpegItems}</ol>
              </div>
            )
          });
          this.forceUpdate();
        })
        .catch((error) => {
          console.log(error);
          alert('Unable to fetch server info:\n' + error.response.data);        
        });
  }

  render() {
    return (
      <div className="offcanvas offcanvas-bottom h-auto" id="offcanvasBottomServerInfo" aria-labelledby="offcanvasBottomServerInfoLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasBottomServerInfoLabel"><b>Server Info</b></h5>
          <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body" style={{ fontSize: "0.85em" }}>
          {/* d-flex align-items-center justify-content-center: used to center
          this.serverInfoPanel horizontally and vertically 
              However, after adding d-flex align-items-center justify-content-center,
              the scroll function of offcanvas will be broken. So now these attributes are
              NOT added. */}
          {this.state.serverInfoPanel}
        </div>
      </div>
    );
  }
}

export {OffcanvasServerInfo};
