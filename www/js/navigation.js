(function(sPh, $, undefined) {
    sPh.addNavigation = function ($selector, sSite, isReverse) {
	console.debug("attached click event to " + $selector.map(function() {return this.id;}).get());

	//assume it's one of the generated 'buttons' - get it's parent to increase clickable area
	var $eventSource = $selector.is("button") ? $selector : $selector.parent();

	$eventSource.click(function (evt) {
	    console.debug("click event from " + evt.target.id);
	    $(':mobile-pagecontainer').pagecontainer('change', sSite, {
		transition: 'slide',
		changeHash: true,
		reverse: isReverse || false,
		showLoadMsg: true
	    });
	});
    };

    sPh.addNavigation($('[name="btnMenu"]'), '#menu', true);
}(window.sPh = window.sPh || {}, jQuery));
