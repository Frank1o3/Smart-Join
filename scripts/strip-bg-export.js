const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const srcDir = path.join(__dirname, '..', 'src');

function copyIfExists(name) {
    const src = path.join(srcDir, name);
    const dest = path.join(distDir, name);
    if (fs.existsSync(src)) {
        try {
            fs.mkdirSync(distDir, { recursive: true });
            fs.copyFileSync(src, dest);
            console.log(`Copied ${name} to dist/`);
        } catch (err) {
            console.error(`Failed to copy ${name}:`, err.message);
        }
    } else {
        console.log(`${name} not found in src/ — skipping`);
    }
}

function applyfix(path) {
    let src = fs.readFileSync(path, 'utf8');
    const fixed = src.replace(/\n?export \{\};?\s*$/m, '\n');
    if (fixed !== src) {
        fs.writeFileSync(path, fixed, 'utf8');
        console.log(`Stripped trailing export {} from ${path}`);
    } else {
        console.log(`No export {} found in ${path}`);
    }

}

try {
    applyfix(path.join(distDir, 'background.js'));
    applyfix(path.join(distDir, 'content.js'));
    applyfix(path.join(distDir, 'popup.js'));

    // Copy additional assets into dist
    copyIfExists('manifest.json');
    copyIfExists('screenshot.png');
    copyIfExists('popup.html');
    copyIfExists('styles.css');
    copyIfExists('style.css');
} catch (err) {
    console.error('Error stripping export {} from background.js:', err.message);
    process.exit(1);
}