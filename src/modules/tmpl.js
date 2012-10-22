// mustache like template Module
define('tmpl', function (require, exports, module) {
    var util = require('util');

    // $1: operator; $2 name; $4: content; $5: none value content;
    var RE_SECTION = /\{([#|\^])([^\}]+?)\}(.*?)(\{else\}(.+?))?\{\/\2\}/mg;
    var RE_TAG = /\{(!|&|\.)?([^\}]+?)?\}/g;
    var ENTITY = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': '&quot;',
            "'": '&#39;',
            "/": '&#x2F;'
        };

    // render
    function render (template, view) {
        template = template.replace(/[\r\n\t\u2029\u2028]/, '');

        var html = section(template, view);
        return tag(html, view);
    }

    // 渲染 section 一并渲染 section 中的 tag
    // {#a} something {else} something else {/a}
    // {^a} something {else} something else {/a}
    function section (template, view) {
        return template.replace(RE_SECTION, function (match, operator, name, content, xxx, vcontent, offset, template) {
            var value = find(name, view);
            var hasSection = RE_SECTION.test(content);
            var funcmap = {'render': render, 'tag': tag};
            var fn = funcmap[hasSection ? 'render' : 'tag'];

            if (operator === '^') {
                content = [vcontent, vcontent = content][0];
            }

            if (util.isArray(value)) {
                return util.map(value, function (item) {
                    return fn(content, util.extend({}, view, !util.isObject(item) ? {'.': item} : item));
                }).join('');
            }

            else if (value) {
                return fn(content, util.extend({}, view, value));
            }

            return vcontent && fn(vcontent, view) || '';
        });
    }

    // 渲染 tag
    function tag (template, view) {
        view = view || {};

        return template.replace(RE_TAG, function (match, operator, name) {
            var values = String(name).split('.');
            var value = view;

            while (values.length) {
                value = value[values.shift()] || {};
            }

            value = value || '';

            if (util.isFunction(value)) {
                value = value.apply(view);
            }

            switch (operator) {
                case '.':
                    return view[operator] || view[operator + name];

                case '!':
                    return '';

                case '&':
                    return value;

                default:
                    return entity (value);
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

    // entity
    function entity(string) {
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return ENTITY[s];
        });
    }

    // simple template render
    function simple (template, view) {
        return String(template).replace(/\{([^\}]+?)\}/g, function (match, key) {
            return view[key] || '';
        });
    }

    exports.render = render;
    exports.simple = simple;
});
