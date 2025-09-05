/**
 * FuncNote 语法解析器
 * 解析 @function(parameters) 格式的函数调用
 */
class FuncMarkParser {
    constructor() {
        // 引入外部函数 schema
        try {
            const { functionSchemas } = require('./core/functions.js');
            this.functions = functionSchemas;
        } catch (e) {
            // 浏览器环境兜底（仍保留旧结构, 避免加载失败）
            this.functions = {
                head: { params: ['text', 'rank'], defaults: { rank: 1 } },
                code: { params: ['text', 'language', 'title'], defaults: { language: '', title: '' } },
                paragraph: { params: ['text'], defaults: {} },
                list: { params: ['items', 'type'], defaults: { type: 'ul' } }
            };
        }

        // 错误构造工具
        try {
            const { ErrorCodes, buildError } = require('./core/errors.js');
            this.ErrorCodes = ErrorCodes;
            this.buildError = buildError;
        } catch (e) {
            this.ErrorCodes = { UNKNOWN_FUNCTION: 'FM001', SYNTAX_ERROR: 'FM000' };
            this.buildError = (code, message, loc) => ({ type: 'error', code, message, loc });
        }
    }

    /**
     * 解析 FuncNote 文本
     * @param {string} input - 输入的 FuncNote 文本
     * @returns {Array} 解析结果数组
     */
    parse(input) {
        const results = [];
        // 先用 tokenizer 拿到行级 token
        let tokens = [];
        try {
            const { tokenize } = require('./core/tokenizer.js');
            tokens = tokenize(input);
        } catch { // 浏览器模式尝试全局
            if (typeof tokenize === 'function') {
                tokens = tokenize(input);
            } else {
                // fallback: 原逻辑
                return this.legacyParse(input);
            }
        }

        const lines = input.split('\n');
        let inMultiLineCall = false;
        let blockContent = '';
        let parenCount = 0;
        let blockStartLine = 0;

        for (let i = 0; i < lines.length; i++) {
            const rawLine = lines[i];
            const line = rawLine.trim();
            const lineNumber = i + 1;

            if (line.startsWith('@') && !inMultiLineCall) {
                if (this.isCompleteFunctionCall(line)) {
                    results.push(this.parseBlock(line, { line: lineNumber }));
                } else if (line.includes('(')) {
                    inMultiLineCall = true;
                    blockContent = line;
                    parenCount = this.countParens(line);
                    blockStartLine = lineNumber;
                } else {
                    results.push(this.buildError(this.ErrorCodes.SYNTAX_ERROR, `语法错误: ${line}`, { line: lineNumber, column: 1 }));
                }
            } else if (inMultiLineCall) {
                blockContent += '\n' + rawLine; // 保留原格式
                parenCount += this.countParens(rawLine);
                if (parenCount <= 0) {
                    inMultiLineCall = false;
                    results.push(this.parseBlock(blockContent, { line: blockStartLine }));
                    blockContent = '';
                    parenCount = 0;
                }
            } else if (line.length > 0) {
                results.push({
                    type: 'paragraph',
                    params: { text: line },
                    loc: { line: lineNumber }
                });
            }
        }

        if (inMultiLineCall && blockContent) {
            // 未闭合括号
            results.push(this.buildError(this.ErrorCodes.UNCLOSED_PAREN || 'FM003', '未闭合的函数调用', { line: blockStartLine }));
        }

        return results;
    }

    // 旧解析逻辑兜底（极端情况下使用）
    legacyParse(input) {
        const lines = input.split('\n');
        const results = [];
        let inMultiLineCall = false;
        let blockContent = '';
        let parenCount = 0;
        let blockStartLine = 0;
        for (let i = 0; i < lines.length; i++) {
            const rawLine = lines[i];
            const line = rawLine.trim();
            const lineNumber = i + 1;
            if (line.startsWith('@') && !inMultiLineCall) {
                if (this.isCompleteFunctionCall(line)) {
                    results.push(this.parseBlock(line, { line: lineNumber }));
                } else if (line.includes('(')) {
                    inMultiLineCall = true;
                    blockContent = line;
                    parenCount = this.countParens(line);
                    blockStartLine = lineNumber;
                } else {
                    results.push(this.buildError(this.ErrorCodes.SYNTAX_ERROR, `语法错误: ${line}`, { line: lineNumber }));
                }
            } else if (inMultiLineCall) {
                blockContent += '\n' + rawLine;
                parenCount += this.countParens(rawLine);
                if (parenCount <= 0) {
                    inMultiLineCall = false;
                    results.push(this.parseBlock(blockContent, { line: blockStartLine }));
                    blockContent = '';
                }
            } else if (line.length > 0) {
                results.push({ type: 'paragraph', params: { text: line }, loc: { line: lineNumber } });
            }
        }
        if (inMultiLineCall && blockContent) {
            results.push(this.buildError(this.ErrorCodes.UNCLOSED_PAREN || 'FM003', '未闭合的函数调用', { line: blockStartLine }));
        }
        return results;
    }

