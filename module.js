// ease.js
/*

define (id, function (require, exports, ease) {
    // 1. return Something
    // 2. exports.method = function () {}
    // 3. exports = {...}
});

define (function (require, exports, ease) {
    // 自动生成模块 Id
});

define({
    initialize: function (ease) {
        // 自执行
    }
})

*/
(function (global) {
    var ease = {};
    var toString = Object.prototype.toString;

    // 类型判断
    forEach('Boolean Number String Function Array Date RegExp Object'.split(' '), function (type) {
        ease['is' + type] = function (value) {
            return '[object ' + type + ']' === toString.call(value);
        };
    });


    // ------------------------------------------------------------- Module System
    // require 分析
    var RE_REQUIRE = /(?:^|[^.$])\brequire\s*\(\s*(["'])([^"'\s\)]+)\1\s*\)/g;

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

    // 调试开关
    var DEBUG = 1;

    // Module Class
    function Module (id, callback) {
        // 模块名，唯一
        this.id = id;

        // 父模块，依赖模块
        this.deps = Module.parseDependencies(callback);

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
                return (completed = false); // 提升性能
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
            ret = [];

        while (match = RE_REQUIRE.exec(callback)) {
            match[2] && ret.push(match[2]);
        }

        return ret;
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
            return false;
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

        if (!ease.isArray(files)) {
            files = [files];
        }

        forEach(files, function (file) {
            if (!/\.js$/i.test(file)) {
                file += '.js';
            }

            require.async(file, function () {
                complete++;

                if (complete === files.length) {
                    callback && callback();
                }
            });
        });
    };

    // 创建 require
    function createRequire () {
        function require (id) {
            var module = MODULES[id];
            return module && module.exports || null;
        }

        require.async = function (url, callback) {
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

    // 生成唯一 ID
    function uid () {
        uid.num = uid.num || 0;
        return _getUid.call(this, ++uid.num);
    }

    function _getUid (id) {
        return 'EASE_NATIVE_' + id;
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

    // 清除注释
    function removeComment (code) {
        return code.replace(RE_BLOCK_COMMENT, '').replace(RE_LINE_COMMENT, '');
    }
    // -------------------------------------------------------------------------------- functions END


    global.define = define;
    global.ease = {
        load: loadFiles,
        use: loadFiles,
        uid: uid
    };

})(this);
