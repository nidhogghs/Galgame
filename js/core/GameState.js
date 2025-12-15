export class GameState {
    constructor() {
        this.flags = {};
        this.variables = {};
    }

    setFlag(key, value) {
        this.flags[key] = value;
    }

    getFlag(key) {
        return this.flags[key];
    }

    setVar(key, value) {
        this.variables[key] = value;
    }

    getVar(key) {
        return this.variables[key];
    }

    serialize() {
        return JSON.stringify({
            flags: this.flags,
            variables: this.variables
        });
    }

    deserialize(json) {
        const data = JSON.parse(json);
        this.flags = data.flags || {};
        this.variables = data.variables || {};
    }
}
