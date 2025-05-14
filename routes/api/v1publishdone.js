const express = require('express');
const router = express.Router();
const apiConfig = require('../../config.json').api;
const processor = require('../../streamprocessor');
const { quickError } = require('../../helpers');
const database = require('../../database');
const db = database.db;

router.get(`${apiConfig.paths.V1}/publish-done`, async (req, res) => {
    const streamKey = req.query.name;
    
    try {
        const userRes = await db.transaction(async(t) => {
            const user = await database.models.User.findOne({
                where: {
                    streamKey: streamKey
                },
                transaction: t
            });

            return user;
        });

        if(userRes) {
            await processor.stopStream(streamKey);
            return res.status(200).end();
        }

        return res.status(400).json({error: {details: [{message: 'Invalid stream key.'}]}});
    } catch(error) {
        next(error);
    }

    res.status(200).end();
});

router.all(`${apiConfig.paths.V1}/publish-done`, async (req, res, next) => {
    return next(quickError('Method Not Allowed', 405));
});

module.exports = router;