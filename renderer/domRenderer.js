/**
 * DOM 渲染器：根据解析结果渲染到指定容器
 * 未来可扩展其它渲染器(JSON/Markdown)
 */
class DOMRenderer {
  constructor(options = {}) {
    this.document = options.document || (typeof document !== 'undefined' ? document : null);
  }

  render(nodes, container) {
    if (!this.document || !container) return;
    container.innerHTML = '';
    nodes.forEach(node => {
      container.appendChild(this.renderNode(node));
    });
  }

  renderNode(block) {
    switch (block.type) {
      case 'head': return this.renderHead(block.params);
      case 'code': return this.renderCode(block.params);
      case 'paragraph': return this.renderParagraph(block.params);
      case 'list': return this.renderList(block.params);
      case 'image': return this.renderImage(block.params);
  case 'table': return this.renderTable(block.params);
      case 'error': return this.renderError(block.message || block.code || 'Error');
      default: return this.renderError(`未知的块类型: ${block.type}`);
    }
  }

  renderHead(params) {
    const element = this.document.createElement('div');
    element.className = `func-head rank-${params.rank || 1}`;
    element.textContent = params.text || '';
    return element;
  }

  renderCode(params) {
    const container = this.document.createElement('div');
    container.className = 'func-code';
    if (params.title) {
      const title = this.document.createElement('div');
      title.className = 'code-title';
      title.textContent = `${params.title} ${params.language ? `(${params.language})` : ''}`;
      container.appendChild(title);
    }
    const content = this.document.createElement('div');
    content.className = 'code-content';
    content.textContent = params.text || '';
    container.appendChild(content);
    return container;
  }

  renderParagraph(params) {
    const element = this.document.createElement('div');
    element.className = 'func-paragraph';
    element.textContent = params.text || '';
    return element;
  }

  renderList(params) {
    const listType = params.type === 'ol' ? 'ol' : 'ul';
    const element = this.document.createElement(listType);
    element.className = 'func-list';
    if (params.items) {
      const items = params.items.includes('|') ? params.items.split('|') : params.items.split('\n');
      items.forEach(item => {
        const trimmedItem = item.trim();
        if (trimmedItem) {
          const li = this.document.createElement('li');
          li.textContent = trimmedItem;
          element.appendChild(li);
        }
      });
    }
    return element;
  }

  renderImage(params) {
    const container = this.document.createElement('div');
    container.className = 'func-image';
    const img = this.document.createElement('img');
    img.src = params.src || '';
    img.alt = params.alt || '';
    if (params.width) img.style.width = /px$/.test(params.width) ? params.width : params.width + 'px';
    if (params.height) img.style.height = /px$/.test(params.height) ? params.height : params.height + 'px';
    img.onerror = () => {
      container.innerHTML = '';
      const err = this.renderError(`图片加载失败: ${params.src}`);
      container.appendChild(err);
    };
    container.appendChild(img);
    return container;
  }

  renderError(message) {
    const element = this.document.createElement('div');
    element.className = 'error';
    element.textContent = message;
    return element;
  }

  renderTable(params) {
    const table = this.document.createElement('table');
    table.className = 'func-table';
    if (!params.rows) return table;
    const rows = params.rows.split('|').map(r => r.split(',').map(c => c.trim()));
    const alignMap = (params.align || '').split(',').map(a => a.trim());
    const header = params.header === true || params.header === 'true';

    const buildRow = (cols, isHeader) => {
      const tr = this.document.createElement('tr');
      cols.forEach((col, idx) => {
        const cell = this.document.createElement(isHeader ? 'th' : 'td');
        cell.textContent = col;
        const align = alignMap[idx];
        if (align === 'l') cell.style.textAlign = 'left';
        else if (align === 'c') cell.style.textAlign = 'center';
        else if (align === 'r') cell.style.textAlign = 'right';
        tr.appendChild(cell);
      });
      return tr;
    };

    if (rows.length) {
      if (header) {
        table.appendChild(buildRow(rows[0], true));
        rows.slice(1).forEach(r => table.appendChild(buildRow(r, false)));
      } else {
        rows.forEach(r => table.appendChild(buildRow(r, false)));
      }
    }
    return table;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DOMRenderer;
}

// 浏览器全局暴露，供 app.js 直接访问
if (typeof window !== 'undefined') {
  window.DOMRenderer = DOMRenderer;
}
