(function(sPh, $, undefined) {
    var $menu = $(".ui-content", "#menu");

    sPh.readConfig = function () {
        $.getJSON("config.json", function(data) {
            sPh.clearMenu();
            Object.keys(data).forEach(function (categoryKey) {
                var oCategory = data[categoryKey];
                sPh.createMenuButton(oCategory.name, oCategory.text, oCategory.site);
                sPh.createPage(oCategory);
            });
        }).fail(function(jqxhr, text, error) {
            console.error(String.format("Coudn't read config: {0}. {1}", text, error));
        }).done(function() {
            sPh.addNavigation($('[name="btnMenu"]'), 'menu', true);
        });
    };

    sPh.createPage = function (oCategory) {
        var header = String.format("<div data-role='header' data-position='fixed'><button class='ui-btn-left ui-btn ui-btn-inline ui-mini ui-corner-all ui-btn-icon-right' name='btnMenu' id='{0}Menu'>Menu</button><h1>{1}</h1></div>", oCategory.name, oCategory.text),
        body = "",
        footer = "";

        if(oCategory.objects) {
            body = sPh.createItems(oCategory.objects);
            console.debug("Created items for "+ oCategory.site);
        }

        var page = $(String.format("<div data-role='page' id='{0}'>{1}{2}{3}</div>", oCategory.name, header, body, footer));
        page.appendTo($.mobile.pageContainer);
        console.debug("Created page " + oCategory.site);


        if(oCategory.objects) {
            sPh.createEvents(oCategory.objects);
            console.debug("Created events for " + oCategory.site);
        }
    };

    sPh.createEvents = function(aObjects) {
        if(aObjects instanceof Array === false || aObjects.length < 1) {
            return "";
        }
        aObjects.forEach(function(obj) {
            switch(obj.template) {
            case "toggle":
                break;
            case "button":
                sPh.addClickEvent(obj.name, obj.action, obj.parameter);
                break;
            case "slider":
                break;
            }
        });
    };

    sPh.createItems = function (aObjects) {
        if(aObjects instanceof Array === false || aObjects.length < 1) {
            return "";
        }

        aObjects.sortBy("location");

        var html = "<div role='main' class='ui-content'>",
        currentLocation;
        aObjects.forEach(function(obj) {
            if(obj.location !== currentLocation) {
                if(currentLocation !== undefined) {
                    html += "</div>";
                }
                html += "<div class='ui-corner-all custom-corners'><div class='ui-bar'>";
                html += "<h3>" + obj.location + "</h3>";
                html += "</div><div class='ui-body'>";

                currentLocation = obj.location;
            }

            switch(obj.template) {
            case "toggle":
                html += sPh.createToggle(obj.name, obj.text, obj.options);
                break;
            case "button":
                html += sPh.createButton(obj.name, obj.text, obj.options);
                break;
            case "slider":
                html += sPh.createSlider(obj.name, obj.text, obj.options);
                break;
            }
        });
        if(currentLocation !== undefined) {
            html += "</div>"
        }
        html += "</div>";
        return html;
    };

    sPh.createLabel = function (sName, sText) {
        return sText ? String.format("<label for='{0}'>{1}</label>", sName, sText) : "";
    };

    sPh.createSlider = function (sName, sText, oOptions) {
        var label = sPh.createLabel(sName, sText),
        minValue = 0,
        maxValue = 5,
        step = 1,
        currentValue = 0,
        slider;

        if(oOptions) {
            minValue = oOptions.min || 0;
            maxValue = oOptions.max || 5;
            step = oOptions.step || 1;
            currentValue =  oOptions.current || 0;
        }

        slider = String.format("<input type='range' name='{0}' id='{0}' value='{1}' min='{2}' max='{3}' />", sName, currentValue, minValue, maxValue);

        return (label + slider);
    };

    sPh.createButton = function(sName, sText, oOptions) {
        return String.format("<button name='{0}' id='{0}' data-role='button'>{1}</button>", sName, sText);
    };

    sPh.createToggle = function(sName, sText, oOptions) {
        var label = sPh.createLabel(sName, sText),
        toggle = String.format("<select name='{0}' id='{0}' data-role='slider'><option value='0'>Off</option><option value='1'>On</option></select>", sName);
        return (label + toggle);
    };

    sPh.createMenuButton = function(sName, sText) {
        var sId = "btn" + sName;
        $menu.append('<span data-role="button" id="' + sId + '" >' + sText + '</span>');
        $menu.find("span[data-role='button']").button();
        sPh.addNavigation($('#'+sId), sName);
    };

    sPh.clearMenu = function () {
        $("span[data-role='button']", "#menu").remove();
    };

    //execute this on start up
    sPh.readConfig();
}(window.sPh = window.sPh || {}, jQuery));

$(document).ready(function() {
    sPh.addPageContainerListener();
});