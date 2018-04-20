import { config } from './config';
import * as cp from 'child_process';

function exec(command: string, options: cp.ExecOptions = {}): Promise<{ stdout: string; stderr: string }> {
    return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
        cp.exec(command, options, (error, stdout, stderr) => {
            if (error) {
                reject({ error, stdout, stderr });
            }
            resolve({ stdout, stderr });
        });
    });
}

export interface Emulator {
    name: String;
    running: Boolean;
}

export class EmulatorLauncher {
    get path() {
        return config.emulatorPath;
    }

    public async emulators(): Promise<Emulator[]> {
        let { stdout } = await exec(this.path + ' -list-avds');
        return stdout.split(/\r{0,1}\n/).filter(l => {
            return l !== '';
        }).map(l => {
            return <Emulator>{
                name: l,
                running: false
            };
        });
    }

    public launch(emulator: Emulator) {
        cp.exec(this.path + ' -avd ' + emulator.name, <cp.ExecOptions>{
            detaced: true
        });
    }
}