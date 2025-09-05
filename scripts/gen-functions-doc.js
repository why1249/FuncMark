#!/usr/bin/env node
/**
 * 生成 docs/Functions.md (自动化)
 */
const fs = require('fs');
const path = require('path');

// 加载函数 schema
const functionsPath = path.join(__dirname, '..', 'core', 'functions.js');
// 使用 require 获取 functionSchemas
// eslint/缓存问题忽略：开发阶段直接 require
const { functionSchemas } = require(functionsPath);

const outFile = path.join(__dirname, '..', 'docs', 'Functions.md');

function mdEscape(str) {
  return String(str).replace(/\|/g, '\\|');
}

function buildHeader() {
  const date = new Date().toISOString().slice(0,10);
  return `# FuncMark 内置函数参考\n\n> 本文件由脚本自动生成 (scripts/gen-functions-doc.js) - 生成日期: ${date}\n> 请勿手动编辑，此文件会被覆盖。\n\n`;
}

function buildTOC(funcNames) {
  return '## 目录\n' + funcNames.map(n => `- [${n}](#${n})`).join('\n') + '\n\n---\n\n';
}

function buildFunctionSection(name, def) {
  const params = def.params || [];
  const defaults = def.defaults || {};
  const description = def.description || '';

  let table = '| 参数 | 必填 | 默认 | 说明 |\n|------|------|------|------|\n';
  params.forEach(p => {
    const hasDefault = Object.prototype.hasOwnProperty.call(defaults, p);
    const required = hasDefault ? '否' : '是';
    const defVal = hasDefault ? (defaults[p] === '' ? '""' : mdEscape(defaults[p])) : '';
    table += `| ${p} | ${required} | ${defVal} |  |\n`;
  });

  const sampleParams = params.map(p => {
    if (Object.prototype.hasOwnProperty.call(defaults, p)) {
      const v = defaults[p];
      return `${p}="${v}"`;
    }
    return `${p}="${p}_value"`;
  }).join(', ');
  const sample = `@${name}(${sampleParams})`;

  return `### ${name}\n\n${description ? description + '\n\n' : ''}${table}\n示例：\n\n\n\`\`\`\n${sample}\n\`\`\`\n\n---\n\n`;
}

function buildDocument() {
  const funcNames = Object.keys(functionSchemas);
  let content = buildHeader();
  content += buildTOC(funcNames);
  funcNames.forEach(name => {
    content += buildFunctionSection(name, functionSchemas[name]);
  });
  content += '生成逻辑: 遍历 core/functions.js 中的 functionSchemas。';
  return content;
}

const md = buildDocument();
fs.writeFileSync(outFile, md, 'utf-8');
console.log('Functions.md 已生成/更新。');
