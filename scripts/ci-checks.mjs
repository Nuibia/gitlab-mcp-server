#!/usr/bin/env node
// 中文说明：项目规则扫描脚本。违反规则将退出码为 1。
// 规则来源：docs/CODING_RULES.md 与 .cursor/rules/code-better.mdc

import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const SRC_DIR = path.join(projectRoot, 'src');

/** 递归列出目录下的文件 */
function listFiles(dir, filterExt = ['.ts', '.tsx', '.js', '.mjs', '.cjs']) {
  const out = [];
  function walk(d) {
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        walk(p);
      } else if (filterExt.includes(path.extname(name))) {
        out.push(p);
      }
    }
  }
  if (fs.existsSync(dir)) walk(dir);
  return out;
}

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

const violations = [];

// 1) utils 目录不得进行 I/O 或请求相关处理，不得依赖 services
const UTILS_DIR = path.join(SRC_DIR, 'utils');
if (fs.existsSync(UTILS_DIR)) {
  const utilsFiles = listFiles(UTILS_DIR, ['.ts', '.tsx']);
  const bannedPatterns = [
    /\baxios\b/,
    /\bnode-fetch\b/,
    /\bfetch\(/,
    /\bhttp\b/,
    /\bhttps\b/,
    /\bfs\b/,
    /process\.env/,
    /createAxiosInstance\(/,
    /from\s+['"](?:\.\.\/)+services\//
  ];
  for (const f of utilsFiles) {
    const content = read(f);
    for (const pat of bannedPatterns) {
      if (pat.test(content)) {
        violations.push(`[utils 纯函数约束] ${f} 违反规则: 匹配到 ${pat}`);
      }
    }
  }
}

// 2) 工具注册不应出现在入口文件，必须集中在 src/mcp/register-tools.ts
const ENTRY_FILES = [
  path.join(SRC_DIR, 'index.ts'),
  path.join(SRC_DIR, 'http-server.ts')
];
for (const f of ENTRY_FILES) {
  if (fs.existsSync(f)) {
    const content = read(f);
    if (/server\.registerTool\(/.test(content)) {
      violations.push(`[MCP 工具集中注册] ${f} 不应包含 server.registerTool，请迁移到 src/mcp/register-tools.ts`);
    }
  }
}

// 3) 限制 axios 引入：仅允许在 services 下引入 axios
const allSrcFiles = listFiles(SRC_DIR, ['.ts', '.tsx']);
for (const f of allSrcFiles) {
  const rel = path.relative(projectRoot, f).replaceAll('\\', '/');
  if (/^src\/services\//.test(rel)) continue; // services 允许
  const content = read(f);
  if (/from\s+['"]axios['"]/.test(content)) {
    violations.push(`[axios 限制] ${rel} 不应直接引入 axios（仅允许在 src/services/** 使用）`);
  }
}

if (violations.length > 0) {
  console.error('\n❌ CI 规则检查未通过：');
  for (const v of violations) console.error(' - ' + v);
  process.exit(1);
} else {
  console.log('✅ CI 规则检查通过');
}
