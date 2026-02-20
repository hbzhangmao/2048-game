class InputHandler {
    constructor(game, uiManager, soundManager) {
        this.game = game;
        this.uiManager = uiManager;
        this.soundManager = soundManager;
        this.keys = {};
        this.touchStart = null;
        this.debounceTimer = null;
        this.isProcessing = false;
        this.bindEvents();
    }

    bindEvents() {
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // 触摸事件
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // 控制按钮事件
        document.getElementById('new-game').addEventListener('click', () => this.handleNewGame());
        document.getElementById('undo').addEventListener('click', () => this.handleUndo());
        document.getElementById('sound-toggle').addEventListener('click', () => this.handleSoundToggle());
    }

    handleKeyDown(e) {
        if (this.debounceTimer || this.isProcessing) return;

        const direction = this.getDirectionFromKey(e.key);
        if (direction) {
            e.preventDefault();
            this.processMove(direction);
            
            // 防抖处理
            this.debounceTimer = setTimeout(() => {
                this.debounceTimer = null;
            }, 150);
        }
    }

    handleTouchStart(e) {
        this.touchStart = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            time: Date.now()
        };
    }

    handleTouchEnd(e) {
        if (!this.touchStart || this.isProcessing) return;

        const touchEnd = {
            x: e.changedTouches[0].clientX,
            y: e.changedTouches[0].clientY,
            time: Date.now()
        };

        const dx = touchEnd.x - this.touchStart.x;
        const dy = touchEnd.y - this.touchStart.y;
        const dt = touchEnd.time - this.touchStart.time;

        // 检查滑动距离和时间
        if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
        if (dt > 500) return; // 滑动时间过长

        const direction = this.getDirectionFromSwipe(dx, dy);
        if (direction) {
            this.processMove(direction);
        }
    }

    getDirectionFromKey(key) {
        const keyMap = {
            'ArrowLeft': 'left',
            'ArrowRight': 'right',
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'a': 'left',
            'd': 'right',
            'w': 'up',
            's': 'down'
        };
        return keyMap[key.toLowerCase()] || null;
    }

    getDirectionFromSwipe(dx, dy) {
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'right' : 'left';
        } else {
            return dy > 0 ? 'down' : 'up';
        }
    }

    async processMove(direction) {
        if (this.isProcessing || this.game.isGameOver() || this.game.isWin()) return;
        
        this.isProcessing = true;
        
        try {
            const moves = this.game.move(direction);
            
            if (moves.length > 0) {
                // 播放移动音效
                this.soundManager.play('move');
                
                // 执行动画
                await this.uiManager.animateMove(moves);
                
                // 如果有合并，播放合并音效
                if (this.game.hasMerged) {
                    this.soundManager.play('merge');
                }
                
                // 更新UI
                this.uiManager.updateUI();
                
                // 检查游戏状态并播放相应音效
                if (this.game.isWin()) {
                    this.soundManager.play('win');
                } else if (this.game.isGameOver()) {
                    this.soundManager.play('gameover');
                }
            }
        } finally {
            this.isProcessing = false;
        }
    }

    handleNewGame() {
        this.soundManager.play('newgame');
        this.game.reset();
        this.uiManager.renderTiles();
        this.uiManager.updateScores();
        this.uiManager.hideMessage();
    }

    handleUndo() {
        if (this.game.undo()) {
            this.uiManager.renderTiles();
            this.uiManager.updateScores();
            this.uiManager.hideMessage();
        }
    }

    handleSoundToggle() {
        const soundButton = document.getElementById('sound-toggle');
        this.soundManager.toggle();
        soundButton.textContent = `音效: ${this.soundManager.enabled ? '开' : '关'}`;
    }
}