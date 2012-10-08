// Template Module
define('tmpl', function (require, exports, ease) {
    // tmpl
    return function (template, view) {
        return template.replace(/\{([^\}]+)\}/g, function (all, key, offset, template) {
            return view && view[key] || all;
        });
    }
});