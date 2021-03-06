// module.js
/*

define (id, function (require, exports, module) {
    // 1. return Something
    // 2. exports.method = function () {}
    // 3. module.exports = {...}
});

define (function (require, exports, module) {
    // 自动生成模块 Id
});

define({
    initialize: function (module) {
        // 自执行
    }
})

*/
(function (global) {
    var ease = {config: {}};
    var toString = Object.prototype.toString;

    // 类型判断
    forEach('Boolean Number String Function Array Date RegExp Object'.split(' '), function (type) {
        ease['is' + type] = function (value) {
            var result = '[object ' + type + ']' === toString.call(value);

            if (type === 'Object') {
                result = result && value === Object(value);
            }

            return result;
        };
    });

    // ------------------------------------------------------------- Module System
    // require 分析
    var RE_REQUIRE_NAME = /^function\s*\(\s*([\w_\$]+)/;

    // 多行与单行注释
    var RE_BLOCK_COMMENT = /^\s*\/\*[\s\S]*?\*\/\s*$/mg;
    var RE_LINE_COMMENT = /^\s*\/\/.*$/mg;

    // 编译的模块
    var MODULES = {};

    // 模块状态
    var STATUS = {
        'initialize': 0,
        'interactive': 1,
        'complete': 4
    };

    // 记录模块通知
    var EVENTS = {};

    // 记录加载的包文件
    var USED = {};

    // Module Class
    function Module (id, callback) {
        // 模块名，唯一
        this.id = id;

        // 父模块，依赖模块
        this.deps = filter(unique(Module.parseDependencies(callback)), function (depId) {
            return depId !== id;
        });

        // 输出的成员
        this.exports = {};

        // 模块函数体
        this.callback = callback;

        // 状态 initialize(0) interactive(1) complete(4)
        this.status = STATUS.initialize;

        MODULES[id] = this;
    }

    // ease
    Module.prototype.ease = ease;

    // 模块加载
    Module.require = createRequire();

    // 判断模块所依赖的模块是否编译完毕
    Module.isDepsCompiled = function (id) {
        var module = MODULES[id],
            deps = module.deps,
            complete = true;

        forEach(deps, function (depId, index) {
            if (!Module.completed(depId)) {
                return (complete = false); // 提升性能
            }
        });

        return complete;
    };

    // 编译模块
    Module.compile = function (id) {
        var module = MODULES[id],
            callback = module.callback,
            ret;

        module.status = STATUS.complete;

        if (ret = callback.call(module, Module.require, module.exports, module)) {
            module.exports = ret;
        }

        if (module.exports.initialize) {
            module.exports.initialize(module);
        }
    };

    // 判断模块是否编译过
    Module.completed = function (id) {
        var module = MODULES[id];
        return module && module.status == STATUS.complete;
    };

    // 分析依赖关系
    Module.parseDependencies = function (callback) {
        var callback = removeComment(callback.toString()),
            match,
            deps = [];

        var fnName, RE_FN;
        if (RE_REQUIRE_NAME.test(callback)) {
            fnName = RegExp.$1;

            RE_FN = new RegExp('(?:^|[^.$])\\b'+ fnName +'\\s*\\(\\s*(["\'])([^"\'\\s\\)]+)\\1\\s*\\)', 'g');

            while (match = RE_FN.exec(callback)) {
                match[2] && deps.push(match[2]);
            }
        }

        return deps;
    };

    // 注册模块使之处于等待编译状态
    Module.on = function (id, callback, priority) {
        var idEvents = EVENTS[id];

        if (!idEvents) {
            EVENTS[id] = [];
        }

        EVENTS[id][priority ? 'unshift' : 'push'](callback);
    };

    // 通知
    Module.notify = function (id) {
        var callbacks = EVENTS[id],
            _tmp = [];

        forEach(callbacks, function (callback, index) {
            var result = callback && callback();
            if (result !== true) {
                _tmp.push(callback);
            }
        });

        EVENTS[id] = _tmp;
    };

    // define
    function define (id, callback) {
        // 无效参数
        if (!id || arguments.length > 2) {
            throw new Error('bad arguments!');
        }

        // 只有模块回调
        if (ease.isFunction(id)) {
            callback = id;
            id = uid();
        }

        // 对象参数，无ID
        if (ease.isObject(id)) {
            var _id = id;
            callback = function () {
                return _id;
            };
            id = uid();
        }

        // 对象参数，有ID
        if (ease.isObject(callback)) {
            var _callback = callback;
            callback = function () {
                return _callback;
            };
        }

        // 重复定义
        if (MODULES[id]) {
            throw new Error('Module ' + id + ' already defined!');
        }

        // 产生模块
        var module = new Module(id, callback),
            deps = module.deps;

        Module.on(id, function () {
            Module.compile(id);
            return true;
        }, true);

        // 没有依赖模块，直接编译
        if (!deps.length) {
            Module.notify(id);
            return false;
        }

        // 处理有依赖的情况
        module.status = STATUS.interactive;

        forEach(deps, function (depId, index) {

            // 依赖模块编译完毕后通知
            Module.on(depId, function () {
                if (Module.isDepsCompiled(id)) {
                    Module.notify(id);
                    return true;
                }
            });

            if (Module.completed(depId)) {
                Module.notify(depId);
            }
        });
    }

    // load files
    function loadFiles (files, callback) {
        var require = createRequire();
        var complete = 0;
        var maps = ease.config.maps || [];
        var _map = maps[0];
        var template = maps[1];

        if (!ease.isArray(files)) {
            files = [files];
        }

        forEach(files, function (file) {
            // 多文件合并形式
            if (file.indexOf(',') > 0) {
                var s = 's0';
                file = map(file.split(/,\s*/), function (item, index) {
                    var result = _map && _map[trim(item)];

                    // 取服务器
                    if (index === 0) {
                        s = result[1];
                    }

                    return result[0] || item;

                }).join(',');

                _map[file] = [file, s];
            }

            if (_map && _map[file]) {
                file = tmpl(template, _map[file]);
            }

            if (!/\.js$/i.test(file)) {
                file += '.js';
            }

            require.async(file, function () {
                if (++complete === files.length) {
                    callback && callback();
                }
            });
        });
    }

    // 创建 require
    function createRequire () {
        function require (id) {
            var module = MODULES[id];
            return module && module.exports || null;
        }

        require.async = function (url, callback) {
            if (USED[url]) {
                throw new Error('load package ' + url + ' multiple');
            }

            USED[url] = true;

            var script = document.createElement('script'),
                s = document.getElementsByTagName('script')[0];

            script.onload = script.onreadystatechange = function () {
                if (!script.readyState || /loaded|complete/i.test(script.readyState)) {
                    script.onload = script.onreadystatechange = null;
                    script.parentNode.removeChild(script);
                    script = null;
                    callback && callback();
                }
            };

            script.src = url;
            s.parentNode.insertBefore(script, s);
        }

        return require;
    }
    // ------------------------------------------------------------------------------ Module System END


    // -------------------------------------------------------------------- functions

    // trim
    function trim (string) {
        return String(string).replace(/^\s+|\s+$/, '');
    }

    // 生成唯一 ID
    function uid (prefix) {
        uid.num = uid.num || 0;
        prefix = prefix || 'EASE_NATIVE_';

        return prefix + ++uid.num;
    }

    ease.uid = uid;

    // forEach
    function forEach (array, callback) {
        if (Array.prototype.forEach) {
            return array.forEach(callback);
        }

        for (var i = 0, len = array.length; i < len; i++) {
            // 如果返回严格 false 值，退出后面的循环
            if (false === callback(array[i], i, array)) break;
        }
    }

    ease.forEach = forEach;

    // indexOf
    function indexOf(array, value) {
        if (Array.prototype.indexOf) {
            return array.indexOf(value);
        }

        for (var i = 0, len = array.length; i < len; i++) {
            if (value === array[i]) {
                return i;
            }
        }

        return -1;
    }

    ease.indexOf = indexOf;

    // 去重数组
    function unique (array) {
        var ret = [];

        forEach(array, function (item, index) {
            if (indexOf(ret, item) === -1) {
                ret.push(item);
            }
        });

        return ret;
    }

    ease.unique = unique;

    // filter
    function filter (array, callback) {
        if (Array.prototype.filter) {
            return array.filter(callback);
        }

        var ret = [];
        var result;

        forEach(array, function (item, index, array) {
            if (result = callback(item, index, array)) {
                ret.push(item);
            }
        });

        return ret;
    }

    ease.filter = filter;

    // map
    function map (array, callback) {
        if (Array.prototype.map) {
            return array.map(callback);
        }

        var ret = [];
        forEach(array, function (item, index, array) {
            ret.push(callback(item, index, array));
        });

        return ret;
    }

    ease.map = map;

    // 清除注释
    function removeComment (code) {
        return code.replace(RE_BLOCK_COMMENT, '').replace(RE_LINE_COMMENT, '');
    }

    // 简易模版替换
    function tmpl (template, view) {
        return String(template).replace(/\{([^\}]+?)\}/g, function (match, key) {
            return view[key] || match;
        });
    }
    // -------------------------------------------------------------------------------- functions END


    global.define = define;
    global.ease = {
        'load': loadFiles,
        'use': loadFiles,
        'uid': uid,
        'forEach': forEach,
        'filter': filter,
        'unique': unique,
        'indexOf': indexOf,
        'modules': MODULES,
        'tmpl': tmpl,
        'config': ease.config
    };

})(this);
