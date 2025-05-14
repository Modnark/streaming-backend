const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    res.json({processes: 1});
});

module.exports = router;