import axios from 'axios';
import React from 'react';
import {createRoot} from 'react-dom/client';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
const Component = () => {
  const codeString = '(num) => num + 1';
  return (
    <SyntaxHighlighter language="javascript" style={docco}>
      {codeString}
    </SyntaxHighlighter>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<div>
  <Component />
</div>);
