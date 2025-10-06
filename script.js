// 创建浮动爱心
function createFloatingHearts() {
    const heartsContainer = document.getElementById('floatingHearts');
    const heartCount = 25;
    
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('div');
        heart.classList.add('floating-heart');
        heart.innerHTML = '❤';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDelay = Math.random() * 8 + 's';
        heart.style.fontSize = (Math.random() * 25 + 15) + 'px';
        heart.style.opacity = Math.random() * 0.5 + 0.1;
        heartsContainer.appendChild(heart);
    }
}

// 创建闪烁星星
function createSparkles() {
    const sparklesContainer = document.getElementById('sparkles');
    const sparkleCount = 15;
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        sparkle.style.left = Math.random() * 100 + 'vw';
        sparkle.style.top = Math.random() * 100 + 'vh';
        sparkle.style.animationDelay = Math.random() * 3 + 's';
        sparkle.style.animationDuration = (Math.random() * 2 + 2) + 's';
        sparklesContainer.appendChild(sparkle);
    }
}

// 用户管理
let currentUser = null;
let messages = JSON.parse(localStorage.getItem('messages')) || [];
let memories = JSON.parse(localStorage.getItem('memories')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];

// DOM元素
const loginSection = document.getElementById('loginSection');
const mainSection = document.getElementById('mainSection');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const messageForm = document.getElementById('messageForm');
const memoryForm = document.getElementById('memoryForm');
const messageWall = document.getElementById('messageWall');
const memoryWall = document.getElementById('memoryWall');
const userInfo = document.getElementById('userInfo');
const usernameDisplay = document.getElementById('usernameDisplay');
const userAvatar = document.getElementById('userAvatar');
const logoutBtn = document.getElementById('logoutBtn');
const showRegister = document.getElementById('showRegister');
const showLogin = document.getElementById('showLogin');
const refreshBtn = document.getElementById('refreshBtn');
const aboutBtn = document.getElementById('aboutBtn');
const messageTab = document.getElementById('messageTab');
const memoryTab = document.getElementById('memoryTab');
const messagePane = document.getElementById('messagePane');
const memoryPane = document.getElementById('memoryPane');
const uploadArea = document.getElementById('uploadArea');
const memoryPhoto = document.getElementById('memoryPhoto');
const previewContainer = document.getElementById('previewContainer');
const imagePreview = document.getElementById('imagePreview');
const removePreview = document.getElementById('removePreview');

// 切换登录/注册表单
showRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.remove('active');
    loginForm.classList.add('active');
});

// 标签页切换
function setActiveTab(activeTab) {
    document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    activeTab.classList.add('active');
}

messageTab.addEventListener('click', () => {
    setActiveTab(messageTab);
    messagePane.classList.add('active');
});

memoryTab.addEventListener('click', () => {
    setActiveTab(memoryTab);
    memoryPane.classList.add('active');
});

// 登录处理
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMainSection();
        showSuccess('登录成功！');
    } else {
        showError('用户名或密码错误！');
    }
});

// 注册处理
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showError('两次输入的密码不一致！');
        return;
    }
    
    if (users.find(u => u.username === username)) {
        showError('用户名已存在！');
        return;
    }
    
    if (username.length < 2) {
        showError('用户名至少需要2个字符！');
        return;
    }
    
    if (password.length < 6) {
        showError('密码至少需要6个字符！');
        return;
    }
    
    const newUser = {
        id: Date.now().toString(),
        username,
        password,
        avatarColor: getRandomColor()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    showMainSection();
    
    // 切换回登录表单
    registerForm.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.reset();
    
    showSuccess('注册成功！');
});

// 显示主内容区域
function showMainSection() {
    loginSection.classList.add('hidden');
    mainSection.classList.remove('hidden');
    usernameDisplay.textContent = currentUser.username;
    userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
    userAvatar.style.background = currentUser.avatarColor;
    
    displayMessages();
    displayMemories();
}

// 退出登录
logoutBtn.addEventListener('click', () => {
    currentUser = null;
    localStorage.removeItem('currentUser');
    mainSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    loginForm.reset();
    showSuccess('已退出登录');
});

