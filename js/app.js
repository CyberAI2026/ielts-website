// 雅思学习平台 - 主应用程序
class IELTSApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentWordIndex = 0;
        this.vocabulary = [];
        this.listeningExercises = [];
        this.practiceExercises = [];
        this.userProgress = null;
        
        this.init();
    }
    
    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.updateDate();
        this.updateDashboard();
        this.renderVocabulary();
        this.renderListeningList();
        this.renderPracticeList();
    }
    
    // 加载数据
    async loadData() {
        try {
            // 加载词汇数据
            const vocabResponse = await fetch('data/vocabulary.json');
            const vocabData = await vocabResponse.json();
            this.vocabulary = vocabData.words;
            
            // 加载听力数据
            const listeningResponse = await fetch('data/listening.json');
            const listeningData = await listeningResponse.json();
            this.listeningExercises = listeningData.exercises;
            
            // 加载练习数据
            const practiceResponse = await fetch('data/practice.json');
            const practiceData = await practiceResponse.json();
            this.practiceExercises = practiceData.exercises;
            
            // 加载用户进度
            const progressResponse = await fetch('data/userProgress.json');
            this.userProgress = await progressResponse.json();
            
            console.log('数据加载成功');
        } catch (error) {
            console.error('加载数据失败:', error);
            this.useDefaultData();
        }
    }
    
    // 默认数据（当 JSON 文件不存在时）
    useDefaultData() {
        this.vocabulary = [
            { word: 'abandon', phonetic: '/əˈbændən/', meaning: 'v. 放弃', example: 'He abandoned the project.' }
        ];
        console.log('使用默认数据');
    }
    
    // 设置事件监听
    setupEventListeners() {
        // 导航菜单
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });
        
        // 单词学习按钮
        document.getElementById('startVocabBtn')?.addEventListener('click', () => {
            this.startVocabularyLearning();
        });
        
        document.getElementById('prevWordBtn')?.addEventListener('click', () => {
            this.showPreviousWord();
        });
        
        document.getElementById('nextWordBtn')?.addEventListener('click', () => {
            this.showNextWord();
        });
        
        document.getElementById('knowWordBtn')?.addEventListener('click', () => {
            this.markWordAsKnown();
        });
        
        document.getElementById('unknownWordBtn')?.addEventListener('click', () => {
            this.markWordAsUnknown();
        });
        
        document.getElementById('playAudioBtn')?.addEventListener('click', () => {
            this.playWordAudio();
        });
        
        // 返回听力列表
        document.getElementById('backToListBtn')?.addEventListener('click', () => {
            document.getElementById('listeningPlayer').style.display = 'none';
            document.getElementById('listeningList').style.display = 'grid';
        });
    }
    
    // 切换章节
    switchSection(sectionId) {
        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`)?.classList.add('active');
        
        // 更新内容显示
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId)?.classList.add('active');
        
        this.currentSection = sectionId;
    }
    
    // 更新日期
    updateDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const now = new Date();
            const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
            dateElement.textContent = now.toLocaleDateString('zh-CN', options);
        }
    }
    
    // 更新仪表板
    updateDashboard() {
        if (!this.userProgress) return;
        
        const user = this.userProgress.users.default;
        document.getElementById('streakDays').textContent = user.currentStreak || 0;
        document.getElementById('wordsLearned').textContent = user.vocabulary.learnedWords?.length || 0;
        document.getElementById('listeningMinutes').textContent = user.listening.totalMinutes || 0;
        document.getElementById('exercisesCompleted').textContent = user.practice.completedExercises?.length || 0;
    }
    
    // 渲染词汇
    renderVocabulary() {
        if (this.vocabulary.length === 0) return;
        
        this.currentWordIndex = 0;
        this.showWord(this.currentWordIndex);
    }
    
    showWord(index) {
        const word = this.vocabulary[index];
        if (!word) return;
        
        document.getElementById('wordText').textContent = word.word;
        document.getElementById('wordPhonetic').textContent = word.phonetic;
        document.getElementById('wordMeaning').textContent = word.meaning;
        document.getElementById('wordExample').textContent = word.example;
        
        // 更新进度
        const progress = `${index + 1}/${this.vocabulary.length}`;
        document.querySelector('.task-progress')?.textContent = progress;
    }
    
    showNextWord() {
        if (this.currentWordIndex < this.vocabulary.length - 1) {
            this.currentWordIndex++;
            this.showWord(this.currentWordIndex);
        }
    }
    
    showPreviousWord() {
        if (this.currentWordIndex > 0) {
            this.currentWordIndex--;
            this.showWord(this.currentWordIndex);
        }
    }
    
    startVocabularyLearning() {
        this.switchSection('vocabulary');
        this.showWord(0);
    }
    
    markWordAsKnown() {
        console.log('标记为认识:', this.vocabulary[this.currentWordIndex].word);
        this.saveProgress('vocabulary', 'known', this.vocabulary[this.currentWordIndex]);
        this.showNextWord();
    }
    
    markWordAsUnknown() {
        console.log('标记为不认识:', this.vocabulary[this.currentWordIndex].word);
        this.saveProgress('vocabulary', 'unknown', this.vocabulary[this.currentWordIndex]);
        this.showNextWord();
    }
    
    playWordAudio() {
        const word = this.vocabulary[this.currentWordIndex].word;
        // 使用浏览器语音合成
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        } else {
            alert('您的浏览器不支持语音播放');
        }
    }
    
    // 渲染听力列表
    renderListeningList() {
        const container = document.getElementById('listeningList');
        if (!container || this.listeningExercises.length === 0) return;
        
        container.innerHTML = this.listeningExercises.map(exercise => `
            <div class="exercise-item" onclick="app.playListeningExercise(${exercise.id})">
                <h4>${exercise.title}</h4>
                <div class="exercise-meta">
                    <span class="difficulty ${exercise.difficulty}">${this.getDifficultyText(exercise.difficulty)}</span>
                    <span>⏱️ ${exercise.duration}</span>
                    <span>📝 ${exercise.questions.length} 题</span>
                </div>
            </div>
        `).join('');
    }
    
    getDifficultyText(level) {
        const map = { 'easy': '简单', 'medium': '中等', 'hard': '困难' };
        return map[level] || level;
    }
    
    playListeningExercise(id) {
        const exercise = this.listeningExercises.find(e => e.id === id);
        if (!exercise) return;
        
        document.getElementById('listeningList').style.display = 'none';
        document.getElementById('listeningPlayer').style.display = 'block';
        
        document.getElementById('playerTitle').textContent = exercise.title;
        document.getElementById('transcript').textContent = exercise.transcript;
        
        // 渲染问题
        const questionsContainer = document.getElementById('questions');
        questionsContainer.innerHTML = exercise.questions.map((q, index) => {
            if (q.type === 'multiple_choice') {
                return `
                    <div class="question-item">
                        <label>${index + 1}. ${q.question}</label>
                        <div class="options">
                            ${q.options.map((opt, i) => `
                                <label>
                                    <input type="radio" name="q${index}" value="${opt.charAt(0)}">
                                    ${opt}
                                </label>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            return '';
        }).join('');
        
        // 添加提交按钮
        questionsContainer.innerHTML += `
            <button class="btn btn-primary" onclick="app.submitListeningAnswers(${exercise.id})">提交答案</button>
        `;
    }
    
    submitListeningAnswers(exerciseId) {
        console.log('提交听力答案:', exerciseId);
        alert('答案已提交！系统会自动批改。');
        this.saveProgress('listening', 'completed', { exerciseId });
    }
    
    // 渲染练习列表
    renderPracticeList() {
        const container = document.getElementById('practiceList');
        if (!container || this.practiceExercises.length === 0) return;
        
        container.innerHTML = this.practiceExercises.map(exercise => `
            <div class="exercise-item" onclick="app.startPractice(${exercise.id})">
                <h4>${exercise.title}</h4>
                <div class="exercise-meta">
                    <span class="difficulty ${exercise.difficulty}">${this.getDifficultyText(exercise.difficulty)}</span>
                    <span>📝 ${exercise.type}</span>
                    ${exercise.type === 'writing' ? `<span>⏱️ ${exercise.requirements.timeLimit}分钟</span>` : ''}
                </div>
            </div>
        `).join('');
    }
    
    startPractice(id) {
        const exercise = this.practiceExercises.find(e => e.id === id);
        if (!exercise) return;
        
        console.log('开始练习:', exercise.title);
        alert(`开始练习：${exercise.title}\n（完整功能开发中）`);
    }
    
    // 保存进度
    async saveProgress(category, action, data) {
        console.log('保存进度:', category, action, data);
        
        // 在实际应用中，这里会更新 userProgress.json
        // 由于浏览器限制，需要使用后端 API 或 localStorage
        
        // 使用 localStorage 作为示例
        try {
            const progress = JSON.parse(localStorage.getItem('ieltsProgress')) || this.userProgress;
            
            if (category === 'vocabulary' && action === 'known') {
                progress.users.default.vocabulary.learnedWords.push(data.word);
                progress.users.default.vocabulary.todayLearned++;
            }
            
            localStorage.setItem('ieltsProgress', JSON.stringify(progress));
            this.updateDashboard();
        } catch (error) {
            console.error('保存进度失败:', error);
        }
    }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new IELTSApp();
});
