const express = require('express');
const router = express.Router();
const apiConfig = require('../../config.json').api;
const processor = require('../../streamprocessor');
const { quickError, randomString } = require('../../helpers');
const database = require('../../database');
const db = database.db;

// Called by RTMP server when it stops recieving stream data.
// Resets the users stream key to allow garbage collector to delete old stream files
// (cont.) currently watching clients will be unable to view the stream
router.get(`${apiConfig.paths.V1}/publish-done`, async (req, res) => {
    const streamKey = req.query.name;
    const newPublicStreamKey = randomString();
    let previousStreamKey = undefined;

    try {
        const userRes = await db.transaction(async(t) => {
            const user = await database.models.User.findOne({
                where: {
                    streamKey: streamKey
                },
                transaction: t
            });

            if(user)
                previousStreamKey = user.publicStreamKey;

            if(user) {
                user.set({
                    publicStreamKey: newPublicStreamKey
                });

                user.save();
            }

            return user;
        });

        if(userRes && previousStreamKey) {
            const streamName = previousStreamKey;
            await processor.stopStream(streamName);
            
            return res.status(200).end();
        }

        return res.status(400).json({error: {details: [{message: 'Invalid stream key.'}]}});
    } catch(error) {
        next(error);
    }

    res.status(200).end();
});

// Prevent unnecessary methods from being used
router.all(`${apiConfig.paths.V1}/publish-done`, async (req, res, next) => {
    return next(quickError('Method Not Allowed', 405));
});

module.exports = router;