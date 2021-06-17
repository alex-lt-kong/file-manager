class FileManager extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            appAddress: 'https://media.sz.lan',
            addressBar: '',
            currentPath: '/',
            fileInfo: null,
            pathStack: [],
            username: null
        };
        this.onClickItem = this.onClickItem.bind(this);
        this.onClickMore = this.onClickMore.bind(this);
        this.onClickAddressBarGo = this.onClickAddressBarGo.bind(this);
        this.onAddressBarChange = this.onAddressBarChange.bind(this);
    }

    componentDidMount() {
        this.fetchDataFromServer(this.state.currentPath);

        window.history.pushState(null, document.title, window.location.href);
        const self = this;
        // to make "this" work inside a eventlistener callback function,
        // we need to define self...
        window.addEventListener('popstate', function (event){
            console.log('back button clicked!');
            if (self.state.pathStack.length >= 2) {
                self.setState(prevState => ({
                    currentPath: prevState.pathStack[prevState.pathStack.length - 2],
                    pathStack: prevState.pathStack.slice(0, -1).slice(0, -1)
                }), () => self.fetchDataFromServer(self.state.currentPath));
            }
            window.history.pushState(null, document.title,  window.location.href);
        });
    }
    
    onAddressBarChange(event) {
        this.setState({
            addressBar: event.target.value
        });
    }
    
    onClickAddressBarGo(event) {
        this.fetchDataFromServer(this.state.addressBar);
    } 
    
    onClickItem(value) { 
        if (this.state.fileInfo.content[value].file_type === 0) {
            console.log('ordinary directory [' + value + '] clicked');
            this.setState(prevState => ({
                currentPath: prevState.currentPath + value + '/'
            }), () => this.fetchDataFromServer(this.state.currentPath));
           // console.log(prevState.currentPath + value + '/');
        } else if (this.state.fileInfo.content[value].file_type === 1) {
            console.log('ordinary file [' + value + '] clicked');
            if (this.state.fileInfo.content[value].media_type < 2) {
                window.open('https://media.sz.lan/download/?asset_dir=' + this.state.fileInfo.metadata.asset_dir + '&filename=' + value); 
            } else if (this.state.fileInfo.content[value].media_type === 2) {
                window.open('https://media.sz.lan/play-video/?asset_dir=' + this.state.fileInfo.metadata.asset_dir + '&video_name=' + value); 
            }
        } else {
            console.log('special file [' + value + '] clicked');
        }
    }

    onClickMore(event) { 
        console.log('onClickMore!');
    };
      
    fetchDataFromServer(asset_dir) {
        URL = this.state.appAddress + '/get-file-list/?asset_dir=' + encodeURIComponent(asset_dir);
        console.log('Fetching: ' + URL);
        axios.get(URL)
          .then(response => {
            // handle success
            this.setState({
                fileInfo: null
              // make it empty before fill it in again to force a re-rendering.
            });
            this.setState(prevState => ({
                addressBar: response.data.metadata.asset_dir,
                fileInfo: response.data,
                currentPath: response.data.metadata.asset_dir,
                pathStack:  [...prevState.pathStack, response.data.metadata.asset_dir]
            }));
            console.log(this.state.pathStack);
          })
          .catch(error => {
            alert('Unable to fetch fileInfo\n' + error);
          });
    }

    ListItemLink(props) {
        return <ListItem button component="a" {...props} />;
    }

    generate(element) {
        return [0, 1, 2].map((value) =>
            React.cloneElement(element, {
            key: value,
            }),
        );
    }

    render() {

        if (this.state.fileInfo === null) { return null; }

        
        let fi = this.state.fileInfo;
        const keys = Object.keys(fi.content);
        let fileList = new Array(keys.length);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            let thumbnail = null;
            if (fi.content[key].file_type === 0) {
                thumbnail = (
                    <img src='https://media.sz.lan/static/folder.png'
                        style={{ maxWidth: "100%", maxWidth: "5em", display:"block", float:"left" }} />);
            }
            else if (fi.content[key].file_type === 1) {
                if (fi.content[key].media_type === 1) {
                    thumbnail = (
                        <img src={`https://media.sz.lan/get-thumbnail/?filename=${key}.jpg`}
                            style={{ maxWidth: "100%", maxHeight: "90vh", "display":"block" }} />);
                } else if (fi.content[key].media_type === 2) {
                    thumbnail = (
                        <img src={`https://media.sz.lan/get-thumbnail/?filename=${key}.jpg`}
                            style={{ maxWidth: "100%", maxWidth: "5em", "display":"block", float:"left" }} />);
                }  
            }
            fileList[i] = (
            <li key={i} className="list-group-item">
                <a href="javascript:;" value={key} style={{ textDecoration: "none", display: "block" }} onClick={() => this.onClickItem(key)}>
                {thumbnail}{key}
                <svg style={{ float: "right" }} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-three-dots-vertical" viewBox="0 0 16 16">
                    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                </svg>
                </a>
            </li>
            );
        }

        return (
            
            <div>
                <div class="input-group mb-3">
                    <input type="text" class="form-control" placeholder="Address" aria-label="Recipient's username" aria-describedby="button-addon2"
                    value={this.state.addressBar} onChange={this.onAddressBarChange} />
                    <button className="btn btn-outline-secondary" type="button" onClick={this.onClickAddressBarGo} >Go</button>
                </div>
                <ul className="list-group">
                {fileList}
                </ul>
            </div>
        );
    }
}