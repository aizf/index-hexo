const path = require('path');
const fs = require('fs');

exports.copyFileX = async function (src, dest, flags) {
    const dirname = path.dirname(dest);
    if (!fs.existsSync(dirname)) {
        await fs.promises.mkdir(dirname, { recursive: true });
    }
    await fs.promises.copyFile(src, dest, flags);
}