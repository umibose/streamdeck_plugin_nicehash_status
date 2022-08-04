import Api from './api'

var log = function () {
    return console.log(...arguments);
}

var niceHashApi = null;
var pollingTimer = null;
var minigStatus = null;
var totalHashRate = null;
var keyCounter = 0;
var latestContex = null;

$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsonObj) {
    console.log(`[connected] ${JSON.stringify(jsonObj)}`);
    $SD.on('com.ace-software.nicehash.action.willAppear', (jsonObj) => action.onWillAppear(jsonObj));
    $SD.on('com.ace-software.nicehash.action.keyUp', (jsonObj) => action.onKeyUp(jsonObj));
    $SD.on('com.ace-software.nicehash.action.didReceiveSettings', (jsonObj) => action.onDidReceiveSettings(jsonObj));
    $SD.on('com.ace-software.nicehash.action.propertyInspectorDidAppear', (jsonObj) => {});
    $SD.on('com.ace-software.nicehash.action.propertyInspectorDidDisappear', (jsonObj) => {});
    $SD.on('com.ace-software.nicehash.action.sendToPlugin', (jsonObj) => action.onSendToPlugin(jsonObj));
};

const outputStreamDeck = function(response, maxdevicecnt) {

    var miningSuccess = !isMiningError(response, maxdevicecnt);
    minigStatus = getMiningStatus(response);
    totalHashRate = getTotalHashRate(response);

    log('MiningSuccess', miningSuccess);
    log('MiningStatus', minigStatus);
    log('TotalHashRate', totalHashRate);

    if (miningSuccess) {
        $SD.api.setTitle(latestContex, totalHashRate);
        $SD.api.setImage(latestContex, 'data:image/png;base64,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');
    }
    else {
        $SD.api.setImage(latestContex, 'data:image/png;base64,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');
        // $SD.api.showAlert(latestContex);
    }
}

const nicehashApiGetRigDetailStatus = function(api, rigid, maxdevicecnt) {

    api.getTime()
        .then(() => {
            return rigid == '' ? api.get('/main/api/v2/mining/rigs2') : api.get('/main/api/v2/mining/rig2/' + rigid);
        })
        .then(res => {
            return rigid != '' ? outputStreamDeck(res, maxdevicecnt) : api.get('/main/api/v2/mining/rig2/' + getMiningRigId(res));
        })
        .then(res => {
            if (rigid == '') outputStreamDeck(res, maxdevicecnt);
        })
        .catch(err => {
            log('all', err);
            log('err.statusCode', err.statusCode);
            log('err.error', err.error);
            log('err.options', err.options);
        })
}

const createNiceHashApi = function(apiHost, apiKey, apiSecret, orgId) {

    return new Api({apiHost: apiHost, apiKey: apiKey, apiSecret: apiSecret, orgId: orgId});
}

var getTotalHashRate = function(response) {

    log('getTotalHashRate', response);

    var total_hashrate = 0.0;

    if (response.devices != undefined) {
        for (var i = 0; i < response.devices.length; i++) {
            for (var j = 0; j < response.devices[i].speeds.length; j ++) {
                total_hashrate += parseFloat(response.devices[i].speeds[j].speed);
            }
        }
    }

    return total_hashrate.toFixed(1);
}

var getMiningStatus = function(response) {

    log('getMiningStatus', response);

    var status_list = [];
    if (response.devices != undefined) {
        for (var i = 0; i < response.devices.length; i++) {
            for (var j = 0; j < response.devices[i].speeds.length; j ++) {
                status_list.push({'name': response.devices[i].name, 'speed': parseFloat(response.devices[i].speeds[j].speed).toFixed(1)});
            }
        }
    }

    return status_list;
}

var isMiningError = function(response, maxdevicecnt) {

    log('isMiningError', response);

    var hash_list = [];

    if (response.devices != undefined) {
        for (var i = 0; i < response.devices.length; i++) {
            for (var j = 0; j < response.devices[i].speeds.length; j ++) {
                hash_list.push(response.devices[i].speeds[j].speed);
            }
        }
    }

    return (hash_list.includes('0.00000000') || hash_list.length != maxdevicecnt);
}