// 发布留言
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const content = document.getElementById('messageContent').value;
    
    if (content.trim() === '') {
        showError('留言内容不能为空！');
        return;
    }
    
    const newMessage = {
        id: Date.now().toString(),
        userId: currentUser.id,
        username: currentUser.username,
        content: content,
        timestamp: new Date().toLocaleString('zh-CN')
    };
    
    messages.unshift(newMessage);
    localStorage.setItem('messages', JSON.stringify(messages));
    
    displayMessages();
    messageForm.reset();
    
    showSuccess('留言发布成功！');
});

// 显示留言（带删除功能）
function displayMessages() {
    const existingMessages = messageWall.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    if (messages.length === 0) {
        const noMessage = document.createElement('div');
        noMessage.className = 'no-content';
        noMessage.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <div style="font-size: 3rem; margin-bottom: 15px;">💌</div>
                <p>还没有留言，快来写下第一条吧！</p>
            </div>
        `;
        messageWall.appendChild(noMessage);
        return;
    }
    
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        
        // 检查当前用户是否可以删除这条留言
        const canDelete = currentUser && (
            currentUser.id === message.userId || 
            currentUser.username === 'admin'
        );
        
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-user">${escapeHtml(message.username)}</span>
                <div class="message-actions">
                    <span class="message-time">${message.timestamp}</span>
                    ${canDelete ? `<button class="delete-btn" data-message-id="${message.id}">删除</button>` : ''}
                </div>
            </div>
            <div class="message-content">${escapeHtml(message.content)}</div>
        `;
        
        messageWall.appendChild(messageElement);
    });
    
    // 添加删除事件监听
    addMessageDeleteListeners();
}

// 添加留言删除事件监听
function addMessageDeleteListeners() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const messageId = this.getAttribute('data-message-id');
            deleteMessage(messageId);
        });
    });
}

// 删除留言函数
function deleteMessage(messageId) {
    showConfirmDialog('确定要删除这条留言吗？此操作不可恢复！', () => {
        const messageIndex = messages.findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
            messages.splice(messageIndex, 1);
            localStorage.setItem('messages', JSON.stringify(messages));
            displayMessages();
            showSuccess('留言删除成功！');
        }
    });
}

// 上传留念
memoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const description = document.getElementById('memoryDescription').value;
    const file = memoryPhoto.files[0];
    
    if (!file) {
        showError('请选择要上传的照片！');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showError('照片大小不能超过5MB！');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const newMemory = {
            id: Date.now().toString(),
            userId: currentUser.id,
            username: currentUser.username,
            image: e.target.result,
            description: description,
            timestamp: new Date().toLocaleString('zh-CN')
        };
        
        memories.unshift(newMemory);
        localStorage.setItem('memories', JSON.stringify(memories));
        
        displayMemories();
        memoryForm.reset();
        previewContainer.style.display = 'none';
        
        showSuccess('留念上传成功！');
    };
    reader.readAsDataURL(file);
});

// 上传区域交互
uploadArea.addEventListener('click', () => {
    memoryPhoto.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    if (e.dataTransfer.files.length) {
        memoryPhoto.files = e.dataTransfer.files;
        previewImage(e.dataTransfer.files[0]);
    }
});

memoryPhoto.addEventListener('change', (e) => {
    if (e.target.files.length) {
        previewImage(e.target.files[0]);
    }
});

removePreview.addEventListener('click', () => {
    previewContainer.style.display = 'none';
    memoryPhoto.value = '';
});

