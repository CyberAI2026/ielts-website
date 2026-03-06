// 雅思学习平台 - 诊断脚本
console.log('=== 诊断开始 ===');

// 检查DOM元素
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded 事件触发');
    
    // 检查导航项
    const navItems = document.querySelectorAll('.nav-item');
    console.log('导航项数量:', navItems.length);
    
    // 检查内容区域
    const sections = document.querySelectorAll('.content-section');
    console.log('内容区域数量:', sections.length);
    
    // 手动添加事件监听
    navItems.forEach((item, index) => {
        console.log(`导航项${index}:`, item.dataset.section);
        item.addEventListener('click', function(e) {
            console.log('点击导航项:', this.dataset.section);
            
            // 移除所有active
            navItems.forEach(i => i.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // 添加active
            this.classList.add('active');
            const targetSection = document.getElementById(this.dataset.section);
            if (targetSection) {
                targetSection.classList.add('active');
                console.log('显示section:', this.dataset.section);
            } else {
                console.error('找不到section:', this.dataset.section);
            }
        });
    });
    
    console.log('=== 诊断完成 ===');
});