// util Module
define('util', function (require, exports, module) {
    var ease = module.ease;
    var forEach = ease.forEach;
    var indexOf = ease.indexOf;

    // extend
    function extend (obj) {
        obj = obj || {};

        forEach(Array.prototype.slice.call(arguments, 1), function (source) {
            for(var key in source) {
                if (source.hasOwnProperty(key)) {
                    obj[key] = source[key];
                }
            }
        });

        return obj;
    }

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
    };

    // keys
    function keys (object) {
        if (Object.keys) {
            return Object.keys(object);
        }

        var ret = [];
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                ret.push(key);
            }
        }

        return ret;
    };



    // DOM 元素判断
    function isElement (element) {
        return !!(element && element.nodeType === 1);
    }

    return extend({}, ease, {
            'extend': extend,
            'map': map,
            'keys': keys,
            'isElement': isElement
        });
});