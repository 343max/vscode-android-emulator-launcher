'use strict';
import * as vscode from 'vscode';
import { EmulatorLauncher, Emulator } from './emulator';

interface QuickPickEmulatorItem extends vscode.QuickPickItem {
    emulator: Emulator;
}

export function activate(context: vscode.ExtensionContext) {
    let launcher = new EmulatorLauncher();

    let disposable = vscode.commands.registerCommand('extension.androidEmulatorLauncher', () => {
        // vscode.window.showInformationMessage('Launch Android Emulators');

        launcher.emulators().then(emulators => {
            console.dir(emulators);
            vscode.window.showQuickPick(emulators.map(emulator => {
                return <QuickPickEmulatorItem>{
                    label: emulator.name,
                    detail: emulator.running ? 'Is running' : null,
                    emulator: emulator
                };
            }), {canPickMany: false}).then(((item => {
                if (!item) {
                    return;
                }
                
                launcher.launch(item.emulator);
            })));
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}