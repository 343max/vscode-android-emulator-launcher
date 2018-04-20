import { config } from './config';
import * as cp from 'child_process';
import { Socket } from 'net';
import { StringDecoder } from 'string_decoder';

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
    name: string;
    running?: Boolean;
    port?: number;
}

export class EmulatorLauncher {
    public async launch(emulator: Emulator) {
        console.assert(!emulator.running);
        return exec(`${config.emulatorPath} -avd ${emulator.name} &`);
    }

    public async activate(emulator: Emulator) {
        console.assert(emulator.running);
        console.assert(emulator.port);
        let pid = await this.emulatorPID(emulator.port!);
        let osascript = `osascript -e 'tell application "System Events"
    set processList to every process whose unix id is ${pid}
    repeat with proc in processList
        set the frontmost of proc to true
    end repeat
end tell'`;
        return exec(osascript);
    }

    public async emulators(): Promise<Emulator[]> {
        let [all, running] = await Promise.all([this.allEmulatorNames(), this.runningEmulators()]);
        return all.map(name => {
            return running.find((emulator) => emulator.name === name) || { name: name, running: false };
        });
    }

    private async allEmulatorNames(): Promise<string[]> {
        let { stdout } = await exec(`${config.emulatorPath} -list-avds`);
        return stdout.split(/\r{0,1}\n/).filter(l => {
            return l !== '';
        }).map(l => {
            return l;
        });
    }

    private async runningEmulators(): Promise<Emulator[]> {
        let ports = await this.runningEmulatorPorts();
        console.dir(ports);
        return Promise.all(ports.map(port => {
            return this.runningEmulatorName(port).then(name => {
                return <Emulator>{name: name, running: true, port: port};
            });
        }));
    }

    private async runningEmulatorName(port: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let client = new Socket();
            client.connect(port, 'localhost');
    
            var dataReceived = false;
            var commandSent = false;
            var data = '';
            client.on('data', chunk => {
                data += new StringDecoder('utf8').write(chunk);
                let lines = data.split('\r\n');
                let c = lines.length;
                // make sure we got an 'OK' and a newline
                if (c >= 2 && lines[c-1] === '' && lines[c-2] === 'OK') {
                    if (!commandSent) {
                        client.write('avd name\n');
                        commandSent = true;
                    } else {
                        resolve(lines[c-3]);
                        client.destroy();
                        dataReceived = true;
                    }
                }
            });

            client.setTimeout(100);

            client.on('close', () => {
                if (!dataReceived) {
                    console.warn(`no name received on port ${port}`);
                    reject();
                }
            });

            client.on('timeout', () => {
                console.warn(`timeout on port ${port}`);
                reject();
            });

            client.on('error', (error) => {
                console.warn(`error on port ${port}: ${error}`);
                reject();
            });
            
        });
    }

    private async runningEmulatorPorts(): Promise<number[]> {
        let { stdout } = await exec(`${config.adbPath} devices`);
        let r = /emulator-([0-9]+)/g;
        var ports = <number[]>[];
        var m;
        while(m = r.exec(stdout)) {
            ports.push(parseInt(m[1]));
        }
        return ports;
    }

    private async emulatorPID(port: number): Promise<number> {
        return exec(`lsof -n -i4TCP:${port} | grep LISTEN`).then(({stdout}) => {
            return parseInt(stdout.split(/\s+/)[1]);
        });
    }
}