class Game2048 {
    constructor(size = 4) {
        this.size = size;
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('2048-best-score') || '0');
        this.gameOver = false;
        this.won = false;
        this.moves = 0;
        this.hasMerged = false;
        this.stateHistory = [];
        this.init();
    }

    init() {
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.moves = 0;
        this.hasMerged = false;
        this.stateHistory = [];
        
        // 初始生成两个数字
        this.addRandomTile();
        this.addRandomTile();
        
        this.saveState();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ x: i, y: j });
                }
            }
        }

        if (emptyCells.length > 0) {
            const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[cell.x][cell.y] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(direction) {
        const moves = [];
        this.hasMerged = false;
        let moved = false;

        switch (direction) {
            case 'left':
                moved = this.moveLeft(moves);
                break;
            case 'right':
                moved = this.moveRight(moves);
                break;
            case 'up':
                moved = this.moveUp(moves);
                break;
            case 'down':
                moved = this.moveDown(moves);
                break;
        }

        if (moved) {
            this.moves++;
            this.addRandomTile();
            this.saveState();
            this.checkGameState();
        }

        return moves;
    }

    moveLeft(moves) {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(cell => cell !== 0);
            const newRow = [];
            
            for (let j = 0; j < row.length; j++) {
                if (j < row.length - 1 && row[j] === row[j + 1]) {
                    const value = row[j] * 2;
                    newRow.push(value);
                    this.score += value;
                    this.hasMerged = true;
                    moves.push({
                        from: { x: i, y: j },
                        to: { x: i, y: newRow.length - 1 },
                        value: value,
                        merged: true
                    });
                    j++; // 跳过下一个元素
                } else {
                    newRow.push(row[j]);
                    if (row[j] !== this.grid[i][j]) {
                        moves.push({
                            from: { x: i, y: j },
                            to: { x: i, y: newRow.length - 1 },
                            value: row[j],
                            merged: false
                        });
                    }
                }
            }

            // 填充剩余位置为0
            while (newRow.length < this.size) {
                newRow.push(0);
            }

            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    moveRight(moves) {
        // 反转行，使用moveLeft，再反转回来
        for (let i = 0; i < this.size; i++) {
            this.grid[i].reverse();
        }
        
        const tempMoves = [];
        const moved = this.moveLeft(tempMoves);
        
        // 调整移动坐标
        for (const move of tempMoves) {
            moves.push({
                from: { x: move.from.x, y: this.size - 1 - move.from.y },
                to: { x: move.to.x, y: this.size - 1 - move.to.y },
                value: move.value,
                merged: move.merged
            });
        }
        
        for (let i = 0; i < this.size; i++) {
            this.grid[i].reverse();
        }
        
        return moved;
    }

    moveUp(moves) {
        // 转置矩阵，使用moveLeft，再转置回来
        this.transpose();
        const tempMoves = [];
        const moved = this.moveLeft(tempMoves);
        
        // 调整移动坐标
        for (const move of tempMoves) {
            moves.push({
                from: { x: move.from.y, y: move.from.x },
                to: { x: move.to.y, y: move.to.x },
                value: move.value,
                merged: move.merged
            });
        }
        
        this.transpose();
        return moved;
    }

    moveDown(moves) {
        // 转置并反转，使用moveLeft，再恢复
        this.transpose();
        for (let i = 0; i < this.size; i++) {
            this.grid[i].reverse();
        }
        
        const tempMoves = [];
        const moved = this.moveLeft(tempMoves);
        
        // 调整移动坐标
        for (const move of tempMoves) {
            moves.push({
                from: { x: move.from.y, y: this.size - 1 - move.from.x },
                to: { x: move.to.y, y: this.size - 1 - move.to.x },
                value: move.value,
                merged: move.merged
            });
        }
        
        for (let i = 0; i < this.size; i++) {
            this.grid[i].reverse();
        }
        this.transpose();
        
        return moved;
    }

    transpose() {
        const newGrid = Array(this.size).fill().map(() => Array(this.size).fill(0));
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                newGrid[j][i] = this.grid[i][j];
            }
        }
        this.grid = newGrid;
    }

    canMove() {
        // 检查是否有空格
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return true;
                }
            }
        }

        // 检查是否有相邻相同数字
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                if (j < this.size - 1 && current === this.grid[i][j + 1]) return true;
                if (i < this.size - 1 && current === this.grid[i + 1][j]) return true;
            }
        }

        return false;
    }

    checkGameState() {
        // 检查是否获胜
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 2048) {
                    this.won = true;
                    return;
                }
            }
        }

        // 检查是否游戏结束
        if (!this.canMove()) {
            this.gameOver = true;
        }

        // 更新最高分
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('2048-best-score', this.bestScore.toString());
        }
    }

    isWin() {
        return this.won;
    }

    isGameOver() {
        return this.gameOver;
    }

    saveState() {
        this.stateHistory.push({
            grid: JSON.parse(JSON.stringify(this.grid)),
            score: this.score,
            moves: this.moves
        });

        // 限制历史记录数量
        if (this.stateHistory.length > 10) {
            this.stateHistory.shift();
        }
    }

    undo() {
        if (this.stateHistory.length > 1) {
            this.stateHistory.pop(); // 移除当前状态
            const previousState = this.stateHistory[this.stateHistory.length - 1];
            this.grid = previousState.grid;
            this.score = previousState.score;
            this.moves = previousState.moves;
            this.gameOver = false;
            this.won = false;
            return true;
        }
        return false;
    }

    reset() {
        this.init();
    }

    getGrid() {
        return this.grid;
    }

    getScore() {
        return this.score;
    }

    getBestScore() {
        return this.bestScore;
    }
}