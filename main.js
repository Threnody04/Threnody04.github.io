/* =========================================
   全局交互逻辑 (main.js)
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
            
    // -----------------------------------------
    // 1. 导航栏缩小与回到顶部逻辑
    // -----------------------------------------
    const nav = document.getElementById('mainNav');
    
    // 增加一个安全检查，确保页面上有导航栏才执行
    if (nav) {
        window.addEventListener('scroll', () => {
            // 如果向下滚动超过 150px，缩小导航栏
            if (window.scrollY > 150) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }
        });

        // 点击缩小的导航栏（箭头）回到顶部
        nav.addEventListener('click', () => {
            if (nav.classList.contains('nav-scrolled')) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth' // 丝滑滚动
                });
            }
        });
    }

    // -----------------------------------------
    // 2. 页面元素依次浮入逻辑 (Intersection Observer)
    // -----------------------------------------
    // 挑选需要浮入效果的元素（增加了个人简介文字、工具徽章等）
    const elementsToAnimate = document.querySelectorAll(
        '.hero-content > *, .glass-card, .section-title, .section-subtitle, .timeline-item, .profile-text > *, .tool-pill'
    );

    // 先给它们都加上等待浮入的初始 CSS 类
    elementsToAnimate.forEach(el => el.classList.add('fade-up-element'));

    let delayCounter = 0; // 用于控制“依次”的延迟时间

    // 监视器，监视元素是否出现在了屏幕内
    const observer = new IntersectionObserver((entries) => {
        let hasIntersecting = false; // 标记这一批次是否有进入视野的元素

        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                hasIntersecting = true;
                // 根据顺序计算延迟时间，产生依次浮入的效果
                setTimeout(() => {
                    entry.target.classList.add('in-view');
                }, delayCounter * 100); // 每个元素间隔 0.1 秒 (100ms)
                
                delayCounter++;
                observer.unobserve(entry.target); // 动画只执行一次，之后不再监视
            }
        });
        
        // 这一批次的元素都安排完延迟后，将计数器清零，方便下一滑动批次重新从 0 开始计算延迟
        if (hasIntersecting) {
            setTimeout(() => { delayCounter = 0; }, 50);
        }
        
    }, { 
        threshold: 0.1, // 元素露出 10% 就开始触发动画
        rootMargin: "0px 0px -50px 0px" // 底部收缩50px，稍微提前一点触发
    });

    // 让监视器开始监视所有选中的元素
    elementsToAnimate.forEach(el => observer.observe(el));
});

// -----------------------------------------
// 3. 作品弹窗 (Modal) 控制逻辑
// -----------------------------------------

// 打开弹窗函数（可以在这里接收参数，用来替换弹窗里的标题和图片）
function openModal(projectId) {
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modal-title');

    // 如果你有真实的数据库或对象，这里可以根据 projectId 动态替换内容
    if (projectId === 'project1') {
        modalTitle.innerText = "金融类 App 概念设计";
    } else if (projectId === 'project2') {
        modalTitle.innerText = "SaaS 数据看板系统";
    }

    // 给 body 加个样式，防止底层网页跟着一起滚动
    document.body.style.overflow = 'hidden';

    // 激活弹窗动画
    modal.classList.add('active');
}

// 关闭弹窗函数
function closeModal() {
    const modal = document.getElementById('projectModal');

    // 恢复 body 的滚动
    document.body.style.overflow = 'auto';

    // 移除弹窗动画类名
    modal.classList.remove('active');
}

// 点击背景遮罩处也能关闭弹窗
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            // 如果点击的正是暗色遮罩背景本身（而不是中间的白卡片），则关闭
            if (e.target === modal) {
                closeModal();
            }
        });
    }
});
// -----------------------------------------
// 4. 作品分类二级页面切换逻辑 (SPA 效果)
// -----------------------------------------

function openCategory(catId, title, desc) {
    const mainView = document.getElementById('portfolio-main');
    const catView = document.getElementById('portfolio-category');

    // 1. 让大厅视图淡出缩小
    mainView.classList.add('view-out');

    // 等待淡出动画结束 (400ms)
    setTimeout(() => {
        mainView.style.display = 'none'; // 彻底隐藏大厅

        // 2. 更新二级页面的标题和描述
        document.getElementById('cat-title').innerText = title;
        document.getElementById('cat-desc').innerText = desc;

        // 3. 隐藏所有分类的瀑布流，只显示被点击的那个
        document.querySelectorAll('.cat-grid').forEach(grid => {
            grid.style.display = 'none';
        });
        document.getElementById('grid-' + catId).style.display = 'grid';

        // 4. 重置新视图中元素的浮入动画状态（关键步骤！）
        // 这样每次进入分类页，卡片都会重新优雅地浮出来
        const newElements = catView.querySelectorAll('.fade-up-element');
        newElements.forEach(el => el.classList.remove('in-view'));

        // 5. 准备显示二级页面
        catView.style.display = 'block';
        catView.classList.add('view-in-start');

        // 强制浏览器重绘
        void catView.offsetWidth;

        // 移除初始进场状态，使其恢复原位并展现
        catView.classList.remove('view-in-start');

        // 滚回顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 重新触发浮入动画观察器（利用之前写好的 observer 逻辑的机制）
        setTimeout(() => {
            newElements.forEach(el => el.classList.add('in-view'));
        }, 100);

    }, 400);
}

// 返回大厅的逻辑（与进入逻辑正好相反）
function backToMain() {
    const mainView = document.getElementById('portfolio-main');
    const catView = document.getElementById('portfolio-category');

    catView.classList.add('view-out');

    setTimeout(() => {
        catView.style.display = 'none';
        catView.classList.remove('view-out');

        mainView.style.display = 'block';
        mainView.classList.add('view-in-start');

        void mainView.offsetWidth;

        mainView.classList.remove('view-in-start');
        mainView.classList.remove('view-out'); // 清除之前留下的状态
        window.scrollTo({ top: 0, behavior: 'smooth' });

    }, 400);
}