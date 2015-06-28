(function (sPh, undefined) {
    "use strict";

    //helper
    /**
     * Comparator to sort objects by a property
     * @param {String} property if the property starts with - the sort order will be descending
     * @param {Number} -1, 0 or 1 to indicate the sort order
     */
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

    /**
     * Add #dynamicSort to the Array-Object
     */
    Object.defineProperty(Array.prototype, "sortBy", {
        enumerable: false,
        writable: true,
        value: function () {
            return this.sort(dynamicSort.apply(null, arguments));
        }
    });

    //enums
    /**
     * Properties by which one can sort Actors or Sensors
     */
    sPh.sortProperty = Object.freeze({
        NAME: {value: 1, name: "name"},
        LOCATION: {value: 2, name: "location"},
        TYPE: {value: 3, name: "type"},
        MEASURE: {value: 4, name: "measure"}
    });

    /**
     * Log levels which one can use to write on the browser console
     */
    sPh.logLevel = Object.freeze({
        NONE: {value: 1, name: "none"},
        ERROR: {value: 2, name: "error"},
        WARNING: {value: 3, name: "warning"},
        DEBUG: {value: 4, name: "debug"},
        INFO: {value: 5, name: "info"}
    });

    //private variables
    var oDomElements = {},
        sCssClassHidden = 'hidden',
        sCssClassAscending = 'ascending',
        sCssClassDescending = 'descending',
        sCssClassThing = "thing",
        sCssClassName = "name",
        sCssClassMeasure = "measure",
        sCssClassType = "type",
        sCssClassLocation = "location",
        bSortAscending = true,
        oActiveSortProperty = sPh.sortProperty.NAME,
        sLastAction,
        sIdMenu1 = "menu_1",
        sIdMenuOrder0 = "menu_order_0",
        sIdContent = "content",
        sIdSortByMeasure = "sortByMeasure",
        sIdSortByType = "sortByType",
        sIdSortByName = "sortByName",
        sIdSortByLocation = "sortByLocation",
        sHtmlUl = "ul",
        sHtmlLi = "li",
        sHtmlSpan = "span",
        sHtmlDiv = "div",
        sActionActor = "actors",
        sActionSensor = "sensors",
        fLog,
        fCreateSensor,
        fCreateActor;

    //private methods
    /**
     * Writes a message with a certain severity to the browser console
     * @param {Number} iLevel the severity @see #logLevel
     * @param {String} sMessage the message tow rite
     */
    fLog = function (iLevel, sMessage) {
        if (sPh.activeLogLevel.value >= iLevel) {
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
     * Create a html element for Sensors
     * @param {Object} oSensor the Sensor to represent
     * @return {Object} a DOM object
     */
    fCreateSensor = function(oSensor) {
        var oSensorName,
            oSensorMeasure,
            oSensorLocation,
            oSensorDiv = document.createElement(sHtmlDiv);

        oSensorDiv.classList.add(sCssClassThing);
        oSensorName = document.createElement(sHtmlSpan);
        oSensorName.classList.add(sCssClassName);
        oSensorName.innerHTML = oSensor.name;
        oSensorDiv.appendChild(oSensorName);

        oSensorMeasure = document.createElement(sHtmlSpan);
        oSensorMeasure.classList.add(sCssClassMeasure);
        oSensorMeasure.innerHTML = oSensor.measure;
        oSensorDiv.appendChild(oSensorMeasure);

        oSensorLocation = document.createElement(sHtmlSpan);
        oSensorLocation.classList.add(sCssClassLocation);
        oSensorLocation.innerHTML = oSensor.location;
        oSensorDiv.appendChild(oSensorLocation);

        return oSensorDiv;
    };


    /**
     * Create a html element for Actors
     * @param {Object} oActor the Actor to represent
     * @return {Object} a DOM object
     */
    fCreateActor = function(oActor) {
        var oActorName,
            oActorType,
            oActorLocation,
            oActorDiv = document.createElement(sHtmlDiv);

        oActorDiv.classList.add(sCssClassThing);
        oActorName = document.createElement(sHtmlSpan);
        oActorName.classList.add(sCssClassName);
        oActorName.innerHTML = oActor.name;
        oActorDiv.appendChild(oActorName);

        oActorType = document.createElement(sHtmlSpan);
        oActorType.classList.add(sCssClassType);
        oActorType.innerHTML = oActor.type;
        oActorDiv.appendChild(oActorType);

        oActorLocation = document.createElement(sHtmlSpan);
        oActorLocation.classList.add(sCssClassLocation);
        oActorLocation.innerHTML = oActor.location;
        oActorDiv.appendChild(oActorLocation);

        return oActorDiv;
    };

    //public variables
    sPh.activeLogLevel = sPh.logLevel.DEBUG;

    //public methods
    /**
     * Get an element from the DOM
     * @param {String} sId the ID of the element
     * @return {Object} the DOM element
     */
    sPh.getElementById = function (sId) {
        if (!oDomElements[sId]) {
            oDomElements[sId] = document.getElementById(sId);
        }
        return oDomElements[sId];
    };

    /**
     * Add a css class to hide an element
     * @param {String} sId the ID of the element
     */
    sPh.toggleVisibility = function (sId) {
        sPh.getElementById(sId).classList.toggle(sCssClassHidden);
    };

    /**
     * Remove a specific class from a number of elements
     * @param {String...} the first parameter is the class to remove, the rest is a list of element IDs
     */
    sPh.removeClass = function () {
        var idx;
        for (idx = 1; idx < arguments.length; idx ++) {
            sPh.getElementById(arguments[idx]).classList.remove(arguments[0]);
        }
    };

    /**
     * Add a specific class to a number of elements
     * @param {String...} the first parameter is the class to add, the rest is a list of element IDs
     */
    sPh.addClass = function () {
        var idx;
        for (idx = 1; idx < arguments.length; idx ++) {
            sPh.getElementById(arguments[idx]).classList.add(arguments[0]);
        }
    };

    /**
     * Add a css class to hide a number of elements
     * @param {String...} a list of element IDs
     */
    sPh.hideElements = function () {
        var idx;
        for (idx = 0; idx < arguments.length; idx++) {
            sPh.getElementById(arguments[idx]).classList.add(sCssClassHidden);
        }
    };

    /**
     * Removes a css class to show a number of elements
     * @param {String...} a list of element IDs
     */
    sPh.showElements = function () {
        var idx;
        for (idx = 0; idx < arguments.length; idx++) {
            sPh.getElementById(arguments[idx]).classList.remove(sCssClassHidden);
        }
    };

    /**
     * Clears the content section
     */
    sPh.clearContent = function () {
        sPh.getElementById(sIdContent).innerHTML = "";
    };

    /**
     * Change the active sort property for Actors or Sensors. If the new sort property
     * is equal to the previous one, the sort order will be reverted
     * @param {Object} oSortProperty the new active sort property
     */
    sPh.setSortProperty = function (oSortProperty) {
        var sElementId;

        if (oActiveSortProperty === oSortProperty) {
            bSortAscending = !bSortAscending;
        } else {
            bSortAscending = true;
            oActiveSortProperty = oSortProperty;
        }

        switch (oActiveSortProperty) {
        case sPh.sortProperty.NAME:
            sElementId = sIdSortByName;
            this.removeClass(sCssClassAscending, sIdSortByLocation, sIdSortByMeasure, sIdSortByType);
            this.removeClass(sCssClassDescending, sIdSortByLocation, sIdSortByMeasure, sIdSortByType);
            break;

        case sPh.sortProperty.LOCATION:
            sElementId = sIdSortByLocation;
            this.removeClass(sCssClassAscending, sIdSortByName, sIdSortByMeasure, sIdSortByType);
            this.removeClass(sCssClassDescending, sIdSortByName, sIdSortByMeasure, sIdSortByType);
            break;

        case sPh.sortProperty.TYPE:
            sElementId = sIdSortByType;
            this.removeClass(sCssClassAscending, sIdSortByLocation, sIdSortByMeasure, sIdSortByName);
            this.removeClass(sCssClassDescending, sIdSortByLocation, sIdSortByMeasure, sIdSortByName);
            break;

        case sPh.sortProperty.MEASURE:
            sElementId = sIdSortByMeasure;
            this.removeClass(sCssClassAscending, sIdSortByLocation, sIdSortByName, sIdSortByType);
            this.removeClass(sCssClassDescending, sIdSortByLocation, sIdSortByName, sIdSortByType);
            break;
        }

        if (bSortAscending) {
            this.removeClass(sCssClassDescending, sElementId);
            this.addClass(sCssClassAscending, sElementId);
        } else {
            this.removeClass(sCssClassAscending, sElementId);
            this.addClass(sCssClassDescending, sElementId);
        }
        this.rerender();
    };

    /**
     * Log a message with #logLevel.ERROR severity
     * @param {String} sMessage the message to log
     */
    sPh.error = function (sMessage) {
        fLog(sPh.logLevel.ERROR.value, sMessage);
    };

    /**
     * Log a message with #logLevel.WARNING severity
     * @param {String} sMessage the message to log
     */
    sPh.warn = function (sMessage) {
        fLog(sPh.logLevel.WARNING.value, sMessage);
    };

    /**
     * Log a message with #logLevel.DEBUG severity
     * @param {String} sMessage the message to log
     */
    sPh.debug = function (sMessage) {
        fLog(sPh.logLevel.DEBUG.value, sMessage);
    };

    /**
     * Log a message with #logLevel.INFO severity
     * @param {String} sMessage the message to log
     */
    sPh.info = function (sMessage) {
        fLog(sPh.logLevel.INFO.value, sMessage);
    };

    /**
     * Fetches all sensors from the backend and renders them as list
     */
    sPh.renderSensors = function () {
        var aSensors = this.fetchSensors(),
            oContent;
        if (!aSensors) {
            this.error("No sensors returned from backend");
            return;
        }

        if(oActiveSortProperty === sPh.sortProperty.TYPE) {
            this.setSortProperty(sPh.sortProperty.NAME);
        }
        aSensors.sortBy( ((bSortAscending) ? '' : '-') + oActiveSortProperty.name);

        this.showElements(sIdMenuOrder0, sIdSortByMeasure);
        this.hideElements(sIdMenu1, sIdSortByType);
        this.clearContent();
        oContent = this.getElementById(sIdContent);

        aSensors.forEach(function (oSensor) {
            var oSensorElement = fCreateSensor(oSensor);
            oContent.appendChild(oSensorElement);
        });
        sLastAction = sActionSensor;
    };

    /**
     * Fetches all actors from the backend and renders them as list
     */
    sPh.renderActors = function () {
        var aActors = this.fetchActors(),
            oContent;

        if (!aActors) {
            this.error("No actors returned from backend");
            return;
        }

        if(oActiveSortProperty === sPh.sortProperty.MEASURE) {
            this.setSortProperty(sPh.sortProperty.NAME);
        }
        aActors.sortBy( ((bSortAscending) ? '' : '-') + oActiveSortProperty.name);

        this.showElements(sIdMenuOrder0, sIdSortByType);
        this.hideElements(sIdMenu1, sIdSortByMeasure);
        this.clearContent();
        oContent = this.getElementById(sIdContent);

        aActors.forEach(function (oActor) {
            var oActorElement = fCreateActor(oActor);
            oContent.appendChild(oActorElement);
        });
        sLastAction = sActionActor;
    };

    /**
     * Redo the last action
     */
    sPh.rerender = function () {
        switch (sLastAction) {
        case sActionActor:
            this.renderActors();
            break;

        case sActionSensor:
            this.renderSensors();
            break;
        }
    };

    /**
     * Fetch all Sensors from the backend
     * @return {Array} a list of all Sensors
     */
    sPh.fetchSensors = function () {
        //TODO query rest service
        return [{
                    "ID": "s1",
                    "name": "temp W",
                    "location" : "Wohnzimmer",
                    "measure" : "temperature",
                    "current_value" : 22.7387666
                },
                {
                    "ID": "s2",
                    name: "hum W",
                    "location" : "Werkstatt",
                    "measure" : "humidity",
                    "current_value" : 40.22
                },
                {
                    "ID": "s3",
                    name: "temp B",
                    "location" : "Bad",
                    "measure" : "temperature",
                    "current_value" : 22.1
                }];
    };

    /**
     * Fetch all Actors from the backend
     * @return {Array} a list of all Actors
     */
    sPh.fetchActors = function () {
        //TODO query rest service
        return [{
                    ID: "a1",
                    name: "win k",
                    location : "Küche (Fenster rechts unten die linke Ecke in der Mitte)",
                    type : "window-shutter",
                    current_state : { value : 0, text : "open", by_module : "timer" },
                    configureable_states : [ { value : 0, text : "open" }, { value : 1, text : "closed" } ]
                },
                {
                    ID: "a2",
                    name: "val B",
                    location : "HK-Zulauf-Bad",
                    type : "valve",
                    current_state : { value : 0, text : "closed", by_module : null },
                    configureable_states : [ { value : 0, text : "closed" }, { value : 1, text : "open" } ]
                },
                {
                    ID: "a3",
                    name: "win K",
                    location : "Küche (Fenster)",
                    type : "window-drive",
                    current_state : { value : 1, text : "open", by_module : "climate" },
                    configureable_states : [ { value : 1, text : "open" }, { value : 0, text : "closed" } ]
                }];
    };
}(window.sPh = window.sPh || {}));

function fSort (evt) {
    switch (evt.target.id) {
    case "sortByName":
        window.sPh.setSortProperty(sPh.sortProperty.NAME);
        break;

    case "sortByLocation":
        window.sPh.setSortProperty(sPh.sortProperty.LOCATION);
        break;

    case "sortByMeasure":
        window.sPh.setSortProperty(sPh.sortProperty.MEASURE);
        break;

    case "sortByType":
        window.sPh.setSortProperty(sPh.sortProperty.TYPE);
        break;
    }
    window.sPh.hideElements('menu_order_1');
    return false;
}

//Add event listener
sPh.getElementById('sortByName').addEventListener("click", fSort, false);
sPh.getElementById('sortByLocation').addEventListener("click", fSort, false);
sPh.getElementById('sortByMeasure').addEventListener("click", fSort, false);
sPh.getElementById('sortByType').addEventListener("click", fSort, false);
sPh.getElementById('menu_0').addEventListener("click", function (evt) {window.sPh.toggleVisibility('menu_1');return false;}, false);
sPh.getElementById('menu_order_0').addEventListener("click", function (evt) {window.sPh.toggleVisibility('menu_order_1');return false;}, false);
sPh.getElementById('content').addEventListener("click", function (evt) {window.sPh.hideElements('menu_1', 'menu_order_1');return false;}, false);
sPh.getElementById('renderSensor').addEventListener("click", function (evt) {window.sPh.renderSensors();return false;}, false);
sPh.getElementById('renderActor').addEventListener("click", function (evt) {window.sPh.renderActors();return false;}, false);