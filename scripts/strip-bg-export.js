const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const srcDir = path.join(__dirname, '..', 'src');
const doExt = process.argv.includes('ext');

function copyDirIfExists(name) {
    const src = path.join(srcDir, name);
    const dest = path.join(distDir, name);
    if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
        console.log(`${name} not found in src/ — skipping`);
        return;
    }
    try {
        const copyRecursive = (s, d) => {
            fs.mkdirSync(d, { recursive: true });
            for (const entry of fs.readdirSync(s, { withFileTypes: true })) {
                const sPath = path.join(s, entry.name);
                const dPath = path.join(d, entry.name);
                if (entry.isDirectory()) copyRecursive(sPath, dPath);
                else fs.copyFileSync(sPath, dPath);
            }
        };
        copyRecursive(src, dest);
        console.log(`Copied directory ${name} to dist/${name}`);
    } catch (err) {
        console.error(`Failed to copy directory ${name}:`, err.message);
    }
}

function copyAllMatching(ext) {
    try {
        const files = fs.readdirSync(srcDir);
        files.filter(f => f.endsWith(ext)).forEach(f => copyIfExists(f));
    } catch (err) {
        console.error(`Failed reading src/ for *${ext}:`, err.message);
    }
}

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
    // applyfix(path.join(distDir, 'background.js'));
    applyfix(path.join(distDir, 'content.js'));
    applyfix(path.join(distDir, 'popup.js'));

    if (doExt) {
        // Copy additional assets into dist (only when ext arg provided)
        copyIfExists('manifest.json');
        copyAllMatching('.html');
        copyAllMatching('.css');
        copyAllMatching('.png');
    } else {
        console.log('Ext build not requested — skipping copying extension assets');
    }
} catch (err) {
    console.error('Error stripping export {} from background.js:', err.message);
    process.exit(1);
}