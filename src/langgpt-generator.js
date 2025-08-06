const yaml = require('js-yaml');

class LangGPTPromptGenerator {
  constructor() {
    this.templates = this.initializeTemplates();
  }

  // 初始化模板
  initializeTemplates() {
    return {
      '基础角色模板': {
        name: '基础角色模板',
        description: '适用于大多数角色的基础模板',
        template: this.getBasicTemplate()
      },
      '专家角色模板': {
        name: '专家角色模板',
        description: '适用于专业领域专家的模板',
        template: this.getExpertTemplate()
      },
      '助手角色模板': {
        name: '助手角色模板',
        description: '适用于AI助手的模板',
        template: this.getAssistantTemplate()
      },
      '教师角色模板': {
        name: '教师角色模板',
        description: '适用于教学和培训的模板',
        template: this.getTeacherTemplate()
      }
    };
  }

  // 获取基础模板
  getBasicTemplate() {
    return `# Role: {{role}}

## Profile
- Author: LangGPT Prompt Generator
- Version: 1.0
- Language: 中文
- Description: {{description}}

## Background
{{background}}

## Goals
{{goals}}

## Constraints
{{constraints}}

## Skills
{{skills}}

## Workflows
{{workflows}}

## Commands
{{commands}}

## Initialization
{{initialization}}`;
  }

  // 获取专家模板
  getExpertTemplate() {
    return `# Role: {{role}}

## Profile
- Author: LangGPT Prompt Generator
- Version: 1.0
- Language: 中文
- Description: {{description}}
- Expertise: {{expertise}}

## Background
{{background}}

## Goals
{{goals}}

## Constraints
{{constraints}}

## Skills
{{skills}}

## Workflows
{{workflows}}

## Commands
{{commands}}

## Initialization
{{initialization}}`;
  }

  // 获取助手模板
  getAssistantTemplate() {
    return `# Role: {{role}}

## Profile
- Author: LangGPT Prompt Generator
- Version: 1.0
- Language: 中文
- Description: {{description}}

## Background
{{background}}

## Goals
{{goals}}

## Constraints
{{constraints}}

## Skills
{{skills}}

## Workflows
{{workflows}}

## Commands
{{commands}}

## Initialization
{{initialization}}`;
  }

  // 获取教师模板
  getTeacherTemplate() {
    return `# Role: {{role}}

## Profile
- Author: LangGPT Prompt Generator
- Version: 1.0
- Language: 中文
- Description: {{description}}
- Teaching Style: {{teaching_style}}

## Background
{{background}}

## Goals
{{goals}}

## Constraints
{{constraints}}

## Skills
{{skills}}

## Workflows
{{workflows}}

## Commands
{{commands}}

## Initialization
{{initialization}}`;
  }

  // 生成prompt
  async generatePrompt(role, requirements, format = 'markdown') {
    try {
      // 分析角色和要求
      const analysis = this.analyzeRequirements(role, requirements);
      
      // 选择合适的模板
      const template = this.selectTemplate(analysis);
      
      // 填充模板
      const filledTemplate = this.fillTemplate(template, analysis);
      
      // 格式化输出
      return this.formatOutput(filledTemplate, format);
    } catch (error) {
      throw new Error(`生成prompt失败: ${error.message}`);
    }
  }

  // 分析需求
  analyzeRequirements(role, requirements) {
    const analysis = {
      role: role,
      description: '',
      background: '',
      goals: [],
      constraints: [],
      skills: [],
      workflows: [],
      commands: [],
      initialization: '',
      expertise: '',
      teaching_style: ''
    };

    // 解析角色描述
    if (typeof requirements === 'string') {
      analysis.description = requirements;
    } else if (typeof requirements === 'object') {
      Object.assign(analysis, requirements);
    }

    // 如果没有提供描述，生成默认描述
    if (!analysis.description) {
      analysis.description = `专业的${role}，能够提供高质量的服务和解决方案`;
    }

    // 生成默认内容
    this.generateDefaultContent(analysis);

    return analysis;
  }

