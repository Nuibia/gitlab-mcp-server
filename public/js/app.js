// 全局变量
let currentPrompt = '';
let currentFormat = 'markdown';

// DOM 元素
const promptForm = document.getElementById('promptForm');
const outputContainer = document.getElementById('outputContainer');
const actionButtons = document.getElementById('actionButtons');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const generateBtn = document.getElementById('generateBtn');
const generateText = document.getElementById('generateText');
const loadingSpinner = document.getElementById('loadingSpinner');
const advancedToggle = document.getElementById('advancedToggle');
const advancedOptions = document.getElementById('advancedOptions');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 初始化应用
function initializeApp() {
    loadTemplates();
    setupEventListeners();
    showWelcomeMessage();
}

// 设置事件监听器
function setupEventListeners() {
    // 表单提交
    promptForm.addEventListener('submit', handleFormSubmit);
    
    // 复制按钮
    copyBtn.addEventListener('click', copyToClipboard);
    
    // 下载按钮
    downloadBtn.addEventListener('click', downloadPrompt);
    
    // 高级选项切换
    advancedToggle.addEventListener('click', toggleAdvancedOptions);
    
    // 格式选择变化
    document.getElementById('format').addEventListener('change', handleFormatChange);
}

// 处理表单提交
async function handleFormSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(promptForm);
    const role = formData.get('role');
    const description = formData.get('description');
    const template = formData.get('template');
    const format = formData.get('format');
    
    // 验证必填字段
    if (!role || !description) {
        showError('请填写角色名称和描述');
        return;
    }
    
    // 准备请求数据
    const requestData = {
        role: role,
        requirements: {
            description: description
        },
        format: format
    };
    
    // 添加高级选项
    const background = formData.get('background');
    const goals = formData.get('goals');
    
    if (background) {
        requestData.requirements.background = background;
    }
    
    if (goals) {
        requestData.requirements.goals = goals.split('\n').filter(goal => goal.trim());
    }
    
    // 显示加载状态
    setLoadingState(true);
    
    try {
        const response = await fetch('/api/generate-prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentPrompt = result.data;
            currentFormat = format;
            displayPrompt(result.data, format);
            showSuccess('Prompt 生成成功！');
        } else {
            showError(result.error || '生成失败，请重试');
        }
    } catch (error) {
        console.error('API 调用失败:', error);
        showError('网络错误，请检查连接后重试');
    } finally {
        setLoadingState(false);
    }
}

// 显示生成的 prompt
function displayPrompt(prompt, format) {
    const formatLabel = getFormatLabel(format);
    
    outputContainer.innerHTML = `
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">
                    <i class="fas fa-file-code mr-1"></i>${formatLabel} 格式
                </span>
                <span class="text-xs text-gray-500">${new Date().toLocaleString()}</span>
            </div>
        </div>
        <div class="code-block text-gray-100 text-sm">
            ${escapeHtml(prompt)}
        </div>
    `;
    
    actionButtons.classList.remove('hidden');
}

// 获取格式标签
function getFormatLabel(format) {
    const labels = {
        'markdown': 'Markdown',
        'yaml': 'YAML',
        'json': 'JSON'
    };
    return labels[format] || format;
}

// 转义 HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 复制到剪贴板
async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(currentPrompt);
        showSuccess('已复制到剪贴板！');
    } catch (error) {
        console.error('复制失败:', error);
        showError('复制失败，请手动复制');
    }
}

// 下载文件
function downloadPrompt() {
    const format = currentFormat;
    const extension = getFileExtension(format);
    const filename = `langgpt-prompt.${extension}`;
    
    const blob = new Blob([currentPrompt], { type: getMimeType(format) });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('文件下载成功！');
}

// 获取文件扩展名
function getFileExtension(format) {
    const extensions = {
        'markdown': 'md',
        'yaml': 'yml',
        'json': 'json'
    };
    return extensions[format] || 'txt';
}

// 获取 MIME 类型
function getMimeType(format) {
    const mimeTypes = {
        'markdown': 'text/markdown',
        'yaml': 'text/yaml',
        'json': 'application/json'
    };
    return mimeTypes[format] || 'text/plain';
}

// 处理格式变化
function handleFormatChange(event) {
    const format = event.target.value;
    if (currentPrompt) {
        // 重新生成不同格式的 prompt
        regeneratePromptWithFormat(format);
    }
}

// 重新生成不同格式的 prompt
async function regeneratePromptWithFormat(format) {
    const formData = new FormData(promptForm);
    const role = formData.get('role');
    const description = formData.get('description');
    
    const requestData = {
        role: role,
        requirements: {
            description: description
        },
        format: format
    };
    
    try {
        const response = await fetch('/api/generate-prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentPrompt = result.data;
            currentFormat = format;
            displayPrompt(result.data, format);
        }
    } catch (error) {
        console.error('重新生成失败:', error);
    }
}

// 切换高级选项
function toggleAdvancedOptions() {
    const isHidden = advancedOptions.classList.contains('hidden');
    
    if (isHidden) {
        advancedOptions.classList.remove('hidden');
        advancedToggle.innerHTML = '<i class="fas fa-chevron-up mr-1"></i>隐藏高级选项';
    } else {
        advancedOptions.classList.add('hidden');
        advancedToggle.innerHTML = '<i class="fas fa-cog mr-1"></i>高级选项';
    }
}

// 设置加载状态
function setLoadingState(loading) {
    if (loading) {
        generateBtn.disabled = true;
        generateText.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
    } else {
        generateBtn.disabled = false;
        generateText.classList.remove('hidden');
        loadingSpinner.classList.add('hidden');
    }
}

// 显示成功消息
function showSuccess(message) {
    showNotification(message, 'success');
}

// 显示错误消息
function showError(message) {
    showNotification(message, 'error');
}

// 显示通知
function showNotification(message, type) {
    // 移除现有通知
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 创建新通知
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 3秒后自动移除
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// 加载模板
async function loadTemplates() {
    try {
        const response = await fetch('/api/templates');
        const result = await response.json();
        
        if (result.success) {
            displayTemplates(result.data);
        }
    } catch (error) {
        console.error('加载模板失败:', error);
    }
}

// 显示模板
function displayTemplates(templates) {
    const templatesGrid = document.getElementById('templatesGrid');
    
    templatesGrid.innerHTML = templates.map(template => `
        <div class="bg-white rounded-lg shadow-md p-6 card-hover">
            <div class="flex items-center mb-4">
                <i class="fas fa-layer-group text-2xl text-blue-500 mr-3"></i>
                <h4 class="text-lg font-semibold text-gray-800">${template.name}</h4>
            </div>
            <p class="text-gray-600 text-sm mb-4">${template.description}</p>
            <button onclick="useTemplate('${template.id}')" 
                    class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm">
                <i class="fas fa-magic mr-1"></i>使用此模板
            </button>
        </div>
    `).join('');
}

// 使用模板
function useTemplate(templateId) {
    // 这里可以根据模板ID设置默认值
    console.log('使用模板:', templateId);
    showSuccess(`已选择 ${templateId} 模板`);
}

// 显示欢迎消息
function showWelcomeMessage() {
    // 可以在这里显示一些使用提示
    console.log('LangGPT Prompt 生成器已启动');
} 