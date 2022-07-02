import axios from 'axios';
import React from 'react';
import {createRoot} from 'react-dom/client';
import syntaxHighlight from './utils';

class PlayBack extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      assetDir: props.assetDir,
      jsonHTML: null,
      subtitlesURL: '../download/?asset_dir=' + encodeURIComponent(props.assetDir) + '&filename=' + encodeURIComponent(props.videoName) + '.vtt',
      lastView: props.lastView,
      videoInfo: null,
      videoName: props.videoName,
      videoPlaybackRate: 1,
      views: props.views,
      username: null
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
    console.log('onPlaybackSpeedInputChange');
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
    this.setState(prevState =>({
      videoPlaybackRate: prevState.videoPlaybackRate + 0.1
    }), () => {this.videoRef.current.playbackRate = this.state.videoPlaybackRate});
  }

  onPlaySlowerButtonClick(event) {
    if (this.state.videoPlaybackRate <= 0.2) { return; }

    this.setState((prevState) =>({
      videoPlaybackRate: prevState.videoPlaybackRate - 0.1
    }), () => {this.videoRef.current.playbackRate = this.state.videoPlaybackRate});
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
    axios.get('../get-media-info/?asset_dir=' + encodeURIComponent(this.state.assetDir) + '&media_filename=' + encodeURIComponent(this.state.videoName))
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
              <div className="alert alert-danger my-2" role="alert" style={{wordBreak: 'break-word'}}>
                Unable to fetch information from media <strong style={{ wordBreak: "break-all" }}>{this.state.mediaFilename}</strong>:
                <br />{error.response.data}
              </div>
            ),
            mediaInfo: false
          });
        });
  }

  render() {
    return (
      <div className="container-fluid my-2">
        <div className="row flex-row-reverse">
          <div className="col-sm-3 col-md-pull-3">       
            <div className="accordion mb-2" id="accordionExample">
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingOne">
                  <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    Basic Information
                  </button>
                </h2>
                <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne">
                  <div className="accordion-body">
                    <p className="my-1" style={{ wordBreak: "break-all" }}><b>Name: </b>{this.state.videoName}</p>
                    <p className="my-1" style={{ wordBreak: "break-all" }}><b>URL: </b><a href={this.videoURL}>{this.videoURL}</a></p>
                    <p className="my-1" style={{ wordBreak: "break-all" }}><b>Views: </b>{this.state.views}</p>
                    <p className="my-1" style={{ wordBreak: "break-all" }}><b>Last View: </b>{this.state.lastView}</p>
                  </div>
                </div>
              </div>
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingTwo">
                  <button className={`accordion-button ${screen.width > 1000 ? "" : "collapsed"}`} type="button" data-bs-toggle="collapse"
                          data-bs-target="#collapseTwo" aria-expanded={screen.width > 1000} aria-controls="collapseTwo">
                    Technical Information
                  </button>
                </h2>
                <div id="collapseTwo" className={`accordion-collapse collapse ${screen.width > 1000 ? "show" : ""}`} aria-labelledby="headingTwo">
                  <div className="accordion-body">
                  {this.state.jsonHTML}
                  </div>
                </div>
              </div>              
            </div>          
          </div>
          <div className="col-sm-9 col-md-push-9">
            {/* A combination of sm and number makes it work */}
            <video style={{ width: "100%", maxHeight: "90vh", backgroundColor: "black" }} ref={this.videoRef} autoPlay={true} controls>
              <source src={this.videoURL} />
              <textarea className="form-control" style={{ wordBreak: "break-all" }} aria-label="With textarea" onChange={this.onSubtitlesURLTextareaChange} value={this.state.subtitlesURL} />
              <track label="English" kind="subtitles" srcLang="en" src={this.state.subtitlesURL} default />
            Your browser does not support the video tag.
            </video>

            <div className="container-fluid px-0">
              <div className="row">
                <div className="col-xl-9">
                  <div className="input-group">                    
                    <span className="input-group-text font-monospace">Subs&nbsp;</span>
                    <textarea className="form-control" aria-label="With textarea" rows={screen.width > 1000 ? 1 : 3}
                              style={{ fontSize: "1em", wordBreak: "break-all" }}
                              onChange={this.onSubtitlesURLTextareaChange} value={this.state.subtitlesURL}></textarea>
                  </div>                        
                </div>
                <div className="col-xl-3">                  
                <div className="input-group">
                          <span className="input-group-text font-monospace">Speed</span>
                          <input type="text" className="form-control" placeholder="Playback speed"
                                 onChange={this.onPlaybackSpeedInputChange} value={this.state.videoPlaybackRate.toFixed(1)} />
                          <button className="btn btn-primary" type="button" onClick={this.onPlaySlowerButtonClick}><i className="bi bi-chevron-double-left"></i></button>
                          <button className="btn btn-primary" type="button" onClick={this.onPlayFasterButtonClick}><i className="bi bi-chevron-double-right"></i></button>
                        </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<div>
  <PlayBack assetDir={paras['asset_dir']} videoName={paras['video_name']}
    views={paras['views']} lastView={paras['last_view']} />
</div>);
