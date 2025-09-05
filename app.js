/**
 * FuncNote 应用程序主文件
 * 处理编辑器交互和实时预览
 */
class FuncMarkApp {
    constructor() {
        this.parser = new FuncMarkParser();
        this.editor = document.querySelector('.editor');
        this.preview = document.querySelector('.preview');
        this.autocompleteContainer = null;
        this.selectedIndex = -1;
        // 引入 DOM 渲染器
        try {
            const DOMRenderer = window.DOMRenderer || require('./renderer/domRenderer.js');
            this.renderer = new DOMRenderer({ document });
        } catch (e) {
            this.renderer = null;
        }
        
        this.init();
    }

    init() {
        // 绑定编辑器事件
        this.editor.addEventListener('input', () => this.handleInput());
        this.editor.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.editor.addEventListener('blur', () => this.hideAutocomplete());
        
        // 初始渲染
        this.render();
        
        // 设置示例内容
        this.setExampleContent();
    }

    setExampleContent() {
        const example = `@head(text="FuncMark 示例文档", rank=1)

@paragraph(text="这是一个使用 FuncMark 语法编写的示例文档。")

@head(text="功能特点", rank=2)

@list(items="函数调用式语法|实时预览|自动补全|多行支持", type="ul")

@head(text="代码示例", rank=2)

@code(
    text="function hello() {
    console.log('Hello, FuncMark!');
    return 'Welcome to FuncMark';
}",
    language="javascript",
    title="JavaScript 示例"
)

@head(text="使用步骤", rank=2)

@list(items="输入 @ 触发自动补全|选择函数并填写参数|查看右侧实时预览|保存或导出结果", type="ol")

@paragraph(text="FuncMark 支持实时预览，您可以在左侧编辑，右侧会实时显示渲染结果。")`;

        this.editor.value = example;
        this.render();
    }

    handleInput() {
        this.render();
        this.handleAutocomplete();
    }

