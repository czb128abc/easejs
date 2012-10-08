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
	var result = define();
	strictEqual(result, false, '未传入参数的模块定义，直接返回 false，什么都不做');
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