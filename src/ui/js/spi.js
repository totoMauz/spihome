(function (sPh, undefined) {
    "use strict";
    
    //private variables
    var oDomElements = {};
    var sCssClassHidden = 'hidden';
    
    sPh.getElementById = function(sId) {
        if(!oDomElements[sId]) {
            oDomElements[sId] = document.getElementById(sId);
        }
        return oDomElements[sId];
    };
    
    sPh.toggleVisibility = function(sId) {
        sPh.getElementById(sId).classList.toggle(sCssClassHidden);
    };
    
    sPh.hideElement = function(sId) {
        sPh.getElementById(sId).classList.add(sCssClassHidden);
    };
    
    sPh.showElement = function(sId) {
        sPh.getElementById(sId).classList.remove(sCssClassHidden);
    };
    
    sPh.clearContent = function() {
        sPh.getElementById('content').innerHTML = "";
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
    
    sPh.renderSensors = function() {
        var oSensors = this.fetchSensors();
        if(!oSensors) {
            this.error("No sensors returned from backend");
            return;
        }
        //TODO implement the rest
    };
    
    sPh.renderActors = function() {
        var oActors = this.fetchActors();
        if(!oActors) {
            this.error("No actors returned from backend");
            return;
        }
        this.showElement('menu_order_0');
        this.clearContent();
    };
    
    sPh.fetchSensors = function() {
        //TODO implement
    };
    
    sPh.fetchActors = function() {
        //TODO query rest service
        return {
              "a1":{
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
              "a2":{
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
            };
    };  
}(window.sPh = window.sPh || {}));