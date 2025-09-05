/**
 * 内置函数 schema 定义
 * 每个函数: { params: string[], defaults: object, description?: string }
 */
const functionSchemas = {
  head: {
    params: ['text', 'rank'],
    defaults: { rank: 1 },
    description: '标题，rank=1..6'
  },
  code: {
    params: ['text', 'language', 'title'],
    defaults: { language: '', title: '' },
    description: '代码块显示'
  },
  paragraph: {
    params: ['text'],
    defaults: {},
    description: '普通段落'
  },
  list: {
    params: ['items', 'type'],
    defaults: { type: 'ul' },
    description: '列表，type=ul|ol，items 用 | 或 换行分隔'
  }
};

function getFunctionList() {
  return Object.keys(functionSchemas).map(name => ({
    name,
    params: functionSchemas[name].params,
    defaults: functionSchemas[name].defaults,
    description: functionSchemas[name].description || ''
  }));
}

module.exports = {
  functionSchemas,
  getFunctionList
};
