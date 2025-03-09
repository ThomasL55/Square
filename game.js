class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 3; // Fixed 3x3 grid
        this.tileSize = this.canvas.width / this.gridSize;
        this.pattern = [];
        this.playerPattern = [];
        this.score = 0;
        this.isPlaying = false;
        this.currentTile = { x: 0, y: 0 };
        this.colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00']; // Red, Green, Blue, Yellow
        this.setupEventListeners();
        this.draw();
    }

    setupEventListeners() {
        if (document.body.dataset.useKeyboard === 'true') {
            document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        }
        // Mouse events
        this.canvas.addEventListener('click', (e) => this.handlePointer(e));
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling
            this.handlePointer(e.touches[0]);
        });
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('resetGame').addEventListener('click', () => this.resetGame());
    }

    handlePointer(e) {
        if (!this.isPlaying) return;

        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = Math.floor(((e.clientX - rect.left) * scaleX) / this.tileSize);
        const y = Math.floor(((e.clientY - rect.top) * scaleY) / this.tileSize);

        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
            this.selectTile(x, y);
        }
    }

    handleKeyboard(e) {
        if (!this.isPlaying) return;

        switch (e.key) {
            case 'ArrowUp':
                this.currentTile.y = Math.max(0, this.currentTile.y - 1);
                break;
            case 'ArrowDown':
                this.currentTile.y = Math.min(this.gridSize - 1, this.currentTile.y + 1);
                break;
            case 'ArrowLeft':
                this.currentTile.x = Math.max(0, this.currentTile.x - 1);
                break;
            case 'ArrowRight':
                this.currentTile.x = Math.min(this.gridSize - 1, this.currentTile.x + 1);
                break;
            case ' ':
                e.preventDefault();
                this.selectTile(this.currentTile.x, this.currentTile.y);
                break;
            case 'Escape':
                this.resetGame();
                break;
        }
        this.draw();
    }

    selectTile(x, y) {
        const index = y * this.gridSize + x;
        if (document.body.dataset.soundEnabled === 'true') {
            gameAudio.playTile(index);
        }
        this.playerPattern.push(index);
        // Flash the tile with same color as pattern
        this.highlightTile(index, true);
        setTimeout(() => {
            this.draw();
            this.checkPattern();
        }, 200);
    }

    async showPattern() {
        const delay = 800; // Fixed delay for consistent gameplay
        for (let i = 0; i < this.pattern.length; i++) {
            await new Promise(resolve => setTimeout(resolve, delay / 2));
            const index = this.pattern[i];
            if (document.body.dataset.soundEnabled === 'true') {
                gameAudio.playTile(index);
            }
            this.highlightTile(index, false);
            await new Promise(resolve => setTimeout(resolve, delay / 2));
            this.draw();
        }
    }

    highlightTile(index, isPlayer) {
        const x = index % this.gridSize;
        const y = Math.floor(index / this.gridSize);
        const isHighContrast = document.body.dataset.highContrast === 'true';
        const tileColor = this.colors[index % this.colors.length];

        if (isHighContrast) {
            this.ctx.fillStyle = '#888888';  // Use gray for both pattern and player in high contrast
        } else {
            this.ctx.fillStyle = tileColor;  // Use same color for both pattern and player
        }
        this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    }

    checkPattern() {
        for (let i = 0; i < this.playerPattern.length; i++) {
            if (this.playerPattern[i] !== this.pattern[i]) {
                if (document.body.dataset.soundEnabled === 'true') {
                    gameAudio.playError();
                }
                this.isPlaying = false;
                this.drawGameOver();
                return;
            }
        }

        if (this.playerPattern.length === this.pattern.length) {
            if (document.body.dataset.soundEnabled === 'true') {
                gameAudio.playSuccess();
            }
            this.score += this.gridSize * 5;
            document.getElementById('score').textContent = this.score;
            this.nextLevel();
        }
    }

    nextLevel() {
        this.playerPattern = [];
        const nextTile = Math.floor(Math.random() * (this.gridSize * this.gridSize));
        this.pattern.push(nextTile);
        setTimeout(() => this.showPattern(), 1000);
    }

    startGame() {
        this.pattern = [];
        this.playerPattern = [];
        this.score = 0;
        document.getElementById('score').textContent = this.score;
        this.isPlaying = true;
        this.nextLevel();
    }

    resetGame() {
        this.isPlaying = false;
        this.pattern = [];
        this.playerPattern = [];
        this.score = 0;
        document.getElementById('score').textContent = this.score;
        this.drawGameOver();
    }

    drawGameOver() {
        this.draw(); // Draw the base game state first

        // Draw semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw "GAME OVER" text
        this.ctx.fillStyle = document.body.dataset.highContrast === 'true' ? '#FFFFFF' : '#FF0000';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);

        // Draw final score
        this.ctx.fillStyle = document.body.dataset.highContrast === 'true' ? '#FFFFFF' : '#FFFF00';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);

        // Draw "Click Start to Play Again" text
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '20px Arial';
        this.ctx.fillText('Click Start to Play Again', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const isHighContrast = document.body.dataset.highContrast === 'true';

        // Draw grid
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                this.ctx.strokeStyle = isHighContrast ? '#ffffff' : '#aaaaaa';
                this.ctx.strokeRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);

                // Highlight current tile for keyboard controls
                if (document.body.dataset.useKeyboard === 'true' && 
                    x === this.currentTile.x && y === this.currentTile.y) {
                    this.ctx.fillStyle = isHighContrast ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.3)';
                    this.ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }

        // If game is not playing and we have a pattern (meaning game over), show the game over screen
        if (!this.isPlaying && this.pattern.length > 0) {
            this.drawGameOver();
        }
    }
}
