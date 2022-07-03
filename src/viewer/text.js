import axios from 'axios';
import React from 'react';
import {createRoot} from 'react-dom/client';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {docco} from 'react-syntax-highlighter/dist/esm/styles/hljs';

class TextViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: props.params,
      plainTextContent: null
    };
    console.log(this.state.params);
    this.fetchDataFromServer();
  }

  fetchDataFromServer() {
    const fileUrl = `./download/?asset_dir=${encodeURIComponent(this.state.params.asset_dir)}` +
      `&filename=${encodeURIComponent(this.state.params.filename)}&as_attachment=0`;
    axios.get(fileUrl)
        .then((response) => {
          this.setState({
            plainTextContent: response.data
          });
          console.log(response);
        })
        .catch((error) => {
          console.error(error);
        });
  }

  detectLanguageFromFilename() {
    const fileExt = this.state.params.filename.split('.').pop();
    console.log(fileExt);
    const extLangMapping = {
      c: 'c',
      cpp: 'cpp',
      cs: 'csharp',
      ini: 'ini',
      js: 'javascript',
      json: 'json',
      php: 'php',
      py: 'python',
      sql: 'sql',
      xml: 'xml'
    };
    if (extLangMapping.hasOwnProperty(fileExt)) {
      return extLangMapping[fileExt];
    }
    return 'text';
  }

  render() {
    return (
      <SyntaxHighlighter language={this.detectLanguageFromFilename()} style={docco}
        showLineNumbers={true} wrapLongLines={true}>
        {this.state.plainTextContent === null ? 'Error' : this.state.plainTextContent}
      </SyntaxHighlighter>
    );
  }
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<div>
  <TextViewer params={params}/>
</div>);
