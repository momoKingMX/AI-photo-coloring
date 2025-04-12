// 加载环境变量
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const { HttpsProxyAgent } = require('hpagent');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 测试模式设置 - 不实际调用DeepAI API
const TEST_MODE = false; // 设置为false禁用测试模式，使用真实API

// 配置CORS，允许前端访问
app.use(cors());

// 配置静态文件服务，将前端文件放在上一级目录
app.use(express.static(path.join(__dirname, '..')));

// 配置文件上传
const upload = multer({ 
  dest: 'uploads/',  // 上传文件保存的临时目录
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制文件大小为5MB
  } 
});

// 确保uploads目录存在
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// 测试端点 - 用于检查服务器是否正常运行
app.get('/api/test', (req, res) => {
  res.json({ status: 'Server is running' });
});

// 图片上色API接口
app.post('/api/colorize', upload.single('image'), async (req, res) => {
  try {
    // 检查是否上传了文件
    if (!req.file) {
      return res.status(400).json({ error: '没有上传图片文件' });
    }

    // 如果开启了测试模式，返回模拟数据
    if (TEST_MODE) {
      console.log('测试模式已启用，返回模拟数据');
      
      // 等待1秒模拟处理时间
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 清理临时文件
      fs.unlinkSync(req.file.path);
      
      // 返回一个彩色示例图像URL
      // 这里使用了一个公开的示例图片，你也可以使用其他图片URL
      return res.json({ 
        outputUrl: 'https://i.imgur.com/FApqk3D.jpg' 
      });
    }

    // 以下是实际调用DeepAI API的代码（测试模式下不会执行）
    // 准备发送到DeepAI的请求
    const formData = new FormData();
    formData.append('image', fs.createReadStream(req.file.path));

    // 调用DeepAI API的配置选项
    const fetchOptions = {
      method: 'POST',
      headers: {
        'api-key': process.env.DEEPAI_API_KEY
      },
      body: formData,
      timeout: 60000  // 增加超时时间到60秒
    };

    // 检查是否配置了代理服务器
    if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
      console.log('使用代理服务器连接到DeepAI API');
      // 使用环境变量中配置的代理
      const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
      fetchOptions.agent = new HttpsProxyAgent({
        keepAlive: true,
        keepAliveMsecs: 1000,
        maxSockets: 256,
        maxFreeSockets: 256,
        scheduling: 'lifo',
        proxy: proxyUrl
      });
    }

    // 调用DeepAI API
    const response = await fetch(process.env.DEEPAI_API_URL, fetchOptions);

    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepAI API 请求失败: ${response.status} ${errorText}`);
    }

    // 解析响应数据
    const data = await response.json();

    // 清理临时文件
    fs.unlinkSync(req.file.path);

    // 返回处理结果
    if (data.output_url) {
      res.json({ outputUrl: data.output_url });
    } else {
      throw new Error('DeepAI API 返回无效数据');
    }
  } catch (error) {
    console.error('处理图片时出错:', error);
    
    // 如果临时文件还存在，清理它
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: error.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`后端服务运行在 http://localhost:${PORT}`);
  console.log(`API接口地址: http://localhost:${PORT}/api/colorize`);
  if (TEST_MODE) {
    console.log('⚠️ 测试模式已启用：API将返回模拟数据，不会实际调用DeepAI');
  }
  if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
    console.log(`⚠️ 已配置代理服务器: ${process.env.HTTPS_PROXY || process.env.HTTP_PROXY}`);
  }
}); 