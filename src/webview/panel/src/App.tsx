import { useEffect, useRef, useState } from 'react';
import { VSCodeTextField } from '@vscode/webview-ui-toolkit/react';

import './App.css';

import { COMMENDS } from './utilities/commends';
import { vscode } from './utilities/vscode';
import { User } from './components/User';
import { Bot } from './components/Bot';

function App() {
  const initialized = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [htmlHistory, setHtmlHistory] = useState<
    { isBot: boolean; content: string }[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [htmlHistory]);

  useEffect(() => {
    const handleMessage = async (event: any) => {
      const message = event.data;
      switch (message.command) {
        case 'aptos-extension.assistant.file':
        case 'aptos-extension.assistant.folder':
          setIsLoading(() => true);
          setHtmlHistory((old) => [
            ...old,
            { isBot: false, content: message.data },
            { isBot: true, content: '' },
          ]);
          break;
        case COMMENDS.AiHistory:
          const temp: { isBot: boolean; content: string }[] = [];
          message.data.forEach((item: { user: string; bot: string }) => {
            temp.push({ isBot: false, content: item.user });
            item.bot && temp.push({ isBot: true, content: item.bot });
          });
          setHtmlHistory(() => temp);
          break;
        case COMMENDS.AiStream:
          setHtmlHistory((old) => [
            ...old.slice(0, -1),
            { isBot: true, content: message.data },
          ]);
          break;
        case COMMENDS.AiStreamEnd:
          setIsLoading(() => false);
          break;
        default:
          break;
      }
    };

    if (!initialized.current) {
      initialized.current = true;
      vscode.postMessage({ command: COMMENDS.Env });
    }

    window.addEventListener('message', handleMessage);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {htmlHistory.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: 'var(--vscode-foreground)',
              fontSize: '1.2rem',
              textAlign: 'center',
              height: '100%',
            }}
          >
            No messages yet. Start a conversation!
          </div>
        ) : (
          htmlHistory.map((item, key) =>
            item.isBot ? (
              <Bot key={key} data={item.content} />
            ) : (
              <User key={key} data={item.content} />
            ),
          )
        )}
        <div ref={messagesEndRef} />
      </div>
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          paddingBottom: '1rem',
        }}
      >
        <VSCodeTextField
          style={{
            width: '100%',
            color: 'var(--vscode-input-foreground)',
          }}
          disabled={isLoading}
          value={input}
          placeholder="Message..."
          onChange={(event) => {
            !isLoading && setInput((event.target as any)?.value || '');
          }}
          onKeyDown={(event) => {
            const value = (event.target as any)?.value || '';
            if (event.key === 'Enter' && value && !isLoading) {
              vscode.postMessage({
                command: COMMENDS.AiQuestion,
                data: value,
              });
              setInput('');
              setIsLoading(() => true);
              setHtmlHistory((old) => [
                ...old,
                { isBot: false, content: value },
                { isBot: true, content: '' },
              ]);
            }
          }}
        />
      </div>
    </div>
  );
}

export default App;
