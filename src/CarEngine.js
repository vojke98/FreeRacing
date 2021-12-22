export class CarEngine {
    constructor() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        this.gainNode = this.audioCtx.createGain();
        this.gainNode.connect(this.audioCtx.destination);
        this.gainNode.gain.value = .1;

        this.source = null;

        this.pitch = { step: 0, min: 1, max: 3 };
    }

    getSound() {
        const request = new XMLHttpRequest();
        request.open('GET', "./res/audio/engine/engine.wav", true);
        request.responseType = "arraybuffer";

        request.onload = () => {
            const audioData = request.response;

            this.audioCtx.decodeAudioData(audioData, (buffer) => {
                const audioBuffer = buffer;
                this.source = this.audioCtx.createBufferSource();
                this.source.loop = true;
                this.source.buffer = audioBuffer;
                //this.source.connect(this.audioCtx.destination);
                this.source.connect(this.gainNode);
                this.source.start();
            }, function (e) {
                "Error with decoding audio data" + e.err
            });
        }

        request.send();
    }

    start() {
        this.getSound();

        this.interval = setInterval(() => {
            if (this.source) {
                let currPitch = this.source.playbackRate.value;
                if ((this.pitch.step < 0 && currPitch > this.pitch.min) ||
                    (this.pitch.step > 0 && currPitch < this.pitch.max)) {
                    this.source.playbackRate.value += this.pitch.step;
                }
            }
        }, 50);
    }

    stop() {
        this.source.stop();
        this.source = null;
        clearInterval(this.interval);
    }

    createPitchStep(n) {
        this.pitch.step = n;
    }
}