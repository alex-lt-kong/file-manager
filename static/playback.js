class PlayBack extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      appAddress: props.appAddress,
      assetDir: props.assetDir,
      subtitlesURL: props.appAddress + '/download/?asset_dir=' + encodeURIComponent(props.assetDir) + '&filename=' + encodeURIComponent(props.videoName) + '.vtt',
      lastView: props.lastView,
      videoInfo: null,
      videoName: props.videoName,
      views: props.views,
      username: null
    };
    
    this.onSubtitlesURLTextareaChange = this.onSubtitlesURLTextareaChange.bind(this);
    this.onCanPlayEvent = this.onCanPlayEvent.bind(this);
    this.videoURL = this.state.appAddress + '/download/?asset_dir=' + 
                    encodeURIComponent(this.state.assetDir) + '&filename=' +
                    encodeURIComponent(this.state.videoName) + '&as_attachment=0';
    this.videoRef = React.createRef();
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

    URL = this.state.appAddress + '/get-video-info/?asset_dir=' + encodeURIComponent(this.state.assetDir) + '&video_name=' + encodeURIComponent(this.state.videoName);
    axios.get(URL)
      .then(response => {
        this.setState({
          videoInfo: null
        });
        this.setState({
          videoInfo: response.data
        });
      })
      .catch(error => {
        alert('Unable to video information:\n' + error.response.data);
        console.log(error);
      });
  }

  render() {

    let json_html = null;
    if (this.state.videoInfo === null) { 
      json_html = (
        <div className="d-flex align-items-center justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }
    else { 
      json_html = syntaxHighlight(JSON.stringify(this.state.videoInfo.content, null, 2));
    }

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
                    <p className="my-1" style={{ wordBreak: "break-all" }}><b>Last View: </b>{this.state.lastView.slice(0, 10)}</p>
                  </div>
                </div>
              </div>
              <div class="accordion-item">
                <h2 class="accordion-header" id="headingTwo">
                  <button className={`accordion-button ${screen.width > 1000 ? "" : "collapsed"}`} type="button" data-bs-toggle="collapse"
                          data-bs-target="#collapseTwo" aria-expanded={screen.width > 1000} aria-controls="collapseTwo">
                    Technical Information
                  </button>
                </h2>
                <div id="collapseTwo" className={`accordion-collapse collapse ${screen.width > 1000 ? "show" : ""}`} aria-labelledby="headingTwo">
                  <div class="accordion-body">
                  {json_html}
                  </div>
                </div>
              </div>              
            </div>          
          </div>
          <div className="col-sm-9 col-md-push-9">
            {/* A combination of sm and number makes it work */}
            <video style={{ width: "100%", maxHeight: "90vh", backgroundColor: "black" }} ref={this.videoRef} onCanPlay={this.onCanPlayEvent} playbackRate="5" autoPlay controls>
              <source src={this.videoURL} />
              <textarea class="form-control" aria-label="With textarea" onChange={this.onSubtitlesURLTextareaChange}>{this.state.subtitlesURL}</textarea>
              <track label="English" kind="subtitles" srcLang="en" src={this.state.subtitlesURL} default />
            Your browser does not support the video tag.
            </video>

            <div class="container-fluid">
              <div class="row">
                <div class="col-lg">
                  <div className="input-group">
                          <span className="input-group-text">Subs</span>
                          <textarea className="form-control" aria-label="With textarea" rows="4"
                                    onChange={this.onSubtitlesURLTextareaChange} value={this.state.subtitlesURL}></textarea>
                  </div>                        
                </div>
                <div class="col-lg">                  
                <div class="input-group">
                          <span class="input-group-text">Speed</span>
                          <input type="text" class="form-control" placeholder="Playback speed" aria-label="Recipient's username with two button addons" />
                          <button class="btn btn-primary" type="button"><i class="bi bi-chevron-double-left"></i></button>
                          <button class="btn btn-primary" type="button"><i class="bi bi-chevron-double-right"></i></button>
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


ReactDOM.render(
  <div>
      <PlayBack appAddress={app_address} assetDir={asset_dir} videoName={video_name} views={views} lastView={last_view} />
  </div>,
  document.querySelector('#root'),
);