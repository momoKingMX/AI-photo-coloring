// DOM元素
const elements = {
    // 上传区域
    uploadArea: document.getElementById('upload-area'),
    dropArea: document.getElementById('drop-area'),
    fileInput: document.getElementById('file-input'),
    uploadBtn: document.getElementById('upload-btn'),
    
    // 处理区域
    processingArea: document.getElementById('processing-area'),
    
    // 结果区域
    resultsArea: document.getElementById('results-area'),
    resultsGrid: document.getElementById('results-grid'),
    retryBtn: document.getElementById('retry-btn'),
    downloadAllBtn: document.getElementById('download-all-btn'),
    
    // 语言选择
    langSwitch: document.getElementById('lang-switch'),
    currentLang: document.getElementById('current-lang'),
    langOptions: document.querySelectorAll('.lang-option'),
    
    // 模板
    resultTemplate: document.getElementById('result-template')
};

// DeepAI API配置
const DEEPAI_CONFIG = {
    apiKey: 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K', // 将此替换为您的实际API密钥
    apiUrl: 'https://api.deepai.org/api/colorizer'
};

// 存储上传的图片和处理结果
const state = {
    uploadedImages: [],
    colorizedImages: [],
    currentLanguage: 'zh', // 默认语言为中文
    processingCount: 0,
    totalImages: 0
};

// 语言数据
const translations = {
    zh: {
        siteTitle: 'AI照片上色工具',
        mainHeading: '为黑白照片注入生命的色彩',
        subHeading: '只需上传您的黑白照片，我们的AI技术将为其添加自然生动的色彩',
        uploadTitle: '上传照片',
        uploadDesc: '点击上传或拖放照片到此处',
        fileTypes: '支持 JPG, PNG, WEBP 格式',
        uploadBtn: '选择照片',
        processingTitle: '正在处理照片...',
        processingDesc: '请稍候，我们的AI正在为您的照片上色',
        resultsTitle: '上色完成',
        retryText: '重新上传',
        downloadText: '下载全部',
        originalLabel: '原图',
        colorizedLabel: '彩色',
        downloadButtonText: '下载',
        copyright: '© 2023 AI照片上色工具. 保留所有权利.',
        disclaimer: '本工具仅用于演示目的，实际效果可能因照片质量而异。',
        errorMsg: '处理出错，请重试',
        processingStatus: '已处理 {current} / {total} 张图片'
    },
    en: {
        siteTitle: 'AI Photo Colorizer',
        mainHeading: 'Bring Your Black & White Photos to Life',
        subHeading: 'Simply upload your black and white photos, and our AI technology will add natural vibrant colors',
        uploadTitle: 'Upload Photos',
        uploadDesc: 'Click to upload or drag and drop photos here',
        fileTypes: 'Supports JPG, PNG, WEBP formats',
        uploadBtn: 'Choose Photos',
        processingTitle: 'Processing Photos...',
        processingDesc: 'Please wait, our AI is colorizing your photos',
        resultsTitle: 'Colorization Complete',
        retryText: 'Upload Again',
        downloadText: 'Download All',
        originalLabel: 'Original',
        colorizedLabel: 'Colorized',
        downloadButtonText: 'Download',
        copyright: '© 2023 AI Photo Colorizer. All rights reserved.',
        disclaimer: 'This tool is for demonstration purposes only, actual results may vary depending on photo quality.',
        errorMsg: 'Processing error, please try again',
        processingStatus: 'Processed {current} / {total} images'
    }
};

// ===== 初始化 =====
function init() {
    // 设置拖放事件监听器
    setupDragAndDrop();
    
    // 设置上传按钮事件
    elements.uploadBtn.addEventListener('click', () => {
        elements.fileInput.click();
    });
    
    // 设置文件选择事件
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // 设置重试按钮事件
    elements.retryBtn.addEventListener('click', resetApp);
    
    // 设置下载全部按钮事件
    elements.downloadAllBtn.addEventListener('click', downloadAllImages);
    
    // 设置语言切换事件
    elements.langOptions.forEach(option => {
        option.addEventListener('click', () => {
            const lang = option.dataset.lang;
            changeLanguage(lang);
        });
    });
}

// ===== 拖放功能 =====
function setupDragAndDrop() {
    const dropArea = elements.dropArea;
    
    // 阻止默认行为，防止浏览器打开拖放的文件
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // 高亮拖放区域
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    // 取消高亮拖放区域
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    // 处理拖放的文件
    dropArea.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        dropArea.classList.add('drag-over');
    }
    
    function unhighlight() {
        dropArea.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleFiles(files);
        }
    }
}

