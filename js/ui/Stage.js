window.Galgame = window.Galgame || {};

class Stage {
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

        charImg.className = 'character';
        charImg.classList.add(position);
    }

    hideCharacter(name) {
        const charImg = this.characters.get(name);
        if (charImg) {
            charImg.remove();
            this.characters.delete(name);
        }
    }

    highlightCharacter(name) {
        this.characters.forEach((img, charName) => {
            if (charName === name) {
                img.classList.add('active');
            } else {
                img.classList.remove('active');
            }
        });
    }

    clear() {
        this.backgroundLayer.style.backgroundImage = '';
        this.characterLayer.innerHTML = '';
        this.characters.clear();
    }
}

window.Galgame.Stage = Stage;
