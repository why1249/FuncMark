# FuncMark 原型

FuncMark 是一个实验性的函数调用式标记语言，旨在通过函数调用的方式来简化文档编写。

## 功能特性

- ✅ **语法解析器**: 支持 `@function(parameters)` 格式的函数调用解析
- ✅ **实时预览**: 左侧编辑，右侧实时显示渲染结果
- ✅ **自动补全**: 输入 `@` 触发函数自动补全（待完善）
- ✅ **多行支持**: 支持多行参数的函数调用

## 支持的函数

| 函数名 | 参数 | 描述 | 示例 |
|--------|------|------|------|
| `head` | `text`, `rank` | 创建标题 | `@head(text="标题", rank=1)` |
| `code` | `text`, `language`, `title` | 创建代码块 | `@code(text="console.log('hello')", language="javascript")` |
| `paragraph` | `text` | 创建段落 | `@paragraph(text="这是一个段落")` |
| `list` | `items`, `type` | 创建列表 | `@list(items="项目1\|项目2\|项目3", type="ul")` |

## 语法示例

### 基本语法
```FuncMark
@head(text="我的文档", rank=1)
@paragraph(text="这是一个简单的段落。")
@list(items="项目1|项目2|项目3", type="ul")
```

### 多行语法
```FuncMark
@code(
    text="function hello() {
    console.log('Hello World');
    return 'FuncNote is awesome!';
}",
    language="javascript",
    title="示例函数"
)
```

## 快速开始

1. **安装依赖**
   ```bash
   npm install
   ```

2. **运行测试**
   ```bash
   npm test
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

4. **访问页面**
   打开浏览器访问 `http://localhost:3000`

## 项目结构

```
├── docs                    # 文档
│   └── ADD_NEW_FUNCTION.md     # 添加新函数指南
├── index.html              # 主页面
├── parser.js               # FuncMark 语法解析器
├── app.js                  # 前端应用逻辑
├── test.js                 # 解析器测试
├── package.json            # 项目配置
└── README.md               # 项目说明

```

## 解析器测试

运行以下命令测试解析器功能：

```bash
node test.js
```

所有测试应该都通过：
- ✅ 基本标题解析
- ✅ 多行函数调用
- ✅ 段落解析
- ✅ 缺少参数使用默认值
- ✅ 普通文本处理
- ✅ 错误函数名处理
- ✅ 列表函数解析
- ✅ 有序列表解析

## 使用说明

1. **编辑区域**: 在左侧编辑器中输入 FuncMark 语法
2. **实时预览**: 右侧会实时显示渲染结果
3. **自动补全**: 输入 `@` 会触发函数名自动补全
4. **错误提示**: 语法错误会在预览区域显示错误信息

## 已知限制

- 自动补全功能需要进一步完善
- 参数验证可以更严格
- 需要支持更多的函数类型
- 错误提示可以更友好

## 未来计划

- [ ] 完善自动补全功能
- [x] 添加列表函数
- [ ] 添加更多内置函数（表格、图片等）
- [ ] 支持自定义函数
- [ ] 改进错误处理和提示
- [ ] 添加导入/导出功能
- [ ] 支持主题定制

## 开发文档

- 📖 [如何添加新函数](docs/ADD_NEW_FUNCTION.md) - 详细说明如何扩展 FuncMark 功能
- 🛠️ [开发计划](docs/DEVELOPMENT_PLAN.md) - 项目阶段性路线与任务拆解

## 技术架构

- **前端**: 纯 HTML/CSS/JavaScript，无框架依赖
- **解析器**: 行级 tokenizer + 括号计数的轻量解析（将逐步演进为 tokens -> AST 流）
- **AST**: 已引入基础节点占位（见 `core/ast.js`），函数节点含 loc 信息，后续用于导出与高级语义
- **函数 Schema**: 内置函数定义集中在 `core/functions.js`，便于扩展与自动补全
- **实时预览**: 基于 DOM 操作的实时渲染

## 开发说明

本项目是 FuncMark 概念的早期原型，主要用于验证函数调用式标记语言的可行性。代码结构简单，易于理解和扩展。

如有问题或建议，欢迎提出！
