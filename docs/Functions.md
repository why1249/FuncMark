# FuncMark 内置函数参考

> 本文件由脚本自动生成 (scripts/gen-functions-doc.js) - 生成日期: 2025-09-05
> 请勿手动编辑，此文件会被覆盖。

## 目录
- [head](#head)
- [code](#code)
- [paragraph](#paragraph)
- [list](#list)
- [image](#image)
- [table](#table)

---

### head

标题，rank=1..6

| 参数 | 必填 | 默认 | 说明 |
|------|------|------|------|
| text | 是 |  |  |
| rank | 否 | 1 |  |

示例：


```
@head(text="text_value", rank="1")
```

---

### code

代码块显示

| 参数 | 必填 | 默认 | 说明 |
|------|------|------|------|
| text | 是 |  |  |
| language | 否 | "" |  |
| title | 否 | "" |  |

示例：


```
@code(text="text_value", language="", title="")
```

---

### paragraph

普通段落

| 参数 | 必填 | 默认 | 说明 |
|------|------|------|------|
| text | 是 |  |  |

示例：


```
@paragraph(text="text_value")
```

---

### list

列表，type=ul|ol，items 用 | 或 换行分隔

| 参数 | 必填 | 默认 | 说明 |
|------|------|------|------|
| items | 是 |  |  |
| type | 否 | ul |  |

示例：


```
@list(items="items_value", type="ul")
```

---

### image

图片，支持可选宽高(px)

| 参数 | 必填 | 默认 | 说明 |
|------|------|------|------|
| src | 是 |  |  |
| alt | 否 | "" |  |
| width | 否 | "" |  |
| height | 否 | "" |  |

示例：


```
@image(src="src_value", alt="", width="", height="")
```

---

### table

表格，rows="a,b|c,d" header=true/false align="l,c,r" (列对齐,逗号分隔)

| 参数 | 必填 | 默认 | 说明 |
|------|------|------|------|
| rows | 是 |  |  |
| header | 否 | false |  |
| align | 否 | "" |  |

示例：


```
@table(rows="rows_value", header="false", align="")
```

---

生成逻辑: 遍历 core/functions.js 中的 functionSchemas。