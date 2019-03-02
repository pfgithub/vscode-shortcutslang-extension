// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as actions from './actionCompletionInfo.json';
import ShortcutsDiagnosticsProvider from './features/scplDiagnosticsProvider';

let diagnosticCollection: vscode.DiagnosticCollection;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// https://code.visualstudio.com/api/language-extensions/programmatic-language-features

	let completionItems = Object.keys(actions).map(a=>{
		let allActions = actions as {
			[key: string]: {
				docs: string,
				args: {
					argName?: string,
					argType: string,
					argAutocompletePlaceholder?: string
				}[],
				autocomplete?: string
			}
		};
		let thisAction = allActions[a];
		let item = new vscode.CompletionItem(a);
		item.documentation = new vscode.MarkdownString(thisAction.docs);
		//item.detail = //TODO arguments
		item.insertText = new vscode.SnippetString(thisAction.autocomplete);
		return item;
	});

	let diagnostics = new ShortcutsDiagnosticsProvider();
	diagnostics.activate(context.subscriptions);
}

// this method is called when your extension is deactivated
export function deactivate() {}
