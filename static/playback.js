class PlayBack extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      appAddress: props.appAddress,
      assetDir: props.assetDir,
      subtitlesURL: props.appAddress + '/download/?asset_dir=' + encodeURIComponent(props.assetDir) + '&filename=' + encodeURIComponent(props.videoName) + '.vtt',
      videoInfo: null,
      videoName: props.videoName,
      username: null
    };
    
    this.onSubtitlesURLTextareaChange = this.onSubtitlesURLTextareaChange.bind(this);

    this.videoURL = this.state.appAddress + '/download/?asset_dir=' + 
                    encodeURIComponent(this.state.assetDir) + '&filename=' +
                    encodeURIComponent(this.state.videoName) + '&as_attachment=0';
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
    return (
      <div className="container-fluid my-2">
        <div className="row flex-row-reverse">
          <div className="col-sm-3 col-md-pull-3">       
            <div className="accordion" id="accordionExample">
              <div className="accordion-item">
                <h2 className="accordion-header" id="headingOne">
                  <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                    Video Information
                  </button>
                </h2>
                <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                  <div className="accordion-body">
                    {syntaxHighlight(JSON.stringify(this.state.videoInfo, null, 2))}
                  </div>
                </div>
              </div>
            </div>          
          </div>
          <div className="col-sm-9 col-md-push-9">
            {/* A combination of sm and number makes it work */}
            <video style={{ width: "100%"}} autoPlay controls>
              <source src={this.videoURL} />
              <textarea class="form-control" aria-label="With textarea" onChange={this.onSubtitlesURLTextareaChange}>{this.state.subtitlesURL}</textarea>
              <track label="English" kind="subtitles" srcLang="en" src={this.state.subtitlesURL} default />
            Your browser does not support the video tag.
            </video>
            <div className="input-group">
              <span className="input-group-text">Specify Subtitles</span>
              <textarea className="form-control" aria-label="With textarea" onChange={this.onSubtitlesURLTextareaChange} value={this.state.subtitlesURL}></textarea>
            </div>
          </div>
        </div>
      </div>
    );
  }
}


ReactDOM.render(
  <div>
      <PlayBack appAddress={app_address} assetDir={asset_dir} videoName={video_name} />
  </div>,
  document.querySelector('#root'),
);