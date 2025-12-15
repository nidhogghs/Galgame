export class ScriptParser {
    constructor() {
        this.script = [];
        this.currentIndex = 0;
    }

    loadScript(scriptData) {
        this.script = scriptData;
        this.currentIndex = 0;
    }

    next() {
        if (this.currentIndex >= this.script.length) return null;
        return this.script[this.currentIndex++];
    }

    jumpTo(label) {
        const index = this.script.findIndex(cmd => cmd.label === label);
        if (index !== -1) {
            this.currentIndex = index;
            return true;
        }
        return false;
    }

    getCurrentIndex() {
        return this.currentIndex;
    }

    setIndex(index) {
        this.currentIndex = index;
    }
}
