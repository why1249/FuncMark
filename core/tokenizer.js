/**
 * 简易 tokenizer：按行扫描，识别函数起始与普通文本。
 * 输出 token: { type: 'function_start'|'text'|'whitespace', value, line, column }
 * 多行函数：这里只标记起始行，主体交由 parser 继续收集。
 */
function tokenize(input) {
  const lines = input.split('\n');
  const tokens = [];
  for (let i = 0; i < lines.length; i++) {
    const original = lines[i];
    const trimmed = original.trim();
    const lineNo = i + 1;
    if (!trimmed) {
      tokens.push({ type: 'whitespace', value: '', line: lineNo, column: 1 });
      continue;
    }
    if (trimmed.startsWith('@')) {
      tokens.push({ type: 'function_start', value: original, line: lineNo, column: original.indexOf('@') + 1 });
    } else {
      tokens.push({ type: 'text', value: original, line: lineNo, column: 1 });
    }
  }
  return tokens;
}

module.exports = { tokenize };