const getMiningRigId = function(response) {

    log('getMiningRigId', response);

    var rigid = ''

    if (response.miningRigs != undefined) {
        for (var i = 0; i < response.miningRigs.length; i ++) {
            // todo : multi rig
            log('get rigid:', response.miningRigs[i].rigId);
            rigid = response.miningRigs[i].rigId;
            break;
        }
    }

    return rigid;
}

const periodicGetMining = function(api, rigid, maxdevicecnt) {

    keyCounter = 0;
    nicehashApiGetRigDetailStatus(api, rigid, maxdevicecnt);
}

const start = function(apiHost, apiKey, apiSecret, orgId, rigId, maxDeviceCnt, intervalSec) {

    console.log('[Start]', apiHost, apiKey, apiSecret, orgId, rigId, maxDeviceCnt, intervalSec);

    keyCounter = 0;

    niceHashApi = createNiceHashApi(apiHost, apiKey, apiSecret, orgId);
    if (pollingTimer != null) clearInterval(pollingTimer);

    periodicGetMining(niceHashApi, rigId, maxDeviceCnt);
    pollingTimer = setInterval(() => periodicGetMining(niceHashApi, rigId, maxDeviceCnt), intervalSec * 1000);
}

const removeCompanyName = function(devicename) {

    const search = ['RTX', 'RX'];

    for (var i = 0; i < search.length; i ++) {
        var pos = devicename.indexOf(search[i]);
        if (pos != -1) return devicename.substr(pos);
    }

    return devicename;
}

const action = {
    onDidReceiveSettings: (jsonObj) => {
        console.log(`[onDidReceiveMessage] ${JSON.stringify(jsonObj)}`);
    },
    onWillAppear: (jsonObj) => {
        console.log(`[onWillAppear] ${JSON.stringify(jsonObj)}`);
        $SD.api.sendToPropertyInspector(jsonObj.context, Utils.getProp(jsonObj, "payload.settings", {}), jsonObj.action);
        latestContex = jsonObj.context;

        if (jsonObj.payload.settings) {
            if (('nicehashhost' in jsonObj.payload.settings) && ('rigid' in jsonObj.payload.settings) &&
                ('apikey' in jsonObj.payload.settings) && ('apisecret' in jsonObj.payload.settings) && ('orgid' in jsonObj.payload.settings) &&
                ('intervalsec' in jsonObj.payload.settings) && ('maxdevicecnt' in jsonObj.payload.settings)) {

                /*
                // start polling mining status
                */
                console.log(jsonObj.payload.settings);
                start(jsonObj.payload.settings.nicehashhost, jsonObj.payload.settings.apikey, jsonObj.payload.settings.apisecret, jsonObj.payload.settings.orgid, jsonObj.payload.settings.rigid, jsonObj.payload.settings.maxdevicecnt, jsonObj.payload.settings.intervalsec);
            }
        }
    },
    onSendToPlugin: (jsonObj) => {
        console.log(`[onSendToPlugin] ${JSON.stringify(jsonObj)}`);
        latestContex = jsonObj.context;

        if (jsonObj.payload) {
            $SD.api.setSettings(jsonObj.context, jsonObj.payload);

            if (('nicehashhost' in jsonObj.payload) && ('rigid' in jsonObj.payload) &&
                ('apikey' in jsonObj.payload) && ('apisecret' in jsonObj.payload) && ('orgid' in jsonObj.payload) &&
                ('intervalsec' in jsonObj.payload) && ('maxdevicecnt' in jsonObj.payload)) {

                /*
                // start polling mining status
                */
                console.log(jsonObj.payload);
                start(jsonObj.payload.nicehashhost, jsonObj.payload.apikey, jsonObj.payload.apisecret, jsonObj.payload.orgid, jsonObj.payload.rigid, jsonObj.payload.maxdevicecnt, jsonObj.payload.intervalsec);
            }
        }
    },
    onKeyUp: (jsonObj) => {
        console.log(`[onKeyUp] ${JSON.stringify(jsonObj)}`);
        console.log(`[minigStatus] ${JSON.stringify(minigStatus)}`);

        if (minigStatus != null && minigStatus.length > 0) {
            if (keyCounter > (minigStatus.length - 1)) {
                keyCounter = 0;
            }

            $SD.api.setTitle(jsonObj.context, removeCompanyName(minigStatus[keyCounter].name) + '\n' + minigStatus[keyCounter].speed);

            keyCounter ++;
        }
        else {
            $SD.api.setTitle(jsonObj.context, '');
        }
    }
};
