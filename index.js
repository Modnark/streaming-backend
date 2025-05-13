const express = require('express');
const { spawn } = require('child_process');
const app = express();

const appPort = 3000;
const IStreams = new Map();

// TODO: move to config
const V1Api = '/api/v1';

// TODO: move all routes to their own files

app.get(`${V1Api}/publish`, (req, res) => {
    //console.log('hello');
    const streamKey = req.query.name;
    console.log(streamKey);
    res.status(200).end();
});

app.get(`${V1Api}/publish-done`, (req, res) => {

});

app.listen(appPort, () => console.log('Backend is running on port 3000'));
