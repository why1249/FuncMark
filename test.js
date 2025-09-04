/**
 * FuncNote 解析器测试
 */

// 在 Node.js 环境中运行测试
let FuncNoteParser;
if (typeof require !== 'undefined') {
    FuncNoteParser = require('./parser.js');
} else {
    // 浏览器环境中，FuncNoteParser 应该已经在全局作用域中
    FuncNoteParser = window.FuncNoteParser;
}

class FuncNoteParserTest {
    constructor() {
        this.parser = new FuncNoteParser();
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
                    message: '不支持的函数: invalid'
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
                const actual = result[0]; // 取第一个结果

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
        if (actual.type !== expected.type) {
            return false;
        }

        if (expected.message) {
            return actual.message && actual.message.includes(expected.message.split(':')[0]);
        }

        if (expected.params) {
            for (const key in expected.params) {
                if (actual.params[key] !== expected.params[key]) {
                    return false;
                }
            }
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
    window.FuncNoteParserTest = FuncNoteParserTest;
}

// 如果在 Node.js 环境中，直接运行测试
if (typeof require !== 'undefined' && require.main === module) {
    const test = new FuncNoteParserTest();
    test.runTests();
}

// 导出供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FuncNoteParserTest;
}
