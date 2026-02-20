class UIManager {
    constructor(game) {
        this.game = game;
        this.gridElement = document.getElementById('game-grid');
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.messageElement = document.getElementById('game-message');
        this.tryAgainButton = document.getElementById('try-again');
        this.init();
    }

    init() {
        this.renderGrid();
        this.updateScores();
        this.bindEvents();
    }

    renderGrid() {
        // 清空网格
        this.gridElement.innerHTML = '';
        
        // 创建网格背景
        for (let i = 0; i < this.game.size; i++) {
            for (let j = 0; j < this.game.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.x = i;
                cell.dataset.y = j;
                this.gridElement.appendChild(cell);
            }
        }

        // 渲染数字方块
        this.renderTiles();
    }

    renderTiles() {
        // 移除现有方块
        const existingTiles = this.gridElement.querySelectorAll('.tile');
        existingTiles.forEach(tile => tile.remove());

        const grid = this.game.getGrid();
        const tileSize = 100 / this.game.size;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = grid[i][j];
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value}`;
                    tile.textContent = value;
                    tile.style.left = `${j * tileSize}%`;
                    tile.style.top = `${i * tileSize}%`;
                    tile.style.width = `calc(${tileSize}% - 10px)`;
                    tile.style.height = `calc(${tileSize}% - 10px)`;
                    this.gridElement.appendChild(tile);
                }
            }
        }
    }

    async animateMove(moves) {
        const promises = [];
        
        for (const move of moves) {
            const tile = this.findTileAtPosition(move.from.x, move.from.y, move.value);
            if (tile) {
                const promise = this.animateTile(tile, move.to, move.merged);
                promises.push(promise);
            }
        }

        await Promise.all(promises);
        
        // 重新渲染以更新位置
        this.renderTiles();
    }

    animateTile(tile, toPos, merged) {
        return new Promise((resolve) => {
            const tileSize = 100 / this.game.size;
            const newLeft = `${toPos.y * tileSize}%`;
            const newTop = `${toPos.x * tileSize}%`;

            if (merged) {
                tile.classList.add('tile-merged');
            }

            requestAnimationFrame(() => {
                tile.style.left = newLeft;
                tile.style.top = newTop;
                
                setTimeout(() => {
                    resolve();
                }, 150);
            });
        });
    }

    findTileAtPosition(x, y, value) {
        const tiles = this.gridElement.querySelectorAll('.tile');
        for (const tile of tiles) {
            const computedStyle = window.getComputedStyle(tile);
            const left = parseFloat(computedStyle.left);
            const top = parseFloat(computedStyle.top);
            const tileValue = parseInt(tile.textContent);
            
            const expectedLeft = (y * 100 / this.game.size);
            const expectedTop = (x * 100 / this.game.size);
            
            if (Math.abs(left - expectedLeft) < 1 && 
                Math.abs(top - expectedTop) < 1 && 
                tileValue === value) {
                return tile;
            }
        }
        return null;
    }

    updateScores() {
        this.scoreElement.textContent = this.game.getScore();
        this.bestScoreElement.textContent = this.game.getBestScore();
    }

    showMessage(message, showButton = true) {
        const messageText = this.messageElement.querySelector('p');
        messageText.textContent = message;
        
        this.messageElement.classList.add('active');
        this.tryAgainButton.style.display = showButton ? 'block' : 'none';
    }

    hideMessage() {
        this.messageElement.classList.remove('active');
    }

    bindEvents() {
        this.tryAgainButton.addEventListener('click', () => {
            this.hideMessage();
            this.game.reset();
            this.renderTiles();
            this.updateScores();
        });
    }

    updateUI() {
        this.renderTiles();
        this.updateScores();
        
        if (this.game.isWin()) {
            this.showMessage('恭喜！你达到了 2048！', true);
        } else if (this.game.isGameOver()) {
            this.showMessage('游戏结束！', true);
        }
    }
}