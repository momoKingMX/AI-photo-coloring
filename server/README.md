# AI照片上色工具 - 后端服务

这是AI照片上色工具的后端服务，用于接收前端上传的图片，通过DeepAI API进行处理，并返回上色后的图片链接。

## 功能

- 接收前端上传的图片
- 使用DeepAI API进行图片上色处理
- 返回处理后的图片链接
- 清理临时文件

## 技术栈

- Node.js
- Express - Web服务框架
- Multer - 处理文件上传
- dotenv - 环境变量管理
- node-fetch - 发送HTTP请求
- form-data - 构建表单数据
- hpagent - HTTP代理支持

## 安装和运行

1. 安装依赖

```bash
cd server
npm install
```

2. 配置环境变量

从模板创建你自己的`.env`文件：

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑.env文件，添加你的DeepAI API密钥
```

⚠️ **重要安全提示**：
- `.env`文件包含敏感信息，已在`.gitignore`中排除，不会提交到Git仓库
- 永远不要将实际的API密钥提交到版本控制系统
- 每个开发环境和生产环境需要单独配置`.env`文件

3. 解决API连接问题

如果遇到连接DeepAI API时出现`ETIMEDOUT`错误，可能是由于网络限制或防火墙阻止了直接连接。解决方案：

在`.env`文件中配置HTTP代理：

```
# 代理服务器配置
HTTP_PROXY=http://proxy-host:port
HTTPS_PROXY=http://proxy-host:port
```

代理服务器配置之后，服务器将通过配置的代理连接到DeepAI API。

4. 运行服务

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

服务将在 http://localhost:3000 上运行。

## API接口

### 图片上色

- **URL**: `/api/colorize`
- **方法**: `POST`
- **内容类型**: `multipart/form-data`
- **参数**:
  - `image`: 图片文件

#### 成功响应

```json
{
  "outputUrl": "https://api.deepai.org/job-view-file/..."
}
```

#### 错误响应

```json
{
  "error": "错误信息"
}
```

## 常见问题

### "连接超时 (ETIMEDOUT)" 错误

如果看到类似以下错误：

```
处理图片时出错: FetchError: request to https://api.deepai.org/api/colorizer failed, reason: connect ETIMEDOUT 202.160.128.40:443
```

可能的原因：
1. 网络连接问题 - 无法建立与DeepAI服务器的TCP连接
2. 防火墙设置 - 防火墙阻止了连接
3. DNS解析问题 - 无法解析DeepAI域名

解决方案：
1. 使用代理服务器 - 在`.env`文件中配置`HTTP_PROXY`和`HTTPS_PROXY`
2. 调整网络设置 - 检查防火墙规则，确保允许对外连接
3. 使用VPN - 如果是地区限制，可以尝试使用VPN
4. 增加超时时间 - 在代码中已设置为60秒，可根据需要进一步调整

## 注意事项

- 图片大小限制为5MB
- 支持的图片格式：jpeg, png, webp等 