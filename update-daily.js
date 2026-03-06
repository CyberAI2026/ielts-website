#!/usr/bin/env node

/**
 * 雅思学习网站 - 每日自动更新脚本
 * 功能：
 * 1. 更新每日单词
 * 2. 更新听力练习
 * 3. 更新练习题
 * 4. 清理过期数据
 * 5. 生成学习报告
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
    dataDir: path.join(__dirname, 'data'),
    vocabularyFile: 'vocabulary.json',
    listeningFile: 'listening.json',
    practiceFile: 'practice.json',
    userProgressFile: 'userProgress.json',
    dailyWordCount: 10,
    backupDays: 30
};

// 词库（扩展示例）
const WORD_BANK = [
    { word: 'abandon', phonetic: '/əˈbændən/', meaning: 'v. 放弃，抛弃', example: 'He decided to abandon the project.', difficulty: 'easy', category: 'academic' },
    { word: 'ability', phonetic: '/əˈbɪləti/', meaning: 'n. 能力，才能', example: 'She has the ability to learn quickly.', difficulty: 'easy', category: 'academic' },
    { word: 'abnormal', phonetic: '/æbˈnɔːrml/', meaning: 'adj. 异常的', example: 'The test results were abnormal.', difficulty: 'medium', category: 'academic' },
    { word: 'aboard', phonetic: '/əˈbɔːrd/', meaning: 'adv. 在船 (车) 上', example: 'Welcome aboard the flight.', difficulty: 'easy', category: 'daily' },
    { word: 'absolute', phonetic: '/ˈæbsəluːt/', meaning: 'adj. 绝对的', example: 'I have absolute confidence in you.', difficulty: 'medium', category: 'academic' },
    { word: 'absorb', phonetic: '/əbˈzɔːrb/', meaning: 'v. 吸收', example: 'Plants absorb sunlight.', difficulty: 'medium', category: 'academic' },
    { word: 'abstract', phonetic: '/ˈæbstrækt/', meaning: 'adj. 抽象的', example: 'This is an abstract concept.', difficulty: 'hard', category: 'academic' },
    { word: 'abundant', phonetic: '/əˈbʌndənt/', meaning: 'adj. 丰富的', example: 'We have abundant evidence.', difficulty: 'hard', category: 'academic' },
    { word: 'academic', phonetic: '/ˌækəˈdemɪk/', meaning: 'adj. 学术的', example: 'She has excellent academic records.', difficulty: 'easy', category: 'academic' },
    { word: 'accelerate', phonetic: '/əkˈseləreɪt/', meaning: 'v. 加速', example: 'The car accelerated quickly.', difficulty: 'medium', category: 'academic' },
    { word: 'access', phonetic: '/ˈækses/', meaning: 'n. 进入，使用权', example: 'Students have access to the library.', difficulty: 'easy', category: 'daily' },
    { word: 'accommodate', phonetic: '/əˈkɑːmədeɪt/', meaning: 'v. 容纳，适应', example: 'The hotel can accommodate 500 guests.', difficulty: 'hard', category: 'academic' },
    { word: 'accomplish', phonetic: '/əˈkɑːmplɪʃ/', meaning: 'v. 完成，实现', example: 'She accomplished her goal.', difficulty: 'medium', category: 'academic' },
    { word: 'accurate', phonetic: '/ˈækjərət/', meaning: 'adj. 准确的', example: 'The measurements were accurate.', difficulty: 'medium', category: 'academic' },
    { word: 'achieve', phonetic: '/əˈtʃiːv/', meaning: 'v. 实现，达到', example: 'He achieved success through hard work.', difficulty: 'easy', category: 'academic' }
];

// 听力练习库
const LISTENING_BANK = [
    {
        title: '日常对话 - 餐厅点餐',
        audioUrl: 'audio/daily_01.mp3',
        duration: '2:30',
        difficulty: 'easy',
        category: 'daily',
        questions: [
            { type: 'multiple_choice', question: 'Where does this conversation take place?', options: ['A. At a hotel', 'B. At a restaurant', 'C. At a shop'], answer: 'B' }
        ],
        transcript: 'Waiter: Good evening, welcome to our restaurant. Table for two?\nCustomer: Yes, please.'
    },
    {
        title: '学术讲座 - 环境保护',
        audioUrl: 'audio/academic_01.mp3',
        duration: '4:15',
        difficulty: 'hard',
        category: 'academic',
        questions: [
            { type: 'multiple_choice', question: 'What is the main topic?', options: ['A. Water pollution', 'B. Air quality', 'C. Climate change'], answer: 'C' }
        ],
        transcript: 'Good morning, today we will discuss climate change and its impacts...'
    },
    {
        title: '校园生活 - 图书馆服务',
        audioUrl: 'audio/campus_01.mp3',
        duration: '3:00',
        difficulty: 'medium',
        category: 'campus',
        questions: [
            { type: 'multiple_choice', question: 'When does the library close?', options: ['A. 5 PM', 'B. 7 PM', 'C. 9 PM'], answer: 'B' }
        ],
        transcript: 'Welcome to the university library. Let me tell you about our services...'
    }
];

// 练习题库
const PRACTICE_BANK = [
    {
        type: 'reading',
        title: '阅读理解 - 科技发展',
        difficulty: 'medium',
        category: 'academic',
        passage: 'Technology has revolutionized the way we communicate and work...',
        questions: [
            { id: '1a', type: 'multiple_choice', question: 'What is the main idea?', options: ['A. Technology is dangerous', 'B. Technology has transformed communication', 'C. AI will replace humans'], answer: 'B' }
        ]
    },
    {
        type: 'writing',
        title: '写作任务 - 教育话题',
        difficulty: 'hard',
        category: 'academic',
        task: 'Some people believe that university education should be free. To what extent do you agree?',
        requirements: { wordCount: 250, timeLimit: 40 }
    },
    {
        type: 'speaking',
        title: '口语练习 - 个人经历',
        difficulty: 'easy',
        category: 'daily',
        questions: [
            { part: 1, question: 'Tell me about your hometown.', followUp: ['What do you like about it?'] }
        ]
    }
];

class DailyUpdater {
    constructor() {
        this.today = new Date().toISOString().split('T')[0];
        console.log(`\n🚀 开始每日更新 - ${this.today}\n`);
    }
    
    // 读取 JSON 文件
    readJSON(filename) {
        const filepath = path.join(CONFIG.dataDir, filename);
        if (!fs.existsSync(filepath)) {
            return null;
        }
        const content = fs.readFileSync(filepath, 'utf-8');
        return JSON.parse(content);
    }
    
    // 写入 JSON 文件
    writeJSON(filename, data) {
        const filepath = path.join(CONFIG.dataDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`✅ 已更新：${filename}`);
    }
    
    // 更新每日单词
    updateVocabulary() {
        console.log('📚 更新每日单词...');
        
        // 随机选择今日单词
        const shuffled = [...WORD_BANK].sort(() => 0.5 - Math.random());
        const todayWords = shuffled.slice(0, CONFIG.dailyWordCount);
        
        const vocabData = {
            words: todayWords,
            lastUpdate: this.today,
            totalWords: todayWords.length
        };
        
        this.writeJSON(CONFIG.vocabularyFile, vocabData);
        console.log(`   已加载 ${todayWords.length} 个单词\n`);
    }
    
    // 更新听力练习
    updateListening() {
        console.log('🎧 更新听力练习...');
        
        const listeningData = {
            exercises: LISTENING_BANK,
            lastUpdate: this.today,
            totalExercises: LISTENING_BANK.length
        };
        
        this.writeJSON(CONFIG.listeningFile, listeningData);
        console.log(`   已加载 ${LISTENING_BANK.length} 个练习\n`);
    }
    
    // 更新练习题
    updatePractice() {
        console.log('✍️ 更新练习题...');
        
        const practiceData = {
            exercises: PRACTICE_BANK,
            lastUpdate: this.today,
            totalExercises: PRACTICE_BANK.length
        };
        
        this.writeJSON(CONFIG.practiceFile, practiceData);
        console.log(`   已加载 ${PRACTICE_BANK.length} 个练习\n`);
    }
    
    // 更新用户进度
    updateUserProgress() {
        console.log('📊 更新用户进度...');
        
        let progress = this.readJSON(CONFIG.userProgressFile);
        
        if (!progress) {
            progress = {
                users: {
                    default: {
                        userId: 'default',
                        name: '学习者',
                        createdAt: this.today,
                        totalStudyDays: 0,
                        currentStreak: 0,
                        longestStreak: 0,
                        lastStudyDate: null,
                        vocabulary: { learnedWords: [], masteredWords: [], reviewQueue: [], dailyGoal: 10, todayLearned: 0 },
                        listening: { completedExercises: [], totalMinutes: 0, averageScore: 0, weakAreas: [] },
                        practice: { completedExercises: [], scores: { reading: [], writing: [], speaking: [] }, averageScore: 0 },
                        statistics: { totalWordsLearned: 0, totalListeningMinutes: 0, totalExercisesCompleted: 0, weeklyActivity: [] }
                    }
                },
                system: { lastDailyUpdate: this.today, nextUpdateScheduled: this.getNextDay(), version: '1.0.0' }
            };
        }
        
        // 检查是否为新的一天
        if (progress.system.lastDailyUpdate !== this.today) {
            // 重置每日计数
            progress.users.default.vocabulary.todayLearned = 0;
            progress.system.lastDailyUpdate = this.today;
            progress.system.nextUpdateScheduled = this.getNextDay();
            
            // 更新学习天数
            progress.users.default.totalStudyDays++;
            
            // 更新连续学习
            const yesterday = this.getYesterday();
            if (progress.users.default.lastStudyDate === yesterday) {
                progress.users.default.currentStreak++;
            } else {
                progress.users.default.currentStreak = 1;
            }
            progress.users.default.lastStudyDate = this.today;
            
            // 更新最长连续
            if (progress.users.default.currentStreak > progress.users.default.longestStreak) {
                progress.users.default.longestStreak = progress.users.default.currentStreak;
            }
            
            console.log('   已更新学习天数和连续记录');
        }
        
        this.writeJSON(CONFIG.userProgressFile, progress);
    }
    
    // 获取昨天日期
    getYesterday() {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    }
    
    // 获取明天日期
    getNextDay() {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date.toISOString().split('T')[0];
    }
    
    // 生成学习报告
    generateReport() {
        console.log('📈 生成学习报告...');
        
        const progress = this.readJSON(CONFIG.userProgressFile);
        if (!progress) return;
        
        const user = progress.users.default;
        const report = `
╔══════════════════════════════════════════════════╗
║           雅思学习平台 - 学习报告                ║
╠══════════════════════════════════════════════════╣
║ 日期：${this.today}                                
║                                                  
║ 📊 学习统计：                                    
║   总学习天数：${user.totalStudyDays}天                  
║   连续学习：${user.currentStreak}天 (最长：${user.longestStreak}天)       
║                                                  
║ 📚 词汇学习：                                    
║   已学单词：${user.vocabulary.learnedWords.length}个                   
║   今日目标：${user.vocabulary.dailyGoal}个 (已完成：${user.vocabulary.todayLearned}个)     
║                                                  
║ 🎧 听力训练：                                    
║   总时长：${user.listening.totalMinutes}分钟                   
║   完成练习：${user.listening.completedExercises.length}个                    
║                                                  
║ ✍️ 练习完成：                                    
║   总完成：${user.practice.completedExercises.length}个                      
║   平均得分：${user.practice.averageScore}%                    
║                                                  
║ 💪 继续加油！坚持就是胜利！                       
╚══════════════════════════════════════════════════╝
        `;
        
        console.log(report);
        
        // 保存报告到文件
        const reportPath = path.join(CONFIG.dataDir, `report_${this.today}.txt`);
        fs.writeFileSync(reportPath, report, 'utf-8');
        console.log(`✅ 报告已保存：${reportPath}\n`);
    }
    
    // 执行所有更新
    run() {
        try {
            this.updateVocabulary();
            this.updateListening();
            this.updatePractice();
            this.updateUserProgress();
            this.generateReport();
            
            console.log('✨ 每日更新完成！\n');
        } catch (error) {
            console.error('❌ 更新失败:', error);
            process.exit(1);
        }
    }
}

// 运行更新
const updater = new DailyUpdater();
updater.run();
