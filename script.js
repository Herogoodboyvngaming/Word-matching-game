// Game State Management
const GameState = {
    currentUser: null,
    score: 0,
    coins: 0,
    streak: 0,
    currentWord: null,
    scrambledLetters: [],
    selectedLetters: [],
    words: [],
    inventory: [],
    currentFilter: 'all',
    hintUsed: false,
    shuffleUsed: false,
    
    // Checkin system
    checkinData: {
        streak: 0,
        lastCheckin: null,
        checkedDays: []
    },
    
    // Gift box
    giftBox: {
        lastOpened: null,
        canOpen: true
    },
    
    // Default funny words
    defaultWords: [
        { word: 'BÁNHTRÁNG', hint: 'Đặc sản miền Trung, cuốn thịt heo' },
        { word: 'TRÀSỮA', hint: 'Thức uống gây nghiện của giới trẻ' },
        { word: 'CÀPHÊ', hint: 'Thức uống giúp tỉnh táo buổi sáng' },
        { word: 'NGỦNGÀY', hint: 'Sở thích của nhiều người cuối tuần' },
        { word: 'CODEBUG', hint: 'Nỗi ám ảnh của dân lập trình' },
        { word: 'WIFI', hint: 'Không có là điên đầu' },
        { word: 'TÍNLUỴ', hint: 'Khi crush không rep tin nhắn' },
        { word: 'MEME', hint: 'Ảnh chế hài hước trên mạng' },
        { word: 'TẾT', hint: 'Ngày lễ quan trọng nhất năm' },
        { word: 'LÌXÌ', hint: 'Phong bao đỏ ngày Tết' },
        { word: 'TROLL', hint: 'Chọc ghẹo bạn bè' },
        { word: 'GÀCỘNG', hint: 'Rank game thủ mơ ước' },
        { word: 'LAG', hint: 'Kẻ thù số 1 của game thủ' },
        { word: 'BỀNVỮNG', hint: 'Điều tối quan trọng trong tình yêu' },
        { word: 'MÌTƯƠNG', hint: 'Món ăn sáng quốc dân' },
        { word: 'PHỞ', hint: 'Tinh hoa ẩm thực Việt Nam' },
        { word: 'BÁNHMÌ', hint: 'Bánh mì Việt Nam nổi tiếng thế giới' },
        { word: 'CƠMTẤM', hint: 'Đặc sản Sài Gòn' },
        { word: 'BÚNCHẢ', hint: 'Obama đã ăn món này ở Hà Nội' },
        { word: 'CHÈ', hint: 'Món tráng miệng ngọt ngào' }
    ],
    
    // Shop items
    shopItems: [
        { id: 'hint_pack', name: 'Gói Gợi Ý', icon: '💡', desc: '3 lần gợi ý miễn phí', price: 50, type: 'consumable', quantity: 3 },
        { id: 'time_freeze', name: 'Đóng Băng', icon: '❄️', desc: 'Dừng thời gian 30s', price: 100, type: 'consumable', quantity: 1 },
        { id: 'double_score', name: 'Nhân Đôi', icon: '2️⃣', desc: 'X2 điểm 5 lượt chơi', price: 150, type: 'consumable', quantity: 5 },
        { id: 'skip_card', name: 'Thẻ Bỏ Qua', icon: '⏭️', desc: 'Bỏ qua không mất điểm', price: 80, type: 'consumable', quantity: 1 },
        { id: 'lucky_charm', name: 'Bùa May Mắn', icon: '🍀', desc: 'Tăng tỷ lệ chữ đầu tiên đúng', price: 200, type: 'passive' },
        { id: 'golden_ticket', name: 'Vé Vàng', icon: '🎫', desc: 'Mở khóa từ đặc biệt', price: 500, type: 'special' }
    ],
    
    // Checkin rewards (increasing)
    checkinRewards: [10, 20, 35, 50, 75, 100, 200]
};

