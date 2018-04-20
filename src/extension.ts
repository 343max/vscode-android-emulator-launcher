'use strict';
import * as vscode from 'vscode';
import { EmulatorLauncher, Emulator } from './emulator';

interface QuickPickEmulatorItem extends vscode.QuickPickItem {
    emulator: Emulator;
}

export function activate(context: vscode.ExtensionContext) {
    let launcher = new EmulatorLauncher();
    let disposable = vscode.commands.registerCommand('extension.androidEmulatorLauncher', () => {
        launcher.emulators().then(emulators => {
            vscode.window.showQuickPick(emulators.map(emulator => {
                return <QuickPickEmulatorItem>{
                    label: emulator.name,
                    detail: emulator.running ? 'running' : 'not running',
                    emulator: emulator
                };
            }), {canPickMany: false}).then(((item => {
                if (!item) {
                    return;
                }

                if (!item.emulator.running) {
                    launcher.launch(item.emulator);
                }
            })));
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}