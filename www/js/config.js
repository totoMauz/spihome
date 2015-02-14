(function(sPh, $, undefined) {
    //private
    var $menu = $(".ui-content", "#menu");

    //public
    sPh.readConfig = function () {
	    $.getJSON("config.json", function(data) {
	        sPh.clearMenu();
	        Object.keys(data).forEach(function (categoryKey) {
		        var oCategory = data[categoryKey];
		        sPh.createMenuButton(oCategory.name, oCategory.site);
		        sPh.createPage(oCategory);
	        });
	    }).fail(function(jqxhr, text, error) {
	        console.error(String.format("Coudn't read config: {0}. {1}", text, error));
	    }).done(function() {
	        sPh.addNavigation($('[name="btnMenu"]'), '#menu', true);
	    });
    };

    sPh.createPage = function (oCategory) {
        var pageId = oCategory.site.charAt(0) === '#' ? oCategory.site.slice(1) : oCategory.site;
	    var header = String.format("<div data-role='header' data-position='fixed'><button class='ui-btn-left ui-btn ui-btn-inline ui-mini ui-corner-all ui-btn-icon-right' name='btnMenu' id='{0}Menu'>Menu</button><h1>{1}</h1>", pageId, oCategory.name),
        body = "",
	    footer = "";
	    var page = $(String.format("<div data-role='page' id='{0}'>{1}{2}{3}</div>", pageId, header, body, footer));
	    page.appendTo($.mobile.pageContainer);
	    console.debug("Created page " + oCategory.site);
    };

    sPh.createMenuButton = function(sCategory, sSite) {
	    var sId = "btn" + sCategory;
	    $menu.append('<span data-role="button" id="' + sId + '" >' + sCategory + '</span>');
	    $menu.find("span[data-role='button']").button();
	    sPh.addNavigation($('#'+sId), sSite);
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