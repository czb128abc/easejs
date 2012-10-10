// ----------------------------------------------------- 内置函数
module('util');

test('extend', 2, function () {
	define(function (require) {
		var util = require('util');

		var obj = {};
		var result = util.extend(obj, {'a': 1}, {'b': 2});
		equal(result.a, 1, '为目标对象扩展 a 属性，值为 1');
		equal(result.b, 2, '为目标对象扩展 b 属性，值为 2');
	});
});

test('uid', 2, function () {
	define(function (require) {
		var util = require('util');

		var uid = util.uid();
		var uid2 = util.uid();

		ok(/^EASE_NATIVE_[\d]+$/.test(uid), '生成Id字符串，类似 EASE_NATIVE_{Number} ');
		ok(uid != uid2, '每次生成的值不重复');
	});
});

test('unique', 2, function () {
	define(function (require) {
		var util = require('util');

		var array = [1, 1, 2, 3];
		var result = util.unique(array);
		deepEqual(result, [1, 2, 3], '数组进行了去重');

		array = [1, '1', 2, 3, true, false];
		result = util.unique(array);
		deepEqual(result, array, '严格限制只去重相同类型的值');
	});
});

test('indexOf', 4, function () {
	define(function (require) {
		var util = require('util');

		var array = [1, '1', 2, 3, true, 0];
		var result = util.indexOf(array, 1);
		var result2 = util.indexOf(array, '1');
		var result3 = util.indexOf(array, true);
		var result4 = util.indexOf(array, false);

		ok(result === 0, '数字查找');
		ok(result2 === 1, '字符串查找');
		ok(result3 === 4, 'Boolean 值查找');
		ok(result4 === -1, '查找不存在的值');
	});
});

test('keys', 1, function () {
	define(function (require) {
		var util = require('util');

		var object = {
			'1': 1,
			'true': true,
			'key': 'key'
		};

		var result = util.keys(object);
		deepEqual(result, ['1', 'true', 'key'], '取对象的键，以数组形式返回');
	});
});

test('map', 2, function () {
	define(function (require) {
		var util = require('util');

		var array = [1, 2, 3];
		var result = util.map(array, function (item) {
			return ++item;
		});

		deepEqual(result, [2, 3, 4], '将数组中的值 +1');

		result = util.map(array, function (item) {
			return item.toFixed(2);
		});
		deepEqual(result, ['1.00', '2.00', '3.00'], '将数组中的值转换为两位小数字符串');
	});
});


test('filter', 1, function () {
	define(function (require) {
		var util = require('util');

		var array = [-1, 0, 2, 3];
		var result = util.filter(array, function (item) {
			return item > 0;
		});

		deepEqual(result, [2, 3], '只返回数组中大于 0 的元素');
	});
});

test('isObject', 3, function () {
	define(function (require) {
		var util = require('util');

		equal(util.isObject({}), true, '{} 是 Object');
		equal(util.isObject([]), false, '[] 不是 Object');
		equal(util.isObject(document.getElementById('#qunit')), false, 'DOM 对象不是 Object');
		// equal(util.isObject(null), true, 'null 是 Object');
	});
});

test('isArray', 4, function () {
	define(function (require) {
		var isArray = require('util').isArray;

		equal(isArray([]), true, '[] 是 Array');
		equal(isArray([1, 'string']), true, '[1, "string"] 是 Array');
		equal(isArray({'0': 0, '1': 1}), false, "{'0': 0, '1': 1} 不是 Array");
		equal(isArray(new Array()), true, 'new Array() 是 Array');
	});
});

test('isRegExp', 2, function () {
	define(function (require) {
		var isRegExp = require('util').isRegExp;

		equal(isRegExp(/./), true, '/./ 是正则表达式');
		equal(isRegExp(new RegExp('.', 'g')), true, "new RegExp('.', 'g') 是正则表达式");
	});
});

test('isDate', 1, function () {
	define(function (require) {
		var isDate = require('util').isDate;

		equal(isDate(new Date()), true, 'new Date() 是日期对象');
	});
});

test('isNumber', 7, function () {
	define(function (require) {
		var isNumber = require('util').isNumber;

		equal(isNumber(1), true, '1 是 Number');
		equal(isNumber(1.2), true, '1.2 是 Number');
		equal(isNumber(.43), true, '.43 是 Number');
		equal(isNumber(NaN), true, 'NaN 是 Number');
		equal(isNumber(0), true, '0 是 Number');
		equal(isNumber(false), false, 'false 不是 Number');
		equal(isNumber("2"), false, '"2" 不是 Number');
	});
});

test('isString', 4, function () {
	define(function (require) {
		var isString = require('util').isString;

		equal(isString("string"), true, '"string" 是 String');
		equal(isString(22), false, '22 不是 String');
		equal(isString(true), false, 'true 不是 String');
		equal(isString(({}).toString()), true, '({}).toString() 是 String');
	});
});

test('isBoolean', 5, function () {
	define(function (require) {
		var isBoolean = require('util').isBoolean;

		equal(isBoolean(true), true, 'true 是 Boolean');
		equal(isBoolean(false), true, 'false 是 Boolean');
		equal(isBoolean(undefined), false, 'undefined 不是 Boolean');
		equal(isBoolean(null), false, 'null 不是 Boolean');
		equal(isBoolean(0), false, '0 不是 Boolean');
	});
});

test('isFunction', 5, function () {
	define(function (require) {
		var isFunction = require('util').isFunction;

		equal(isFunction(function(){}), true, 'function(){} 是 Function');
		equal(isFunction(new Function()), true, 'new Function() 是 Function');
		equal(isFunction({}), false, '{} 不是 Function');
		equal(isFunction(/./), false, '/./ 不是 Function');
		equal(isFunction(Date), true, 'Date 是 Function');
	});
});

test('isElement', 4, function () {
	define(function (require) {
		var isElement = require('util').isElement;

		equal(isElement(document.getElementById('qunit')), true, 'document.getElementById 获取到的是 DOM 元素');
		equal(isElement(document.getElementsByTagName('body')[0]), true, 'document.getElementsByTagName 的一个元素为 DOM 元素');
		equal(isElement(document.getElementsByName('__test')[0]), true, 'document.getElementsByName 的一个元素为 DOM 元素');
		equal(isElement(document.links[0]), true, 'document.links 的一个元素为 DOM 元素');
	});
});