# 雅思学习平台 - 安装与配置指南

## 📦 快速开始

### 1. 启动网站

```bash
# 方式 1: 使用启动脚本（推荐）
cd /Users/prof.shen/.openclaw/workspace/ielts-website
./start.sh

# 方式 2: 直接使用浏览器打开
open index.html

# 方式 3: 使用 Python 简单服务器
cd /Users/prof.shen/.openclaw/workspace/ielts-website
python3 -m http.server 8000
# 访问 http://localhost:8000
```

### 2. 设置每日自动更新

#### macOS/Linux - 使用 cron

```bash
# 1. 编辑 crontab
crontab -e

# 2. 添加以下行（每日凌晨 0 点执行）
0 0 * * * cd /Users/prof.shen/.openclaw/workspace/ielts-website && node update-daily.js

# 3. 保存并退出
```

#### 验证 cron 任务

```bash
# 查看已设置的 cron 任务
crontab -l

# 查看 cron 日志（macOS）
grep CRON /var/log/system.log
```

### 3. 手动更新内容

```bash
cd /Users/prof.shen/.openclaw/workspace/ielts-website
node update-daily.js
```

## 📁 文件结构

```
ielts-website/
├── index.html              # 主页面
├── start.sh                # 启动脚本
├── update-daily.js         # 每日更新脚本
├── README.md               # 项目说明
├── INSTALL.md              # 安装指南（本文件）
├── css/
│   └── style.css          # 样式
├── js/
│   └── app.js             # 应用逻辑
└── data/
    ├── vocabulary.json    # 词汇数据
    ├── listening.json     # 听力数据
    ├── practice.json      # 练习数据
    ├── userProgress.json  # 用户进度
    └── report_*.txt       # 学习报告
```

## 🔧 自定义内容

### 添加新单词

编辑 `update-daily.js` 中的 `WORD_BANK` 数组：

```javascript
const WORD_BANK = [
    // ... 现有单词
    { 
        word: 'newword', 
        phonetic: '/ˈnjuːwɜːrd/', 
        meaning: 'n. 新词', 
        example: 'This is a new word.', 
        difficulty: 'medium', 
        category: 'academic' 
    }
];
```

### 添加听力练习

编辑 `update-daily.js` 中的 `LISTENING_BANK` 数组：

```javascript
const LISTENING_BANK = [
    // ... 现有练习
    {
        title: '新听力练习',
        audioUrl: 'audio/new_01.mp3',
        duration: '3:00',
        difficulty: 'medium',
        category: 'academic',
        questions: [...],
        transcript: '...'
    }
];
```

### 添加练习题

编辑 `update-daily.js` 中的 `PRACTICE_BANK` 数组。

## 📊 查看学习数据

### 查看用户进度

```bash
# 使用 jq 格式化查看（需安装 jq）
cat data/userProgress.json | jq

# 或直接查看
cat data/userProgress.json
```

### 查看学习报告

```bash
# 查看今日报告
cat data/report_$(date +%Y-%m-%d).txt

# 查看所有报告
ls -la data/report_*.txt
```

## 🐛 故障排除

### 问题 1: 网站无法打开

**解决方案**:
```bash
# 检查文件是否存在
ls -la index.html

# 检查端口是否被占用
lsof -i :3000
lsof -i :8000

# 更换端口
npx serve . -p 8080
```

### 问题 2: 自动更新未执行

**解决方案**:
```bash
# 检查 cron 是否运行
sudo systemctl status cron  # Linux
sudo launchctl list | grep cron  # macOS

# 手动测试更新脚本
cd /Users/prof.shen/.openclaw/workspace/ielts-website
node update-daily.js

# 检查 cron 日志
tail -f /var/log/system.log | grep CRON  # macOS
tail -f /var/log/cron.log  # Linux
```

### 问题 3: 数据不更新

**解决方案**:
```bash
# 删除旧数据文件（会重置进度）
rm data/*.json

# 重新运行更新
node update-daily.js
```

### 问题 4: 浏览器缓存问题

**解决方案**:
- 强制刷新：Cmd+Shift+R (macOS) 或 Ctrl+Shift+R (Windows/Linux)
- 清除浏览器缓存
- 使用无痕模式打开

## 📱 移动端使用

网站采用响应式设计，可在移动设备上使用：

1. 在电脑上启动服务器
2. 确保手机和电脑在同一 WiFi 网络
3. 获取电脑 IP 地址：
   ```bash
   ipconfig getifaddr en0  # macOS
   ```
4. 在手机浏览器访问：`http://[电脑IP]:3000`

## 🔐 数据备份

### 备份所有数据

```bash
# 创建备份目录
mkdir -p ~/ielts-backup

# 备份数据文件
cp -r /Users/prof.shen/.openclaw/workspace/ielts-website/data ~/ielts-backup/data-$(date +%Y%m%d)

# 查看备份
ls -la ~/ielts-backup/
```

### 恢复数据

```bash
# 恢复特定日期的备份
cp -r ~/ielts-backup/data-20260306/* /Users/prof.shen/.openclaw/workspace/ielts-website/data/
```

## 📈 性能优化

### 启用浏览器缓存

在 `index.html` 的 `<head>` 中添加：

```html
<meta http-equiv="Cache-Control" content="max-age=86400">
```

### 压缩资源

```bash
# 安装 terser（JS 压缩）
npm install -g terser

# 压缩 JS 文件
terser js/app.js -o js/app.min.js
```

## 🎓 使用技巧

1. **每日学习流程**:
   - 打开网站 → 查看学习概览
   - 完成每日单词（10 个）
   - 完成 1 个听力练习
   - 完成 1 套练习题
   - 查看学习统计

2. **提高学习效率**:
   - 固定时间学习（建议早晨）
   - 保持连续学习天数
   - 定期复习不认识的单词
   - 根据统计调整学习重点

3. **数据追踪**:
   - 每周查看学习报告
   - 关注连续学习天数
   - 分析薄弱环节

## 📞 技术支持

如有问题，请检查：
1. README.md - 项目说明
2. INSTALL.md - 安装指南
3. 数据文件 - 确保 JSON 格式正确
4. 浏览器控制台 - 查看错误信息

---

**版本**: 1.0.0  
**更新日期**: 2026-03-06  
**技术负责人**: 李逵
