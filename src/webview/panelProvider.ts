import * as vscode from 'vscode';
import { getUri } from '../utilities/getUri';
import { getNonce } from '../utilities/getNonce';
import { getMoveFilesFromFolder } from '../utilities/getMoveFilesFromFolder';
import { printOutputChannel } from '../utilities/printOutputChannel';
import { COMMENDS } from './panel/src/utilities/commends';
import { aptosAssistant, getHistory } from '../utilities/aptosAssistant';

const AuditPrompt =
  'Audit the provided Aptos Move smart contract files one by one with file name\nSecurity\nCode Quality and Optimization\nLogical Error Detection\nRecommendations for Improvements\n';

class PanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'panelProviderAptos';
  private _view?: vscode.WebviewView;

  private readonly _context;
  private readonly _extensionUri: vscode.Uri;

  constructor(context: vscode.ExtensionContext) {
    this._context = context;
    this._extensionUri = context.extensionUri;
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken,
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
      enableCommandUris: true,
    };

    webviewView.webview.html = this._getHtmlForWebview(
      webviewView.webview,
      this._extensionUri,
    );

    webviewView.webview.onDidReceiveMessage(
      async ({ command, data }: { command: COMMENDS; data: any }) => {
        switch (command) {
          case COMMENDS.Env:
            this._view?.webview.postMessage({
              command: COMMENDS.AptosAssistantHistory,
              data: getHistory(),
            });
            break;
          case COMMENDS.AptosAssistantQuestion:
            aptosAssistant(
              data,
              (stream) => {
                this._view?.webview.postMessage({
                  command: COMMENDS.AptosAssistantStream,
                  data: stream,
                });
              },
              () => {
                this._view?.webview.postMessage({
                  command: COMMENDS.AptosAssistantStreamEnd,
                });
              },
            );
            break;
          case COMMENDS.MsgInfo:
            vscode.window.showInformationMessage(data);
            break;
          case COMMENDS.MsgError:
            vscode.window.showErrorMessage(data);
            break;
          case COMMENDS.OutputInfo:
            printOutputChannel(data);
            break;
          case COMMENDS.OutputError:
            printOutputChannel(`[ERROR]\n${data}`);
            break;
          default:
            vscode.window.showErrorMessage(
              `Unknown command received : ${command}`,
            );
            break;
        }
      },
    );
  }

  public sendMessage(message: any) {
    switch (message.command) {
      case 'aptos-extension.assistant.file':
      case 'aptos-extension.assistant.folder':
        this._view?.webview.postMessage({
          command: message.command,
          data: 'Code Analysis...',
        });
        aptosAssistant(
          message.data,
          (stream) => {
            this._view?.webview.postMessage({
              command: COMMENDS.AptosAssistantStream,
              data: stream,
            });
          },
          () => {
            this._view?.webview.postMessage({
              command: COMMENDS.AptosAssistantStreamEnd,
            });
          },
        );
        break;
      default:
        break;
    }
  }

  private _getHtmlForWebview(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
  ) {
    const stylesUri = getUri(webview, extensionUri, [
      'src',
      'webview',
      'panel',
      'build',
      'static',
      'css',
      'main.css',
    ]);
    const scriptUri = getUri(webview, extensionUri, [
      'src',
      'webview',
      'panel',
      'build',
      'static',
      'js',
      'main.js',
    ]);
    const nonce = getNonce();

    return /*html*/ `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no">
                <meta name="theme-color" content="#000000">
                <link nonce="${nonce}" rel="stylesheet" type="text/css" href="${stylesUri}">
              </head>
              <body>
                <noscript>You need to enable JavaScript to run this app.</noscript>
                <div id="root"></div>
                <script nonce="${nonce}" src="${scriptUri}"></script>
              </body>
            </html>
          `;
  }
}

export function initPanel(context: vscode.ExtensionContext) {
  const provider = new PanelProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(PanelProvider.viewType, provider),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'aptos-extension.assistant.file',
      async (uri: vscode.Uri) => {
        let code = '';
        const document = await vscode.workspace.openTextDocument(uri);
        code += `// ${vscode.workspace.asRelativePath(uri, false)}\n${document.getText()}`;
        (provider as any).sendMessage &&
          (provider as any).sendMessage({
            command: 'aptos-extension.assistant.file',
            data: `${AuditPrompt}\n${code}`,
          });
      },
    ),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'aptos-extension.assistant.folder',
      async (uri: vscode.Uri) => {
        const files = await getMoveFilesFromFolder(uri);
        if (files.length > 0) {
          let code = '';
          for (const file of files) {
            const document = await vscode.workspace.openTextDocument(file);
            code += `// ${vscode.workspace.asRelativePath(file, false)}\n${document.getText()}\n\n`;
          }
          (provider as any).sendMessage &&
            (provider as any).sendMessage({
              command: 'aptos-extension.assistant.folder',
              data: `${AuditPrompt}\n${code}`,
            });
        } else {
          vscode.window.showErrorMessage('No move file found!');
        }
      },
    ),
  );
}