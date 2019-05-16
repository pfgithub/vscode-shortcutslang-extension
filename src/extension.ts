// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ShortcutsDiagnosticsProvider from './features/scplDiagnosticsProvider';

import {allActions, getActionFromName} from 'scpl';

let diagnosticCollection: vscode.DiagnosticCollection;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// https://code.visualstudio.com/api/language-extensions/programmatic-language-features

	let completionItems = allActions.map(a=>{
		let item = new vscode.CompletionItem(a.shortName);
		item.documentation = new vscode.MarkdownString(a.genDocs());
		//item.detail = //TODO arguments
		item.insertText = new vscode.SnippetString(a.genDocsUsage().replace("```\n", "").replace("\n```", ""));
		return item;
	});
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider('scpl', {
		provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
			return completionItems;
		}
	}));
	context.subscriptions.push(vscode.languages.registerHoverProvider('scpl', {
		provideHover(document, position, token) {
			let action = getActionFromName(document.getText(document.getWordRangeAtPosition(position)));
			if(action){
				return new vscode.Hover(new vscode.MarkdownString(action.genDocs()));
			}
			return;
		}
	}));

	let diagnostics = new ShortcutsDiagnosticsProvider();
	diagnostics.activate(context.subscriptions);
}

// this method is called when your extension is deactivated
export function deactivate() {}
