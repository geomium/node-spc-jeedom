#!/usr/bin/env node
/*
* Binding between SPC Web Gateway and Fibaro Home Center 2
*/
/* Accept self signed certificate */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var config = require('./config.json');

// SPC Websocket Client
var ws_client = require('websocket').client;
var spc_ws_client = new ws_client();

// SPC Http Client
var digest = require('./lib/http-digest-client');
var spc_http_client = digest.createClient(config.spc_get_user, config.spc_get_password, true);

// Fibaro Home Center 2 Http Client
var hc2_http_client = require('http');

// Update HC2 with current SPC Areas and Zones status
getSpcStatus('area', handleSpcAreaData);
getSpcStatus('zone', handleSpcZoneData);

// Listen on events from SPC
spc_ws_client.connect('wss://' + config.spc_gw_host + ':' + config.spc_gw_port + '/ws/spc?username=' + config.spc_ws_user + '&password=' + config.spc_ws_password);

spc_ws_client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

spc_ws_client.on('connect', function(connection) {
    console.log('SPC WebSocket client connected');

    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            manageSiaEvent(message.utf8Data);
        }
    });
});
/**********************************************************************
* setFibaroVariable  
**********************************************************************/
function setFibaroVariable(globalVariableHC2, value){

    var options = {
        hostname: config.hc2_host,
        port: 80,
        path: '/api/globalVariables/' + globalVariableHC2,
        auth: config.hc2_user + ':' + config.hc2_password,
        method: 'PUT'
    }
    var req = hc2_http_client.request(options, function(res) {
        if (res.statusCode == 404) {  /* Create variable if not found */
           createFibaroVariable(globalVariableHC2, value);
        }  
        var reply = '';
        res.on('data', function(chunk) {
            reply += chunk;
        });
        res.on('end', function(){
            console.log(reply);
        });
    }).on('error', function(e) {
        console.log('Error: ' + e.message);
    });

    var data = {
        value: value
    };

    req.write(JSON.stringify(data));
    req.end();
}
/**********************************************************************
* createFibaroVariable  
**********************************************************************/
function createFibaroVariable(globalVariableHC2, value){

    var options = {
        hostname: config.hc2_host,
        port: 80,
        path: '/api/globalVariables/' + globalVariableHC2,
        auth: config.hc2_user + ':' + config.hc2_password,
        method: 'POST'
    }
    var req = hc2_http_client.request(options, function(res) {
        var reply = '';
        res.on('data', function(chunk) {
            reply += chunk;
        });
        res.on('end', function(){
            console.log(reply);
        });
    }).on('error', function(e) {
        console.log('Error: ' + e.message);
    });

    var data = {
        name: globalVariableHC2, 
        value: value
    };

    req.write(JSON.stringify(data));
    req.end();
}
/**********************************************************************
* handleSpcAreaData
**********************************************************************/
function handleSpcAreaData(data) {

    data.area.forEach(function(area) {
        var area_mode = "unknown";

        switch (parseInt(area.mode)) {
            case 0:
                area_mode = "unset";
                break;
            case 1:
                area_mode = "partset_a";
                break;
            case 2:
                area_mode = "partset_b";
                break;
            case 3:
                area_mode = "set";
                break;
        }

        var modeVariableHC2 = 'G_SPC_AREA_MODE_' + area.id;

        setFibaroVariable(modeVariableHC2, area_mode);
    });
}
/**********************************************************************
* handleSpcZoneData
**********************************************************************/
function handleSpcZoneData(data) {
    data.zone.forEach(function(zone) {

        if (zone.input != undefined) {
            var zone_input = "unknown";
            switch (parseInt(zone.input)) {
                case 0:
                    zone_input = "closed";
                    break;
                case 1:
                    zone_input = "open";
                    break;
                case 2:
                    zone_input = "short";
                    break;
                case 3:
                    zone_input = "disconnected";
                    break;
                case 4:
                    zone_input = "pir_masked";
                    break;
                case 5:
                    zone_input = "dc_substitution";
                    break;
                case 6:
                    zone_input = "sensor_missing";
                    break;
                case 7:
                    zone_input = "offline";
                    break;
            }
            var inputVariableHC2 = 'G_SPC_ZONE_INPUT_' + zone.id;

            setFibaroVariable(inputVariableHC2, zone_input);
        }

        if (zone.status != undefined) {
            var zone_status = "unknown";
            switch (parseInt(zone.status)) {
                case 0:
                    zone_status = "ok";
                    break;
                case 1:
                    zone_status = "inhibit";
                    break;
                case 2:
                    zone_status = "isolate";
                    break;
                case 3:
                    zone_status = "soak";
                    break;
                case 4:
                    zone_status = "tamper";
                    break;
                case 5:
                    zone_status = "alarm";
                    break;
                case 6:
                    zone_status = "ok";
                    break;
                case 7:
                    zone_status = "trouble";
                    break;
            }

            var statusVariableHC2 = 'G_SPC_ZONE_STATUS_' + zone.id;

            setFibaroVariable(statusVariableHC2, zone_status);
        }
    });
}
/**********************************************************************
* getSpcStatus
**********************************************************************/
function getSpcStatus(uri, callback) {
    var options = {
        host: config.spc_gw_host,
        port: config.spc_gw_port,
        path: '/spc/' + uri,
        method: 'GET'
    }
    var reply = "";

    var req = spc_http_client.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(chunk){
            reply += chunk;
        });
        res.on('end', function(){
            var data = JSON.parse(reply);
            if (data.status === 'success'){
               callback && callback(data.data);
            }
            else {
               console.log("Unable to get data from SPC: " + uri);
            }
        });
    });
}
/**********************************************************************
* manageSiaEvent
**********************************************************************/
function manageSiaEvent(message){
    data = JSON.parse(message);
    if (data.status === 'success'){ 
        var sia = data.data.sia;
        sia_code    = sia.sia_code;
        sia_address = sia.sia_address;

        // Update status dependent on type of SIA event
        switch (sia_code){
            case 'BA': /* Burglar Alarm */
            case 'BR': /* Burglar Alarm Restore */
                getSpcStatus('area', handleSpcAreaData);
                getSpcStatus('zone', handleSpcZoneData);
                break;
            case 'BB': /* Inhibited or Isolated */
            case 'BU': /* Deinhibited or Deisolated */
                getSpcStatus('zone', handleSpcZoneData);
                break;
            case 'CL': /* Area Activated (Full Set) */
            case 'NL': /* Area Activated (Part Set)  */
            case 'OP': /* Area Deactivated */
                getSpcStatus('area', handleSpcAreaData);
                break;
            case 'ZC': /* Zone Closed */
            case 'ZO': /* Zone Opened */
                var value = (sia_code == 'ZC') ? 0:1;
                var data = {
                    zone: [
                        {
                            id: sia_address,
                            input: value
                        }
                    ]
                }
                handleSpcZoneData(data);
                break;
        }
    }
}
