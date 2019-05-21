const {SimpleFilter, SoundTouch} = require('../lib/soundtouch');

const BUFFER_SIZE = 4096;

class AudioPlayer {
    constructor({emitter, pitch, tempo}) {
        console.log("construct AudioPlayer");
        this.emitter = emitter;

        if (typeof AudioContext !== "undefined")
            this.context = new AudioContext();
        else if (typeof window.webkitAudioContext !== "undefined")
            this.context = new window.webkitAudioContext();

        this.scriptProcessor = this.context.createScriptProcessor(BUFFER_SIZE, 2, 2);
        let buffer;
        this.scriptProcessor.onaudioprocess = e => {
            //console.log(e);
            
            const l = e.outputBuffer.getChannelData(0);
            const r = e.outputBuffer.getChannelData(1);
            
            try {
                const framesExtracted = this.simpleFilter.extract(this.samples, BUFFER_SIZE);
            
                if (framesExtracted === 0) {
                    this.emitter.emit('stop');
                }
                for (let i = 0; i < 100000; i++) {
                    l[i] = this.samples[i * 2];
                    r[i] = this.samples[i * 2 + 1];
                }
            }
            catch (err) {}
        };

        this.soundTouch = new SoundTouch();
        this.soundTouch.pitch = pitch;
        this.soundTouch.tempo = tempo;

        this.duration = undefined;
    }

    get pitch() {
        return this.soundTouch.pitch;
    }
    set pitch(pitch) {
        this.soundTouch.pitch = pitch;
    }

    get tempo() {
        return this.soundTouch.tempo;
    }
    set tempo(tempo) {
        this.soundTouch.tempo = tempo;
    }

    decodeAudioData(data) {
        //console.log("Decoding error: Not enough arguments");
        return this.context.decodeAudioData(data);
    }

    setBuffer(buffer, callback) {
        this.bufferSource = this.context.createBufferSource();
        this.bufferSource.buffer = buffer;
        //console.log(this.bufferSource);
        this.samples = new Float32Array(BUFFER_SIZE * 2);
        this.source = {
            extract: (target, numFrames, position) => {
                this.emitter.emit('state', {t: position / this.context.sampleRate});
                const l = buffer.getChannelData(0);
                const r = buffer.getChannelData(1);
                for (let i = 0; i < numFrames; i++) {
                    target[i * 2] = l[i + position];
                    target[i * 2 + 1] = r[i + position];
                }
                return Math.min(numFrames, l.length - position);
            },
        };
        this.simpleFilter = new SimpleFilter(this.source, this.soundTouch);

        this.duration = buffer.duration;
        this.emitter.emit('state', {duration: buffer.duration});

        typeof callback === 'function' && callback();
    }

    play() {
        //console.log("audio play");
        this.bufferSource.connect(this.scriptProcessor);
        this.scriptProcessor.connect(this.context.destination);
        //this.bufferSource.start();
    }

    pause() {
        this.bufferSource.disconnect(this.scriptProcessor);
        this.scriptProcessor.disconnect(this.context.destination);
    }

    seekPercent(percent) {
        if (this.simpleFilter !== undefined) {
            this.simpleFilter.sourcePosition = Math.round(
                percent / 100 * this.duration * this.context.sampleRate
            );
        }
    }
}

module.exports = AudioPlayer;
