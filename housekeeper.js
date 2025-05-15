const fs = require('fs/promises');
const path = require('path');
const config = require('./config.json');

// Ticks every minute, deletes stale m3u8 or m4s files
async function houseKeeper() {
    const filePath = config.server.streamStorage;
    try {
        const files = await fs.readdir(filePath); // get all files in the storage folder

        for(const file of files) {
            const mTime = (await fs.stat(path.join(filePath, file))).mtimeMs; // get modified time of each file
            const delta = Date.now() - mTime;
            if(delta >= 60000) { // Check if files are older than 1 minute
                const ext = path.extname(file);
                if(ext === '.m3u8' || ext === '.m4s' || ext === '.mp4') {
                    console.log(`Removing stale file ${file} with delta of ${delta}`);
                    await fs.unlink(path.join(filePath, file)); // Delete stale files
                }
            }
        }
    } catch(error) {
        console.log(error); // TODO: handle these in a better way
    }
}

module.exports = {
    houseKeeper
}