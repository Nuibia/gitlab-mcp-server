const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { LangGPTPromptGenerator } = require('./langgpt-generator');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 创建LangGPT prompt生成器实例
const promptGenerator = new LangGPTPromptGenerator();

// API路由
app.post('/api/generate-prompt', async (req, res) => {
  try {
    const { role, requirements, format = 'markdown' } = req.body;
    
    if (!role || !requirements) {
      return res.status(400).json({
        success: false,
        error: '请提供角色(role)和要求(requirements)'
      });
    }

    const prompt = await promptGenerator.generatePrompt(role, requirements, format);
    
    res.json({
      success: true,
      data: prompt
    });
  } catch (error) {
    console.error('生成prompt时出错:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 获取模板列表
app.get('/api/templates', (req, res) => {
  const templates = promptGenerator.getTemplates();
  res.json({
    success: true,
    data: templates
  });
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'LangGPT Prompt Generator 运行正常' });
});

app.listen(PORT, () => {
  console.log(`🚀 LangGPT Prompt Generator 服务已启动，端口: ${PORT}`);
  console.log(`📝 访问 http://localhost:${PORT} 查看Web界面`);
}); 