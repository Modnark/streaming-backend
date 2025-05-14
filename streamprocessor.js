const IStreams = new Map();
const { spawn } = require('child_process');
const config = require('./config.json');

function createNewStream(streamKey) {
    const ffmpeg = spawn('ffmpeg', [
        '-i', `rtmp://localhost/golive/${streamKey}`,
        '-c:v', 'libx264', '-preset', 'veryfast', '-g', '30', '-sc_threshold', '0',
        '-c:a', 'aac', '-ar', '44100', '-b:a', '128k',
        '-f', 'hls',
        '-hls_time', '1', // time in seconds of each segment
        '-hls_list_size', '4', // max size of segments, older get removed
        '-hls_flags', 'delete_segments+append_list+independent_segments+split_by_time',
        '-hls_segment_type', 'fmp4',
        '-hls_fmp4_init_filename', 'init.mp4',
        '-hls_segment_filename', `${config.server.streamStorage}/${streamKey}/dat_%d.m4s`,
        `${config.server.streamStorage}/${streamKey}/dat.m3u8`        
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

function stopStream(streamKey) {
    const ffmpeg = IStreams.get(streamKey);

    if(ffmpeg) {
        ffmpeg.kill('SIGINT');
        IStreams.delete(streamKey);
        console.log(`Stopped stream ${streamKey}`);
    }
}

module.exports = {
    IStreams,
    createNewStream,
    stopStream
}