function previewImage(file) {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            previewContainer.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// 显示留念（带删除功能）
function displayMemories() {
    const memoryGrid = memoryWall.querySelector('.memory-grid') || document.createElement('div');
    memoryGrid.className = 'memory-grid';
    
    // 清空现有内容
    while (memoryGrid.firstChild) {
        memoryGrid.removeChild(memoryGrid.firstChild);
    }
    
    if (memories.length === 0) {
        const noMemory = document.createElement('div');
        noMemory.className = 'no-content';
        noMemory.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <div style="font-size: 3rem; margin-bottom: 15px;">📸</div>
                <p>还没有留念照片，快来上传第一张吧！</p>
            </div>
        `;
        memoryGrid.appendChild(noMemory);
    } else {
        memories.forEach(memory => {
            const memoryElement = document.createElement('div');
            memoryElement.classList.add('memory-item');
            
            // 检查当前用户是否可以删除这条留念
            const canDelete = currentUser && (
                currentUser.id === memory.userId || 
                currentUser.username === 'admin'
            );
            
            memoryElement.innerHTML = `
                <div class="memory-image-container">
                    <img src="${memory.image}" alt="留念照片" class="memory-image">
                    ${canDelete ? `<button class="memory-delete-btn" data-memory-id="${memory.id}">×</button>` : ''}
                </div>
                <div class="memory-content">
                    <div class="memory-user">${escapeHtml(memory.username)}</div>
                    <div class="memory-description">${escapeHtml(memory.description)}</div>
                    <div class="memory-time">${memory.timestamp}</div>
                </div>
            `;
            
            memoryGrid.appendChild(memoryElement);
        });
    }
    
    if (!memoryWall.contains(memoryGrid)) {
        memoryWall.appendChild(memoryGrid);
    }
    
    // 添加留念删除事件监听
    addMemoryDeleteListeners();
}

// 添加留念删除事件监听
function addMemoryDeleteListeners() {
    document.querySelectorAll('.memory-delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const memoryId = this.getAttribute('data-memory-id');
            deleteMemory(memoryId);
        });
    });
}

// 删除留念函数
function deleteMemory(memoryId) {
    showConfirmDialog('确定要删除这张照片吗？此操作不可恢复！', () => {
        const memoryIndex = memories.findIndex(memory => memory.id === memoryId);
        if (memoryIndex !== -1) {
            memories.splice(memoryIndex, 1);
            localStorage.setItem('memories', JSON.stringify(memories));
            displayMemories();
            showSuccess('照片删除成功！');
        }
    });
}

// 刷新功能
refreshBtn.addEventListener('click', () => {
    displayMessages();
    displayMemories();
    
    const originalText = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '🔄 刷新中...';
    refreshBtn.disabled = true;
    
    setTimeout(() => {
        refreshBtn.innerHTML = originalText;
        refreshBtn.disabled = false;
        showSuccess('已刷新！');
    }, 1000);
});

// 关于我们
aboutBtn.addEventListener('click', () => {
    const aboutMessage = `
        💝 爱心留言墙 💝

        这是一个充满爱意的专属空间
        记录我们之间的每一个美好瞬间

        ✨ 功能特色：
        • 💌 爱心留言 - 写下心里话
        • 📸 美好留念 - 珍藏回忆照片
        • ❤️ 浪漫主题 - 粉色爱心元素
        • 🗑️ 删除管理 - 自由管理自己的内容

        愿我们的爱如星辰大海
        永恒而璀璨！

        —— 永远爱你的我
    `;
    
    alert(aboutMessage);
});

// 工具函数
function getRandomColor() {
    const colors = [
        'linear-gradient(45deg, #ff66b2, #ff99cc)',
        'linear-gradient(45deg, #ff9966, #ffcc99)',
        'linear-gradient(45deg, #66b2ff, #99ccff)',
        'linear-gradient(45deg, #66ffb2, #99ffcc)',
        'linear-gradient(45deg, #b266ff, #cc99ff)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 自定义确认对话框
function showConfirmDialog(message, onConfirm) {
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.innerHTML = `
        <div class="dialog-content">
            <div style="font-size: 3rem; margin-bottom: 15px;">❓</div>
            <h3 style="color: #ff66b2; margin-bottom: 10px;">确认删除</h3>
            <p style="color: #666; margin-bottom: 20px;">${message}</p>
            <div class="dialog-buttons">
                <button class="cancel-btn">取消</button>
                <button class="confirm-btn">确认删除</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    dialog.querySelector('.confirm-btn').addEventListener('click', () => {
        onConfirm();
        document.body.removeChild(dialog);
    });
    
    dialog.querySelector('.cancel-btn').addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
    
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            document.body.removeChild(dialog);
        }
    });
}

function showSuccess(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #4CAF50, #66BB6A);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

function showError(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #ff4757, #ff6b81);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    createFloatingHearts();
    createSparkles();
    displayMessages();
    displayMemories();
    
    // 检查是否已登录
    if (localStorage.getItem('currentUser')) {
        try {
            const savedUser = JSON.parse(localStorage.getItem('currentUser'));
            const user = users.find(u => u.id === savedUser.id);
            if (user) {
                currentUser = user;
                showMainSection();
            }
        } catch (e) {
            console.error('Error loading user data:', e);
            localStorage.removeItem('currentUser');
        }
    }
    
    // 添加页面加载动画
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});