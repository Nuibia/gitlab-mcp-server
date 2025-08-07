#!/usr/bin/env node

// 测试分支功能的脚本
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 启动MCP服务器
const serverProcess = spawn('node', [join(__dirname, 'dist', 'index.js')], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let serverOutput = '';
let serverError = '';

serverProcess.stdout.on('data', (data) => {
  serverOutput += data.toString();
  console.log('服务器输出:', data.toString());
});

serverProcess.stderr.on('data', (data) => {
  serverError += data.toString();
  console.error('服务器错误:', data.toString());
});

serverProcess.on('close', (code) => {
  console.log(`服务器进程退出，退出码: ${code}`);
  console.log('完整输出:', serverOutput);
  if (serverError) {
    console.error('错误输出:', serverError);
  }
});

// 等待一段时间后关闭服务器
setTimeout(() => {
  console.log('🛑 关闭服务器...');
  serverProcess.kill('SIGINT');
}, 10000);
