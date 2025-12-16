window.Galgame = window.Galgame || {};

class AudioManager {
    constructor() {
        this.AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = null;
        this.bgmSource = null;
        this.bgmGain = null;
        this.sfxGain = null;
    }

    ensureContext() {
        if (this.ctx) return true;

        if (!this.AudioContextClass) {
            console.warn("AudioContext is not supported in this environment.");
            return false;
        }

        try {
            this.ctx = new this.AudioContextClass();
            this.bgmGain = this.ctx.createGain();
            this.bgmGain.connect(this.ctx.destination);
            this.sfxGain = this.ctx.createGain();
            this.sfxGain.connect(this.ctx.destination);
            return true;
        } catch (err) {
            console.warn("AudioManager: Failed to create AudioContext.", err);
            this.ctx = null;
            return false;
        }
    }

    async resume() {
        if (!this.ensureContext()) return;
        if (this.ctx.state === 'suspended') {
            try {
                await this.ctx.resume();
            } catch (err) {
                console.warn("AudioContext resume failed:", err);
            }
        }
    }

    async decodeAudio(arrayBuffer) {
        if (!this.ensureContext()) return null;
        return await this.ctx.decodeAudioData(arrayBuffer);
    }

    playBGM(audioBuffer, loop = true) {
        if (!this.ensureContext()) {
            console.warn("AudioManager: Cannot play BGM without an AudioContext.");
            return;
        }

        if (!audioBuffer) {
            console.warn("AudioManager: No audio buffer provided for BGM");
            return;
        }

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
        if (!this.ensureContext() || !audioBuffer) {
            if (!audioBuffer) {
                console.warn("AudioManager: No audio buffer provided for SFX");
            }
            return;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.sfxGain);
        source.start(0);
    }
}

window.Galgame.AudioManager = AudioManager;
