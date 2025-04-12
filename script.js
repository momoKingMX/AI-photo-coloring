// 当文档加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 语言选择功能初始化等其他初始化代码
    // ...
    
    // 添加测试服务器状态功能
    testServerConnection();
});

/**
 * 测试服务器连接
 */
function testServerConnection() {
    fetch('/api/test')
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('服务器连接测试失败');
        })
        .then(data => {
            console.log('服务器连接测试成功:', data);
            showToast('服务器连接成功', 'success');
        })
        .catch(error => {
            console.error('服务器连接测试失败:', error);
            showToast('无法连接到服务器，请确保服务器已启动', 'error');
        });
}

/**
 * 显示提示消息
 * @param {string} message - 提示消息文本
 * @param {string} type - 消息类型 (success, error, warning)
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
    
    // 显示动画
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 2秒后自动消失
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 2000);
}

// 当用户点击上传按钮时
document.getElementById('upload-btn').addEventListener('click', function() {
    document.getElementById('file-input').click();
});

// 文件选择变化时
document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        // 直接上传文件并处理，不再检查API密钥
        uploadAndProcessImage(file);
    }
});

/**
 * 上传并处理图片（发送到后端服务）
 * @param {File} file - 要上传的图片文件
 */
function uploadAndProcessImage(file) {
    // 显示加载中状态
    showLoadingState(true);
    
    // 保存原始图片以便后续显示
    const reader = new FileReader();
    reader.onload = function(e) {
        const originalImageUrl = e.target.result;
        
        // 创建FormData对象用于API请求
        const formData = new FormData();
        formData.append('image', file);
        
        // 调用后端API
        fetch('/api/colorize', {  // 这里使用服务器端API地址
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('服务器响应错误: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.outputUrl) {
                // 成功处理图片
                showToast('图片处理完成', 'success');
                
                // 显示处理结果
                showResults({
                    original: {
                        name: file.name,
                        url: originalImageUrl
                    },
                    colorized: {
                        name: `colorized_${file.name}`,
                        url: data.outputUrl
                    }
                });
            } else {
                throw new Error('服务器返回数据中没有outputUrl');
            }
        })
        .catch(error => {
            console.error('处理图片时出错:', error);
            showToast('处理图片失败: ' + error.message, 'error');
            // 返回到上传状态
            showUploadState();
        })
        .finally(() => {
            // 无论成功失败都取消加载状态
            showLoadingState(false);
        });
    };
    
    reader.readAsDataURL(file);
}

/**
 * 显示处理结果
 * @param {Object} result - 处理结果对象
 */
function showResults(result) {
    // 隐藏上传区域，显示结果区域
    document.getElementById('upload-area').classList.add('hidden');
    document.getElementById('processing-area').classList.add('hidden');
    
    const resultsArea = document.getElementById('results-area');
    resultsArea.classList.remove('hidden');
    
    // 获取结果网格
    const resultsGrid = document.getElementById('results-grid');
    resultsGrid.innerHTML = ''; // 清空现有内容
    
    // 创建结果项
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    
    // 创建对比容器
    const comparisonContainer = document.createElement('div');
    comparisonContainer.className = 'comparison-container';
    
    // 添加原始图片
    const originalContainer = document.createElement('div');
    originalContainer.className = 'image-container original';
    const originalImg = document.createElement('img');
    originalImg.src = result.original.url;
    originalImg.alt = result.original.name;
    originalImg.className = 'result-img original-img';
    const originalLabel = document.createElement('span');
    originalLabel.className = 'image-label';
    originalLabel.textContent = '原图';
    originalContainer.appendChild(originalImg);
    originalContainer.appendChild(originalLabel);
    
    // 添加彩色图片
    const colorizedContainer = document.createElement('div');
    colorizedContainer.className = 'image-container colorized';
    const colorizedImg = document.createElement('img');
    colorizedImg.src = result.colorized.url;
    colorizedImg.alt = result.colorized.name;
    colorizedImg.className = 'result-img colorized-img';
    const colorizedLabel = document.createElement('span');
    colorizedLabel.className = 'image-label';
    colorizedLabel.textContent = '彩色';
    colorizedContainer.appendChild(colorizedImg);
    colorizedContainer.appendChild(colorizedLabel);
    
    // 组装结果项
    comparisonContainer.appendChild(originalContainer);
    comparisonContainer.appendChild(colorizedContainer);
    resultItem.appendChild(comparisonContainer);
    
    // 添加下载按钮
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'result-actions';
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'action-btn download-btn';
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> <span>下载</span>';
    downloadBtn.addEventListener('click', () => downloadImage(result.colorized.url, result.colorized.name));
    actionsContainer.appendChild(downloadBtn);
    resultItem.appendChild(actionsContainer);
    
    // 添加到结果网格
    resultsGrid.appendChild(resultItem);
    
    // 设置重试按钮事件
    document.getElementById('retry-btn').addEventListener('click', showUploadState);
}

/**
 * 返回到上传状态
 */
function showUploadState() {
    document.getElementById('upload-area').classList.remove('hidden');
    document.getElementById('processing-area').classList.add('hidden');
    document.getElementById('results-area').classList.add('hidden');
    document.getElementById('file-input').value = ''; // 清空文件输入
}

/**
 * 显示或隐藏加载状态
 * @param {boolean} isLoading - 是否显示加载状态
 */
function showLoadingState(isLoading) {
    const uploadBtn = document.getElementById('upload-btn');
    const processingArea = document.getElementById('processing-area');
    const uploadArea = document.getElementById('upload-area');
    
    if (isLoading) {
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
        processingArea.classList.remove('hidden');
        uploadArea.classList.add('hidden');
    } else {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '选择照片';
        // 注意：不在这里切换visibility，由其他函数控制
    }
}

/**
 * 下载图片
 * @param {string} url - 图片URL
 * @param {string} filename - 文件名
 */
function downloadImage(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
} 