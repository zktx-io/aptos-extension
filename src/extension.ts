import * as vscode from 'vscode';
import { initActivityBar } from './webview/activitybarProvider';
import { initPanel } from './webview/panelProvider';

export function activate(context: vscode.ExtensionContext) {
  initActivityBar(context);
  initPanel(context);
  context.subscriptions.push(
    vscode.commands.registerCommand('aptos-extension.openDocs', () => {
      vscode.env.openExternal(vscode.Uri.parse('https://docs.zktx.io'));
    }),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
