const fs = require('fs');
const path = require('path');

const outlinePath = path.join(__dirname, '../Outline.txt');
const outputPath = path.join(__dirname, '../assets/script.json');

const rawData = fs.readFileSync(outlinePath, 'utf-8');
const lines = rawData.split('\n').filter(line => line.trim() !== '');

const script = [];
let currentScene = '';
let currentBgm = '';
let currentSprites = {}; // name -> sprite file

// Character mapping for positions
const charPositions = {
    '一森窦': 'left',
    '楚蒙牛': 'right'
};

lines.forEach(line => {
    // Parse line: 01 | scene=... | ...
    const parts = line.split('|').map(p => p.trim());
    const data = {};
    parts.forEach(p => {
        const [key, val] = p.split('=').map(s => s.trim());
        if (key && val) data[key] = val;
    });

    if (!data.text) return; // Skip empty or malformed lines

    // 1. Scene Change
    if (data.scene && data.scene !== currentScene) {
        currentScene = data.scene;
        script.push({
            type: 'bg',
            file: `scene/${data.scene}.png`
        });
    }

    // 2. BGM Change
    if (data.bgm && data.bgm !== currentBgm) {
        currentBgm = data.bgm;
        script.push({
            type: 'music',
            file: `${data.bgm}.mp3`,
            action: 'play'
        });
    }

    // 3. Character Sprite Change
    // If sprite is specified, update it.
    // We need to know who the sprite belongs to. The 'speaker' field tells us.
    if (data.speaker && data.sprite) {
        const charName = data.speaker;
        const spriteFile = `sprite/${data.sprite}.png`;

        // Only push char command if sprite changed or first time
        if (currentSprites[charName] !== spriteFile) {
            currentSprites[charName] = spriteFile;
            script.push({
                type: 'char',
                name: charName,
                file: spriteFile,
                pos: charPositions[charName] || 'center'
            });
        }
    }

    // 4. Dialogue
    if (data.speaker && data.text) {
        script.push({
            type: 'say',
            name: data.speaker,
            text: data.text
        });
    }
});

fs.writeFileSync(outputPath, JSON.stringify(script, null, 2));
console.log(`Converted ${lines.length} lines to ${script.length} commands.`);
