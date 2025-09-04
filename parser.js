/**
 * FuncNote 语法解析器
 * 解析 @function(parameters) 格式的函数调用
 */
class FuncMarkParser {
    constructor() {
        // 支持的函数定义
        this.functions = {
            head: {
                params: ['text', 'rank'],
                defaults: { rank: 1 }
            },
            code: {
                params: ['text', 'language', 'title'],
                defaults: { language: '', title: '' }
            },
            paragraph: {
                params: ['text'],
                defaults: {}
            },
            list: {
                params: ['items', 'type'],
                defaults: { type: 'ul' }
            }
        };
    }

    /**
     * 解析 FuncNote 文本
     * @param {string} input - 输入的 FuncNote 文本
     * @returns {Array} 解析结果数组
     */
    parse(input) {
        const results = [];
        const lines = input.split('\n');
        let currentBlock = null;
        let inMultiLineCall = false;
        let blockContent = '';
        let parenCount = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('@') && !inMultiLineCall) {
                // 检查是否是完整的单行调用
                if (this.isCompleteFunctionCall(line)) {
                    results.push(this.parseBlock(line));
                } else if (line.includes('(')) {
                    // 开始多行函数调用
                    inMultiLineCall = true;
                    blockContent = line;
                    parenCount = this.countParens(line);
                } else {
                    results.push({ type: 'error', message: `语法错误: ${line}` });
                }
            } else if (inMultiLineCall) {
                blockContent += '\n' + lines[i]; // 保持原始格式
                parenCount += this.countParens(lines[i]);
                
                // 检查是否结束了多行调用
                if (parenCount <= 0) {
                    inMultiLineCall = false;
                    results.push(this.parseBlock(blockContent));
                    blockContent = '';
                    parenCount = 0;
                }
            } else if (line.length > 0) {
                // 处理普通文本
                results.push({
                    type: 'paragraph',
                    params: { text: line }
                });
            }
        }

        // 处理最后一个未完成的块
        if (inMultiLineCall && blockContent) {
            results.push(this.parseBlock(blockContent));
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
    parseBlock(content) {
        try {
            // 提取函数名
            const functionMatch = content.match(/@(\w+)\s*\(/);
            if (!functionMatch) {
                return { type: 'error', message: '无法识别的函数格式' };
            }

            const functionName = functionMatch[1];
            
            // 检查函数是否支持
            if (!this.functions[functionName]) {
                return { type: 'error', message: `不支持的函数: ${functionName}` };
            }

            // 提取参数部分
            const paramsMatch = content.match(/@\w+\s*\(([\s\S]*)\)/);
            if (!paramsMatch) {
                return { type: 'error', message: '参数格式错误' };
            }

            const paramsString = paramsMatch[1];
            const params = this.parseParameters(paramsString);
            
            // 验证参数
            const validatedParams = this.validateParameters(functionName, params);
            
            return {
                type: functionName,
                params: validatedParams
            };
        } catch (error) {
            return { type: 'error', message: `解析错误: ${error.message}` };
        }
    }

    /**
     * 解析参数字符串
     */
    parseParameters(paramsString) {
        const params = {};
        
        if (!paramsString.trim()) {
            return params;
        }

        // 移除换行符并规范化空格，但要小心字符串内容
        let normalized = paramsString.replace(/\s*\n\s*/g, ' ').trim();
        
        // 改进的参数解析：先找到所有的键值对
        const regex = /(\w+)\s*=\s*("(?:[^"\\]|\\.|[\n\r])*?"|'(?:[^'\\]|\\.|[\n\r])*?'|\w+)(?:\s*,|$)/g;
        let match;
        
        while ((match = regex.exec(normalized)) !== null) {
            const key = match[1];
            let value = match[2];
            
            // 清理值
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            } else if (/^\d+$/.test(value)) {
                value = parseInt(value);
            }
            
            params[key] = value;
        }
        
        return params;
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
