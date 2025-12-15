export class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.bgmSource = null;
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.connect(this.ctx.destination);
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.connect(this.ctx.destination);
    }

    async decodeAudio(arrayBuffer) {
        return await this.ctx.decodeAudioData(arrayBuffer);
    }

    playBGM(audioBuffer, loop = true) {
        if (this.bgmSource) {
            this.bgmSource.stop();
        }
        this.bgmSource = this.ctx.createBufferSource();
        this.bgmSource.buffer = audioBuffer;
        this.bgmSource.loop = loop;
        this.bgmSource.connect(this.bgmGain);
        this.bgmSource.start(0);
    }

    stopBGM() {
        if (this.bgmSource) {
            this.bgmSource.stop();
            this.bgmSource = null;
        }
    }

    playSFX(audioBuffer) {
        const source = this.ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.sfxGain);
        source.start(0);
    }
}
