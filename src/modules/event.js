// Event Module
define('event', function (require, exports, ease) {
    // DOM Ready
    function ready (callback) {
        var doc = document;

    	if (doc.readyState === 'complete') {
    		ready.done = true;
    	}

        if (!callback) {
            return false;
        }

        if (ready.done) {
            return callback && callback();
        }


        // only run once
        function init () {
            if (!ready.done) {
                ready.done = true;
                callback && callback();
            }
        }

        // standards
        if (doc.addEventListener) {
            doc.addEventListener('DOMContentLoaded', function () {
                doc.removeEventListener('DOMContentLoaded', arguments.callee, false);
                init();
            }, false);

        } else if (doc.attachEvent) {
            // newer IE
            doc.attachEvent('onreadystatechange', function () {
                if (doc.readyState === 'complete') {
                    doc.detachEvent('onreadystatechange', arguments.callee);
                    init();
                }
            });

            // older IE
            if (doc.documentElement.doScroll) {
                (function () {
                    try {
                        doc.documentElement.doScroll('left');
                    } catch (e) {
                        setTimeout(arguments.callee, 0);
                        return;
                    }

                    init();
                })();
            }
        }
    }

    exports.ready = ready;
});