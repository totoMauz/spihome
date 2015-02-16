(function (sPh, $, undefined) {
    "use strict";
    if (!String.format) {
        String.format = function (format) {
            var args = Array.prototype.slice.call(arguments, 1);
            return format.replace(/{(\d+)}/g, function (match, number) {
                return args[number] !== undefined
                    ? args[number]
                    : match;
            });
        };
        console.debug("Created String.format");
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

    console.debug("Created Array.sortBy");
}(window.sPh = window.sPh || {}, jQuery));