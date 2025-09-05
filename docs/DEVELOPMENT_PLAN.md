# FuncMark 开发计划（初稿）

> 版本: 2025-09-05 / 状态: Draft / 负责人: TBD  
> 目标: 将当前原型演进为可扩展、可维护、可插件化的函数式标记语言内核与编辑体验。

## 1. 当前状态速览
| 维度 | 现状 | 评价 |
|------|------|------|
| 功能 | head / paragraph / code / list，实时预览，基础自动补全 | 基础可用，深度不足 |
| 解析 | 行扫描 + 正则 + 括号计数，参数解析简化实现 | 脆弱、缺少 AST、缺少错误上下文 |
| 渲染 | 直接 DOM 构建 | 无虚拟层 / 无 diff / 无主题体系 |
| 自动补全 | 触发 @，静态列表 | 无参数提示、无上下文建议 |
| 测试 | 8 个解析单例用例 | 覆盖率低，无渲染 / 回归 / 性能测试 |
| 工程 | JS 单文件，无打包，无类型 | 规模增长前需调整 |
| 文档 | README + 扩展函数指南 | 缺 Roadmap / API / 贡献规范 |
| 风险 | 解析扩展困难 / 错误处理弱 / 未来插件化阻力 | 需及早重构 |

## 2. 核心问题
1. 解析无结构化 AST，后续高级语义（嵌套、条件、变量、宏）难以落地。  
2. 自动补全不支持参数级智能提示。  
3. 错误系统仅输出字符串，缺少位置信息 & 恢复策略。  
4. 无模块化：渲染/解析/编辑耦合。  
5. 缺 CI / 覆盖率度量 / 性能基线。  
6. 缺插件与函数注册生命周期设计。  
7. 缺发布策略与版本语义化规范。

## 3. 愿景 & 分阶段目标
| 阶段 | 版本范围 | 时间预估 | 目标关键词 |
|------|----------|----------|------------|
| 原型硬化 | 0.1.x | 2 周 | AST、错误系统、测试补齐 |
| 可扩展内核 | 0.2.x | 3–4 周 | 插件/函数注册、自动补全增强、主题化 |
| 可发布 Beta | 0.3.x | 4 周 | 打包、文档网站、导入导出、表格/图片函数 |
| 公开 Beta | 0.4.x | 4 周 | 性能优化、脚本/变量、诊断面板 |
| 1.0 稳定 | 1.0.0 | 之后 | 语义冻结、插件生态、兼容承诺 |

## 4. 近期（0.1.x）里程碑拆解
| 里程碑 | 描述 | 完成判定 |
|--------|------|----------|
| AST 基础 | 构建 tokens -> AST -> nodes 流程 | 能输出结构化节点 & 单元测试覆盖主路径 |
| 错误系统 | 位置信息 + 级别(info/warn/error) | 解析异常包含行/列/建议 |
| 参数解析升级 | 支持字符串内换行 / 数字 / bool / 空值 | 新测试全部通过 |
| 函数注册解耦 | 分离 functions 定义 & parser 实例化 | 新增函数无需改动 parser 主体 |
| 单元测试扩展 | 覆盖 > 25 条用例，基础分支覆盖 >70% | 生成覆盖率报告 |
| 基础 CI | Node LTS + 测试自动化 | push 即运行，失败阻断 |

## 5. 功能规划矩阵
| 功能 | 优先级 | 阶段 | 说明 |
|------|--------|------|------|
| AST 重构 | 高 | 0.1 | 支撑一切后续能力 |
| 错误诊断 | 高 | 0.1 | 行列定位 + 恢复策略 |
| 插件化注册 | 高 | 0.2 | 函数/渲染/补全挂载点 |
| 表格函数 table | 中 | 0.2 | 基础二维文本解析 |
| 图片函数 image | 中 | 0.2 | 宽高 / alt 验证 |
| 导入/导出 (JSON/Markdown) | 中 | 0.3 | AST <-> 外部格式 |
| 主题系统 | 中 | 0.2 | CSS 变量 + 主题包 |
| 自动补全智能参数 | 中 | 0.2 | 根据函数 schema 提示 |
| 性能基准 & profiling | 中 | 0.3 | 解析 5k 行 < X ms 目标 |
| 变量/宏 | 低 | 0.4 | 简化复用 | 
| 条件/包含 include | 低 | 0.4 | 文档组合 |

## 6. 技术演进路线
1. 解析层： source -> tokenizer -> parser -> AST -> validator -> renderer adapter。  
2. AST 节点：NodeBase { type, loc, props }；扩展特定节点 (HeadingNode, ParagraphNode...)。  
3. 函数 schema： { name, params:[{name,type,required,default,validate}], render(astNode, ctx) }。  
4. 插件系统： register(plugin) => 暴露 hooks: onParseStart/onNode/onRender/onComplete。  
5. 渲染器抽象： DOMRenderer (浏览器) / JSONRenderer (导出) / MarkdownRenderer (未来)。  
6. 打包：引入构建（esbuild 或 rollup），输出 ESM + CJS + IIFE。  
7. 逐步 TS 迁移：先加 JSDoc 类型，再 incremental TS。  

