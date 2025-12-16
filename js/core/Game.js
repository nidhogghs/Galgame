window.Galgame = window.Galgame || {};

(() => {
    const {
        ResourceManager,
        AudioManager,
        ScriptParser,
        GameState,
        Stage,
        DialogueBox,
        ChoiceMenu
    } = window.Galgame;

    class Game {
        constructor() {
            this.resourceManager = new ResourceManager();
            this.audioManager = new AudioManager();
            this.scriptParser = new ScriptParser();
            this.gameState = new GameState();

            this.stage = new Stage();
            this.dialogueBox = new DialogueBox();
            this.choiceMenu = new ChoiceMenu();

            this.isWaiting = false;
            this.startBtn = null;
            this.mainMenu = null;
            this.scriptLoaded = false;

            this.init().catch(err => console.error("Game initialization failed:", err));
        }

        async init() {
            console.log("Initializing Game...");

            document.addEventListener('click', () => this.handleInput());
            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space' || e.code === 'Enter') this.handleInput();
            });

            this.startBtn = document.getElementById('start-btn');
            this.mainMenu = document.getElementById('main-menu');

            if (this.startBtn) {
                this.startBtn.addEventListener('click', (e) => {
                    this.handleStartClick(e).catch(err => console.error('Start handler error:', err));
                });
                this.setStartButtonState({ text: 'Loading script...', disabled: true });
            } else {
                console.error("Start button not found!");
            }

            await this.loadScriptData();
        }

        async handleStartClick(e) {
            if (!this.startBtn) return;

            e.stopPropagation();

            if (!this.scriptLoaded) {
                const warning = "Game assets are still loading. Please wait a moment.";
                console.warn(warning);
                alert(warning);
                return;
            }

            if (!this.mainMenu) {
                console.error("Main menu element is missing.");
                return;
            }

            this.setStartButtonState({ text: 'Starting...', disabled: true });
            this.mainMenu.classList.add('hidden');

            try {
                await this.audioManager.resume();
            } catch (e) {
                console.warn("Audio resume failed:", e);
            }

            this.start();
        }

        async loadScriptData() {
            const fallbackScript = [
                { type: "say", name: "System", text: "Welcome to the Galgame Framework." },
                { type: "say", name: "System", text: "No script.json found in assets/." }
            ];

            let loadedScript = fallbackScript;

            // Prefer inline scriptData (works on file://)
            if (Array.isArray(window.GAL_SCRIPT) && window.GAL_SCRIPT.length) {
                loadedScript = window.GAL_SCRIPT;
                console.log("Loaded script from window.GAL_SCRIPT:", loadedScript.length, "commands");
            } else {
                try {
                    console.log("Fetching script...");
                    const response = await fetch('assets/script.json');
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const script = await response.json();
                    console.log("Script loaded:", script.length, "commands");
                    loadedScript = script;
                } catch (e) {
                    console.error("Failed to load script via fetch:", e);
                    console.warn("Falling back to embedded demo script.");
                }
            }

            this.scriptParser.loadScript(loadedScript);
            this.validateScript(loadedScript);
            this.scriptLoaded = true;
            this.setStartButtonState({ text: 'Start Game', disabled: false });
        }

        validateScript(scriptData) {
            if (!Array.isArray(scriptData)) {
                console.warn("Script is not an array, unable to validate.", scriptData);
                return;
            }

            const issues = [];
            let hasDialogue = false;

            scriptData.forEach((command, index) => {
                if (!command || typeof command !== 'object') {
                    issues.push(`Command #${index + 1} is malformed.`);
                    return;
                }

                const type = command.type;

                if (type === 'say') {
                    hasDialogue = true;
                    if (!command.text) {
                        issues.push(`Say command #${index + 1} is missing text.`);
                    }
                }

                if (type === 'bg' || type === 'char' || type === 'music') {
                    if (!command.file) {
                        issues.push(`${type.toUpperCase()} command #${index + 1} is missing a file path.`);
                    }
                }

                if (type === 'choice') {
                    if (!Array.isArray(command.options) || command.options.length === 0) {
                        issues.push(`Choice command #${index + 1} has no options.`);
                    }
                }
            });

            if (!hasDialogue) {
                issues.push("Script does not contain any dialogue commands.");
            }

            if (issues.length) {
                console.warn("Script validation warnings:", issues.slice(0, 5));
            }
        }

        start() {
            console.log("Game started");
            this.nextStep();
        }

        handleInput() {
            if (this.mainMenu && !this.mainMenu.classList.contains('hidden')) return;
            if (this.choiceMenu.container && !this.choiceMenu.container.classList.contains('hidden')) return;

            if (this.dialogueBox.isVisible()) {
                if (this.dialogueBox.finishTyping(this.currentText)) {
                    return;
                }
                this.dialogueBox.hide();
                this.isWaiting = false;
                this.nextStep();
                return;
            }

            if (!this.isWaiting) {
                this.nextStep();
            }
        }

        async nextStep() {
            const command = this.scriptParser.next();
            if (!command) {
                console.log("End of script");
                return;
            }

            console.log("Processing command:", command);
            this.isWaiting = true;

            try {
                switch (command.type) {
                    case 'bg':
                        try {
                            const img = await this.resourceManager.loadImage(command.file, `assets/${command.file}`);
                            this.stage.setBackground(img);
                        } catch (e) {
                            console.warn("BG not found, using placeholder");
                            this.stage.backgroundLayer.style.backgroundColor = '#333';
                        }
                        this.isWaiting = false;
                        this.nextStep();
                        break;

                    case 'char':
                        try {
                            const img = await this.resourceManager.loadImage(command.file, `assets/${command.file}`);
                            this.stage.showCharacter(command.name, img, command.pos);
                        } catch (e) {
                            console.warn("Char not found");
                        }
                        this.isWaiting = false;
                        this.nextStep();
                        break;

                    case 'say':
                        this.currentText = command.text;
                        if (command.name) {
                            this.stage.highlightCharacter(command.name);
                        }
                        this.dialogueBox.show(command.name, command.text, () => {
                        });
                        break;

                    case 'choice':
                        this.choiceMenu.showChoices(command.options, (selectedOption) => {
                            if (selectedOption.jump) {
                                this.scriptParser.jumpTo(selectedOption.jump);
                            }
                            this.isWaiting = false;
                            this.nextStep();
                        });
                        break;

                    case 'music':
                        if (command.action === 'play') {
                            try {
                                await this.audioManager.resume();
                                const audio = await this.resourceManager.loadAudio(command.file, `assets/${command.file}`)
                                    .catch(e => {
                                        console.warn(`Audio file missing: ${command.file}`);
                                        return null;
                                    });

                                if (audio) {
                                    const decoded = await this.audioManager.decodeAudio(audio);
                                    if (decoded) {
                                        this.audioManager.playBGM(decoded, true);
                                    } else {
                                        console.warn(`AudioManager has no context to decode ${command.file}`);
                                    }
                                }
                            } catch (e) {
                                console.warn("Failed to play music:", e);
                            }
                        } else if (command.action === 'stop') {
                            this.audioManager.stopBGM();
                        }
                        this.isWaiting = false;
                        this.nextStep();
                        break;

                    case 'label':
                        this.isWaiting = false;
                        this.nextStep();
                        break;

                    default:
                        console.warn("Unknown command:", command.type);
                        this.isWaiting = false;
                        this.nextStep();
                        break;
                }
            } catch (err) {
                console.error("Error executing command:", err);
                this.isWaiting = false;
            }
        }

        setStartButtonState({ text, disabled }) {
            if (!this.startBtn) return;
            if (text !== undefined) {
                this.startBtn.textContent = text;
            }
            if (disabled !== undefined) {
                this.startBtn.disabled = disabled;
            }
        }
    }

    window.Galgame.Game = Game;

    window.addEventListener('load', () => {
        console.log("Window loaded, initializing game...");
        if (!window.game) {
            window.game = new Game();
        }
    });
})();
