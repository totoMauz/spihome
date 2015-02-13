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
	    });
	    $menu.find("span[data-role='button']").button();
	}).fail(function() {
	    console.error("Coudn't read config");
	});
    };

    sPh.createMenuButton = function(sCategory, sSite) {
	var sId = "btn" + sCategory;
	$menu.append('<span data-role="button" id="' + sId + '" >' + sCategory + '</span>');
	sPh.addNavigation($('#'+sId), sSite);
    };

    sPh.clearMenu = function () {
	$("span[data-role='button']", "#menu").remove();
    };

    //execute this on start up
    sPh.readConfig();
}(window.sPh = window.sPh || {}, jQuery));
