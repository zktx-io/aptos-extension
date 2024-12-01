import React, { useEffect, useState } from 'react';
import { VSCodeTextField } from '@vscode/webview-ui-toolkit/react';
import { marked } from 'marked';

import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMarkdown(() => value);
    // setHtml(marked.parse(value));
  };

  useEffect(() => {
    const renderMarkdown = async () => {
      const renderedHtml = await marked.parse(markdown);
      setHtml(() => renderedHtml);
    };
    renderMarkdown();
  }, [markdown]);

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
        disabled={isLoading}
        value={markdown}
        placeholder="Message..."
        onInput={(e: any) => handleInputChange(e)}
        style={{
          backgroundColor: 'var(--vscode-editor-background)',
          color: 'var(--vscode-input-foreground)',
        }}
      />
    </div>
  );
}

export default App;
