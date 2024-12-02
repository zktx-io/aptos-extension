import { useEffect, useState } from 'react';
import { marked } from 'marked';

export const Bot = ({ data }: { data: string }) => {
  const [html, setHtml] = useState<string>('');
  useEffect(() => {
    const renderedHtml = marked.parse(data, { async: false });
    setHtml(() => renderedHtml);
  }, [data]);
  return (
    <div
      style={{
        width: '80%',
        color: 'var(--vscode-foreground)',
        textAlign: 'left',
        marginBottom: '1rem',
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
