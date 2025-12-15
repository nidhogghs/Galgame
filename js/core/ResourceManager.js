export class ResourceManager {
    constructor() {
        this.images = new Map();
        this.audio = new Map();
    }

    async loadImage(key, url) {
        if (this.images.has(key)) return this.images.get(key);

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images.set(key, img);
                resolve(img);
            };
            img.onerror = (e) => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        });
    }

    async loadAudio(key, url) {
        if (this.audio.has(key)) return this.audio.get(key);

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            // We'll decode this in AudioManager, just store buffer here or decode if we have context
            // For simplicity, let's return the buffer.
            this.audio.set(key, arrayBuffer);
            return arrayBuffer;
        } catch (e) {
            throw new Error(`Failed to load audio: ${url}`);
        }
    }

    getImage(key) {
        return this.images.get(key);
    }

    getAudio(key) {
        return this.audio.get(key);
    }
}
