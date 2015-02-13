addNavigation($('[name="btnMenu"]'), '#menu', true);
addNavigation($('#btnPowerplugs'), '#powerplugs');
addNavigation($('#btnKodi'), '#kodi');
addNavigation($('#btnSomething'), '#dummy');

function addNavigation(oButton, sSite, isReverse) {
  oButton.click(function () {
    $(':mobile-pagecontainer').pagecontainer('change', sSite, {
      transition: 'slide',
      changeHash: true,
      reverse: isReverse || false,
      showLoadMsg: true
    });
  });
}
