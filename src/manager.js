import axios from 'axios';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {FileItems} from './file-items';
import path from 'path';
import {NavigationBar} from './navbar';

class FileManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addressBar: '/',
      currentPath: '/',
      // CanNOT use currentPath as addressBar's value--addressBar's value has to change as user types while
      // currentPath should be set only after user presses Enter.
      filesInfo: null,
      pathStack: [],
      serverInfo: null,
      showNewFolderModal: false,
      uploadProgress: 0,
      username: null
    };
    this.onClickMore = this.onClickMore.bind(this);
    this.fetchFilesListFromServer = this.fetchFilesListFromServer.bind(this);
    this.refreshFileList = this.refreshFileList.bind(this);
    this.serverInfoPanel;
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
        currentPath: formattedNewCurrentPath,
        addressBar: formattedNewCurrentPath
      }, ()=> {
        this.fetchFilesListFromServer();
      });
    } else {
      this.fetchFilesListFromServer();
    }
  }

  onClickMore(event) {
    console.log('onClickMore!');
  };

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

  ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
  }


  render() {
    if (this.state.filesInfo === null) {
      return null;
    }

    return (
      <div>
        <NavigationBar currentPath={this.state.currentPath} refreshFileList={this.refreshFileList}/>
        <div>
          <ul className="list-group overflow-auto"
            style={{
              maxWidth: '1000px', maxHeight: '100%', minHeight: '60vh', marginLeft: 'auto', marginRight: 'auto'
            }}>
            {/* The maxHeight: 100% is used to solve a very nasty bug. The bug is like this:
                First, it only happens on smartphone and will not happen on desktop browser.
                On a mobile device, if you have a long file list and you try to open the
                menu for the file items shown on the last page of the list (i.e. not necessarily
                the last one, but the ones could be shown on the last page of the screen) you will
                notice that the poge will scroll up a little bit at the moment you click the
                "more" button. I failed to find any solutions or even references to this bug online.
                After a lot of trial-and-error, it turns out that if we set the maxHeight of the file
                list to the height of the monitor, the bug disappears...
                minHeight is used to fix another issue: suppose we set maxHeight only, if the content
                height is too small, the context menu can actually be higher than the content height,
                forcing the browser to show a scrollbar in order to accommodate the height of the context
                menu. If we set minHeight == 60vh, the content height will never to too small to accomodate
                the context menu.*/}
            <FileItems filesInfo={this.state.filesInfo} refreshFileList={this.refreshFileList}
              currentPath={this.state.currentPath}/>
          </ul>
        </div>
      </div>
    );
  }
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<div>
  <FileManager />
</div>);