  // 生成默认内容
  generateDefaultContent(analysis) {
    // 默认背景
    if (!analysis.background) {
      analysis.background = `我是一位经验丰富的${analysis.role}，拥有深厚的专业知识和丰富的实践经验。我致力于为用户提供最优质的服务和解决方案。`;
    }

    // 默认目标
    if (analysis.goals.length === 0) {
      analysis.goals = [
        `提供专业、准确的${analysis.role}服务`,
        '确保用户获得满意的体验',
        '持续学习和改进，保持专业水准'
      ];
    }

    // 默认约束
    if (analysis.constraints.length === 0) {
      analysis.constraints = [
        '始终遵循道德和法律准则',
        '提供准确、可靠的信息',
        '保护用户隐私和数据安全',
        '保持专业和礼貌的态度'
      ];
    }

    // 默认技能
    if (analysis.skills.length === 0) {
      analysis.skills = [
        '专业领域知识',
        '问题分析和解决能力',
        '沟通和表达能力',
        '持续学习能力'
      ];
    }

    // 默认工作流程
    if (analysis.workflows.length === 0) {
      analysis.workflows = [
        '理解用户需求',
        '分析问题并提供解决方案',
        '执行相应的操作或提供建议',
        '确认用户满意度'
      ];
    }

    // 默认命令
    if (analysis.commands.length === 0) {
      analysis.commands = [
        '/help - 显示帮助信息',
        '/start - 开始新的任务',
        '/status - 查看当前状态'
      ];
    }

    // 默认初始化
    if (!analysis.initialization) {
      analysis.initialization = `你好！我是你的${analysis.role}助手。请告诉我你需要什么帮助，我会尽力为你提供专业的服务。`;
    }
  }

  // 选择模板
  selectTemplate(analysis) {
    // 根据角色类型选择合适的模板
    const roleLower = analysis.role.toLowerCase();
    
    if (roleLower.includes('专家') || roleLower.includes('expert')) {
      return this.templates['专家角色模板'].template;
    } else if (roleLower.includes('教师') || roleLower.includes('teacher')) {
      return this.templates['教师角色模板'].template;
    } else if (roleLower.includes('助手') || roleLower.includes('assistant')) {
      return this.templates['助手角色模板'].template;
    } else {
      return this.templates['基础角色模板'].template;
    }
  }

  // 填充模板
  fillTemplate(template, analysis) {
    let filledTemplate = template;

    // 替换所有占位符
    Object.keys(analysis).forEach(key => {
      const placeholder = `{{${key}}}`;
      let value = analysis[key];

      // 处理数组类型
      if (Array.isArray(value)) {
        value = value.map(item => `- ${item}`).join('\n');
      }

      filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), value);
    });

    return filledTemplate;
  }

  // 格式化输出
  formatOutput(template, format) {
    switch (format.toLowerCase()) {
      case 'yaml':
        return this.convertToYAML(template);
      case 'json':
        return this.convertToJSON(template);
      case 'markdown':
      default:
        return template;
    }
  }

  // 转换为YAML格式
  convertToYAML(template) {
    // 简单的markdown到YAML转换
    const lines = template.split('\n');
    const yamlLines = [];
    
    lines.forEach(line => {
      if (line.startsWith('# ')) {
        yamlLines.push(line.replace('# ', ''));
      } else if (line.startsWith('## ')) {
        yamlLines.push(line.replace('## ', ''));
      } else if (line.startsWith('- ')) {
        yamlLines.push(`  ${line}`);
      } else if (line.trim()) {
        yamlLines.push(`  ${line}`);
      }
    });

    return yamlLines.join('\n');
  }

  // 转换为JSON格式
  convertToJSON(template) {
    // 简单的markdown到JSON转换
    const sections = {};
    let currentSection = '';
    let currentContent = [];

    const lines = template.split('\n');
    
    lines.forEach(line => {
      if (line.startsWith('# ')) {
        sections.role = line.replace('# Role: ', '');
      } else if (line.startsWith('## ')) {
        if (currentSection && currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = line.replace('## ', '').toLowerCase();
        currentContent = [];
      } else if (line.trim() && currentSection) {
        currentContent.push(line);
      }
    });

    if (currentSection && currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n').trim();
    }

    return JSON.stringify(sections, null, 2);
  }

  // 获取模板列表
  getTemplates() {
    return Object.keys(this.templates).map(key => ({
      id: key,
      ...this.templates[key]
    }));
  }
}

module.exports = { LangGPTPromptGenerator }; 