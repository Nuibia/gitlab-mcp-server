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
NO_PROXY=localhost,127.0.0.1,.company.com

# SSL证书验证（内网GitLab可能使用自签名证书）
VERIFY_SSL=false

# 服务器配置
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

#### 问题2: 证书验证失败
**原因**: 内网GitLab使用自签名证书
**解决方案**:
```env
VERIFY_SSL=false
```

#### 问题3: 401认证失败
**原因**: 访问令牌无效
**解决方案**:
1. 检查GITLAB_TOKEN是否正确
2. 确认令牌具有read_api权限
3. 检查令牌是否过期

#### 问题4: 404 API路径错误
**原因**: GitLab URL或API路径错误
**解决方案**:
1. 检查GitLab URL是否正确
2. 确认GitLab版本支持v4 API
3. 测试API端点是否可访问

### 5. 调试技巧

#### 启用详细日志
```bash
# 设置环境变量
export DEBUG=axios
export NODE_ENV=development

# 运行服务器
yarn dev
```

#### 检查网络连接
```bash
# 测试DNS解析
nslookup your-gitlab-url

# 测试端口连接
telnet your-gitlab-url 443

# 测试HTTP连接
curl -v https://your-gitlab-url
```

### 6. 企业环境特殊配置

#### 企业代理配置
```env
# 如果企业使用代理认证
HTTP_PROXY=http://username:password@proxy.company.com:8080
HTTPS_PROXY=http://username:password@proxy.company.com:8080
```

#### 自签名证书配置
```env
# 禁用SSL验证
VERIFY_SSL=false

# 或者指定证书路径
NODE_EXTRA_CA_CERTS=/path/to/company-ca.crt
```

### 7. 性能优化

#### 超时设置
```javascript
// 在代码中已设置30秒超时
timeout: 30000
```

#### 重试机制
```javascript
// 可以添加重试逻辑
const axiosInstance = axios.create({
  timeout: 30000,
  retry: 3,
  retryDelay: 1000
});
```

## 总结

通过以上配置，Node.js应该能够成功访问内网GitLab。关键点是：

1. **正确配置环境变量**
2. **处理SSL证书问题**
3. **配置代理（如需要）**
4. **提供详细的错误信息**

如果仍然遇到问题，请检查：
- 网络连接状态
- GitLab服务器状态
- 防火墙设置
- 代理配置 