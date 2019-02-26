// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as actions from './actions.json';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let completionItems = Object.keys(actions).map(a=>{
		let item = new vscode.CompletionItem(a);
		item.documentation = new vscode.MarkdownString((actions as {[key: string]: string})[a]);
		return item;
	});

	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('flowcut', {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
			return completionItems;
		}
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}
