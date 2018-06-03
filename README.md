# Binding to integrate Siemens SPC intrusion system and Jeedom

Ce module nodejs était prévu initialement pour la HC2 de Fibaro et a été adapté à Jeedom par mes soins.

Source originale : https://github.com/Goran58/node-spc-fibaro-hc2-binding

This nodejs module is used to integrate Siemens SPC intrusion system and Jeedom. 

<b>NOTE!</b> To be able to use this module you also need to have SPC Web Gateway from [Lundix IT](http://forum.lundix.se) installed. SPC Web Gateway is providing a generic open REST and Websocket interface to Siemens SPC intrusion system.

The module has only been tested on Jeedom version 3.2.7.

## Description
The module uses SPC Web Gateway REST and Websocket API to get status from the SPC intrusion system and Jeedom API to set status of variables in Jeedom. The status of the variables can then be used in Virtual Devices and Scenes to trigger actions or be displayed in Dashboard.

### Variables
NOTE! The variables are created automatically if they not exists in Jeedom.

####Secteur_&lt;AREA_ID&gt;
AREA_ID is 1 - Number of defined areas.<br>
Values:
- "unset"
- "partset_a"
- "partset_b"
- "set"
- "unknown"

####ZONE_&lt;ZONE_ID&gt;
ZONE_ID is 1 - Number of defined zones.<br>
Values:
- "closed"
- "open"
- "short"
- "disconnected"
- "pir_masked"
- "dc_substitution"
- "sensor_missing"
- "offline"
- "unknown"

####G_SPC_ZONE_STATUS_&lt;ZONE_ID&gt;
ZONE_ID is 1 - Number of defined zones.<br>
Values:
- "ok"
- "inhibit"
- "isolate"
- "soak"
- "tamper"
- "alarm"
- "trouble"
- "unknown"

### Supported events
Following events are supported:
- Zone closed/open  
- Zone inhibited/de-inhibited  
- Zone isolated/de-isolated  
- Alarm armed/disarmed (Area set, Area partset A/B, Area unset)
- Burglar alarm/restored

More event types can very easy be added to the module.
  
## Installation
      
	git clone https://github.com/geomium/node-spc-jeedom-1
	cd node-spc-jeedom-1
	npm install
	
## Configuration

- Modify the settings in config.json according to your environment.


## Start
	./node-spc-jeedom-1.js