    /**
     * 计算括号数量差（开括号 - 闭括号）
     */
    countParens(line) {
        let count = 0;
        let inQuotes = false;
        let quoteChar = '';
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuotes && line[i-1] !== '\\') {
                inQuotes = false;
                quoteChar = '';
            } else if (!inQuotes) {
                if (char === '(') {
                    count++;
                } else if (char === ')') {
                    count--;
                }
            }
        }
        
        return count;
    }

    /**
     * 检查是否是完整的函数调用
     */
    isCompleteFunctionCall(line) {
        let openParens = 0;
        let inQuotes = false;
        let quoteChar = '';
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuotes && line[i-1] !== '\\') {
                inQuotes = false;
                quoteChar = '';
            } else if (!inQuotes) {
                if (char === '(') {
                    openParens++;
                } else if (char === ')') {
                    openParens--;
                }
            }
        }
        
        return openParens === 0 && line.includes('(');
    }

    /**
     * 解析单个函数块
     */
    parseBlock(content, loc) {
        try {
            // 提取函数名
            const functionMatch = content.match(/@(\w+)\s*\(/);
            if (!functionMatch) {
                return this.buildError(this.ErrorCodes.SYNTAX_ERROR, '无法识别的函数格式', loc);
            }

            const functionName = functionMatch[1];
            
            // 检查函数是否支持
            if (!this.functions[functionName]) {
                return this.buildError(this.ErrorCodes.UNKNOWN_FUNCTION, `不支持的函数: ${functionName}` , loc);
            }

            // 提取参数部分
            const paramsMatch = content.match(/@\w+\s*\(([\s\S]*)\)/);
            if (!paramsMatch) {
                return this.buildError(this.ErrorCodes.PARAM_FORMAT_ERROR || 'FM002', '参数格式错误', loc);
            }

            const paramsString = paramsMatch[1];
            const parseResult = this.parseParameters(paramsString);
            if (parseResult.invalid) {
                return this.buildError(this.ErrorCodes.PARAM_FORMAT_ERROR || 'FM002', '参数格式错误', loc);
            }
            const params = parseResult.params;

            // 验证参数
            const validatedParams = this.validateParameters(functionName, params);
            
            return {
                type: functionName,
                params: validatedParams,
                loc
            };
        } catch (error) {
            return this.buildError(this.ErrorCodes.SYNTAX_ERROR, `解析错误: ${error.message}`, loc);
        }
    }

    /**
     * 解析参数字符串
     */
    parseParameters(paramsString) {
        const params = {};
        if (!paramsString.trim()) {
            return { params, invalid: false };
        }

        let normalized = paramsString
            .replace(/\n+/g, '\n')
            .replace(/\n\s+/g, ' ')
            .trim();

        const regex = /(\w+)\s*=\s*("(?:[^"\\]|\\.|[\n\r])*?"|'(?:[^'\\]|\\.|[\n\r])*?'|\w+)(?:\s*,|$)/g;
        let match;
        let consumedSpans = [];
        while ((match = regex.exec(normalized)) !== null) {
            const key = match[1];
            let value = match[2];
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
                value = value.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
            } else if (/^\d+$/.test(value)) {
                value = parseInt(value);
            }
            params[key] = value;
            consumedSpans.push({ start: match.index, end: match.index + match[0].length });
        }

        // 计算剩余未匹配字符（去掉逗号与空白后仍存在则为格式错误）
        let remainderMask = normalized.split('');
        consumedSpans.forEach(span => {
            for (let i = span.start; i < span.end; i++) remainderMask[i] = ' ';
        });
        const remainder = remainderMask.join('').replace(/[\s,]/g, '');
        const invalid = remainder.length > 0;
        return { params, invalid };
    }

    /**
     * 清理参数值（去除引号）
     */
    cleanValue(value) {
        value = value.trim();
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
            return value.slice(1, -1);
        }
        
        // 尝试转换数字
        if (/^\d+$/.test(value)) {
            return parseInt(value);
        }
        
        return value;
    }

    /**
     * 验证和补充参数
     */
    validateParameters(functionName, params) {
        const funcDef = this.functions[functionName];
        const result = { ...funcDef.defaults };
        
        // 添加提供的参数
        for (const key in params) {
            if (funcDef.params.includes(key)) {
                result[key] = params[key];
            }
        }
        
        return result;
    }

    /**
     * 获取所有支持的函数列表（用于自动补全）
     */
    getFunctions() {
        return Object.keys(this.functions).map(name => ({
            name: name,
            params: this.functions[name].params,
            defaults: this.functions[name].defaults
        }));
    }

    /**
     * 生成函数模板
     */
    generateTemplate(functionName) {
        if (!this.functions[functionName]) {
            return null;
        }

        const func = this.functions[functionName];
        const params = func.params.map(param => {
            const defaultValue = func.defaults[param] || '';
            return `    ${param}="${defaultValue}"`;
        }).join(',\n');

        return `@${functionName}(\n${params}\n)`;
    }
}

// 导出供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FuncMarkParser;
}
