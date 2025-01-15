import * as vscode from 'vscode';
import { RequestData } from '../webview/panel/src/utilities/commands';

const getContent = (str: string) => {
  const { choices } = JSON.parse(str);
  return choices[0]?.delta?.content || '';
};

let isLoading: boolean = false;
const history: {
  user: RequestData;
  bot: string;
}[] = [];

export const getHistory = () => history;

export const aptosAssistant = async (
  request: RequestData,
  onData: (data: string) => void,
  onEnd: () => void,
): Promise<void> => {
  if (isLoading) {
    return;
  }
  isLoading = true;
  history.push({ user: request, bot: '' });
  try {
    const response = await fetch(
      'https://assistant.aptosfoundation.org/api/assistant/chat',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approach: 'rrr',
          overrides: {
            retrieval_mode: 'foundation',
            semantic_ranker: true,
            semantic_captions: false,
            top: 3,
            suggest_followup_questions: false,
          },
          history: history.map((item) => ({
            user: item.user.content,
            bot: item.bot,
          })),
        }),
      },
    );

    if (!response.ok || !response.body) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let resultText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        buffer += decoder.decode(value, { stream: false });
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (let line of lines) {
        if (line.trim()) {
          try {
            const chunk = getContent(line);
            resultText += chunk;
            onData(resultText);
          } catch (error) {
            vscode.window.showErrorMessage(`JSON parse error (1): ${error}`);
          }
        }
      }
    }

    if (buffer.trim()) {
      try {
        const chunk = getContent(buffer);
        resultText += chunk;
        onData(resultText);
      } catch (error) {
        vscode.window.showErrorMessage(`JSON parse error (2): ${error}`);
      }
    }

    if (onEnd) {
      isLoading = false;
      history[history.length - 1].bot = resultText;
      onEnd();
    }
  } catch (error) {
    history.slice(0, -1);
    vscode.window.showErrorMessage(`Unknown error: ${error}`);
    if (onEnd) {
      isLoading = false;
      onEnd();
    }
  }
};
