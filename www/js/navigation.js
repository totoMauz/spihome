(function(sPh, $, undefined) {
    sPh.addNavigation = function ($selector, sSite, isReverse) {
	console.debug("attached click event to " + $selector.map(function() {return this.id;}).get());

	//if it's not a button, assume it's one of the generated ones - get it's 'div button' parent
	var $eventSource = $selector.is("button") ? $selector : $selector.parent('.ui-btn');

	$eventSource.click(function (evt) {
	    console.debug("click event from " + (evt.target.id || evt.target.children[0].id));
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
