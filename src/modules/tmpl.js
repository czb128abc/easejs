// mustache like template Module
define('tmpl', function (require, exports, module) {
    var util = require('util');

    // $1: name; $2: content; $4: none value content;
    var RE_SECTION = /\{#([^\}]+?)\}(.*?)(\{else\}(.+?))?\{\/\1\}/mg;
    var RE_TAG = /\{(!|&|\.)?([^\}]+?)?\}/g;


    // render
    function render (template, view) {
        template = template.replace(/[\r\n\t\u2029\u2028]/, '');

        var html = section(template, view);
        return tag(html, view);
    }

    // 渲染 section
    function section (template, view) {
        return template.replace(RE_SECTION, function (match, name, content, xxx, vcontent, offset, template) {
            var value = find(name, view);
            var hasSection = RE_SECTION.test(content);
            var funcmap = {'render': render, 'tag': tag};
            var fn = funcmap[hasSection ? 'render' : 'tag'];

            if (util.isArray(value)) {
                return util.map(value, function (item) {
                    return fn(content, util.extend({}, view, !util.isObject(item) ? {'.': item} : item));
                }).join('');
            }

            else if (util.isFunction(value)) {
                return value.apply(view);
            }

            else if (value) {
                return fn(content, util.extend({}, view, value));
            }

            return vcontent && tag(vcontent, view) || '';
        });
    }

    // 渲染 tag
    function tag (template, view) {
        view = view || {};

        return template.replace(RE_TAG, function (match, operator, name) {
            var value = view[name] || '';

            if (util.isFunction(value)) {
                value = value.apply(view);
            }

            switch (operator) {
                case '.':
                    return view[operator];

                case '!':
                    return '';

                case '&':

                default:
                    return value;
            }
        });
    }

    // find value from context
    function find (name, context) {
        context = context || {};

        if (!name) {
            throw new Error ('bad section!');
        }

        var value = context[name];

        if (util.isFunction (value)) {
            return value.call(context);
        }

        return value;
    }

    exports.render = render;
});
