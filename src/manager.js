import axios from 'axios';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {FileItems} from './file-items';
import path from 'path';
import {NavigationBar} from './navbar';
import ListGroup from 'react-bootstrap/ListGroup';

class FileManager extends React.Component {
  constructor(props) {
    super(props);
    let cachedThumbnailSize = parseInt(localStorage.getItem('thumbnailSize'));
    if (typeof cachedThumbnailSize !== 'number' || isNaN(cachedThumbnailSize)) {
      cachedThumbnailSize = 2;
    }
    this.state = {
      currentPath: '/',
      filesInfo: null,
      pathStack: [],
      username: null,
      thumbnailSize: cachedThumbnailSize
    };
    this.fetchFilesListFromServer = this.fetchFilesListFromServer.bind(this);
    this.refreshFileList = this.refreshFileList.bind(this);
    this.updateThumbnailSize = this.updateThumbnailSize.bind(this);
  }

  componentDidMount() {
    this.fetchFilesListFromServer();

    window.history.pushState(null, document.title, window.location.href);
    const self = this;
    // to make "this" work inside a eventlistener callback function,
    // we need to define self...
    window.addEventListener('popstate', function(event) {
      console.log('back button clicked!');
      if (self.state.pathStack.length >= 2) {
        self.setState((prevState) => ({
          currentPath: prevState.pathStack[prevState.pathStack.length - 2],
          pathStack: prevState.pathStack.slice(0, -1).slice(0, -1)
        }), () => self.fetchFilesListFromServer());
      }
      window.history.pushState(null, document.title, window.location.href);
    });
  }

  refreshFileList(newCurrentPath) {
    if (typeof newCurrentPath === 'string') {
      let formattedNewCurrentPath = path.resolve(newCurrentPath);
      formattedNewCurrentPath += (formattedNewCurrentPath.endsWith('/') ? '' : '/');
      this.setState({
        currentPath: formattedNewCurrentPath
      }, ()=> {
        this.fetchFilesListFromServer();
      });
    } else {
      this.fetchFilesListFromServer();
    }
  }

  updateThumbnailSize(newThumbnailSize) {
    if (typeof newThumbnailSize === 'number') {
      this.setState({
        thumbnailSize: newThumbnailSize
      });
    }
  }

  fetchFilesListFromServer() {
    const URL = './get-file-list/?asset_dir=' + encodeURIComponent(this.state.currentPath);

    axios.get(URL)
        .then((response) => {
          this.setState((prevState) => ({
            filesInfo: response.data,
            pathStack: [...prevState.pathStack, response.data.metadata.asset_dir]
          }));
        })
        .catch((error) => {
          console.error(error);
          alert('Unable to fetch filesInfo:\n' + error.response.data);
        });
  }

  render() {
    if (this.state.filesInfo === null) {
      return null;
    }

    return (
      <>
        <NavigationBar currentPath={this.state.currentPath} refreshFileList={this.refreshFileList}
          updateThumbnailSize={this.updateThumbnailSize} thumbnailSize={this.state.thumbnailSize} />
        <ListGroup className="overflow-auto"
          style={{maxWidth: '1000px', marginLeft: 'auto', marginRight: 'auto', minHeight: 'calc(100vh - 64px)'}}>
          <FileItems filesInfo={this.state.filesInfo} refreshFileList={this.refreshFileList}
            currentPath={this.state.currentPath} thumbnailSize={this.state.thumbnailSize} />
        </ListGroup>
      </>
    );
  }
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<div>
  <FileManager />
</div>);
