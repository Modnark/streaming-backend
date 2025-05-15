const fs = require('fs/promises');
const path = require('path');
const config = require('./config.json');

// Ticks every minute, deletes stale m3u8 or m4s files
async function houseKeeper() {
    const filePath = config.server.streamStorage;
    try {
        const files = await fs.readdir(filePath);

        for(const file of files) {
            const mTime = (await fs.stat(path.join(filePath, file))).mtimeMs;
            const delta = Date.now() - mTime;
            if(delta >= 60000) {
                const ext = path.extname(file);
                if(ext === '.m3u8' || ext === '.m4s' || ext === '.mp4') {
                    console.log(`Removing stale file ${file} with delta of ${delta}`);
                    await fs.unlink(path.join(filePath, file));
                }
            }
        }
    } catch(error) {
        console.log(error);
    }
}

module.exports = {
    houseKeeper
}