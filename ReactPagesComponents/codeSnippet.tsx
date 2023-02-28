import type { CellPlugin } from '@react-page/editor';
import React from 'react';

import CodeSnippet from './CodeSnippetComp';

const codeSnippet: CellPlugin<{
  code: string;
  language: string;
}> = {
  Renderer: (props) =>
    props.data?.code ? (
      <CodeSnippet language={props.data.language} code={props.data.code} />
    ) : null,
  id: 'code-snippet',
  title: 'Code snippet',
  description: 'A code snippet',
  version: 1,
  controls: {
    type: 'autoform',
    schema: {
      properties: {
        language: {
          type: 'string',
        },
        code: {
          type: 'string',
          uniforms: {
            multiline: true,
          },
        },
      },
      required: ['code'],
    },
  },
};
export default codeSnippet;