// ===== 文件处理 =====
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFiles(files);
    }
}

function handleFiles(files) {
    const imageFiles = Array.from(files).filter(file => {
        return file.type.match(/^image\/(jpeg|png|webp)$/);
    });
    
    if (imageFiles.length === 0) {
        alert(translations[state.currentLanguage].errorMsg);
        return;
    }
    
    // 清空之前的图片
    state.uploadedImages = [];
    state.colorizedImages = [];
    state.processingCount = 0;
    state.totalImages = imageFiles.length;
    
    // 显示处理中状态
    showProcessingState();
    
    // 处理图片，这次分批处理每张图片
    imageFiles.forEach(file => {
        processImage(file);
    });
}

function processImage(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const originalImageUrl = e.target.result;
        
        // 保存原始图片
        state.uploadedImages.push({
            name: file.name,
            url: originalImageUrl
        });
        
        // 调用DeepAI API进行上色
        callDeepAIColorizer(originalImageUrl, file.name);
    };
    
    reader.readAsDataURL(file);
}

// 调用DeepAI的上色API
async function callDeepAIColorizer(imageDataUrl, fileName) {
    try {
        // 将Base64数据转换为Blob
        const blob = dataURLtoBlob(imageDataUrl);
        const formData = new FormData();
        formData.append('image', blob, fileName);
        
        // 调用DeepAI API
        const response = await fetch(DEEPAI_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'api-key': DEEPAI_CONFIG.apiKey
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.output_url) {
            // 保存处理结果
            state.colorizedImages.push({
                name: `colorized_${fileName}`,
                url: data.output_url,
                originalName: fileName
            });
            
            // 更新处理状态
            state.processingCount++;
            updateProcessingStatus();
            
            // 如果所有图片都处理完成，显示结果
            if (state.processingCount === state.totalImages) {
                showResults();
            }
        } else {
            throw new Error('No output URL in response');
        }
    } catch (error) {
        console.error('Error calling DeepAI API:', error);
        
        // 发生错误时，保存原图作为结果（作为回退策略）
        state.colorizedImages.push({
            name: `colorized_${fileName}`,
            url: imageDataUrl,
            originalName: fileName,
            error: true
        });
        
        // 更新处理状态
        state.processingCount++;
        updateProcessingStatus();
        
        // 如果所有图片都处理完成，显示结果
        if (state.processingCount === state.totalImages) {
            showResults();
        }
    }
}

// 将Data URL转换为Blob对象，用于表单提交
function dataURLtoBlob(dataURL) {
    // 分析Data URL
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    
    // 创建Uint8Array用于存储解码后的数据
    const uInt8Array = new Uint8Array(rawLength);
    
    // 将数据填充到Uint8Array中
    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    
    // 创建并返回Blob对象
    return new Blob([uInt8Array], { type: contentType });
}

// 更新处理状态显示
function updateProcessingStatus() {
    const statusText = translations[state.currentLanguage].processingStatus
        .replace('{current}', state.processingCount)
        .replace('{total}', state.totalImages);
    
    const processingDesc = document.getElementById('processing-desc');
    processingDesc.textContent = statusText;
}

// ===== 界面状态管理 =====
function showProcessingState() {
    elements.uploadArea.classList.add('hidden');
    elements.processingArea.classList.remove('hidden');
    elements.resultsArea.classList.add('hidden');
    
    // 更新处理状态初始显示
    updateProcessingStatus();
}

function showResults() {
    elements.uploadArea.classList.add('hidden');
    elements.processingArea.classList.add('hidden');
    elements.resultsArea.classList.remove('hidden');
    
    renderResults();
}

function resetApp() {
    elements.uploadArea.classList.remove('hidden');
    elements.processingArea.classList.add('hidden');
    elements.resultsArea.classList.add('hidden');
    
    // 清空文件输入
    elements.fileInput.value = '';
    
    // 清空结果网格
    elements.resultsGrid.innerHTML = '';
    
    // 清空状态
    state.uploadedImages = [];
    state.colorizedImages = [];
    state.processingCount = 0;
    state.totalImages = 0;
}

