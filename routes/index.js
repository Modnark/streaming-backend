const express = require('express');
const router = express.Router();
const processor = require('../streamprocessor');

router.get('/', async (req, res) => {
    res.json({streams: processor.IStreams.size});
});

module.exports = router;