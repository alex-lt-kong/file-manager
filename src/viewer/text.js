import axios from 'axios';
import React from 'react';
import {createRoot} from 'react-dom/client';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

class TextViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      params: props.params
    };
    console.log(this.state.params);
  }
  render() {
    const codeString = '(num) => num + 1';
    return (
      <SyntaxHighlighter language="javascript" style={docco}>
        {codeString}
      </SyntaxHighlighter>
    );
  }
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<div>
  <TextViewer params={params}/>
</div>);
