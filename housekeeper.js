const fs = require('fs/promises');
const path = require('path');
const config = require('./config.json');
const staleThreshold = config.server.houseKeeperStaleThreshold * 1000;

// Ticks every minute, deletes stale m3u8 or m4s files
async function houseKeeper() {
    const filePath = config.server.streamStorage;
    try {
        const files = await fs.readdir(filePath); // get all files in the storage folder
        const filteredFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.m3u8', '.m4s'].includes(ext);
        });

        for(const file of filteredFiles) {
             // get modified time of each file
            const stats = await fs.stat(path.join(filePath, file));
            const fTime = stats.mtimeMs;
            const delta = Date.now() - fTime;

            if(delta >= staleThreshold) // Check if files are older than 1 minute
                await fs.unlink(path.join(filePath, file)); // Delete stale files
        }
    } catch(error) {
        console.log(`[!][HK] ${error}`); // TODO: handle these in a better way
    }
}

module.exports = {
    houseKeeper
}