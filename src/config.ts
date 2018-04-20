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

    get emulatorPath(): string { return this.config.get<string>("emulatorPath")!; }
}

export const config = new Config();