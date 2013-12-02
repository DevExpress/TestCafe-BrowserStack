var browserStack = require('browserstack'),
    browserStackTunnel = require('browserstacktunnel-wrapper');

var config = null,
    bsClient = null;

function getWorkerName(browser) {
    return [browser.os, browser.os_version, browser.browser, browser.browser_version, browser.device].join(' ').trim();
}

exports.createWorkers = function createWorkers(browsers, callback, workerIds) {
    if (browsers.length) {
        var browser = browsers.shift(),
            workerName = getWorkerName(browser);

        workerIds = workerIds || [];

        browser.url = 'http://' + config.TestCafe.hostname + ':' + config.TestCafe.controlPanelPort + 
            '/worker/add/' + encodeURI(workerName);

        bsClient.createWorker(browser, function(err, worker) {
            if (!err) {
                workerIds.push(worker.id);
                createWorkers(browsers, callback, workerIds);
            } else
                callback && callback(workerIds, err);
        });
    } else
        callback && callback(workerIds);
}

exports.removeWorkers = function removeWorkers(workerIds, callback) {
    if (workerIds.length) {
        var workerId = workerIds.shift();

        bsClient.terminateWorker(workerId, function(err, data) {
            if(!err)
                removeWorkers(workerIds, callback)
            else
                callback && callback(err);
        });
    } else
        callback && callback();
}

exports.removeAllWorkers = function removeAllWorkers(callback) {
    if (arguments.length > 1) {
        var workers = arguments[1];

        if (workers.length) {
            bsClient.terminateWorker(workers.shift().id, function(err, data) {
                if (!err)
                    removeAllWorkers(callback, workers);
                else
                    callback && callback(err);
            });
        } else
            callback && callback();
    } else {
        bsClient.getWorkers(function(err, workers) {
            if(!err)
                removeAllWorkers(callback, workers);
            else
                callback && callback(err);
        });
    }
}

exports.init = function(data, callback) {
    config = data;

    bsClient = browserStack.createClient({
        "username" : config.BrowserStack.username,
        "password" : config.BrowserStack.password
    });

    if (config.BrowserStack.localTesting) {
        var bsTunnel = new browserStackTunnel({
            key: config.BrowserStack.accessKey,
            hosts: [{
                name: config.TestCafe.hostname,
                port: config.TestCafe.controlPanelPort
            }, {
                name: config.TestCafe.hostname,
                port: config.TestCafe.servicePort
            }]
        });

        bsTunnel.start(callback);
    } else 
        callback && callback();
}
