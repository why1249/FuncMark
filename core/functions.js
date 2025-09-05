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
  },
  image: {
    params: ['src', 'alt', 'width', 'height'],
    defaults: { alt: '', width: '', height: '' },
    description: '图片，支持可选宽高(px)'
  },
  table: {
    params: ['rows', 'header', 'align'],
    defaults: { header: 'false', align: '' },
    description: '表格，rows="a,b|c,d" header=true/false align="l,c,r" (列对齐,逗号分隔)'
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

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    functionSchemas,
    getFunctionList
  };
}

// 浏览器环境暴露
if (typeof window !== 'undefined') {
  window.FuncMarkFunctionSchemas = functionSchemas;
  window.FuncMarkGetFunctionList = getFunctionList;
}
