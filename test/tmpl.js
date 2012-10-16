// ---------------------------------------------------------------- tmpl
module('tmpl');

// 借鉴引用 underscore 的部分测试用例
test('tmpl', function () {
    define(function (require, exports) {
        var tmpl = require('tmpl');
        var template = '', result = '', view = {};

        throws(tmpl.render('{#}{/}'), Error, '{#}{/} 将抛出异常');

        result = tmpl.render('{! 这是注释}');
        equal(result, '', '能正确渲染注释文字');

        result = tmpl.render('hello{#test} world{/test}', {});
        equal(result, 'hello', '不存在的模版变量，section 渲染为空');

        result = tmpl.render('{#test}1{else}2{/test}', {test: 1});
        equal(result, "1", '能进入 第一分支');

        result = tmpl.render('{#test}1{else}2{/test}', {test: false});
        equal(result, "2", '能进入 else 分支');

        result = tmpl.render('{^a}^a{/a}', {a: 0});
        equal(result, '^a', '^ 操作符能正确渲染');

        result = tmpl.render('{^test}1{else}2{/test}', {test: 1});
        equal(result, "2", '^ 能进入 else 分支');

        result = tmpl.render('{^test}1{else}2{/test}', {test: false});
        equal(result, "1", '^ 能进入 第一分支');

        result = tmpl.render('hello{#test} world{/test}', {'test': true});
        equal(result, 'hello world', '存在的模版变量，渲染模版 section 为其内部的值');

        result = tmpl.render('hello{#test} world{/test}', {'test': 0});
        equal(result, 'hello', '模版变量值为 假，section 渲染为空');

        result = tmpl.render("{thing} is gettin' on my noives!", {'thing': 'This'});
        equal(result, "This is gettin' on my noives!", '能完成基本的模版变量属性值插入');

        result = tmpl.render("{thing} is \\ridanculous", {thing: 'This'});
        equal(result, "This is \\ridanculous", '正常输出转义字符');

        result = tmpl.render('{#test}{test}{/test}', {test: 'csser'});
        equal(result, 'csser', '能够正确判断并输出模版属性的值');

        view = {
            'test': {
                'testInner': 'csser'
            }
        };
        result = tmpl.render('{#test}{#testInner}1{/testInner}{/test}', view);
        equal(result, '1', '嵌套对象取布尔值判断');

        result = tmpl.render('{#test}\n{#testInner}{testInner}{/testInner}{/test}', view);
        equal(result, 'csser', '模版中能正常取到嵌套对象的值');

        view.a = 'a';
        view.parent = 'parent';
        result = tmpl.render('{#test}\n{a}{#testInner}{parent}{testInner}{/testInner}{/test}', view);
        equal(result, 'aparentcsser', '嵌套中可以读取父对象的变量值');

        view = {'test': ['1', 2]};
        result = tmpl.render('{#test}{.}{/test}', view);
        equal(result, '12', '基本数组类型能正常渲染');

        view = {
            'test': [
                {'a': 'a', 'b': 'b'},
                {'a': 'a2', 'b': 'b2'}
            ]
        };
        result = tmpl.render('{#test}{a}{/test}', view);
        equal(result, 'aa2', '对象数组可以正常渲染');

        view = {
            a: 'a',
            fn: function () {
                return this.a;
            }
        };
        result = tmpl.render('{fn}', view);
        equal(result, 'a', '能正确渲染函数变量值 {fn}');

        result = tmpl.render('{#fn}{fn}{/fn}', view);
        equal(result, 'a', '能正确渲染函数变量值，区间判断 {#fn}{fn}{/fn}');

        result = tmpl.render('{a.b}', {
            'a': {
                'b': 'ab'
            }
        });
        equal(result, 'ab', '能正确读取以点分割的属性值 {a.b}');

        result = tmpl.render('{a}', {a: '<b>s</b>'});
        equal(result, '&lt;b&gt;s&lt;&#x2F;b&gt;', '默认 {a} 能正确编码HTML标签');

        result = tmpl.render('{&a}', {a: '<b>s</b>'});
        equal(result, '<b>s</b>', '{&a} 能不编码正常输出');

        result = tmpl.render('{.aaa}', {'.aaa': 'aaa'});
        equal(result, 'aaa', '以点号开头的变量值可以被正确渲染');

        /*view = {
            'a': {
                'b': 'a.b'
            },
            'c': 'c'
        };
        result = tmpl.render('{#a.b}{a.b}{c}{/a.b}', view);
        equal(result, 'a.bc', '能正确渲染 {#a.b} 类似的区间');*/
    });
});
