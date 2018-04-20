import { WorkspaceConfiguration, workspace } from "vscode";

class Config {
	private config!: WorkspaceConfiguration;

	constructor() {
		workspace.onDidChangeConfiguration((e) => this.loadConfig());
		this.loadConfig();
	}

	private loadConfig() {
		this.config = workspace.getConfiguration("androidEmulatorLauncher");
	}

    get emulatorPath() { return this.config.get<string>("emulatorPath")!; }
    get adbPath() { return this.config.get<string>("adbPath")!; }
}

export const config = new Config();