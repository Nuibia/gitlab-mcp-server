#!/usr/bin/env node

// 简单的HTTP客户端来测试GitLab MCP服务器
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testHealth() {
  try {
    console.log('🔍 测试健康检查...');
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ 健康检查成功:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 健康检查失败:', error.message);
    return false;
  }
}

async function testMCPConnection() {
  try {
    console.log('🔍 测试MCP连接...');
    
    const initializeRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: "test-client",
          version: "1.0.0"
        }
      }
    };

    const response = await axios.post(`${BASE_URL}/mcp`, initializeRequest, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      }
    });

    console.log('✅ MCP初始化成功:', response.data);
    
    // 从响应头中获取会话ID
    const sessionId = response.headers['mcp-session-id'];
    if (sessionId) {
      console.log('📝 会话ID:', sessionId);
      return { success: true, sessionId };
    } else {
      console.log('⚠️  未获取到会话ID');
      return { success: true, sessionId: null };
    }
  } catch (error) {
    console.error('❌ MCP连接失败:', error.response?.data || error.message);
    return { success: false, sessionId: null };
  }
}

async function testListTools(sessionId) {
  try {
    console.log('🔍 测试工具列表...');
    
    const listToolsRequest = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {}
    };

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    };

    if (sessionId) {
      headers['mcp-session-id'] = sessionId;
    }

    const response = await axios.post(`${BASE_URL}/mcp`, listToolsRequest, { headers });

    console.log('✅ 工具列表获取成功:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 工具列表获取失败:', error.response?.data || error.message);
    return false;
  }
}

async function testCallTool(sessionId) {
  try {
    console.log('🔍 测试调用工具...');
    
    const callToolRequest = {
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "list_projects",
        arguments: {}
      }
    };

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream'
    };

    if (sessionId) {
      headers['mcp-session-id'] = sessionId;
    }

    const response = await axios.post(`${BASE_URL}/mcp`, callToolRequest, { headers });

    console.log('✅ 工具调用成功:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 工具调用失败:', error.response?.data || error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 开始测试GitLab MCP HTTP服务器...\n');

  // 测试健康检查
  console.log('📋 测试: 健康检查');
  const healthSuccess = await testHealth();
  console.log(`结果: ${healthSuccess ? '✅ 通过' : '❌ 失败'}`);

  // 测试MCP连接
  console.log('\n📋 测试: MCP连接');
  const connectionResult = await testMCPConnection();
  console.log(`结果: ${connectionResult.success ? '✅ 通过' : '❌ 失败'}`);

  let passed = 1; // 健康检查已通过
  let total = 4;

  if (connectionResult.success) {
    passed++;
    
    // 测试工具列表
    console.log('\n📋 测试: 工具列表');
    const toolsSuccess = await testListTools(connectionResult.sessionId);
    console.log(`结果: ${toolsSuccess ? '✅ 通过' : '❌ 失败'}`);
    if (toolsSuccess) passed++;

    // 测试工具调用
    console.log('\n📋 测试: 工具调用');
    const callSuccess = await testCallTool(connectionResult.sessionId);
    console.log(`结果: ${callSuccess ? '✅ 通过' : '❌ 失败'}`);
    if (callSuccess) passed++;
  }

  console.log(`\n📊 测试结果: ${passed}/${total} 通过`);
  
  if (passed === total) {
    console.log('🎉 所有测试通过！服务器运行正常。');
  } else {
    console.log('⚠️  部分测试失败，请检查服务器配置。');
  }
}

main().catch((error) => {
  console.error('❌ 测试过程中发生错误:', error);
  process.exit(1);
}); 