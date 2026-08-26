const { spawn } = require('node:child_process');
const electron = require('electron');

// Some developer shells (including VS Code/Codex terminals) set this flag for
// their own Electron integrations. It must not leak into this child process.
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electron, ['.'], { env, stdio: 'inherit', windowsHide: false });
child.on('exit', code => process.exit(code ?? 0));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
