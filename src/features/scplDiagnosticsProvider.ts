import * as path from 'path';
import * as cp from 'child_process';
import ChildProcess = cp.ChildProcess;

import {parse, PositionedError} from "scpl";

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

        try{
            parse(textDocument.getText(), {})
        }catch(er){
            if(er instanceof PositionedError) {
                let end = er.end[1] - 1;
                if(end < 1) {end = 0;} // this shouldn't be an issue but it's not working for some reason
                let range = new vscode.Range(er.start[0] - 1, er.start[1] - 1, er.end[0] - 1, end);
                let diagnostic = new vscode.Diagnostic(range, er.message, vscode.DiagnosticSeverity.Error);
                diagnostics.push(diagnostic);
                this.diagnosticCollection.set(textDocument.uri, diagnostics);
            }else{
                let range = new vscode.Range(0, 0, 100, 0);
                let diagnostic = new vscode.Diagnostic(range, "Unknown position: "+er.message, vscode.DiagnosticSeverity.Error);
                diagnostics.push(diagnostic);
                this.diagnosticCollection.set(textDocument.uri, diagnostics);
            }
        }
        this.diagnosticCollection.set(textDocument.uri, diagnostics);
	}
}