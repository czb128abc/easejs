// ---------------------------------------------------------------- tmpl
module('tmpl');

test('tmpl', 3, function () {
	define(uid(), function (require, exports) {
		var tmpl = require('tmpl');

		var template = 'hello {tmpl}!';
		var result = tmpl(template, {tmpl: 'tmpl.tmpl'});
		equal(result, 'hello tmpl.tmpl!', '编译模版字符串');

		result = tmpl(template, {});
		equal(result, 'hello {tmpl}!', '不存在的视图键不编译，保持原样输出');

		result = tmpl(template);
		equal(result, 'hello {tmpl}!', '不传入视图数据，保持原样输出');
	});
});