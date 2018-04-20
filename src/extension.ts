'use strict';
import * as vscode from 'vscode';
import { EmulatorLauncher, Emulator } from './emulator';

interface QuickPickEmulatorItem extends vscode.QuickPickItem {
    emulator: Emulator;
}

export function activate(context: vscode.ExtensionContext) {
    let launcher = new EmulatorLauncher();

    context.subscriptions.push(vscode.commands.registerCommand('extension.androidEmulatorLauncher', () => {
        vscode.window.showQuickPick(launcher.emulators().then<QuickPickEmulatorItem[]>(emulators => {
            return emulators.map(emulator => {
                return <QuickPickEmulatorItem>{
                    label: emulator.name,
                    detail: emulator.running ? 'running' : 'not running',
                    emulator: emulator
                };
            });
        }), {canPickMany: false}).then(((item => {
            if (!item) {
                return;
            }

            let emulator = item.emulator;

            if (!emulator.running) {
                launcher.launch(emulator);
            }
        })));
    }));
}

export function deactivate() {
}