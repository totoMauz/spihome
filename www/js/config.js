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
	}).fail(function() {
	    console.error("Coudn't read config");
	}).done(function() {
	    sPh.addNavigation($('[name="btnMenu"]'), '#menu', true);
	});
    };

    sPh.createPage = function (oCategory) {
	//TODO generalize
	if(oCategory.site !== "#dummy"){return;}

	var header = "<div data-role='header' data-position='fixed'><button class='ui-btn-left ui-btn ui-btn-inline ui-mini ui-corner-all ui-btn-icon-right' name='btnMenu' id='dummyMenu'>Menu</button><h1>Dummy</h1>",
        body = "",
	footer = "";
	var page = $("<div data-role='page' id='dummy'>" + header+body+footer + "</div>");
	page.appendTo($.mobile.pageContainer);
	console.debug("Created page dummy");
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