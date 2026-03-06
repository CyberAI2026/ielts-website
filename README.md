# 雅思学习平台 - 架构设计文档

## 📋 项目概述

这是一个基于静态 HTML/CSS/JavaScript 的雅思学习网站，具有每日自动更新功能和本地 JSON 数据存储。

## 🏗️ 网站架构

```
ielts-website/
├── index.html              # 主页面（单页应用）
├── css/
│   └── style.css          # 样式文件
├── js/
│   └── app.js             # 应用程序逻辑
├── data/
│   ├── vocabulary.json    # 每日单词数据
│   ├── listening.json     # 听力练习数据
│   ├── practice.json      # 练习题数据
│   └── userProgress.json  # 用户学习进度
└── update-daily.js        # 每日自动更新脚本
```

## 🎯 功能模块

### 1. 每日单词（妙玉提供）
- **数据来源**: `data/vocabulary.json`
- **功能**:
  - 每日推送 10 个雅思核心词汇
  - 显示单词、音标、释义、例句
  - 支持标记"认识"/"不认识"
  - 语音播放功能（浏览器 TTS）
  - 学习进度追踪

### 2. 听力训练（晴雯提供）
- **数据来源**: `data/listening.json`
- **功能**:
  - 多种场景听力练习（日常、学术、校园）
  - 难度分级（简单/中等/困难）
  - 在线音频播放
  - 听力原文显示
  - 配套练习题（选择、填空、判断）
  - 自动批改

### 3. 雅思练习题（王熙凤提供）
- **数据来源**: `data/practice.json`
- **功能**:
  - 阅读理解练习
  - 写作任务（带字数和时间要求）
  - 口语练习题目
  - 答题记录和分数统计

## 📊 数据 JSON 结构

### vocabulary.json
```json
{
  "words": [
    {
      "id": 1,
      "word": "abandon",
      "phonetic": "/əˈbændən/",
      "meaning": "v. 放弃，抛弃",
      "example": "He decided to abandon the project.",
      "difficulty": "easy",
      "category": "academic"
    }
  ],
  "lastUpdate": "2026-03-06",
  "totalWords": 10
}
```

### listening.json
```json
{
  "exercises": [
    {
      "id": 1,
      "title": "日常对话 - 餐厅点餐",
      "audioUrl": "audio/daily_01.mp3",
      "duration": "2:30",
      "difficulty": "easy",
      "category": "daily",
      "questions": [
        {
          "type": "multiple_choice",
          "question": "Where does this conversation take place?",
          "options": ["A. At a hotel", "B. At a restaurant", "C. At a shop"],
          "answer": "B"
        }
      ],
      "transcript": "对话原文..."
    }
  ],
  "lastUpdate": "2026-03-06",
  "totalExercises": 3
}
```

### practice.json
```json
{
  "exercises": [
    {
      "id": 1,
      "type": "reading",
      "title": "阅读理解 - 科技发展",
      "difficulty": "medium",
      "category": "academic",
      "passage": "文章段落...",
      "questions": [...]
    },
    {
      "id": 2,
      "type": "writing",
      "title": "写作任务 - 教育话题",
      "difficulty": "hard",
      "task": "题目描述...",
      "requirements": {
        "wordCount": 250,
        "timeLimit": 40
      }
    }
  ],
  "lastUpdate": "2026-03-06",
  "totalExercises": 4
}
```

### userProgress.json
```json
{
  "users": {
    "default": {
      "userId": "default",
      "name": "学习者",
      "createdAt": "2026-03-06",
      "totalStudyDays": 0,
      "currentStreak": 0,
      "longestStreak": 0,
      "lastStudyDate": null,
      "vocabulary": {
        "learnedWords": [],
        "masteredWords": [],
        "reviewQueue": [],
        "dailyGoal": 10,
        "todayLearned": 0
      },
      "listening": {
        "completedExercises": [],
        "totalMinutes": 0,
        "averageScore": 0,
        "weakAreas": []
      },
      "practice": {
        "completedExercises": [],
        "scores": {
          "reading": [],
          "writing": [],
          "speaking": []
        },
        "averageScore": 0
      }
    }
  },
  "system": {
    "lastDailyUpdate": "2026-03-06",
    "nextUpdateScheduled": "2026-03-07 00:00:00",
    "version": "1.0.0"
  }
}
```

