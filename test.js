/**
 * FuncNote 解析器测试
 */

// 在 Node.js 环境中运行测试
let FuncMarkParser;
if (typeof require !== 'undefined') {
    FuncMarkParser = require('./parser.js');
} else {
    // 浏览器环境中，FuncMarkParser 应该已经在全局作用域中
    FuncMarkParser = window.FuncMarkParser;
}

class FuncMarkParserTest {
    constructor() {
        this.parser = new FuncMarkParser();
    this.testCases = [
            {
                name: '基本标题解析',
                input: '@head(text="测试标题", rank=1)',
                expected: {
                    type: 'head',
                    params: { text: '测试标题', rank: 1 }
                }
            },
            {
                name: '参数格式错误',
                input: '@head(text"缺少等号")',
                expected: {
                    type: 'error',
                    message: '参数格式错误'
                }
            },
            {
                name: '多行函数调用',
                input: `@code(
    text="console.log('hello')",
    language="javascript",
    title="示例代码"
)`,
                expected: {
                    type: 'code',
                    params: {
                        text: "console.log('hello')",
                        language: 'javascript',
                        title: '示例代码'
                    }
                }
            },
            {
                name: '段落解析',
                input: '@paragraph(text="这是一个测试段落")',
                expected: {
                    type: 'paragraph',
                    params: { text: '这是一个测试段落' }
                }
            },
            {
                name: '缺少参数使用默认值',
                input: '@head(text="标题")',
                expected: {
                    type: 'head',
                    params: { text: '标题', rank: 1 }
                }
            },
            {
                name: '普通文本处理',
                input: '这是普通文本',
                expected: {
                    type: 'paragraph',
                    params: { text: '这是普通文本' }
                }
            },
            {
                name: '错误函数名',
                input: '@invalid(text="test")',
                expected: {
                    type: 'error',
                    code: 'FM001',
                    message: '不支持的函数'
                }
            },
            {
                name: '未闭合函数调用',
                input: '@head(text="未闭合"',
                expected: {
                    type: 'error',
                    message: '未闭合的函数调用'
                }
            },
            {
                name: '列表函数解析',
                input: '@list(items="项目1|项目2|项目3", type="ul")',
                expected: {
                    type: 'list',
                    params: { items: '项目1|项目2|项目3', type: 'ul' }
                }
            },
            {
                name: '有序列表解析',
                input: '@list(items="第一步|第二步|第三步", type="ol")',
                expected: {
                    type: 'list',
                    params: { items: '第一步|第二步|第三步', type: 'ol' }
                }
            },
            {
                name: '忽略未知参数',
                input: '@head(text="标题", rank=2, extra="x")',
                expected: {
                    type: 'head',
                    params: { text: '标题', rank: 2 }
                }
            },
            {
                name: '多行代码块保留换行',
                input: `@code(\n    text="line1\\nline2\\nline3",\n    language="js",\n    title="多行"\n)`,
                expected: {
                    type: 'code',
                    params: { text: 'line1\nline2\nline3', language: 'js', title: '多行' }
                }
            },
            {
                name: '换行分隔列表',
                input: '@list(items="A\\nB\\nC", type="ul")',
                expected: {
                    type: 'list',
                    params: { items: 'A\nB\nC', type: 'ul' }
                }
            },
            {
                name: '定位信息',
                input: '\n@paragraph(text="段落")',
                expected: {
                    type: 'paragraph',
                    params: { text: '段落' },
                    loc: { line: 2 }
                }
            },
            {
                name: '连续普通文本行',
                input: '第一行\n第二行',
                expectedArray: [
                    { type: 'paragraph', params: { text: '第一行' } },
                    { type: 'paragraph', params: { text: '第二行' } }
                ]
            }
        ];
    }

    runTests() {
        console.log('=== FuncMark 解析器测试 ===\n');
        
        let passed = 0;
        let failed = 0;

        this.testCases.forEach((testCase, index) => {
            try {
                const result = this.parser.parse(testCase.input);
                if (testCase.expectedArray) {
                    const pass = this.compareArrayResults(result, testCase.expectedArray);
                    if (pass) {
                        console.log(`✅ 测试 ${index + 1}: ${testCase.name}`);
                        passed++;
                    } else {
                        console.log(`❌ 测试 ${index + 1}: ${testCase.name}`);
                        console.log('   期望数组:', testCase.expectedArray);
                        console.log('   实际数组:', result.map(r => ({ type: r.type, params: r.params })));
                        failed++;
                    }
                    return;
                }
                const actual = result[0];
                if (this.compareResults(actual, testCase.expected)) {
                    console.log(`✅ 测试 ${index + 1}: ${testCase.name}`);
                    passed++;
                } else {
                    console.log(`❌ 测试 ${index + 1}: ${testCase.name}`);
                    console.log(`   期望:`, testCase.expected);
                    console.log(`   实际:`, actual);
                    failed++;
                }
            } catch (error) {
                console.log(`❌ 测试 ${index + 1}: ${testCase.name} - 异常: ${error.message}`);
                failed++;
            }
        });

        console.log(`\n=== 测试结果 ===`);
        console.log(`通过: ${passed}`);
        console.log(`失败: ${failed}`);
        console.log(`总计: ${passed + failed}`);

        return failed === 0;
    }

    compareResults(actual, expected) {
        if (!actual || actual.type !== expected.type) return false;
        if (expected.code && actual.code !== expected.code) return false;
        if (expected.message && !(actual.message && actual.message.includes(expected.message))) return false;
        if (expected.params) {
            for (const key in expected.params) {
                if (actual.params[key] !== expected.params[key]) return false;
            }
        }
        if (expected.loc && expected.loc.line && (!actual.loc || actual.loc.line !== expected.loc.line)) return false;
        return true;
    }

    compareArrayResults(actualArr, expectedArr) {
        if (!Array.isArray(actualArr) || actualArr.length !== expectedArr.length) return false;
        for (let i = 0; i < expectedArr.length; i++) {
            if (!this.compareResults(actualArr[i], expectedArr[i])) return false;
        }
        return true;
    }

    // 交互式测试方法（用于浏览器）
    testInteractive() {
        const testInput = `@head(text="测试文档", rank=1)

@paragraph(text="这是一个测试段落。")

@code(
    text="function test() {
    return 'Hello World';
}",
    language="javascript",
    title="测试函数"
)

@head(text="子标题", rank=2)

@paragraph(text="另一个段落。")`;

        console.log('=== 交互式测试 ===');
        console.log('输入文本:');
        console.log(testInput);
        console.log('\n解析结果:');
        
        const results = this.parser.parse(testInput);
        results.forEach((result, index) => {
            console.log(`${index + 1}. 类型: ${result.type}`);
            if (result.params) {
                console.log('   参数:', result.params);
            }
            if (result.message) {
                console.log('   消息:', result.message);
            }
        });
    }
}

// 如果在浏览器环境中，添加到全局对象
if (typeof window !== 'undefined') {
    window.FuncMarkParserTest = FuncMarkParserTest;
}

// 如果在 Node.js 环境中，直接运行测试
if (typeof require !== 'undefined' && require.main === module) {
    const test = new FuncMarkParserTest();
    test.runTests();
}

// 导出供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FuncMarkParserTest;
}
