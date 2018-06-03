# Binding to integrate Siemens SPC intrusion system and Jeedom

Premiers test ! On va essayer d'alimenter directement des variables grâce à l'API de Jeedom

# Binding to integrate Siemens SPC intrusion system and Fibaro Home Center 2

This nodejs module is used to integrate Siemens SPC intrusion system and Fibaro Home Center 2. 

<b>NOTE!</b> To be able to use this module you also need to have SPC Web Gateway from [Lundix IT](http://forum.lundix.se) installed. SPC Web Gateway is providing a generic open REST and Websocket interface to Siemens SPC intrusion system.

The module has only been tested on Home Center Firmware version 4.040.

## Description
The module uses SPC Web Gateway REST and Websocket API to get status from the SPC intrusion system and Fibaro REST API to set status of global variables in the Fibaro Home Center 2. The status of the global variables can then be used in Virtual Devices and Scenes to trigger actions or be displayed in Home Center GUI.

### Home Center Global Variables
NOTE! The global variables are created automatically if they not exists in Home Center 2.

####G_SPC_AREA_MODE_&lt;AREA_ID&gt;
AREA_ID is 1 - Number of defined areas.<br>
Values:
- "unset"
- "partset_a"
- "partset_b"
- "set"
- "unknown"

####G_SPC_ZONE_INPUT_&lt;ZONE_ID&gt;
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
      
	git clone https://github.com/Goran58/node-spc-fibaro-hc2-binding
	cd node-spc-fibaro-hc2-binding
	npm install
	
## Configuration

- Modify the settings in config.json according to your environment.

NOTE! To allow automatically creation of the global variables, it seems, at least in FW 4.040, that you have to use user admin.

## Start
	./node-spc-fibaro-hc2-binding.js
