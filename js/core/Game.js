import { ResourceManager } from './ResourceManager.js';
import { AudioManager } from './AudioManager.js';
import { ScriptParser } from './ScriptParser.js';
import { GameState } from './GameState.js';
import { Stage } from '../ui/Stage.js';
import { DialogueBox } from '../ui/DialogueBox.js';
import { ChoiceMenu } from '../ui/ChoiceMenu.js';

export class Game {
    constructor() {
        this.resourceManager = new ResourceManager();
        this.audioManager = new AudioManager();
        this.scriptParser = new ScriptParser();
        this.gameState = new GameState();

        this.stage = new Stage();
        this.dialogueBox = new DialogueBox();
        this.choiceMenu = new ChoiceMenu();

        this.isWaiting = false;

        this.init();
    }

    async init() {
        console.log("Initializing Game...");

        // Setup input
        document.addEventListener('click', () => this.handleInput());
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Enter') this.handleInput();
        });

        // Load initial script (demo)
        try {
            const response = await fetch('assets/script.json');
            const script = await response.json();
            this.scriptParser.loadScript(script);
            this.start();
        } catch (e) {
            console.error("Failed to load script:", e);
            // Fallback for demo if file missing
            this.scriptParser.loadScript([
                { type: "say", name: "System", text: "Welcome to the Galgame Framework." },
                { type: "say", name: "System", text: "No script.json found in assets/." }
            ]);
            this.start();
        }
    }

    start() {
        console.log("Game started");
        this.nextStep();
    }

    handleInput() {
        if (this.choiceMenu.container.classList.contains('hidden') === false) return; // Ignore clicks when choice menu is open

        if (this.dialogueBox.isVisible()) {
            // If typing, finish it
            if (this.dialogueBox.finishTyping(this.currentText)) {
                return;
            }
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

        switch (command.type) {
            case 'bg':
                // await this.resourceManager.loadImage(command.file, `assets/${command.file}`);
                // this.stage.setBackground(this.resourceManager.getImage(command.file));
                // For demo without assets, just use color or text if file fails, but let's try to load
                try {
                    const img = await this.resourceManager.loadImage(command.file, `assets/${command.file}`);
                    this.stage.setBackground(img);
                } catch (e) {
                    console.warn("BG not found, using placeholder");
                    this.stage.backgroundLayer.style.backgroundColor = '#333';
                }
                this.isWaiting = false;
                this.nextStep(); // Auto proceed after BG change usually? Or wait? Usually auto.
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
                this.dialogueBox.show(command.name, command.text, () => {
                    // Typing finished callback
                });
                // We stay waiting until user input
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
                // Implement music logic
                this.isWaiting = false;
                this.nextStep();
                break;

            case 'label':
                // Just a marker, skip
                this.isWaiting = false;
                this.nextStep();
                break;

            default:
                console.warn("Unknown command:", command.type);
                this.isWaiting = false;
                this.nextStep();
                break;
        }
    }
}

// Auto-start
window.game = new Game();
