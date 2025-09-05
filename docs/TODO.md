# FuncMark TODO 清单

阶段 0.1（硬化原型）
- [x] 实现 tokenizer（识别函数块 / 普通文本，保留行列信息）
- [x] 定义 AST 节点结构 & parseToAST 接口（初步 buildNode 占位）
- [x] parser 使用 tokenizer 输出与旧实现一致结果
- [x] 错误码补齐（FM001 / FM002 / FM003）并统一 loc（FM003 占位）
- [x] 扩展测试用例 >= 15 条（含错误分支 & 位置断言）(当前 15 条)
- [x] 新增覆盖率工具（nyc 或 c8）
- [x] 更新 README：加入 AST / tokenizer 简述

> 阶段 0.1 已完成 ✅

阶段 0.2（可扩展内核准备）
- [ ] DOM 渲染抽象（renderer/DOMRenderer）
- [ ] 新函数 image
- [ ] 新函数 table（最简：rows="a,b|c,d"）
- [ ] 自动补全：参数占位与提示
- [ ] 函数 schema 文档自动生成 (scripts/gen-functions-doc.js)

阶段 0.3（功能增强）
- [ ] 导出：AST -> JSON
- [ ] 导出：AST -> Markdown（基础）
- [ ] 主题系统（light/dark 变量化）
- [ ] 性能基准脚本 benchmark.js

阶段 0.4（高级特性）
- [ ] 变量/宏 设计草案
- [ ] include/fragment 语法提案

维护 / 持续任务
- [ ] 增加 >=80% 语法分支覆盖率
- [ ] CHANGELOG 机制
- [ ] CONTRIBUTING.md
- [ ] functions.md 自动生成

（执行时：完成即勾选，并在提交中同步此文件）
