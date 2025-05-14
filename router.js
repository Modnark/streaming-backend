const fs = require('fs').promises;
const path = require('path');

async function setupRoutes(app, dir) {
    try {
        const files = await fs.readdir(dir, { withFileTypes: true });

        await Promise.all(files.map(async (file) => {
            if (file.name === "router.js") return;

            const filePath = path.join(dir, file.name);

            if (file.isDirectory()) {
                await setupRoutes(app, filePath);
            } else if (file.isFile()) {
                const name = path.parse(filePath).name;
                const module = require(filePath);

                if (typeof module === 'function') {
                    console.log(`Found router: ${name}`);
                    app.use(module);
                }
            }
        }));
    } catch (err) {
        console.error(err);
        process.exit(-1);
    }
}

module.exports = async function (app) {
    console.log('Setting up routes...');
    const cDir = path.join(__dirname, 'routes');
    await setupRoutes(app, cDir);
    console.log('Routes setup successfully!');
};