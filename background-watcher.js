
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const projectRoot = process.argv[2] || process.cwd();
const socket = new WebSocket('ws://2b5d-2401-4900-1c21-25fe-b491-13-39cb-5bcb.ngrok-free.app');

socket.on('open', () => {
  const watcher = chokidar.watch(projectRoot, {
    ignored: /node_modules|\.git/,
    persistent: true,
    ignoreInitial: true,
  });

  watcher
    .on('add', file => sendFileChange('add', file))
    .on('change', file => sendFileChange('change', file))
    .on('unlink', file => sendFileChange('delete', file));

  function sendFileChange(type, file) {
    const relPath = path.relative(projectRoot, file);
    let content = '';
    try {
      if (type !== 'delete') content = fs.readFileSync(file, 'utf8');
    } catch { }

    const payload = {
      type,
      file: relPath,
      content,
    };

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    }
  }
});
