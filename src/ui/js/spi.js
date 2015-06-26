(function (sPh, undefined) {
    "use strict";

    //helper
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
    
    //enums
    sPh.sortProperty = Object.freeze({
        NAME: {value: 1, name: "name"},
        LOCATION: {value: 2, name: "location"},
        TYPE: {value: 3 , name: "type"}
    });
    
    sPh.logLevel = Object.freeze({
        NONE: {value: 1, name: "none"},
        ERROR: {value: 2, name: "error"},
        WARNING: {value: 3 , name: "warning"},
        DEBUG: {value: 4, name: "debug"}
    });
    
    //private variables
    var oDomElements = {},
        sCssClassHidden = 'hidden',
        bSortAscending = true,
        oActiveSortProperty = sPh.sortProperty.NAME;
    
    //public variables    
    sPh.activeLogLevel = sPh.logLevel.DEBUG;
    
    //public methods
    sPh.getElementById = function(sId) {
        if(!oDomElements[sId]) {
            oDomElements[sId] = document.getElementById(sId);
        }
        return oDomElements[sId];
    };
    
    sPh.toggleVisibility = function(sId) {
        sPh.getElementById(sId).classList.toggle(sCssClassHidden);
    };
    
    sPh.hideElements = function() {
        var idx;
        for(idx = 0; idx < arguments.length; idx++) {
            sPh.getElementById(arguments[idx]).classList.add(sCssClassHidden);
        };
    };
    
    sPh.showElement = function(sId) {
        sPh.getElementById(sId).classList.remove(sCssClassHidden);
    };
    
    sPh.clearContent = function() {
        sPh.getElementById('content').innerHTML = "";
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
    
    sPh.setSortProperty = function(oSortProperty) {
        if(oActiveSortProperty == oSortProperty) {
            bSortAscending = !bSortAscending;
        } else {
            bSortAscending = true;
            oActiveSortProperty = oSortProperty;
        }
    };
    
    sPh.error = function(sMessage) {
        sPh.log(sPh.logLevel.ERROR.value, sMessage);
    };

    sPh.warn = function(sMessage) {
        sPh.log(sPh.logLevel.WARNING.value, sMessage);
    };

    sPh.debug = function(sMessage) {
        sPh.log(sPh.logLevel.DEBUG.value, sMessage);
    };
    
    sPh.renderSensors = function() {
        var oSensors = this.fetchSensors();
        if(!oSensors) {
            this.error("No sensors returned from backend");
            return;
        }
        //TODO implement the rest
    };
    
    sPh.renderActors = function() {
        var oContent,
            oList,
            oListItem,
            aActors = this.fetchActors();
            
        if(!aActors) {
            this.error("No actors returned from backend");
            return;
        }
        
        //add - to indicate descending
        aActors.sortBy( ((bSortAscending) ? '' : '-') + oActiveSortProperty.name);
        
        this.showElement('menu_order_0');
        this.hideElements('menu_1');
        this.clearContent();
        
        oList = document.createElement('ul');        
        aActors.forEach(function(oActor) {
            oListItem = document.createElement('li');
            oListItem.appendChild(document.createTextNode(oActor.name + ": " + oActor.type + ": " +  oActor.location));
            oList.appendChild(oListItem);
        });
        this.getElementById('content').appendChild(oList);
    };
    
    sPh.fetchSensors = function() {
        //TODO implement
    };
    
    sPh.fetchActors = function() {
        //TODO query rest service
        return [
                {
                 "name": "a1",
                 "location":"Wohnzimmer (Fenster)",
                 "type":"window-drive",
                 "current_state":{
                    "value":1,
                    "text":"open",
                    "by_module":"climate"
                 },
                 "configureable_states":[
                    {
                       "value":1,
                       "text":"open"
                    },
                    {
                       "value":0,
                       "text":"closed"
                    }
                 ]
              },
              {
                 "name": "a2",
                 "location":"Werkstatt (Fenster)",
                 "type":"window-drive",
                 "current_state":{
                    "value":1,
                    "text":"open",
                    "by_module":"climate"
                 },
                 "configureable_states":[
                    {
                       "value":1,
                       "text":"open"
                    },
                    {
                       "value":0,
                       "text":"closed"
                    }
                 ]
              }
            ];
    };  
}(window.sPh = window.sPh || {}));