## 7. 错误与诊断模型
结构: { code, message, severity, loc:{line,column,startOffset,endOffset}, hint }  
示例 code： FM001(未知函数) / FM002(缺少参数) / FM003(未闭合括号)。  
UI：预览区域统一渲染带行号错误；未来可显示悬浮提示。  

## 8. 测试策略
| 层级 | 内容 | 工具 |
|------|------|------|
| 单元 | tokenizer / parser / validators | node + assert / vitest (可选) |
| 组件 | 渲染函数输出结构（快照） | jsdom (后续) |
| 集成 | 输入全文 -> AST -> HTML | 端到端用例脚本 |
| 回归 | 关键语法集合固定集 | 测试夹具 |
| 性能 | 1k / 5k / 10k 行文本解析时间 | 轻量 benchmark 脚本 |

覆盖指标（阶段性目标）：
- 0.1：语法主干 >70% 分支覆盖
- 0.2：>80%，含插件注册路径
- 0.3：性能基准脚本纳入 CI（允许软失败预警）

## 9. 性能基线（拟定）
| 规模 | 目标解析耗时 (Chrome 中值) |
|------|---------------------------|
| 1k 行 | < 30ms |
| 5k 行 | < 160ms |
| 10k 行 | < 400ms |
（初期通过简单基准记录真实现状再校准）

## 10. 语义化版本与发布
格式: MAJOR.MINOR.PATCH  
- PATCH：修复 / 非破坏行为  
- MINOR：新增向后兼容功能  
- MAJOR：语法或 API 破坏  
分支策略： main（稳定） / dev（集成） / feature/*。  
发布脚本（后续）：自动生成 CHANGELOG（conventional commits）。

## 11. 任务初始 Backlog（按优先级排序）
P0
1. 重构：抽取 parser.js -> tokenizer.js + ast.js + parser.js
2. AST 结构定义 & 单元测试
3. 错误对象 loc 支持 + 解析恢复策略（跳过无法解析块）
4. 函数 schema 抽离（functions.js）
5. 测试扩展：覆盖所有现有函数 + 错误分支

P1
6. DOM 渲染层抽象（renderer/domRenderer.js）
7. 新函数：image / table（简版）
8. 自动补全：参数级提示 & 占位填充
9. 打包配置（esbuild）
10. README Roadmap 同步 + API 文档初稿

P2
11. 导出：AST -> JSON / Markdown MVP
12. 主题：CSS 变量 + 2 个内置主题
13. 性能基准脚本 benchmark.js
14. 插件 Hook 设计 & 实现

P3
15. 变量/宏语法提案草案
16. 包含 include / 片段 fragment 语法讨论

## 12. 风险与缓解
| 风险 | 影响 | 缓解 |
|------|------|------|
| AST 重构延期 | 后续所有功能阻塞 | 先最小 AST，迭代扩展 |
| 解析性能退化 | 大文档卡顿 | 基准测试入 CI，差异报警 |
| 语法膨胀 | 难维护 | RFC 流程 + 最小实现策略 |
| 无社区贡献 | 研发压力集中 | 提前补齐贡献指南 + good first issue |
| 错误体验差 | 用户挫败 | 分级严重度 + 定位 + 建议文本 |

## 13. 文档交付物清单
- DEVELOPMENT_PLAN（本文件）
- ROADMAP（提炼公开版，可放 README 或 docs/ROADMAP.md）
- functions.md（所有内置函数 schema 自动生成）
- CONTRIBUTING.md（含开发流程 / 提交规范）
- SYNTAX_SPEC.md（语法与保留字）

## 14. 指标 (初步)
- 功能覆盖率：已实现函数数 / 规划函数数
- 解析正确率：测试成功 / 总用例
- 性能：解析中值耗时（按行规模）
- 回归失败率：最近 10 次 CI 失败次数
- 文档完成度：已交付文档 / 规划文档

## 15. 近期 5 日行动（可直接执行）
Day1: 拆分 parser -> tokenizer 草稿 + AST 接口定义 + 基础测试  
Day2: 完成 AST 解析流 & 错误定位；迁移现有 head/paragraph/list/code  
Day3: 函数 schema 分离 + image 函数 + 测试扩展  
Day4: DOM Renderer 抽象 + 自动补全使用 schema 参数  
Day5: CI 脚本（npm test）+ 覆盖率工具（nyc 或 c8）+ 文档目录骨架  

## 16. 迭代验收标准（0.1.0）
- 所有旧测试通过 & 新增测试 >= 20 条
- head/paragraph/code/list 在新架构无行为差异
- 新增 image 函数 & 有 2 条测试覆盖
- 解析错误提供行/列与 FM 错误码
- README 链接本开发计划

## 17. 后续演进跟踪
建议建立 `docs/CHANGELOG.md` + issue 标签： `type:feature` / `type:refactor` / `type:bug` / `prio:P0-P3`。  

---
本文件将随每次里程碑推进更新（在顶部版本号追加修订日期与摘要）。