## ⚙️ 自动更新机制

### 更新脚本：`update-daily.js`

**执行方式**:
```bash
# 手动执行
node update-daily.js

# 设置每日凌晨自动执行（crontab）
0 0 * * * cd /path/to/ielts-website && node update-daily.js
```

**更新流程**:
1. **读取词库** - 从内置词库随机选择 10 个单词
2. **更新词汇文件** - 写入 `vocabulary.json`
3. **更新听力文件** - 写入 `listening.json`
4. **更新练习文件** - 写入 `practice.json`
5. **更新用户进度** - 重置每日计数，更新连续学习天数
6. **生成学习报告** - 输出文本报告到 `data/report_YYYY-MM-DD.txt`

**定时任务设置**:

#### macOS/Linux (cron)
```bash
# 编辑 crontab
crontab -e

# 添加每日凌晨 0 点执行
0 0 * * * cd /Users/prof.shen/.openclaw/workspace/ielts-website && node update-daily.js
```

#### Windows (Task Scheduler)
1. 打开"任务计划程序"
2. 创建基本任务
3. 设置触发器：每天 00:00
4. 设置操作：启动程序 `node.exe`，参数 `update-daily.js`

### 智能内容推荐

基于用户数据，第二天内容会动态调整：

```javascript
// 伪代码示例
function generateNextDayContent(userProgress) {
    // 分析薄弱环节
    const weakAreas = analyzeWeakAreas(userProgress);
    
    // 调整难度
    const difficulty = calculateOptimalDifficulty(userProgress);
    
    // 生成个性化内容
    return {
        vocabulary: selectWordsByCategory(weakAreas, difficulty),
        listening: selectExercisesByWeakAreas(weakAreas),
        practice: selectPracticeByPerformance(userProgress)
    };
}
```

## 🎨 用户界面

### 设计特点
- **渐变紫色主题** - 现代、专业
- **响应式布局** - 支持手机、平板、桌面
- **侧边导航** - 快速切换功能模块
- **卡片式设计** - 清晰的信息层级
- **动画效果** - 流畅的交互体验

### 主要页面
1. **学习概览** - 统计卡片、今日任务
2. **每日单词** - 单词卡片、学习控制
3. **听力训练** - 练习列表、音频播放器
4. **练习题** - 题目列表、答题界面
5. **学习统计** - 图表展示（可扩展）

## 🚀 使用方法

### 启动网站
```bash
# 方式 1: 直接打开
open index.html

# 方式 2: 使用本地服务器（推荐）
npx serve .
# 或
python3 -m http.server 8000
```

### 设置自动更新
```bash
# 添加 cron 任务
crontab -e
0 0 * * * cd /Users/prof.shen/.openclaw/workspace/ielts-website && node update-daily.js
```

### 查看学习报告
```bash
# 查看今日报告
cat data/report_$(date +%Y-%m-%d).txt
```

## 📈 扩展建议

### 短期优化
1. 添加更多词汇和练习题
2. 实现完整的答题批改逻辑
3. 添加图表库（Chart.js）展示统计
4. 支持多用户账户

### 长期规划
1. 后端 API 支持（Node.js + Express）
2. 数据库存储（MongoDB/PostgreSQL）
3. 用户认证系统
4. 移动端 App（React Native）
5. AI 智能推荐算法

## 🔒 安全与隐私

- 所有数据存储在本地
- 无需网络连接即可使用
- 不收集用户个人信息
- 适合离线学习

---

**版本**: 1.0.0  
**创建日期**: 2026-03-06  
**技术栈**: HTML5 + CSS3 + JavaScript (ES6+)  
**角色分配**: 
- 词汇内容：妙玉
- 听力内容：晴雯
- 练习内容：王熙凤
- 技术开发：李逵
