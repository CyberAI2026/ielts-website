// 雅思学习平台 - 修复版
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== 网站初始化开始 ===');
    
    // 获取所有导航项和内容区域
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    console.log('导航项数量:', navItems.length);
    console.log('内容区域数量:', sections.length);
    
    // 检查每个导航项
    navItems.forEach((item, index) => {
        const sectionName = item.dataset.section;
        console.log(`导航项${index}: ${sectionName}`);
        
        // 添加点击事件
        item.onclick = function(e) {
            e.preventDefault();
            console.log('点击:', sectionName);
            
            // 移除所有active
            navItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // 添加active到当前项
            this.classList.add('active');
            
            // 显示对应section
            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                targetSection.classList.add('active');
                console.log('已显示:', sectionName);
            } else {
                console.error('找不到section:', sectionName);
            }
        };
    });
    
    // 加载数据
    loadData();
    
    console.log('=== 网站初始化完成 ===');
});

// 加载数据函数
async function loadData() {
    try {
        // 加载词汇
        const vocabResponse = await fetch('data/vocabulary.json');
        const vocabData = await vocabResponse.json();
        console.log('词汇加载成功:', vocabData.words.length, '个单词');
        
        // 加载听力
        const listeningResponse = await fetch('data/listening.json');
        const listeningData = await listeningResponse.json();
        console.log('听力加载成功:', listeningData.exercises.length, '个练习');
        
        // 加载练习
        const practiceResponse = await fetch('data/practice.json');
        const practiceData = await practiceResponse.json();
        console.log('练习加载成功:', practiceData.exercises.length, '道题');
        
        // 渲染内容
        renderVocabulary(vocabData.words);
        renderListening(listeningData.exercises);
        renderPractice(practiceData.exercises);
        
    } catch (error) {
        console.error('加载数据失败:', error);
    }
}

// 渲染词汇
function renderVocabulary(words) {
    const container = document.getElementById('vocabulary');
    if (!container) return;
    
    let index = 0;
    
    function showWord(i) {
        const word = words[i];
        container.innerHTML = `
            <div class="vocab-container">
                <div class="vocab-card">
                    <div class="word-header">
                        <div class="word" id="wordText">${word.word}</div>
                        <div class="phonetic" id="wordPhonetic">${word.phonetic}</div>
                    </div>
                    <div class="word-meaning" id="wordMeaning">${word.meaning}</div>
                    <div class="word-example" id="wordExample">${word.example}</div>
                    <div class="word-actions">
                        <button class="btn btn-primary" onclick="prevWord()">上一个</button>
                        <button class="btn btn-audio" onclick="playWord('${word.word}')">🔊 发音</button>
                        <button class="btn btn-primary" onclick="nextWord()">下一个</button>
                    </div>
                    <div style="margin-top: 1rem; color: #667eea; font-weight: bold;">
                        ${i + 1} / ${words.length}
                    </div>
                </div>
            </div>
        `;
    }
    
    window.prevWord = function() {
        if (index > 0) {
            index--;
            showWord(index);
        }
    };
    
    window.nextWord = function() {
        if (index < words.length - 1) {
            index++;
            showWord(index);
        }
    };
    
    window.playWord = function(word) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    };
    
    showWord(0);
}

// 渲染听力
function renderListening(exercises) {
    const container = document.getElementById('listening');
    if (!container) return;
    
    let html = '<div class="exercise-list">';
    exercises.forEach(exercise => {
        html += `
            <div class="exercise-item">
                <h4>${exercise.title}</h4>
                <div class="exercise-meta">
                    <span class="difficulty ${exercise.difficulty}">${exercise.difficulty}</span>
                    <span>⏱️ ${exercise.duration}</span>
                    <span>📝 ${exercise.questions ? exercise.questions.length : 0} 题</span>
                </div>
                <div style="margin-top: 1rem; padding: 1rem; background: #f9f9f9; border-radius: 8px;">
                    <strong>原文：</strong><br>
                    ${exercise.transcript || '暂无原文'}
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// 渲染练习
function renderPractice(exercises) {
    const container = document.getElementById('practice');
    if (!container) return;
    
    let html = '<div class="exercise-list">';
    exercises.forEach(exercise => {
        html += `
            <div class="exercise-item">
                <h4>${exercise.title}</h4>
                <div class="exercise-meta">
                    <span class="difficulty ${exercise.difficulty}">${exercise.difficulty}</span>
                    <span>📝 ${exercise.type}</span>
                </div>
                ${exercise.passage ? `<div style="margin-top: 1rem; padding: 1rem; background: #f9f9f9; border-radius: 8px;"><strong>文章：</strong><br>${exercise.passage}</div>` : ''}
                ${exercise.prompt ? `<div style="margin-top: 1rem; padding: 1rem; background: #f9f9f9; border-radius: 8px;"><strong>题目：</strong><br>${exercise.prompt}</div>` : ''}
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}