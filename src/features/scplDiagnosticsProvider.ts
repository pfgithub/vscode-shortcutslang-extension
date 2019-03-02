import * as path from 'path';
import * as cp from 'child_process';
import ChildProcess = cp.ChildProcess;

import {parser, PositionedError} from "shortcutslang";

import * as vscode from 'vscode';

export default class ShortcutsDiagnosticsProvider {
    
    // @ts-ignore
	private diagnosticCollection: vscode.DiagnosticCollection;
    // @ts-ignore
    private command: vscode.Disposable;
	
	public activate(subscriptions: vscode.Disposable[]) {
		subscriptions.push(this);
		this.diagnosticCollection = vscode.languages.createDiagnosticCollection();

		vscode.workspace.onDidOpenTextDocument(this.doScDiagnostics, this, subscriptions);
		vscode.workspace.onDidCloseTextDocument((textDocument)=> {
			this.diagnosticCollection.delete(textDocument.uri);
		}, null, subscriptions);

		vscode.workspace.onDidSaveTextDocument(this.doScDiagnostics, this);

		// Hlint all open haskell documents
		vscode.workspace.textDocuments.forEach(this.doScDiagnostics, this);
	}
	
	public dispose(): void {
		this.diagnosticCollection.clear();
		this.diagnosticCollection.dispose();
		this.command.dispose();
	}
	private doScDiagnostics(textDocument: vscode.TextDocument) {
        if(textDocument.languageId !== "scpl"){
            return;
        }
		let diagnostics: vscode.Diagnostic[] = [];

        const parsed = parser.parse(`${textDocument.getText()}\n`, [1, 1]);
        if(parsed.remainingStr) {
            if(!parsed.pos){throw new Error("!parsed.pos")}
            let range = new vscode.Range(parsed.pos[0] - 1, parsed.pos[1] - 1, parsed.pos[0] + 100, 0);
            let diagnostic = new vscode.Diagnostic(range, "Parsing Error", vscode.DiagnosticSeverity.Error);
            diagnostics.push(diagnostic);
            this.diagnosticCollection.set(textDocument.uri, diagnostics);
            return;
            // throw new Error("Str remaining");
        }
    
        let shortcut;
        try{
            shortcut = parsed.data.asShortcut();
        }catch(er) {
            if(er instanceof PositionedError) {
                let range = new vscode.Range(er.start[0] - 1, er.start[1] - 1, er.end[0] - 1, er.end[1] - 1);
                let diagnostic = new vscode.Diagnostic(range, er.message, vscode.DiagnosticSeverity.Error);
                diagnostics.push(diagnostic);
                this.diagnosticCollection.set(textDocument.uri, diagnostics);
            }
            // throw er;
            return;
        }
        this.diagnosticCollection.set(textDocument.uri, diagnostics);

	}
}