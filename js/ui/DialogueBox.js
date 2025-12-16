window.Galgame = window.Galgame || {};

class DialogueBox {
    constructor() {
        this.container = document.getElementById('dialogue-box');
        this.nameTag = document.getElementById('name-tag');
        this.textContent = document.getElementById('text-content');
        this.nextIndicator = document.getElementById('next-indicator');
        this.typingInterval = null;
    }

    show(name, text, onComplete) {
        this.container.classList.remove('hidden');
        this.nameTag.textContent = name || '';
        this.textContent.textContent = '';
        this.nextIndicator.style.display = 'none';

        if (this.typingInterval) clearInterval(this.typingInterval);

        let index = 0;
        this.typingInterval = setInterval(() => {
            this.textContent.textContent += text[index];
            index++;
            if (index >= text.length) {
                clearInterval(this.typingInterval);
                this.typingInterval = null;
                this.nextIndicator.style.display = 'block';
                if (onComplete) onComplete();
            }
        }, 30);
    }

    finishTyping(text) {
        if (this.typingInterval) {
            clearInterval(this.typingInterval);
            this.typingInterval = null;
            this.textContent.textContent = text;
            this.nextIndicator.style.display = 'block';
            return true;
        }
        return false;
    }

    hide() {
        this.container.classList.add('hidden');
    }

    isVisible() {
        return !this.container.classList.contains('hidden');
    }
}

window.Galgame.DialogueBox = DialogueBox;
