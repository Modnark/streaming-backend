const IStreams = new Map();
const { spawn } = require('child_process');
const config = require('./config.json');
const fs = require('fs/promises');
const path = require('path');

function createNewStream(streamKey) {
    const ffmpeg = spawn('ffmpeg', [
        '-i', `rtmp://localhost/golive/${streamKey}`,
        '-c:v', 'libx264', '-preset', 'ultrafast', '-g', '30', '-sc_threshold', '0',
        '-c:a', 'aac', '-ar', '44100', '-b:a', '128k',
        '-f', 'hls',
        '-hls_time', '1', // time in seconds of each segment
        '-hls_list_size', '10', // max size of segments, older get removed
        '-hls_flags', 'delete_segments+append_list+independent_segments+split_by_time',
        '-hls_segment_type', 'fmp4',
        '-hls_fmp4_init_filename', `${config.server.streamStorage}/${streamKey}_init.mp4`,
        '-hls_segment_filename', `${config.server.streamStorage}/${streamKey}_dat_%d.m4s`,
        `${config.server.streamStorage}/${streamKey}_dat.m3u8`        
    ]);

    
    ffmpeg.stdout.setEncoding('utf8');
    ffmpeg.stdout.on('data', (data) => {
        console.log('STDOUT');
        console.log(data);
    });

    ffmpeg.stderr.setEncoding('utf8');
    ffmpeg.stderr.on('data', (data) => {
        console.log('STDERR');
        console.log(data);
    });

    IStreams.set(streamKey, ffmpeg);
    console.log(`Stream active for ${streamKey}`);
}

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

async function stopStream(streamKey) {
    const ffmpeg = IStreams.get(streamKey);

    if (ffmpeg) {
        ffmpeg.kill('SIGINT');
        IStreams.delete(streamKey);
        console.log(`[0] Stopped stream ${streamKey}`);
    } else {
        console.log(`[!] No active ffmpeg process for ${streamKey}`);
    }

    // Await cleanup
    await deleteStreamFiles(config.server.streamStorage, streamKey);
}

module.exports = {
    IStreams,
    createNewStream,
    stopStream
}