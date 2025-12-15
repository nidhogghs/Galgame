export class Stage {
    constructor() {
        this.backgroundLayer = document.getElementById('background-layer');
        this.characterLayer = document.getElementById('character-layer');
        this.foregroundLayer = document.getElementById('foreground-layer');
        this.characters = new Map();
    }

    setBackground(image) {
        if (typeof image === 'string') {
            this.backgroundLayer.style.backgroundImage = `url('${image}')`;
        } else {
            this.backgroundLayer.style.backgroundImage = `url('${image.src}')`;
        }
    }

    showCharacter(name, image, position = 'center') {
        let charImg = this.characters.get(name);
        if (!charImg) {
            charImg = document.createElement('img');
            charImg.classList.add('character');
            this.characterLayer.appendChild(charImg);
            this.characters.set(name, charImg);
        }

        charImg.src = image.src || image;

        // Reset classes
        charImg.className = 'character';
        charImg.classList.add(position);

        // Force reflow to restart transition if needed (optional)
        // void charImg.offsetWidth; 
    }

    hideCharacter(name) {
        const charImg = this.characters.get(name);
        if (charImg) {
            charImg.remove();
            this.characters.delete(name);
        }
    }

    clear() {
        this.backgroundLayer.style.backgroundImage = '';
        this.characterLayer.innerHTML = '';
        this.characters.clear();
    }
}
