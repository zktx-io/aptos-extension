import React, { useEffect, useState } from 'react';
import { VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import { marked } from 'marked';

import './App.css';

import { COMMENDS } from './utilities/commends';
import { vscode } from './utilities/vscode';

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    const initInfo = async () => {
      const info =
        'This window is for testing the [```Aptos Assistant```](https://assistant.aptosfoundation.org). Try using the ```Aptos Assistant (beta) context menu``` in the Explorer or Editor window.';
      const renderedHtml = await marked.parse(info);
      setHtml(() => renderedHtml);
    };
    const handleMessage = async (event: any) => {
      const message = event.data;
      switch (message.command) {
        case 'aptos-extension.assistant.file':
        case 'aptos-extension.assistant.folder':
          setIsLoading(() => true);
          break;
        case COMMENDS.AptosAssistantStream:
          const renderedHtml = await marked.parse(message.data);
          setHtml(() => renderedHtml);
          break;
        case COMMENDS.AptosAssistantStreamEnd:
          setIsLoading(() => false);
          break;
        default:
          break;
      }
    };
    window.addEventListener('message', handleMessage);

    initInfo();
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          color: 'var(--vscode-foreground)',
          borderBottom: '1px solid var(--vscode-editorGroup-border)',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <VSCodeTextField
        style={{
          backgroundColor: 'var(--vscode-editor-background)',
          color: 'var(--vscode-input-foreground)',
        }}
        disabled={isLoading}
        value={input}
        placeholder="Message..."
        onChange={(event) => {
          setInput((event.target as any)?.value || '');
        }}
        onKeyDown={(event) => {
          const value = (event.target as any)?.value || '';
          if (event.key === 'Enter' && value) {
            vscode.postMessage({
              command: COMMENDS.AptosAssistantQuestion,
              data: value,
            });
            setInput('');
            setIsLoading(() => true);
          }
        }}
      />
    </div>
  );
}

export default App;
