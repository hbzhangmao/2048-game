class Game2048App {
    constructor() {
        this.game = new Game2048();
        this.soundManager = new SoundManager();
        this.uiManager = new UIManager(this.game);
        this.inputHandler = new InputHandler(this.game, this.uiManager, this.soundManager);
        
        // 初始化UI
        this.uiManager.updateUI();
        
        console.log('2048 游戏已启动！');
    }
}

// 当页面加载完成后启动游戏
document.addEventListener('DOMContentLoaded', () => {
    new Game2048App();
});

// 防止页面滚动（移动端）
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.game-grid')) {
        e.preventDefault();
    }
}, { passive: false });