const IStreams = new Map();
const { spawn } = require('child_process');
const config = require('./config.json');
const fs = require('fs/promises');
const path = require('path');

async function deleteStreamFiles(filePath, streamKey) {
    try {
        const files = await fs.readdir(filePath);
        const streamFiles = files.filter(file => file.startsWith(streamKey));

        for(const file of streamFiles) {
            await fs.unlink(path.join(filePath, file));
        }
    } catch(error) {
        console.log(error);
    }
}

async function onProcessorExit(streamKey) {
    console.log('FFMPEG died! Cleaning up...');
    
    try {
        IStreams.delete(streamKey);
        console.log('Removed old entries...');
    } catch(error) {}

    // Try to remove files (will be removed later anyways~)
    await deleteStreamFiles(config.server.streamStorage, streamKey);
}

function createNewStream(streamName, streamKey) {
    const ffmpeg = spawn('ffmpeg', [
        '-i', `rtmp://localhost/golive/${streamKey}`,
        '-c:v', 'libx264', '-preset', 'veryfast', '-g', '30', '-sc_threshold', '0',
        '-c:a', 'aac', '-ar', '44100', '-b:a', '128k',
        '-f', 'hls',
        '-hls_time', '1', // time in seconds of each segment
        '-hls_list_size', '2', // max size of segments, older get removed
        '-hls_flags', 'delete_segments+append_list+split_by_time+program_date_time',
        '-hls_segment_type', 'fmp4',
        '-hls_fmp4_init_filename', `${streamName}_init.mp4`,
        '-hls_segment_filename', `${config.server.streamStorage}/${streamName}_dat_%d.m4s`,
        `${config.server.streamStorage}/${streamName}_dat.m3u8`       
    ]);

    // Stupid hack
    ffmpeg.stderr.on('data', (d) => {});

    // Catch any unexpected closure
    ffmpeg.on('exit', async (code, signal) => {
        await onProcessorExit(streamName);
    });
    ffmpeg.on('close', async (code, signal) => {
        await onProcessorExit(streamName);
    });

    IStreams.set(streamName, ffmpeg);
    console.log(`Stream active for ${streamKey}`);
}

async function stopStream(streamKey) {
    const ffmpeg = IStreams.get(streamKey);

    if (ffmpeg) {
        ffmpeg.kill('SIGINT');
        console.log(`[0] Stopped stream ${streamKey}`);
    } else {
        console.log(`[!] No active ffmpeg process for ${streamKey}`);
    }

    try {
        IStreams.delete(streamKey);
        console.log('Removed old entries...');
    } catch(error) {}

    // Await cleanup
    await deleteStreamFiles(config.server.streamStorage, streamKey);
}

module.exports = {
    IStreams,
    createNewStream,
    stopStream
}