(function(sPh, $, undefined) {
    sPh.addNavigation = function ($selector, sSite, isReverse) {
	    console.debug("attached click event to " + $selector.map(function() {return this.id;}).get());

	    //if it's not a button, assume it's one of the generated ones - get it's 'div button' parent
	    var $eventSource = $selector.is("button") ? $selector : $selector.parent('.ui-btn');

	    $eventSource.click(function (evt) {
	        console.debug("click event from " + (evt.target.id || evt.target.children[0].id));
	        $.mobile.pageContainer.pagecontainer('change', sSite, {
		        transition: 'slide',
		        changeHash: true,
		        reverse: isReverse || false,
		        showLoadMsg: true
	        });
	    });
    };

    sPh.addPageContainerListener = function (){
	    $.mobile.pageContainer.on( "pagecontainerchangefailed", function( event, ui ) {
	        console.error("Coudn't change page to " + ui.toPage);
	    });
	    $.mobile.pageContainer.on( "pagecontainerchange", function( event, ui ) {
	        console.debug("Page changed to " + ui.toPage.map(function() {return this.id;}).get());
	    });
    };
}(window.sPh = window.sPh || {}, jQuery));
