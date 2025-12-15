export class ChoiceMenu {
    constructor() {
        this.container = document.getElementById('choice-menu');
    }

    showChoices(choices, callback) {
        this.container.innerHTML = '';
        this.container.classList.remove('hidden');

        choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.textContent = choice.label;
            btn.classList.add('choice-btn');
            btn.onclick = () => {
                this.hide();
                callback(choice);
            };
            this.container.appendChild(btn);
        });
    }

    hide() {
        this.container.classList.add('hidden');
        this.container.innerHTML = '';
    }
}
