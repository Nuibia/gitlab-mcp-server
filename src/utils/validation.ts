// 验证相关的工具函数

// 验证URL格式
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 验证GitLab URL
export function isValidGitLabUrl(url: string): boolean {
  if (!isValidUrl(url)) {
    return false;
  }
  
  // 确保URL以斜杠结尾
  const normalizedUrl = url.endsWith('/') ? url : url + '/';
  
  return normalizedUrl.startsWith('https://') || normalizedUrl.startsWith('http://');
}

// 验证端口号
export function isValidPort(port: number): boolean {
  return port > 0 && port <= 65535;
}

// 验证GitLab Token格式
export function isValidGitLabToken(token: string): boolean {
  // GitLab个人访问令牌通常以 glpat- 开头
  return token.startsWith('glpat-') && token.length > 20;
} 