const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public', 'sequence');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const dir = __dirname;
let files = fs.readdirSync(dir).filter(f => f.startsWith('ezgif-frame-') && f.endsWith('.jpg'));
files.sort();

let count = 0;
for (const file of files) {
  const oldPath = path.join(dir, file);
  const newPath = path.join(publicDir, `frame_${count}.jpg`);
  fs.renameSync(oldPath, newPath);
  count++;
}
console.log(`Moved and renamed ${count} files.`);
