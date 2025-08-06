#!/usr/bin/env node

// 简单的测试脚本来验证GitLab MCP服务器
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
  if (serverError) {
    console.error('服务器错误输出:', serverError);
  }
});

// 等待服务器启动
setTimeout(() => {
  console.log('测试完成，关闭服务器...');
  serverProcess.kill('SIGINT');
}, 5000); 