# 内网GitLab访问指南

## 问题分析

对于内网GitLab，Node.js可能会遇到以下问题：

1. **网络连接问题**: 无法直接访问内网服务器
2. **代理访问**: 需要通过代理服务器访问
3. **证书问题**: 内网GitLab可能使用自签名证书
4. **DNS解析**: 内网域名解析问题

## 解决方案

### 1. 环境变量配置

在 `.env` 文件中添加以下配置：

```env
# GitLab配置
GITLAB_URL=https://your-internal-gitlab.company.com/
GITLAB_TOKEN=your_gitlab_token

# 代理配置（如果需要）
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080

# SSL证书验证（内网GitLab可能使用自签名证书）
VERIFY_SSL=false

# 服务器配置
PORT=3000
NODE_ENV=development
```

### 2. 常见内网访问场景

#### 场景1: 直接内网访问
```env
GITLAB_URL=https://gitlab.internal.company.com/
GITLAB_TOKEN=your_token
VERIFY_SSL=false  # 如果使用自签名证书
```

#### 场景2: 通过代理访问
```env
GITLAB_URL=https://gitlab.internal.company.com/
GITLAB_TOKEN=your_token
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080
VERIFY_SSL=false
```

#### 场景3: 使用VPN访问
```env
GITLAB_URL=https://gitlab.internal.company.com/
GITLAB_TOKEN=your_token
# 确保VPN连接正常，无需额外配置
```

### 3. 测试连接

#### 方法1: 使用curl测试
```bash
# 测试基本连接
curl -k https://your-gitlab-url/api/v4/version

# 测试认证
curl -k -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-gitlab-url/api/v4/projects
```

#### 方法2: 使用Node.js测试
```javascript
const axios = require('axios');

const testConnection = async () => {
  try {
    const response = await axios.get('https://your-gitlab-url/api/v4/version', {
      httpsAgent: new (require('https').Agent)({
        rejectUnauthorized: false
      })
    });
    console.log('连接成功:', response.data);
  } catch (error) {
    console.error('连接失败:', error.message);
  }
};

testConnection();
```

### 4. 故障排除

#### 问题1: 连接被拒绝 (ECONNREFUSED)
**原因**: 网络无法访问内网GitLab
**解决方案**:
1. 检查网络连接
2. 确认GitLab URL正确
3. 配置代理（如果需要）
4. 使用VPN连接 