    handleKeydown(e) {
        if (this.autocompleteContainer && this.autocompleteContainer.style.display !== 'none') {
            const items = this.autocompleteContainer.querySelectorAll('.autocomplete-item');
            
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
                    this.updateAutocompleteSelection(items);
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
                    this.updateAutocompleteSelection(items);
                    break;
                    
                case 'Enter':
                    e.preventDefault();
                    if (this.selectedIndex >= 0 && this.selectedIndex < items.length) {
                        this.selectAutocompleteItem(items[this.selectedIndex]);
                    }
                    break;
                    
                case 'Escape':
                    this.hideAutocomplete();
                    break;
            }
        }
    }

    handleAutocomplete() {
        const cursorPos = this.editor.selectionStart;
        const text = this.editor.value;
        const beforeCursor = text.substring(0, cursorPos);
        
        // 优先检测是否在函数参数上下文中
        if (this.tryParameterAutocomplete(beforeCursor)) {
            return;
        }

        // 普通函数名补全上下文
        const lastAtIndex = beforeCursor.lastIndexOf('@');
        if (lastAtIndex === -1) {
            this.hideAutocomplete();
            return;
        }
        const afterAt = beforeCursor.substring(lastAtIndex + 1);
        if (afterAt.includes(' ') || afterAt.includes('\n') || afterAt.includes('(')) {
            this.hideAutocomplete();
            return;
        }
        this.showAutocomplete(afterAt, 'function');
    }

    showAutocomplete(filter = '', mode = 'function', extra = {}) {
        if (!this.autocompleteContainer) {
            this.autocompleteContainer = document.createElement('div');
            this.autocompleteContainer.className = 'autocomplete';
            document.body.appendChild(this.autocompleteContainer);
        }

        let itemsData = [];
        if (mode === 'function') {
            let functions = this.parser.getFunctions();
            if ((!functions || !functions.length) && window.FuncMarkGetFunctionList) {
                functions = window.FuncMarkGetFunctionList();
            }
            itemsData = functions.filter(func => func.name.toLowerCase().startsWith(filter.toLowerCase()))
                .map(f => ({ kind: 'function', data: f }));
        } else if (mode === 'param') {
            const { funcSchema, existingParams } = extra;
            if (funcSchema) {
                funcSchema.params.forEach(p => {
                    if (!existingParams.includes(p)) {
                        const defVal = funcSchema.defaults[p] !== undefined ? funcSchema.defaults[p] : '';
                        itemsData.push({ kind: 'param', data: { name: p, defaultValue: defVal } });
                    }
                });
            }
        }

        // 限制最多显示 5 个，避免视觉负担
        const MAX_AUTOCOMPLETE_ITEMS = 5;
        if (itemsData.length > MAX_AUTOCOMPLETE_ITEMS) {
            itemsData = itemsData.slice(0, MAX_AUTOCOMPLETE_ITEMS);
        }

        if (itemsData.length === 0) {
            this.hideAutocomplete();
            return;
        }

        this.autocompleteMode = mode;
        this.autocompleteExtra = extra;
        this.autocompleteContainer.innerHTML = '';
        itemsData.forEach(obj => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            if (obj.kind === 'function') {
                const f = obj.data;
                item.textContent = `${f.name}(${f.params.join(', ')})`;
            } else if (obj.kind === 'param') {
                const p = obj.data;
                item.textContent = `${p.name}="${p.defaultValue}"`;
            }
            item.dataset.kind = obj.kind;
            item.dataset.payload = JSON.stringify(obj.data);
            item.addEventListener('click', () => this.selectAutocompleteItem(item, obj.data));
            this.autocompleteContainer.appendChild(item);
        });

        this.positionAutocomplete();
        this.autocompleteContainer.style.display = 'block';
        this.selectedIndex = 0;
        this.updateAutocompleteSelection(this.autocompleteContainer.querySelectorAll('.autocomplete-item'));
    }

    positionAutocomplete() {
        const editorRect = this.editor.getBoundingClientRect();
        const cursorPos = this.getCursorPosition();
        
        this.autocompleteContainer.style.left = `${editorRect.left + cursorPos.x}px`;
        this.autocompleteContainer.style.top = `${editorRect.top + cursorPos.y + 20}px`;
    }

    getCursorPosition() {
        // 简化的光标位置计算，实际项目中可能需要更精确的计算
        return { x: 0, y: 0 };
    }

    updateAutocompleteSelection(items) {
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
    }

    selectAutocompleteItem(item, payload = null) {
        const kind = item.dataset.kind;
        if (this.autocompleteMode === 'function' || kind === 'function') {
            let func = payload;
            if (!func) {
                const funcName = item.textContent.split('(')[0];
                func = this.parser.getFunctions().find(f => f.name === funcName);
            }
            if (func) this.insertFunctionTemplate(func.name);
        } else if (this.autocompleteMode === 'param' || kind === 'param') {
            const data = JSON.parse(item.dataset.payload || '{}');
            this.insertParameterSnippet(data.name, data.defaultValue);
        }
        this.hideAutocomplete();
    }

    insertFunctionTemplate(functionName) {
        const template = this.parser.generateTemplate(functionName);
        const cursorPos = this.editor.selectionStart;
        const text = this.editor.value;
        const beforeCursor = text.substring(0, cursorPos);
        const afterCursor = text.substring(cursorPos);
        
        // 找到最后一个@的位置
        const lastAtIndex = beforeCursor.lastIndexOf('@');
        if (lastAtIndex !== -1) {
            const newText = beforeCursor.substring(0, lastAtIndex) + template + afterCursor;
            this.editor.value = newText;
            
            // 设置光标位置到第一个参数
            const firstQuoteIndex = newText.indexOf('"', lastAtIndex);
            if (firstQuoteIndex !== -1) {
                this.editor.setSelectionRange(firstQuoteIndex + 1, firstQuoteIndex + 1);
            }
            
            this.render();
        }
    }

    hideAutocomplete() {
        if (this.autocompleteContainer) {
            this.autocompleteContainer.style.display = 'none';
        }
        this.selectedIndex = -1;
        this.autocompleteMode = null;
        this.autocompleteExtra = null;
    }

    // 参数级自动补全：识别是否位于 @func( ... 光标 ... 未闭合 ) 内
    tryParameterAutocomplete(beforeCursor) {
        // 找到最后的函数起点 @name(
        const funcPattern = /@([a-zA-Z_]\w*)\(/g;
        let match; let lastMatch = null;
        while ((match = funcPattern.exec(beforeCursor)) !== null) {
            lastMatch = match;
        }
        if (!lastMatch) return false;
        const funcName = lastMatch[1];
        const openIndex = lastMatch.index + lastMatch[0].length; // 指向 ( 之后
        const inside = beforeCursor.substring(openIndex); // 从 ( 后到光标
        // 如果 inside 包含未转义的 )，说明光标已在函数外
        if (inside.includes(')')) return false;
        // 检测是否在字符串内（简单计数引号奇偶）
        const quoteCount = (inside.match(/"/g) || []).length + (inside.match(/'/g) || []).length;
        if (quoteCount % 2 === 1) return false; // 简单处理：字符串内不提示

        // 获取函数 schema
        let schema = (this.parser.functions && this.parser.functions[funcName]) || null;
        if (!schema && window.FuncMarkFunctionSchemas) {
            schema = window.FuncMarkFunctionSchemas[funcName];
        }
        if (!schema) return false;

        // 已存在参数名
        const existingParams = Array.from(inside.matchAll(/(\w+)\s*=/g)).map(m => m[1]);
        // 若全部参数都已存在则不显示
        const remaining = schema.params.filter(p => !existingParams.includes(p));
        if (remaining.length === 0) {
            this.hideAutocomplete();
            return false;
        }

        this.showAutocomplete('', 'param', { funcSchema: schema, existingParams });
        return true;
    }

    insertParameterSnippet(name, defaultValue) {
        const cursorPos = this.editor.selectionStart;
        const text = this.editor.value;
        // 在光标位置前向后找最近的 '(' 未闭合的函数调用区域范围
        let insertPos = cursorPos;
        // 简单插入：若前一个非空白且不是 '(' 或 ',' 则先补 ', '
        let prefix = '';
        if (cursorPos > 0) {
            const prevChar = text[cursorPos - 1];
            if (prevChar !== '(' && prevChar !== ',' && prevChar !== ' ' && prevChar !== '\n') {
                prefix = ', ';
            } else if (prevChar === '(') {
                // no prefix
            } else if (prevChar === ',') {
                prefix = ' ';
            }
        }
        const snippet = `${prefix}${name}="${defaultValue}"`;
        const newText = text.substring(0, cursorPos) + snippet + text.substring(cursorPos);
        this.editor.value = newText;
        // 定位光标：若 defaultValue 为空，将光标放在引号中间最后插入位置 -1
        if (defaultValue === '') {
            const quoteStart = cursorPos + snippet.indexOf('"') + 1;
            this.editor.setSelectionRange(quoteStart, quoteStart);
        } else {
            const endPos = cursorPos + snippet.length;
            this.editor.setSelectionRange(endPos, endPos);
        }
        this.render();
    }

    render() {
        const content = this.editor.value;
        const parsed = this.parser.parse(content);
        if (this.renderer) {
            this.renderer.render(parsed, this.preview);
        } else {
            // 回退旧逻辑
            this.preview.innerHTML = '';
            parsed.forEach(block => {
                const element = this.renderBlock(block);
                this.preview.appendChild(element);
            });
        }
    }

    renderBlock(block) {
        const container = document.createElement('div');
        container.className = 'func-block';
        
        switch (block.type) {
            case 'head':
                return this.renderHead(block.params);
                
            case 'code':
                return this.renderCode(block.params);
                
            case 'paragraph':
                return this.renderParagraph(block.params);
                
            case 'list':
                return this.renderList(block.params);
            
            case 'image':
                // 回退模式下简单渲染 image（避免 DOMRenderer 加载失败时出现未知类型）
                return this.renderImageFallback(block.params);
                
            case 'error':
                return this.renderError(block.message);
                
            default:
                return this.renderError(`未知的块类型: ${block.type}`);
        }
    }

    // 简单的 image 回退渲染（不重复 DOMRenderer 复杂逻辑）
    renderImageFallback(params) {
        const wrapper = document.createElement('div');
        wrapper.className = 'func-image';
        const img = document.createElement('img');
        img.src = params.src || '';
        img.alt = params.alt || '';
        if (params.width) img.style.width = /px$/.test(params.width) ? params.width : params.width + 'px';
        if (params.height) img.style.height = /px$/.test(params.height) ? params.height : params.height + 'px';
        wrapper.appendChild(img);
        return wrapper;
    }

    renderHead(params) {
        const element = document.createElement('div');
        element.className = `func-head rank-${params.rank || 1}`;
        element.textContent = params.text || '';
        return element;
    }

    renderCode(params) {
        const container = document.createElement('div');
        container.className = 'func-code';
        
        if (params.title) {
            const title = document.createElement('div');
            title.className = 'code-title';
            title.textContent = `${params.title} ${params.language ? `(${params.language})` : ''}`;
            container.appendChild(title);
        }
        
        const content = document.createElement('div');
        content.className = 'code-content';
        content.textContent = params.text || '';
        container.appendChild(content);
        
        return container;
    }

    renderParagraph(params) {
        const element = document.createElement('div');
        element.className = 'func-paragraph';
        element.textContent = params.text || '';
        return element;
    }

    renderError(message) {
        const element = document.createElement('div');
        element.className = 'error';
        element.textContent = message;
        return element;
    }

    renderList(params) {
        const listType = params.type === 'ol' ? 'ol' : 'ul';
        const element = document.createElement(listType);
        element.className = 'func-list';
        
        if (params.items) {
            // 支持用 | 或换行符分隔的列表项
            const items = params.items.includes('|') 
                ? params.items.split('|') 
                : params.items.split('\n');
                
            items.forEach(item => {
                const trimmedItem = item.trim();
                if (trimmedItem) {
                    const li = document.createElement('li');
                    li.textContent = trimmedItem;
                    element.appendChild(li);
                }
            });
        }
        
        return element;
    }
}

// 当页面加载完成时初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new FuncMarkApp();
});