// Sound Effects
const AudioManager = {
    ctx: null,
    
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    
    playTone(frequency, duration, type = 'sine') {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.frequency.value = frequency;
        osc.type = type;
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        
        osc.start(this.ctx.currentTime);
        osc.stop(this.ctx.currentTime + duration);
    },
    
    playCorrect() {
        this.playTone(523.25, 0.1);
        setTimeout(() => this.playTone(659.25, 0.1), 100);
        setTimeout(() => this.playTone(783.99, 0.2), 200);
    },
    
    playWrong() {
        this.playTone(200, 0.3, 'sawtooth');
    },
    
    playWin() {
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.15), i * 100);
        });
    },
    
    playClick() {
        this.playTone(800, 0.05);
    },
    
    playCoin() {
        this.playTone(1200, 0.1);
        setTimeout(() => this.playTone(1600, 0.1), 50);
    },
    
    playSad() {
        this.playTone(300, 0.3);
        setTimeout(() => this.playTone(250, 0.4), 300);
    }
};

// Notification System
const NotificationManager = {
    show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        notification.innerHTML = `
            <span style="font-size: 1.5rem;">${icons[type]}</span>
            <span style="font-weight: 600;">${message}</span>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    }
};

// Ping Monitor - Only in game
const PingMonitor = {
    start() {
        document.getElementById('ping-monitor').classList.remove('hidden');
        this.checkPing();
        setInterval(() => this.checkPing(), 5000);
    },
    
    stop() {
        document.getElementById('ping-monitor').classList.add('hidden');
    },
    
    async checkPing() {
        const start = Date.now();
        const monitor = document.getElementById('ping-monitor');
        const lagWarning = document.getElementById('lag-warning');
        
        try {
            await fetch('https://www.google.com/favicon.ico', { 
                mode: 'no-cors',
                cache: 'no-store'
            });
            const ping = Date.now() - start;
            
            document.getElementById('ping-text').textContent = `${ping}ms`;
            
            if (ping > 1000) {
                monitor.classList.add('lag');
                lagWarning.classList.remove('hidden');
                NotificationManager.show('Mạng đang lag! (>1000ms)', 'warning');
            } else {
                monitor.classList.remove('lag');
                lagWarning.classList.add('hidden');
            }
        } catch (e) {
            document.getElementById('ping-text').textContent = 'Error';
            monitor.classList.add('lag');
        }
    }
};

// Auth System
const Auth = {
    users: {},
    
    init() {
        const saved = localStorage.getItem('wordGameUsers');
        if (saved) {
            this.users = JSON.parse(saved);
        }
        
        const session = sessionStorage.getItem('currentUser');
        if (session) {
            GameState.currentUser = session;
            this.loadUserData();
            this.showGame();
        }
    },
    
    saveUsers() {
        localStorage.setItem('wordGameUsers', JSON.stringify(this.users));
    },
    
    togglePassword(inputId) {
        const input = document.getElementById(inputId);
        input.type = input.type === 'password' ? 'text' : 'password';
    },
    
    showLogin() {
        document.getElementById('login-form').classList.add('active');
        document.getElementById('register-form').classList.remove('active');
        AudioManager.playClick();
    },
    
    showRegister() {
        document.getElementById('register-form').classList.add('active');
        document.getElementById('login-form').classList.remove('active');
        AudioManager.playClick();
    },
    
    register() {
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirm = document.getElementById('reg-confirm').value;
        
        if (!username || !password) {
            NotificationManager.show('Vui lòng điền đầy đủ thông tin!', 'error');
            return;
        }
        
        if (password.length < 4) {
            NotificationManager.show('Mật khẩu phải có ít nhất 4 ký tự!', 'error');
            return;
        }
        
        if (password !== confirm) {
            NotificationManager.show('Mật khẩu xác nhận không khớp!', 'error');
            return;
        }
        
        if (this.users[username]) {
            NotificationManager.show('Tên đăng nhập đã tồn tại!', 'error');
            return;
        }
        
        this.users[username] = {
            password: password,
            score: 0,
            coins: 0,
            words: [...GameState.defaultWords],
            inventory: [],
            checkinData: {
                streak: 0,
                lastCheckin: null,
                checkedDays: []
            },
            giftBox: {
                lastOpened: null,
                canOpen: true
            }
        };
        
        this.saveUsers();
        AudioManager.playWin();
        NotificationManager.show('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
        
        document.getElementById('reg-username').value = '';
        document.getElementById('reg-password').value = '';
        document.getElementById('reg-confirm').value = '';
        this.showLogin();
    },
    
    login() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        
        if (!username || !password) {
            NotificationManager.show('Vui lòng điền đầy đủ thông tin!', 'error');
            return;
        }
        
        const user = this.users[username];
        if (!user || user.password !== password) {
            NotificationManager.show('Tên đăng nhập hoặc mật khẩu không đúng!', 'error');
            return;
        }
        
        GameState.currentUser = username;
        this.loadUserData();
        
        sessionStorage.setItem('currentUser', username);
        AudioManager.playWin();
        NotificationManager.show(`Chào mừng ${username}! 🎉`, 'success');
        
        this.showGame();
    },
    
    confirmLogout() {
        ConfirmModal.show('Xác nhận Đăng Xuất', 'Bạn có chắc muốn rời đi? 😢', () => {
            this.showSadLogout();
        });
    },
    
    showSadLogout() {
        document.getElementById('logout-modal').classList.remove('hidden');
        AudioManager.playSad();
    },
    
    completeLogout(reason) {
        document.getElementById('logout-modal').classList.add('hidden');
        
        if (GameState.currentUser) {
            this.saveUserData();
        }
        
        GameState.currentUser = null;
        GameState.score = 0;
        GameState.coins = 0;
        GameState.streak = 0;
        GameState.words = [];
        GameState.inventory = [];
        GameState.checkinData = { streak: 0, lastCheckin: null, checkedDays: [] };
        GameState.giftBox = { lastOpened: null, canOpen: true };
        
        sessionStorage.removeItem('currentUser');
        
        PingMonitor.stop();
        
        document.getElementById('main-menu').classList.remove('hidden');
        document.getElementById('game-container').classList.add('hidden');
        
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        
        const sadMessages = {
            'Mệt mỏi': 'Nghỉ ngơi đi nhé, đừng quá cố gắng! 💤',
            'Buồn ngủ': 'Ngủ ngon, mai lại chiến tiếp! 🌙',
            'Có việc gấp': 'Việc quan trọng trước, quay lại sau nhé! 🏃',
            'Game khó quá': 'Đừng bỏ cuộc! Lần sau sẽ dễ hơn! 💪',
            'Không có lý do': 'Ủa sao buồn vậy... 😔'
        };
        
        NotificationManager.show(sadMessages[reason] || 'Tạm biệt! Hẹn gặp lại! 👋', 'info', 5000);
    },
    
    showGame() {
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('game-container').classList.remove('hidden');
        document.getElementById('current-user').textContent = GameState.currentUser;
        
        Game.init();
    },
    
    loadUserData() {
        const user = this.users[GameState.currentUser];
        if (user) {
            GameState.score = user.score || 0;
            GameState.coins = user.coins || 0;
            GameState.words = user.words || [...GameState.defaultWords];
            GameState.inventory = user.inventory || [];
            GameState.checkinData = user.checkinData || { streak: 0, lastCheckin: null, checkedDays: [] };
            GameState.giftBox = user.giftBox || { lastOpened: null, canOpen: true };
        }
    },
    
    saveUserData() {
        if (!GameState.currentUser) return;
        
        this.users[GameState.currentUser] = {
            ...this.users[GameState.currentUser],
            score: GameState.score,
            coins: GameState.coins,
            words: GameState.words,
            inventory: GameState.inventory,
            checkinData: GameState.checkinData,
            giftBox: GameState.giftBox
        };
        
        this.saveUsers();
    }
};

// Auto Save System (Random interval 1s - 10 minutes)
const AutoSave = {
    scheduleNextSave() {
        const randomTime = Math.floor(Math.random() * 599000) + 1000;
        
        setTimeout(() => {
            if (GameState.currentUser) {
                Auth.saveUserData();
                console.log(`Auto saved at ${new Date().toLocaleTimeString()}`);
            }
            this.scheduleNextSave();
        }, randomTime);
    },
    
    init() {
        this.scheduleNextSave();
    }
};

// Confirmation Modal
const ConfirmModal = {
    show(title, message, onConfirm) {
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        document.getElementById('confirm-modal').classList.remove('hidden');
        
        const btn = document.getElementById('confirm-btn');
        btn.onclick = () => {
            this.close();
            onConfirm();
        };
    },
    
    close() {
        document.getElementById('confirm-modal').classList.add('hidden');
    }
};

// Game Logic
const Game = {
    init() {
        this.setupEventListeners();
        this.renderShop();
        this.renderCheckin();
        this.renderWordsList();
        this.nextWord();
        this.updateGiftBox();
        PingMonitor.start();
        AutoSave.init();
        
        document.addEventListener('click', () => {
            AudioManager.init();
        }, { once: true });
        
        setInterval(() => {
            this.updateCheckinTimer();
            this.updateGiftBox();
        }, 1000);
    },
    
    setupEventListeners() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                AudioManager.playClick();
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        document.getElementById('shuffle-btn').addEventListener('click', () => {
            if (GameState.shuffleUsed) {
                NotificationManager.show('Bạn đã xáo trộn cho từ này rồi!', 'warning');
                return;
            }
            ConfirmModal.show('Xác nhận Xáo Trộn', 'Bạn chỉ được xáo trộn 1 lần cho mỗi từ. Tiếp tục?', () => {
                AudioManager.playClick();
                this.shuffleLetters();
            });
        });
        
        document.getElementById('hint-btn').addEventListener('click', () => {
            ConfirmModal.show('Xác nhận Gợi Ý', 'Sử dụng gợi ý sẽ mất 50 điểm và chỉ dùng được 1 lần. Tiếp tục?', () => {
                AudioManager.playClick();
                this.useHint();
            });
        });
        
        document.getElementById('skip-btn').addEventListener('click', () => {
            ConfirmModal.show('Xác nhận Bỏ Qua', 'Bỏ qua sẽ mất 10 điểm. Tiếp tục?', () => {
                AudioManager.playClick();
                this.skipWord();
            });
        });
        
        document.getElementById('submit-btn').addEventListener('click', () => {
            this.checkAnswer();
        });
        
        document.getElementById('word-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
        
        document.getElementById('add-word-btn').addEventListener('click', () => {
            ConfirmModal.show('Xác nhận Thêm Từ', 'Bạn muốn thêm từ này vào hệ thống?', () => {
                this.addWord();
            });
        });
        
        document.querySelectorAll('.exchange-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const points = parseInt(e.currentTarget.dataset.points);
                const coins = parseInt(e.currentTarget.dataset.coins);
                ConfirmModal.show('Xác nhận Đổi Điểm', `Đổi ${points} điểm lấy ${coins} coin?`, () => {
                    this.exchangePoints(points, coins);
                });
            });
        });
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                GameState.currentFilter = e.target.dataset.filter;
                this.renderWordsList();
            });
        });
        
        window.addEventListener('beforeunload', () => {
            Auth.saveUserData();
        });
    },
    
    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-tab`).classList.add('active');
        
        if (tab === 'words') this.renderWordsList();
        if (tab === 'shop') this.renderShop();
        if (tab === 'checkin') this.renderCheckin();
    },
    
    nextWord() {
        if (GameState.words.length === 0) {
            NotificationManager.show('Chưa có từ nào! Hãy thêm từ mới.', 'warning');
            return;
        }
        
        GameState.hintUsed = false;
        GameState.shuffleUsed = false;
        document.getElementById('hint-btn').disabled = false;
        document.getElementById('hint-btn').textContent = '💡 Gợi Ý (-50 điểm)';
        document.getElementById('shuffle-btn').disabled = false;
        document.getElementById('shuffle-btn').textContent = '🔀 Xáo Trộn';
        
        const randomIndex = Math.floor(Math.random() * GameState.words.length);
        GameState.currentWord = GameState.words[randomIndex];
        GameState.selectedLetters = [];
        
        this.scrambleWord();
        this.renderGame();
        this.updateProgress();
    },
    
    scrambleWord() {
        const word = GameState.currentWord.word;
        let letters = word.split('');
        
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        
        if (letters.join('') === word && word.length > 1) {
            this.scrambleWord();
            return;
        }
        
        GameState.scrambledLetters = letters.map((letter, index) => ({
            letter,
            id: index,
            selected: false
        }));
    },
    
    renderGame() {
        const lettersContainer = document.getElementById('scrambled-letters');
        const slotsContainer = document.getElementById('answer-slots');
        
        // Render scrambled letters - show all but mark used ones
        lettersContainer.innerHTML = GameState.scrambledLetters.map((item, index) => `
            <div class="letter-tile ${item.selected ? 'used' : ''}" 
                 onclick="Game.selectLetter(${index})"
                 style="animation-delay: ${index * 0.05}s">
                ${item.letter}
            </div>
        `).join('');
        
        // Render answer slots
        const wordLength = GameState.currentWord.word.length;
        slotsContainer.innerHTML = '';
        for (let i = 0; i < wordLength; i++) {
            const slot = document.createElement('div');
            slot.className = 'answer-slot';
            slot.dataset.index = i;
            
            if (i < GameState.selectedLetters.length) {
                slot.classList.add('filled');
                slot.textContent = GameState.selectedLetters[i].letter;
                // Click to remove letter
                slot.onclick = () => this.removeLetter(i);
            }
            
            slotsContainer.appendChild(slot);
        }
        
        document.getElementById('word-input').value = '';
        document.getElementById('word-input').placeholder = `Nhập ${wordLength} chữ...`;
        document.getElementById('word-input').maxLength = wordLength;
    },
    
    selectLetter(index) {
        const letter = GameState.scrambledLetters[index];
        if (letter.selected) {
            // If already selected, find and remove it
            const selectedIndex = GameState.selectedLetters.findIndex(l => l.id === letter.id);
            if (selectedIndex !== -1) {
                this.removeLetter(selectedIndex);
            }
            return;
        }
        
        AudioManager.playClick();
        letter.selected = true;
        GameState.selectedLetters.push(letter);
        this.renderGame();
        
        if (GameState.selectedLetters.length === GameState.currentWord.word.length) {
            setTimeout(() => this.checkAnswer(), 300);
        }
    },
    
    removeLetter(index) {
        if (index < 0 || index >= GameState.selectedLetters.length) return;
        
        AudioManager.playClick();
        const letter = GameState.selectedLetters[index];
        
        // Mark as not selected in scrambled letters
        const originalIndex = GameState.scrambledLetters.findIndex(l => l.id === letter.id);
        if (originalIndex !== -1) {
            GameState.scrambledLetters[originalIndex].selected = false;
        }
        
        // Remove from selected
        GameState.selectedLetters.splice(index, 1);
        this.renderGame();
    },
    
    shuffleLetters() {
        if (GameState.shuffleUsed) return;
        
        GameState.shuffleUsed = true;
        document.getElementById('shuffle-btn').disabled = true;
        document.getElementById('shuffle-btn').textContent = '🔀 Đã Xáo';
        
        // Reset all selections
        GameState.scrambledLetters.forEach(l => l.selected = false);
        GameState.selectedLetters = [];
        
        // Reshuffle
        for (let i = GameState.scrambledLetters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [GameState.scrambledLetters[i], GameState.scrambledLetters[j]] = 
            [GameState.scrambledLetters[j], GameState.scrambledLetters[i]];
        }
        
        this.renderGame();
        NotificationManager.show('Đã xáo trộn! (Không thể xáo lại)', 'info');
    },
    
    useHint() {
        if (GameState.hintUsed) {
            NotificationManager.show('Bạn đã dùng gợi ý cho từ này rồi!', 'warning');
            return;
        }
        
        if (GameState.score < 50) {
            NotificationManager.show('Không đủ điểm! Cần 50 điểm.', 'error');
            return;
        }
        
        const word = GameState.currentWord.word;
        const currentAnswer = GameState.selectedLetters.map(l => l.letter).join('');
        
        if (currentAnswer.length >= word.length) {
            NotificationManager.show('Đã điền đầy đủ chữ!', 'warning');
            return;
        }
        
        const nextIndex = currentAnswer.length;
        const correctLetter = word[nextIndex];
        
        const availableIndex = GameState.scrambledLetters.findIndex(
            l => l.letter === correctLetter && !l.selected
        );
        
        if (availableIndex !== -1) {
            GameState.score -= 50;
            GameState.hintUsed = true;
            
            document.getElementById('hint-btn').disabled = true;
            document.getElementById('hint-btn').textContent = '💡 Đã Dùng Gợi Ý';
            
            this.updateUI();
            Auth.saveUserData();
            
            this.selectLetter(availableIndex);
            NotificationManager.show(`Gợi ý: Chữ "${correctLetter}" đúng!`, 'success');
        }
    },
    
    skipWord() {
        if (GameState.score < 10) {
            NotificationManager.show('Không đủ điểm! Cần 10 điểm để bỏ qua.', 'error');
            return;
        }
        
        GameState.score -= 10;
        GameState.streak = 0;
        this.updateUI();
        Auth.saveUserData();
        
        NotificationManager.show(`Bỏ qua! -10 điểm. Đáp án là: ${GameState.currentWord.word}`, 'info');
        setTimeout(() => this.nextWord(), 1500);
    },
    
    checkAnswer() {
        const input = document.getElementById('word-input');
        const answer = input.value.toUpperCase().trim();
        const correct = GameState.currentWord.word;
        
        if (!answer) {
            const selectedAnswer = GameState.selectedLetters.map(l => l.letter).join('');
            if (selectedAnswer.length === correct.length) {
                this.processAnswer(selectedAnswer === correct, selectedAnswer);
            } else {
                NotificationManager.show('Vui lòng nhập đáp án!', 'warning');
            }
            return;
        }
        
        this.processAnswer(answer === correct, answer);
    },
    
    processAnswer(isCorrect, answer) {
        if (isCorrect) {
            AudioManager.playCorrect();
            GameState.streak++;
            
            const baseScore = 10 * GameState.currentWord.word.length;
            const streakBonus = Math.min(GameState.streak * 5, 50);
            const totalScore = baseScore + streakBonus;
            
            GameState.score += totalScore;
            
            if (Math.random() < 0.1) {
                const bonusCoins = Math.floor(Math.random() * 5) + 1;
                GameState.coins += bonusCoins;
                NotificationManager.show(`🎉 Bonus! +${bonusCoins} Coin!`, 'success');
                AudioManager.playCoin();
            }
            
            this.updateUI();
            Auth.saveUserData();
            
            this.createConfetti();
            NotificationManager.show(
                `Chính xác! +${totalScore} điểm${GameState.streak > 1 ? ` (Streak x${GameState.streak})` : ''}`, 
                'success'
            );
            
            setTimeout(() => this.nextWord(), 1500);
        } else {
            AudioManager.playWrong();
            GameState.streak = 0;
            this.updateUI();
            
            NotificationManager.show(`Sai rồi! Thử lại nhé!`, 'error');
            
            const gameArea = document.querySelector('.game-area');
            gameArea.style.animation = 'shake 0.5s';
            setTimeout(() => gameArea.style.animation = '', 500);
        }
    },
    
    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff8b94'];
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 4000);
        }
    },
    
    updateProgress() {
        const total = GameState.words.length;
        const progress = Math.floor(Math.random() * total);
        const percentage = (progress / total) * 100;
        
        document.getElementById('progress-fill').style.width = percentage + '%';
        document.getElementById('progress-text').textContent = `${progress}/${total}`;
    },
    
    updateUI() {
        document.getElementById('score').textContent = GameState.score;
        document.getElementById('coins').textContent = GameState.coins;
        document.getElementById('streak').textContent = GameState.streak;
    },
    
    updateGiftBox() {
        const giftBox = document.getElementById('gift-box');
        const timer = document.getElementById('gift-timer');
        
        if (!GameState.giftBox.lastOpened) {
            GameState.giftBox.canOpen = true;
        } else {
            const lastOpened = new Date(GameState.giftBox.lastOpened);
            const now = new Date();
            const diff = now - lastOpened;
            const hours24 = 24 * 60 * 60 * 1000;
            
            if (diff >= hours24) {
                GameState.giftBox.canOpen = true;
            } else {
                GameState.giftBox.canOpen = false;
                const remaining = hours24 - diff;
                const hours = Math.floor(remaining / (60 * 60 * 1000));
                const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
                const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
                timer.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
        
        if (GameState.giftBox.canOpen) {
            giftBox.classList.remove('opened');
            timer.textContent = '';
        } else {
            giftBox.classList.add('opened');
        }
    },
    
    openGiftBox() {
        if (!GameState.giftBox.canOpen) {
            NotificationManager.show('Hộp quà chưa sẵn sàng! Chờ 24h nhé!', 'warning');
            return;
        }
        
        const rewards = [10, 20, 30, 50, 100, 200];
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
        
        GameState.coins += randomReward;
        GameState.giftBox.lastOpened = new Date().toISOString();
        GameState.giftBox.canOpen = false;
        
        this.updateUI();
        Auth.saveUserData();
        
        document.getElementById('gift-amount').textContent = randomReward;
        document.getElementById('gift-modal').classList.remove('hidden');
        
        AudioManager.playWin();
        this.createConfetti();
    },
    
    closeGiftModal() {
        document.getElementById('gift-modal').classList.add('hidden');
    },
    
    // UPDATED: Only show checked days and current day, hide future days
    renderCheckin() {
        const container = document.getElementById('checkin-calendar');
        const streakDisplay = document.getElementById('streak-days');
        
        streakDisplay.textContent = GameState.checkinData.streak;
        
        container.innerHTML = '';
        
        const currentDay = GameState.checkinData.streak + 1; // Day to check in next
        
        for (let i = 1; i <= 7; i++) {
            const isChecked = GameState.checkinData.checkedDays.includes(i);
            const isCurrent = i === currentDay;
            const isFuture = i > currentDay;
            
            // Skip future days - hide them completely
            if (isFuture) {
                continue;
            }
            
            const dayDiv = document.createElement('div');
            dayDiv.className = `checkin-day ${isChecked ? 'checked' : ''} ${isCurrent ? 'current' : ''}`;
            
            let buttonHTML = '';
            if (isCurrent && !isChecked) {
                buttonHTML = '<button class="checkin-btn" onclick="Game.checkin()">Nhận</button>';
            } else if (isChecked) {
                buttonHTML = '<div style="font-size:1.5rem;">✅</div>';
            }
            
            dayDiv.innerHTML = `
                <div class="day-number">Ngày ${i}</div>
                <div class="day-reward">+${GameState.checkinRewards[i-1]} 🪙</div>
                ${buttonHTML}
            `;
            
            container.appendChild(dayDiv);
        }
        
        this.updateCheckinTimer();
    },
    
    checkin() {
        const today = new Date().toDateString();
        const lastCheckin = GameState.checkinData.lastCheckin ? new Date(GameState.checkinData.lastCheckin).toDateString() : null;
        
        if (lastCheckin === today) {
            NotificationManager.show('Bạn đã điểm danh hôm nay rồi!', 'warning');
            return;
        }
        
        if (lastCheckin) {
            const lastDate = new Date(GameState.checkinData.lastCheckin);
            const todayDate = new Date();
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays > 1) {
                GameState.checkinData.streak = 0;
                GameState.checkinData.checkedDays = [];
            }
        }
        
        GameState.checkinData.streak++;
        const dayIndex = GameState.checkinData.streak;
        const reward = GameState.checkinRewards[dayIndex - 1];
        
        GameState.coins += reward;
        GameState.checkinData.checkedDays.push(dayIndex);
        GameState.checkinData.lastCheckin = new Date().toISOString();
        
        if (GameState.checkinData.streak >= 7) {
            NotificationManager.show('🎉 Chúc mừng! Bạn đã hoàn thành 7 ngày! Hệ thống sẽ reset!', 'success');
            setTimeout(() => {
                GameState.checkinData.streak = 0;
                GameState.checkinData.checkedDays = [];
                Auth.saveUserData();
                this.renderCheckin();
            }, 2000);
        }
        
        this.updateUI();
        Auth.saveUserData();
        this.renderCheckin();
        
        AudioManager.playCoin();
        NotificationManager.show(`Điểm danh thành công! +${reward} Coin!`, 'success');
        this.createConfetti();
    },
    
    updateCheckinTimer() {
        const timer = document.getElementById('reset-timer');
        if (GameState.checkinData.streak >= 7) {
            timer.textContent = 'Sẵn sàng reset!';
            return;
        }
        
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const diff = tomorrow - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        timer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    renderShop() {
        const container = document.getElementById('shop-items');
        container.innerHTML = GameState.shopItems.map(item => {
            const canAfford = GameState.coins >= item.price;
            return `
                <div class="shop-item">
                    <div class="shop-item-icon">${item.icon}</div>
                    <div class="shop-item-name">${item.name}</div>
                    <div class="shop-item-desc">${item.desc}</div>
                    <div class="shop-item-price">${item.price} 🪙</div>
                    <button class="buy-btn" onclick="Game.buyItem('${item.id}')" ${!canAfford ? 'disabled' : ''}>
                        ${canAfford ? 'Mua Ngay' : 'Không đủ Coin'}
                    </button>
                </div>
            `;
        }).join('');
    },
    
    buyItem(itemId) {
        const item = GameState.shopItems.find(i => i.id === itemId);
        if (!item || GameState.coins < item.price) {
            NotificationManager.show('Không đủ Coin!', 'error');
            return;
        }
        
        ConfirmModal.show('Xác nhận Mua Hàng', `Mua ${item.name} với giá ${item.price} coin?`, () => {
            GameState.coins -= item.price;
            
            const existingItem = GameState.inventory.find(i => i.id === itemId);
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                GameState.inventory.push({ ...item, quantity: item.quantity });
            }
            
            this.updateUI();
            Auth.saveUserData();
            this.renderShop();
            
            AudioManager.playCoin();
            NotificationManager.show(`Đã mua ${item.name}!`, 'success');
        });
    },
    
    exchangePoints(points, coins) {
        if (GameState.score < points) {
            NotificationManager.show(`Không đủ điểm! Cần ${points} điểm.`, 'error');
            return;
        }
        
        GameState.score -= points;
        GameState.coins += coins;
        
        this.updateUI();
        Auth.saveUserData();
        this.renderShop();
        
        AudioManager.playCoin();
        NotificationManager.show(`Đổi thành công! +${coins} Coin`, 'success');
    },
    
    addWord() {
        const wordInput = document.getElementById('new-word');
        const hintInput = document.getElementById('word-hint');
        
        const word = wordInput.value.toUpperCase().trim();
        const hint = hintInput.value.trim();
        
        if (!word) {
            NotificationManager.show('Vui lòng nhập từ!', 'warning');
            return;
        }
        
        if (word.length < 2) {
            NotificationManager.show('Từ quá ngắn!', 'error');
            return;
        }
        
        if (GameState.words.some(w => w.word === word)) {
            NotificationManager.show('Từ này đã tồn tại!', 'error');
            return;
        }
        
        GameState.words.push({ word, hint: hint || 'Không có gợi ý' });
        Auth.saveUserData();
        
        wordInput.value = '';
        hintInput.value = '';
        
        this.renderWordsList();
        NotificationManager.show('Thêm từ thành công!', 'success');
    },
    
    deleteWord(index) {
        ConfirmModal.show('Xác nhận Xóa', 'Bạn có chắc muốn xóa từ này?', () => {
            GameState.words.splice(index, 1);
            Auth.saveUserData();
            this.renderWordsList();
            NotificationManager.show('Đã xóa từ!', 'info');
        });
    },
    
    renderWordsList() {
        const container = document.getElementById('words-list');
        let filteredWords = GameState.words;
        
        if (GameState.currentFilter !== 'all') {
            filteredWords = GameState.words.filter(w => {
                const len = w.word.length;
                if (GameState.currentFilter === 'easy') return len <= 4;
                if (GameState.currentFilter === 'medium') return len >= 5 && len <= 6;
                if (GameState.currentFilter === 'hard') return len >= 7;
            });
        }
        
        container.innerHTML = filteredWords.map((wordObj, index) => `
            <div class="word-item">
                <div class="word-info">
                    <h4>${wordObj.word}</h4>
                    <p>💡 ${wordObj.hint}</p>
                </div>
                <div class="word-actions">
                    <button class="delete-btn" onclick="Game.deleteWord(${GameState.words.indexOf(wordObj)})">🗑️</button>
                </div>
            </div>
        `).join('');
    },
    
    closeModal() {
        ConfirmModal.close();
    }
};

// Initialize Auth on load
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});
