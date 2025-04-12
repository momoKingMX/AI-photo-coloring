# AI照片上色工具

这是一个简洁elegant的AI照片上色工具网站，可以将黑白照片转换为彩色照片。网站采用苹果风格设计，支持中英文切换。

## 功能特点

- 上传或拖放黑白照片
- AI自动为照片添加自然彩色
- 下载处理后的彩色照片
- 中英文语言切换
- 响应式设计，适配各种设备

## 项目架构

项目分为前端和后端两部分：

- **前端**：纯HTML/CSS/JavaScript实现的用户界面
- **后端**：Node.js服务，处理图片上传和与DeepAI API的交互

## 技术栈

### 前端
- HTML5 - 网页结构
- CSS3 - 样式与动画
- JavaScript - 交互逻辑

### 后端
- Node.js - 运行环境
- Express - Web服务框架
- DeepAI API - AI上色服务

## 如何运行

### 1. 配置后端
首先需要配置和启动后端服务：

```bash
# 进入后端目录
cd server

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 然后编辑.env文件，添加你的DeepAI API密钥

# 启动服务
npm run dev
```

详细说明请查看 [server/README.md](server/README.md)

### 2. 解决DeepAI API连接问题

如果遇到连接DeepAI API时出现`ETIMEDOUT`超时错误，可以通过以下方式解决：

#### 设置代理服务器
在`.env`文件中添加代理服务器配置：

```
# 代理服务器配置
HTTP_PROXY=http://your-proxy-host:port
HTTPS_PROXY=http://your-proxy-host:port
```

#### 调整网络设置
- 检查防火墙设置，确保没有阻止对DeepAI服务器的访问
- 尝试使用VPN或其他网络代理解决DNS解析问题
- 如果在公司网络环境，可能需要联系网络管理员解除限制

#### 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务将在 http://localhost:3000 上运行。

## 安全注意事项

本项目使用了以下安全措施来保护API密钥：

1. **服务器中转**：所有API请求通过后端服务器中转，API密钥只存在于服务器端
2. **环境变量**：敏感信息存储在`.env`文件中，而不是硬编码在代码中
3. **Git排除**：`.env`文件已添加到`.gitignore`中，不会被提交到版本控制系统

如果你要部署此项目或将其提交到GitHub：
- 确保不要提交`.env`文件
- 如果不小心提交了，请立即更换API密钥并从Git历史中移除敏感信息
- 只共享`.env.example`作为配置模板

## 页面结构

### 主页面 (index.html)
- 顶部导航栏：logo、语言切换
- 主区域：上传区、处理中状态、结果展示
- 底部：版权信息、关于链接

## 设计风格

参考苹果公司的设计理念：
- 简洁、优雅的界面
- 大量留白
- 精致的细节和微动画
- 高对比度
- 清晰的视觉层次 