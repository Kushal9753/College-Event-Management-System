const fs = require('fs');
const path = require('path');

function removeDark(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            removeDark(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content.replace(/dark:[A-Za-z0-9\-_\[\]\#/:]+/g, '').replace(/ +/g, ' ');
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

removeDark(path.join(__dirname, 'frontend', 'event', 'src'));
console.log('Done');
