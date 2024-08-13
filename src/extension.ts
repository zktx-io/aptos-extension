import * as vscode from 'vscode';
import { commands, ExtensionContext } from 'vscode';
import { WebviewViewProvider } from './webviewPovider';

export function activate(context: ExtensionContext) {
  const provider = new WebviewViewProvider(context, 'Aptos Extension');
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      WebviewViewProvider.viewType,
      provider,
    ),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
