import type { CellPlugin } from '@react-page/editor';
import React from 'react';

import CodeSnippet from './CodeSnippetComp';

const codeSnippet: CellPlugin<{
  kod: string;
  rozszerzenie: string;
}> = {
  Renderer: (props) =>
    props.data?.kod ? (
      <CodeSnippet language={props.data.rozszerzenie} code={props.data.kod} />
    ) : null,
  id: 'code-snippet',
  title: 'Fragment kodu',
  description: 'Wstaw fragment kodu',
  version: 1,
  controls: {
    type: 'autoform',
    schema: {
      properties: {
        rozszerzenie: {
          type: 'string',
        },
        kod: {
          type: 'string',
          uniforms: {
            multiline: true,
          },
        },
      },
      required: ['kod'],
    },
  },
};
export default codeSnippet;