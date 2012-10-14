// ----------------------------------------------------------------模块系统
module('module');

test('定义独立模块', 3, function () {
    var moduleId = uid();

    define(moduleId, function (require, exports) {
        // console.log(app);
        ok(true, '独立模块 ' + this.id + ' 定义并编译完成');
        equal(this.id, moduleId, '在模块回调中获取到的模块Id与定义时一致');
        equal(this.exports, exports, '模块回调中的 this 指向当前模块对象');
    });
});

test('定义两个独立模块', 2, function () {
    var moduleId = uid();

    define(moduleId, function () {
        ok(true, '模块 ' + moduleId + ' 定义并编译完成');
    });

    moduleId = uid();
    define(moduleId, function () {
        ok(true, '模块 ' + moduleId + ' 定义并编译完成');
    });
});

test('定义依赖模块，先定义的先执行', 3, function () {
    var a = 'order_a';
    var b = 'order_b';

    define(a, function (require, exports) {
        exports.a = function () {
            return 'a';
        };
        ok(true, '模块 ' + a + ' 定义并编译完成，其具有公开方法 a()');
    });

    define(b, function (require, exports) {
        var _a = require('order_a');
        ok(true, '模块 ' + b + ' 定义并编译完成，其依赖于 ' + a);
        equal(_a.a(), 'a', '调用依赖模块的方法 ' + a + '.a(); 返回结果符合预期');
    });
});

test('定义依赖模块，先定义的后执行', 3, function () {
    var a = 'order_reverse_a';
    var b = 'order_reverse_b';

    define(a, function (require) {
        var _b = require('order_reverse_b');

        ok(true, '模块 ' + a + ' 定义并编译完成，其依赖于 ' + b);
        equal(_b.b(), 'b', '调用依赖模块的方法 ' + b + '.b(); 返回结果符合预期');
    });

    define(b, function (require, exports) {
        exports.b = function () {
            return 'b';
        };

        ok(true, '模块 ' + b + ' 定义并编译完成，含有公开方法 b()');
    });
});

test('特殊模块：无参数定义', 1, function () {
    throws(function () {
        define();
    }, Error, 'bad arguments!');
});

test('特殊模块：仅一个参数，为 function', 1, function () {
    define(function () {
        ok(true, '模块 ' + this.id + ' 初始化完毕');
    });
});

test('特殊模块：仅一个参数，为 object', 2, function () {
    define({
        value: 100,
        initialize: function () {
            ok(true, '执行模块对象的 initialize 方法');
            equal(this.value, 100, '可以读取模块对象的成员值');
        }
    });
});

test('#13 依赖的模块没有完全就绪，则不执行', 0, function () {
    define('add', function (require, exports, module) {
        module.exports = function (a, b) {
            return a + b;
        };
    });

    define(function (require) {
        var add = require('add');
        var minus = require('minus');

        equal(add(1, 2), 3);
    });
});

test('复杂依赖', 7, function () {
    define('_a', function (require, exports) {
        var d = require('_d');

        ok(true, '模块 _a 初始化完毕，依赖模块 _d');
    });

    define('_b', function (require, exports) {
        var d = require('_d');

        ok(true, '模块 _b 初始化完毕，依赖模块 _d');
    });

    define('_c', function (require, exports) {
        var d = require('_d');

        ok(true, '模块 _c 初始化完毕，依赖模块 _d');
    });

    define('_e', function () {
        ok(true, '模块 _e 初始化完毕');
    });

    define('_f', function () {
        ok(true, '模块 _f 初始化完毕');
    });

    define('_g', function () {
        ok(true, '模块 _g 初始化完毕');
    });

    define('_d', function (require, exports) {
        var e = require('_e');
        var f = require('_f');
        var g = require('_g');

        ok(true, '模块 _d 初始化完毕，依赖模块 _e, _f, _g');
    });
});

test('依赖自身', 3, function () {
    define('self_deps', function (require, exports, module) {
        exports.method = function () {
            return 'method';
        };

        var self = require('self_deps');
        var another = require('self_another');

        ok(true, '依赖自己可以运行');
        equal(self.method(), 'method', '可以读取自身的公开成员');
    });

    define('self_another', function (require, exports) {
        ok(true, 'self_another 初始化完毕');
    });
});

test('重复定义模块', function () {
    var mid = uid();

    define(mid, function () {
        ok(true, mid + ' 初始化完毕');
    });

    throws(function () {
        define(mid, function () {});
    }, Error, 'Module ' + mid + ' already defined!');
});

test('相互依赖', 1, function () {
    ok(true, '相互依赖的模块不会编译');

    define('circleA', function (require, exports, module) {
        exports.a = 'a';
        var b = require('circleB');
        ok(false, 'circleA 初始化完毕，依赖模块 circleB');
    });

    define('circleB', function (require, exports, module) {
        exports.b = 'b';
        var a = require('circleA');
        ok(false, 'circleB 初始化完毕，依赖模块 circleA');
    });
});

test('异步加载模块（或js文件）', 3, function () {
    define(function (require) {
        ok(true, '模块初始化完毕');
        stop();

        require.async('http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js', function () {
            start();
            ok(true, '异步加载的 jquery.js 完毕');
            equal($('#qunit').size(), 1, '页面中 $("div#qunit").size() == 1');
        });
    });
});