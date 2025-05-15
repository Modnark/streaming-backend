const express = require('express');
const router = express.Router();
const apiConfig = require('../../config.json').api;
const processor = require('../../streamprocessor');
const { quickError } = require('../../helpers');
const database = require('../../database');
const db = database.db;

router.get(`${apiConfig.paths.V1}/publish`, async (req, res, next) => {
    const streamKey = req.query.name;

    try {
        // Try to find a user by the stream key sent to the server
        const userRes = await db.transaction(async(t) => {
            const user = await database.models.User.findOne({
                where: {
                    streamKey: streamKey
                },
                transaction: t
            });

            return user;
        });

        // We found a user with this stream key, we can start a stream now
        if(userRes) {
            processor.createNewStream(userRes.publicStreamKey, streamKey);
            return res.status(200).end();
        }
        
        return res.status(400).json({error: {details: [{message: 'Invalid stream key.'}]}});
    } catch(error) {
        next(error);
    }

    res.status(200).end();
});

router.all(`${apiConfig.paths.V1}/publish`, async (req, res, next) => {
    return next(quickError('Method Not Allowed', 405));
});

module.exports = router;