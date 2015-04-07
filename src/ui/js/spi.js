(function (sPh, $, undefined) {
    "use strict";
    /**
     * Logging
     */
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

    sPh.group = function() {
        if(sPh.activeLogLevel.value >= sPh.logLevel.DEBUG.value) {
            console.group();
        }
    };

    sPh.groupEnd = function() {
        if(sPh.activeLogLevel.value >= sPh.logLevel.DEBUG.value) {
            console.groupEnd();
        }
    };

    sPh.lookupLogLevel = function(level) {
        if(isNaN(level) === false) {
            //convert to real number
            level = ~~level;
        }
        switch(level) {
        case sPh.logLevel.NONE.name:
        case sPh.logLevel.NONE.value:
            return sPh.logLevel.NONE;
            
        case sPh.logLevel.ERROR.name:
        case sPh.logLevel.ERROR.value:
            return sPh.logLevel.ERROR;

        case sPh.logLevel.WARNING.name:
        case sPh.logLevel.WARNING.value:
            return sPh.logLevel.WARNING;

        case sPh.logLevel.DEBUG.name:
        case sPh.logLevel.DEBUG.value:
            return sPh.logLevel.DEBUG;
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

    /**
     * Helper functions
     */          
    if (!String.format) {
        String.format = function (sFormat) {
            var args = Array.prototype.slice.call(arguments, 1);
            return sFormat.replace(/{(\d+)}/g, function (match, number) {
                return args[number] !== undefined ? args[number] : match;
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
    
    /**
     * Navigation
     */
    var $menu = $(".ui-content", "#menu");

    sPh.removeOldPages = function () {
        $("div[data-role='page']:not(#menu,#options,#login)").remove();
        sPh.debug("Removed old pages");
    };

    /**
     * Config
     */
    sPh.validateConfig = function (oConfig) {
        var start = performance.now(),
        end,
        iWarnings = 0,
        iErrors = 0;

        function checkProperties(aExpected, sActual, bError, sCategory, iIndex) {
            var sMessage;
            if (aExpected.indexOf(sActual) === -1) {
                if (bError) {
                    ++iErrors;
                    sMessage = "Missing mandatory property '" + sActual + "'";
                } else {
                    ++iWarnings;
                    sMessage = "Unexpected property '" + sActual + "'";
                }
                if (iIndex !== undefined) {
                    sMessage += " of object at [" + iIndex + "] of category '" + sCategory + "'";
                } else {
                    sMessage += " for category '" + sCategory + "'";
                }
                if (bError) {
                    sPh.error(sMessage);
                } else {
                    sPh.warn(sMessage);
                }
            }
        }

        Object.keys(oConfig).forEach(function (sCategory) {
            //check root categories
            var oCategory = oConfig[sCategory],
            categoryTags = Object.keys(oCategory);

            categoryTags.forEach(function (sProperty) {
                var oObjects;
                //check for undefined tags
                checkProperties(["name", "text", "objects"], sProperty, false, sCategory);

                if (sProperty === "objects") {
                    oObjects = oCategory[sProperty];
                    if (oObjects instanceof Array === false) {
                        ++iErrors;
                        sPh.error("Expected objects to be of type Array");
                    } else {
                        oObjects.forEach(function (object, iObjIdx) {
                            var objectTags = Object.keys(object);
                            //check for undefined tags
                            objectTags.forEach(function (sTag) {
                                checkProperties(["name", "text", "template", "location", "action", "parameter", "options"], sTag, false, sCategory, iObjIdx);
                            });
                            //check mandatory tags
                            checkProperties(objectTags, "name", true, sCategory, iObjIdx);
                        });
                    }
                }
            });
            //check for mandatory tags
            checkProperties(categoryTags, "name", true, sCategory);
        });

        end = performance.now();
        sPh.debug(String.format("Validated config in {0} ms with {1} error(s) and {2} warnings(s)", (end - start), iErrors, iWarnings));

        return iErrors === 0;
    };

    sPh.readConfig = function () {
        var start = performance.now(),
        end,
        validConfig;
        $.getJSON("config.json", function (data) {
            sPh.group("start up");
            validConfig = sPh.validateConfig(data);
            if (!validConfig) {
                return;
            }
            sPh.clearMenu();
            sPh.removeOldPages();
            Object.keys(data).forEach(function (categoryKey) {
                var oCategory = data[categoryKey];
                sPh.group(categoryKey);
                if (!oCategory.text) {
                    oCategory.text = oCategory.name;
                }

                sPh.createMenuButton(oCategory.name, oCategory.text, oCategory.site);
                sPh.createPage(oCategory);
                sPh.groupEnd();
            });
        }).fail(function (jqxhr, text, error) {
            sPh.error(String.format("Couldn't read config: {0}. {1}", text, error));
        }).done(function () {
            if (validConfig)  {
                sPh.group("Navigation");
                sPh.addNavigation($('[name="btnMenu"]'), 'menu', true);
                sPh.groupEnd();
            }
        }).always(function () {
            end = performance.now();
            sPh.debug(String.format("Total startup time: {0} ms", (end - start)));
            sPh.groupEnd();
        });
    };

    sPh.createPage = function (oCategory) {
        var start = performance.now(),
        end,
        header = String.format("<div data-role='header' data-position='fixed'><button class='ui-btn-left ui-btn ui-btn-inline ui-mini ui-corner-all ui-btn-icon-left ui-icon-bars' name='btnMenu' id='{0}Menu'>Menu</button><h1>{1}</h1></div>", oCategory.name, oCategory.text),
        body = "",
        footer = "",
        page;

        if (oCategory.objects) {
            body = sPh.createItems(oCategory.objects);
            sPh.debug("Created items for " + oCategory.name);
        }

        page = $(String.format("<div data-role='page' id='{0}'>{1}{2}{3}</div>", oCategory.name, header, body, footer));
        page.appendTo($.mobile.pageContainer);
        sPh.debug("Created page " + oCategory.name);

        if (oCategory.objects) {
            sPh.createEvents(oCategory.objects);
            sPh.debug("Created events for " + oCategory.name);
        }
        end = performance.now();
        sPh.debug(String.format("created page {1} in: {0} ms", (end - start), oCategory.name));
    };

    sPh.createEvents = function (aObjects) {
        if (aObjects instanceof Array === false || aObjects.length < 1) {
            return "";
        }
        aObjects.forEach(function (obj) {
            switch (obj.template) {
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
        var start = performance.now(),
        end,
        html,
        currentLocation;
        if (aObjects instanceof Array === false || aObjects.length < 1) {
            return "";
        }

        aObjects.sortBy("location");

        html = "<div data-role='main' class='ui-content'>";
        aObjects.forEach(function (obj) {
            if (obj.location !== currentLocation) {
                if (currentLocation !== undefined) {
                    html += "</div>";
                }
                html += "<div class='ui-corner-all custom-corners'><div class='ui-bar'>";
                html += "<h3>" + obj.location + "</h3>";
                html += "</div><div class='ui-body'>";

                currentLocation = obj.location;
            }

            switch (obj.template) {
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
        if (currentLocation !== undefined) {
            html += "</div>";
        }
        html += "</div>";
        end = performance.now();
        sPh.debug(String.format("Created items in {0} ms", (end - start)));
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

        if (oOptions) {
            minValue = oOptions.min || 0;
            maxValue = oOptions.max || 5;
            step = oOptions.step || 1;
            currentValue =  oOptions.current || 0;
        }

        slider = String.format("<input type='range' data-highlight='true' name='{0}' id='{0}' value='{1}' min='{2}' max='{3}' />", sName, currentValue, minValue, maxValue);

        return (label + slider);
    };

    sPh.createButton = function (sName, sText, oOptions) {
        return String.format("<button name='{0}' id='{0}' data-role='button'>{1}</button>", sName, sText);
    };

    sPh.createToggle = function (sName, sText, oOptions) {
        var label = sPh.createLabel(sName, sText),
        toggle = String.format("<select name='{0}' id='{0}' data-role='slider'><option value='0'>Off</option><option value='1'>On</option></select>", sName);
        return (label + toggle);
    };

    sPh.createMenuButton = function (sName, sText) {
        var sId = "btn" + sName;
        $menu.append('<span data-role="button" id="' + sId + '" >' + sText + '</span>');
        $menu.find("span[data-role='button']").button();
        sPh.addNavigation($('#' + sId), sName);
    };

    sPh.clearMenu = function () {
        $("span[data-role='button']", "#menu").remove();
    };

    sPh.addNavigation = function ($selector, sName, isReverse) {
        sPh.debug("attached click event to " + $selector.map(function () {return this.id; }).get());

        //if it's not a button, assume it's one of the generated ones - get it's 'div button' parent
        var $eventSource = $selector.is("button") ? $selector : $selector.parent('.ui-btn');

        $eventSource.on("click", function(evt) {
            sPh.debug("click event from " + (evt.target.id || evt.target.children[0].id));
            $.mobile.pageContainer.pagecontainer('change', '#' + sName, {
                transition: 'slide',
                changeHash: true,
                reverse: isReverse || false,
                showLoadMsg: true
            });
        });
    };

    sPh.addClickEvent = function (sName, sAction, aParameter) {
        var fnAction;

        if (aParameter instanceof Array === false) {
            aParameter = [aParameter];
        }

        switch (sAction) {
        case "cec":
            fnAction = function () {
                alert(String.format("echo '{0}' | cec-client -s -d 1", aParameter[0]));
            };
            break;
        default:
            fnAction = function () {
                alert(String.format("Action: {0}, Paremeter:{1}", sAction, aParameter.toString()));
            };
            break;
        }

        $('#' + sName).click(function () {
            sPh.debug(sName + " clicked");
            fnAction();
        });
    };

    sPh.addPageContainerListener = function () {
        $.mobile.pageContainer.on("pagecontainerchangefailed", function (event, ui) {
            sPh.error("Coudn't change page to " + ui.toPage);
        });
        $.mobile.pageContainer.on("pagecontainerchange", function (event, ui) {
            sPh.debug("Page changed to " + ui.toPage.map(function () {return this.id; }).get());
        });
    };
    
    sPh.login = function () {
		var $password = $("#txt-password");
        //TODO implement password service in backend
        if($password.val()) {
			sPh.debug("Successful login attempt");
            $.mobile.changePage($("#menu"));
        } else 
		{
			$password.addClass("error").focus();
			sPh.warn("Failed login attempt");
		}
    };
    
    //execute this on start up
    sPh.readConfig();
}(window.sPh = window.sPh || {}, jQuery));

$(document).ready(function () {
    //we want this after all subpages are created, so not using $(document).on("pagecreate", function(){}) is fine
    sPh.addPageContainerListener();    
    $("[name=active-theme]").on("change", function(event, ui) {
        var allPages = $("div[data-role='page'],div[data-role='dialog']"),
            dialogs = $("div[data-role='dialog']"),
            fieldsets = $('fieldset'),
            oldTheme = "",
            newTheme = "";
        oldTheme = dialogs.attr("data-theme");
        newTheme = $(this).val();
            
        dialogs.attr({"data-overlay-theme": newTheme,
                       "data-theme": newTheme});
        fieldsets.attr({"data-theme": newTheme,
                       "data-content-theme": newTheme});           
                       
                       
        fieldsets.removeClass("ui-group-theme-" + oldTheme).addClass("ui-group-theme-" + newTheme);
        allPages.removeClass("ui-page-theme-" + oldTheme).addClass("ui-page-theme-" + newTheme);
        sPh.debug("Changed active theme to " + newTheme);
    });

    //assign enum values to radio buttons
    $("#logLevelNone").val(sPh.logLevel.NONE.value);
    $("#logLevelError").val(sPh.logLevel.ERROR.value);
    $("#logLevelWarning").val(sPh.logLevel.WARNING.value);
    $("#logLevelDebug").val(sPh.logLevel.DEBUG.value);
    $("[name=active-log-level]").on("change", function(event, ui) {
        sPh.activeLogLevel = sPh.lookupLogLevel($(this).val());
        sPh.debug("Changed active log level to " + sPh.activeLogLevel.name);
    });
});
