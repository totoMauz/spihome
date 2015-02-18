(function (sPh, $, undefined) {
    "use strict";

    sPh.logLevel = Object.freeze({
        NONE: {value: 1, name: "none"},
        ERROR: {value: 2, name: "error"},
        WARNING: {value: 3 , name: "warning"},
        DEBUG: {value: 4, name: "debug"}
    });

    sPh.activeLogLevel = sPh.logLevel.DEBUG;

    sPh.error = function(sMessage) {
        sPh.log(sPh.logLevel.ERROR.value, sMessage);
    };

    sPh.warn = function(sMessage) {
        sPh.log(sPh.logLevel.WARNING.value, sMessage);
    };

    sPh.debug = function(sMessage) {
        sPh.log(sPh.logLevel.DEBUG.value, sMessage);
    };

    sPh.group = function () {
        if(sPh.activeLogLevel.value >= sPh.logLevel.DEBUG.value) {
            console.group();
        }
    };

    sPh.groupEnd = function () {
        if(sPh.activeLogLevel.value >= sPh.logLevel.DEBUG.value) {
            console.groupEnd();
        }
    };

    sPh.log = function(iLevel, sMessage) {
        if(sPh.activeLogLevel.value >= iLevel) {
            switch (iLevel) {
            case sPh.logLevel.ERROR.value:
                console.error(sMessage);
                break;

            case sPh.logLevel.WARNING.value:
                console.warn(sMessage);
                break;

            case sPh.logLevel.DEBUG.value:
                console.debug(sMessage);
                break;
            }
        }
    };

    if (!String.format) {
        String.format = function (format) {
            var args = Array.prototype.slice.call(arguments, 1);
            return format.replace(/{(\d+)}/g, function (match, number) {
                return args[number] !== undefined
                    ? args[number]
                    : match;
            });
        };
        sPh.debug("Created String.format");
    }

    function dynamicSort(property) {
        var sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a, b) {
            var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        };
    }

    Object.defineProperty(Array.prototype, "sortBy", {
        enumerable: false,
        writable: true,
        value: function () {
            return this.sort(dynamicSort.apply(null, arguments));
        }
    });
    sPh.debug("Created Array.sortBy");
}(window.sPh = window.sPh || {}, jQuery));