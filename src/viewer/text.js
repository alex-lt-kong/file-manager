import axios from 'axios';
import React from 'react';
import PropTypes from 'prop-types';
import {createRoot} from 'react-dom/client';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {stackoverflowLight} from 'react-syntax-highlighter/dist/esm/styles/hljs';
// eslint-disable-next-line max-len
// Available styles: https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/AVAILABLE_STYLES_HLJS.MD

class TextViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: props.params,
      plainTextContent: '<text loading...>'
    };
    this.fetchDataFromServer();
  }

  fetchDataFromServer() {
    const fileUrl = `./download/?asset_dir=${encodeURIComponent(this.state.params.asset_dir)}` +
      `&filename=${encodeURIComponent(this.state.params.filename)}&as_attachment=0`;
    axios.get(fileUrl)
        .then((response) => {
          const fileSizeLimit = 10 * 1024 * 1024;
          if (response.data.length > fileSizeLimit) {
            alert(
                `Due to common browser limit, file that is larger than ` +
                `${fileSizeLimit / 1024 / 1024} MB will not be loaded.`
            );
            return;
          }

          if (typeof response.data === 'string' || response.data instanceof String) {
            this.setState({
              plainTextContent: response.data
            });
          } else if (typeof response.data === 'object' ) {
            this.setState({
              plainTextContent: JSON.stringify(response.data)
            });
          } else {
            this.setState({
              plainTextContent: `typeof response.data === ${typeof response.data}, its content is:\n${response.data}`
            });
          }
        })
        .catch((error) => {
          console.error(error);
          alert(error);
        });
  }

  detectLanguageFromFilename() {
    if (this.state.params.filename[0] === '.') {
      console.warn(`filename ${this.state.params.filename} starts with ".", we will assume it to be a bash script`);
      return 'bash';
    }
    const fileExt = this.state.params.filename.split('.').pop().toLowerCase();
    const extLangMapping = {
      c: 'c',
      cpp: 'cpp',
      cs: 'csharp',
      h: 'c',
      ini: 'ini',
      js: 'javascript',
      json: 'json',
      log: 'text',
      md: 'markdown',
      php: 'php',
      ps1: 'powershell',
      py: 'python',
      pyi: 'python',
      sql: 'sql',
      txt: 'text',
      xml: 'xml'
    };
    if (extLangMapping.hasOwnProperty(fileExt)) {
      return extLangMapping[fileExt];
    }
    console.warn(`fileExt ${fileExt} does not have a defined mapping, returning text`);
    return 'text';
  }

  render() {
    return (
      <SyntaxHighlighter language={this.detectLanguageFromFilename()} style={stackoverflowLight}
        showLineNumbers={true} showInlineLineNumbers={false} wrapLongLines={true}>
        {this.state.plainTextContent === null ? '' : this.state.plainTextContent}
      </SyntaxHighlighter>
    );
  }
}

TextViewer.propTypes = {
  params: PropTypes.object
};

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<div>
  <TextViewer params={params}/>
</div>);
