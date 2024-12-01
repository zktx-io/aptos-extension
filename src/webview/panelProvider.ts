import * as vscode from 'vscode';
import { getUri } from '../utilities/getUri';
import { getNonce } from '../utilities/getNonce';

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
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this._getHtmlForWebview(
      webviewView.webview,
      this._extensionUri,
    );
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
}
