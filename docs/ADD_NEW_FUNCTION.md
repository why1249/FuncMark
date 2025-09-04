# 如何添加新的 FuncMark 函数

本文档详细说明了如何在 FuncMark 中添加新的函数，包括解析器修改、渲染逻辑和测试用例。

## 📋 目录

1. [概述](#概述)
2. [添加步骤](#添加步骤)
3. [示例：添加列表函数](#示例添加列表函数)
4. [示例：添加图片函数](#示例添加图片函数)
5. [测试新函数](#测试新函数)
6. [最佳实践](#最佳实践)

## 概述

在 FuncMark 中添加新函数需要修改三个主要文件：
- `parser.js` - 定义函数的参数和默认值
- `app.js` - 实现函数的渲染逻辑
- `test.js` - 添加测试用例验证功能

## 添加步骤

### 步骤 1: 在解析器中注册函数

在 `parser.js` 文件中的 `functions` 对象里添加新函数定义：

```javascript
// 在 parser.js 的 constructor 中
this.functions = {
    // 现有函数...
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
    
    // 添加新函数
    newFunction: {
        params: ['param1', 'param2', 'param3'],
        defaults: { param2: 'defaultValue', param3: '' }
    }
};
```

### 步骤 2: 在应用中添加渲染逻辑

在 `app.js` 文件中的 `renderBlock` 方法里添加新的 case：

```javascript
renderBlock(block) {
    const container = document.createElement('div');
    container.className = 'func-block';
    
    switch (block.type) {
        // 现有 case...
        case 'head':
            return this.renderHead(block.params);
        case 'code':
            return this.renderCode(block.params);
        case 'paragraph':
            return this.renderParagraph(block.params);
            
        // 添加新的 case
        case 'newFunction':
            return this.renderNewFunction(block.params);
            
        case 'error':
            return this.renderError(block.message);
        default:
            return this.renderError(`未知的块类型: ${block.type}`);
    }
}
```

然后实现对应的渲染方法：

```javascript
renderNewFunction(params) {
    const element = document.createElement('div');
    element.className = 'func-new-function';
    
    // 实现具体的渲染逻辑
    element.textContent = params.param1 || '';
    
    return element;
}
```

### 步骤 3: 添加 CSS 样式

在 `index.html` 的 `<style>` 标签中添加新函数的样式：

```css
.func-new-function {
    /* 添加样式 */
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ddd;
}
```

### 步骤 4: 添加测试用例

在 `test.js` 文件的 `testCases` 数组中添加测试：

```javascript
{
    name: '新函数解析',
    input: '@newFunction(param1="test", param2="value")',
    expected: {
        type: 'newFunction',
        params: { param1: 'test', param2: 'value', param3: '' }
    }
}
```

## 示例：添加列表函数

让我们通过一个完整的示例来演示如何添加一个 `list` 函数。

### 1. 在解析器中定义

```javascript
// 在 parser.js 中添加
list: {
    params: ['items', 'type'],
    defaults: { type: 'ul' }  // ul (无序) 或 ol (有序)
}
```

### 2. 实现渲染逻辑

```javascript
// 在 app.js 中添加
case 'list':
    return this.renderList(block.params);

// 添加渲染方法
renderList(params) {
    const listType = params.type === 'ol' ? 'ol' : 'ul';
    const element = document.createElement(listType);
    element.className = 'func-list';
    
    if (params.items) {
        // 假设 items 是用 | 分隔的字符串
        const items = params.items.split('|');
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.trim();
            element.appendChild(li);
        });
    }
    
    return element;
}
```

### 3. 添加样式

```css
.func-list {
    margin: 10px 0;
    padding-left: 20px;
}

.func-list li {
    margin: 5px 0;
    line-height: 1.4;
}
```

### 4. 添加测试

```javascript
{
    name: '列表函数解析',
    input: '@list(items="项目1|项目2|项目3", type="ul")',
    expected: {
        type: 'list',
        params: { items: '项目1|项目2|项目3', type: 'ul' }
    }
}
```

### 5. 使用示例

```funcnote
@list(items="苹果|香蕉|橙子", type="ul")

@list(items="第一步|第二步|第三步", type="ol")
```

## 示例：添加图片函数

再来看一个更复杂的例子 - 图片函数。

### 1. 解析器定义

```javascript
image: {
    params: ['src', 'alt', 'width', 'height'],
    defaults: { alt: '', width: '', height: '' }
}
```

### 2. 渲染逻辑

```javascript
case 'image':
    return this.renderImage(block.params);

renderImage(params) {
    const container = document.createElement('div');
    container.className = 'func-image';
    
    const img = document.createElement('img');
    img.src = params.src || '';
    img.alt = params.alt || '';
    
    if (params.width) {
        img.style.width = params.width.includes('px') ? params.width : params.width + 'px';
    }
    if (params.height) {
        img.style.height = params.height.includes('px') ? params.height : params.height + 'px';
    }
    
    img.onerror = () => {
        container.innerHTML = `<div class="error">图片加载失败: ${params.src}</div>`;
    };
    
    container.appendChild(img);
    return container;
}
```

### 3. 样式

```css
.func-image {
    text-align: center;
    margin: 15px 0;
}

.func-image img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

### 4. 测试

```javascript
{
    name: '图片函数解析',
    input: '@image(src="test.jpg", alt="测试图片", width="300")',
    expected: {
        type: 'image',
        params: { src: 'test.jpg', alt: '测试图片', width: '300', height: '' }
    }
}
```

## 测试新函数

添加新函数后，按以下步骤进行测试：

### 1. 运行解析器测试
```bash
node test.js
```

### 2. 在浏览器中测试
```bash
npx serve . -p 3000
```

然后在编辑器中测试新函数的语法。

### 3. 测试各种场景

确保测试以下场景：
- 基本功能
- 默认参数
- 多行参数
- 错误输入
- 边界情况

## 最佳实践

### 1. 命名约定
- 函数名使用 camelCase（驼峰命名）
- 参数名要清晰明确
- CSS 类名使用 `func-` 前缀

### 2. 参数设计
- 必需参数放在前面
- 为常用参数提供合理的默认值
- 参数数量不宜过多（建议不超过 5 个）

### 3. 错误处理
```javascript
renderNewFunction(params) {
    // 验证必需参数
    if (!params.requiredParam) {
        const error = document.createElement('div');
        error.className = 'error';
        error.textContent = '缺少必需参数: requiredParam';
        return error;
    }
    
    // 正常渲染逻辑...
}
```

### 4. 文档化
为每个新函数添加文档注释：

```javascript
/**
 * 列表函数
 * @param {string} items - 列表项，用 | 分隔
 * @param {string} type - 列表类型：ul (无序) 或 ol (有序)
 */
list: {
    params: ['items', 'type'],
    defaults: { type: 'ul' }
}
```

### 5. 版本兼容性
在添加新函数时，确保不会破坏现有的函数和语法。

## 调试技巧

### 1. 使用 console.log
```javascript
renderNewFunction(params) {
    console.log('渲染新函数，参数:', params);
    // 渲染逻辑...
}
```

### 2. 创建测试页面
创建专门的测试内容：

```funcnote
@head(text="新函数测试", rank=1)
@newFunction(param1="测试值")
@paragraph(text="测试完成")
```

### 3. 分步验证
1. 先确认解析器能正确解析
2. 再确认渲染逻辑正确
3. 最后调整样式

## 常见问题

### Q: 参数没有正确解析怎么办？
A: 检查 `parser.js` 中的参数定义，确保参数名称正确。

### Q: 渲染结果不正确怎么办？
A: 检查 `app.js` 中的 renderBlock 方法是否有对应的 case。

### Q: 样式不生效怎么办？
A: 确认 CSS 类名与 JavaScript 中设置的类名一致。

### Q: 测试失败怎么办？

A: 检查测试用例的 expected 结果是否与实际解析结果匹配。

## 总结

添加新函数的完整流程：

1. ✅ 在 `parser.js` 中定义函数参数
2. ✅ 在 `app.js` 中实现渲染逻辑
3. ✅ 在 `index.html` 中添加 CSS 样式
4. ✅ 在 `test.js` 中添加测试用例
5. ✅ 运行测试验证功能
6. ✅ 在浏览器中手动测试

遵循这个流程，你就可以成功地向 FuncMark 添加任何新的函数功能！
