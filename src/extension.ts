import * as vscode from 'vscode';
import { ActivitybarPovider } from './webview/activitybarPovider';

export function activate(context: vscode.ExtensionContext) {
  const provider = new ActivitybarPovider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      ActivitybarPovider.viewType,
      provider,
    ),
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('aptos-extension.openDocs', () => {
      vscode.env.openExternal(vscode.Uri.parse('https://docs.zktx.io'));
    }),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