// ===== 结果渲染 =====
function renderResults() {
    // 清空结果网格
    elements.resultsGrid.innerHTML = '';
    
    // 渲染每个结果项
    state.uploadedImages.forEach((original, index) => {
        const colorized = state.colorizedImages[index];
        if (!colorized) return;
        
        // 克隆模板
        const template = elements.resultTemplate.content.cloneNode(true);
        
        // 设置原始图片
        const originalImg = template.querySelector('.original-img');
        originalImg.src = original.url;
        originalImg.alt = original.name;
        
        // 确保图片加载后正确显示
        originalImg.onload = function() {
            adjustImageContainer(this);
        };
        
        // 设置彩色图片
        const colorizedImg = template.querySelector('.colorized-img');
        colorizedImg.src = colorized.url;
        colorizedImg.alt = colorized.name;
        
        // 确保图片加载后正确显示
        colorizedImg.onload = function() {
            adjustImageContainer(this);
        };
        
        // 如果处理出错，显示错误提示
        if (colorized.error) {
            const colorizedContainer = template.querySelector('.image-container.colorized');
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = translations[state.currentLanguage].errorMsg;
            colorizedContainer.appendChild(errorMsg);
        }
        
        // 设置下载按钮事件
        const downloadBtn = template.querySelector('.download-btn');
        downloadBtn.addEventListener('click', () => {
            downloadImage(colorized.url, colorized.name);
        });
        
        // 设置语言标签
        updateElementLanguage(template.querySelector('[data-label-original]'), 'originalLabel');
        updateElementLanguage(template.querySelector('[data-label-colorized]'), 'colorizedLabel');
        updateElementLanguage(template.querySelector('.download-btn span'), 'downloadButtonText');
        
        // 添加到结果网格
        elements.resultsGrid.appendChild(template);
    });
}

// 调整图片容器大小，确保完整显示图片
function adjustImageContainer(imgElement) {
    // 根据图片的自然尺寸调整容器
    const container = imgElement.closest('.image-container');
    if (container) {
        // 保持合理的最小高度
        const minHeight = 200;
        const imgHeight = Math.max(imgElement.naturalHeight, minHeight);
        
        // 设置容器最小高度
        container.style.minHeight = imgHeight + 'px';
    }
}

// ===== 下载功能 =====
function downloadImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadAllImages() {
    state.colorizedImages.forEach(image => {
        // 只下载成功处理的图片
        if (!image.error) {
            downloadImage(image.url, image.name);
        }
    });
}

// ===== 语言切换 =====
function changeLanguage(lang) {
    if (state.currentLanguage === lang) return;
    
    state.currentLanguage = lang;
    elements.currentLang.textContent = lang === 'zh' ? '中文' : 'English';
    
    // 更新所有需要翻译的元素
    updateAllTexts();
}

function updateAllTexts() {
    // 更新页面标题
    document.title = translations[state.currentLanguage].siteTitle;
    
    // 更新各元素文本
    updateElementText('site-title', 'siteTitle');
    updateElementText('main-heading', 'mainHeading');
    updateElementText('sub-heading', 'subHeading');
    updateElementText('upload-title', 'uploadTitle');
    updateElementText('upload-desc', 'uploadDesc');
    updateElementText('file-types', 'fileTypes');
    updateElementText('upload-btn', 'uploadBtn');
    updateElementText('processing-title', 'processingTitle');
    
    // 处理状态文本需要特殊处理
    if (state.totalImages > 0) {
        updateProcessingStatus();
    } else {
        updateElementText('processing-desc', 'processingDesc');
    }
    
    updateElementText('results-title', 'resultsTitle');
    updateElementText('retry-text', 'retryText');
    updateElementText('download-text', 'downloadText');
    updateElementText('copyright', 'copyright');
    updateElementText('disclaimer', 'disclaimer');
    
    // 更新结果区域中的所有标签
    document.querySelectorAll('[data-label-original]').forEach(el => {
        el.textContent = translations[state.currentLanguage].originalLabel;
    });
    
    document.querySelectorAll('[data-label-colorized]').forEach(el => {
        el.textContent = translations[state.currentLanguage].colorizedLabel;
    });
    
    document.querySelectorAll('.download-btn span').forEach(el => {
        el.textContent = translations[state.currentLanguage].downloadButtonText;
    });
    
    // 更新错误消息
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = translations[state.currentLanguage].errorMsg;
    });
}

function updateElementText(elementId, translationKey) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = translations[state.currentLanguage][translationKey];
    }
}

function updateElementLanguage(element, translationKey) {
    if (element) {
        element.textContent = translations[state.currentLanguage][translationKey];
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', init); 