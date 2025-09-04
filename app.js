/**
 * FuncNote 应用程序主文件
 * 处理编辑器交互和实时预览
 */
class FuncNoteApp {
    constructor() {
        this.parser = new FuncNoteParser();
        this.editor = document.querySelector('.editor');
        this.preview = document.querySelector('.preview');
        this.autocompleteContainer = null;
        this.selectedIndex = -1;
        
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
        
        // 检查是否刚输入了 @
        const lastAtIndex = beforeCursor.lastIndexOf('@');
        if (lastAtIndex === -1) {
            this.hideAutocomplete();
            return;
        }
        
        const afterAt = beforeCursor.substring(lastAtIndex + 1);
        
        // 如果@后面有空格或其他字符，则不显示自动补全
        if (afterAt.includes(' ') || afterAt.includes('\n') || afterAt.includes('(')) {
            this.hideAutocomplete();
            return;
        }
        
        // 显示自动补全
        this.showAutocomplete(afterAt);
    }

    showAutocomplete(filter = '') {
        const functions = this.parser.getFunctions();
        const filtered = functions.filter(func => 
            func.name.toLowerCase().startsWith(filter.toLowerCase())
        );
        
        if (filtered.length === 0) {
            this.hideAutocomplete();
            return;
        }
        
        if (!this.autocompleteContainer) {
            this.autocompleteContainer = document.createElement('div');
            this.autocompleteContainer.className = 'autocomplete';
            document.body.appendChild(this.autocompleteContainer);
        }
        
        // 清空现有内容
        this.autocompleteContainer.innerHTML = '';
        
        // 添加选项
        filtered.forEach((func, index) => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = `${func.name}(${func.params.join(', ')})`;
            item.addEventListener('click', () => this.selectAutocompleteItem(item, func));
            this.autocompleteContainer.appendChild(item);
        });
        
        // 定位自动补全容器
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

    selectAutocompleteItem(item, func = null) {
        if (!func) {
            // 从文本中提取函数名
            const funcName = item.textContent.split('(')[0];
            func = this.parser.getFunctions().find(f => f.name === funcName);
        }
        
        if (func) {
            this.insertFunctionTemplate(func.name);
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
    }

    render() {
        const content = this.editor.value;
        const parsed = this.parser.parse(content);
        
        this.preview.innerHTML = '';
        
        parsed.forEach(block => {
            const element = this.renderBlock(block);
            this.preview.appendChild(element);
        });
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
                
            case 'error':
                return this.renderError(block.message);
                
            default:
                return this.renderError(`未知的块类型: ${block.type}`);
        }
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
    new FuncNoteApp();
});
