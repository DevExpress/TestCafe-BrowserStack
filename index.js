var browserStack = require('browserstack'),
    browserStackTunnel = require('browserstacktunnel-wrapper'),
    async = require('async');

var config = null,
    bsClient = null;

function generateWorkerName(browser) {
    return [browser.os, browser.os_version, browser.browser, browser.browser_version, browser.device].join(' ').trim();
}

exports.createWorkers = function createWorkers(browsers, callback) {
    async.map(browsers, function(browser, callback) {
        var workerName = browser.worker_name || generateWorkerName(browser),
            browserInfo = {
                os: browser.os,
                os_version: browser.os_version,
                browser: browser.browser,
                browser_version: browser.browser_version,
                device: browser.device,
                url: 'http://' + config.TestCafe.hostname + ':' + config.TestCafe.controlPanelPort +
                     '/worker/add/' + encodeURI(workerName)
            };

        bsClient.createWorker(browserInfo, function(err, worker) {
            callback(err, !err && worker.id);
        });
    }, function(err, workerIds) {
        callback && callback(workerIds, err);
    });
};

exports.removeWorkers = function removeWorkers(workerIds, callback) {
    async.map(workerIds, function(workerId, callback) {
        bsClient.terminateWorker(workerId, function(err) {
            callback && callback(err);
        });
    }, function(err) {
        callback && callback(err);
    });
};

exports.removeAllWorkers = function removeAllWorkers(callback) {
    bsClient.getWorkers(function(err, workers) {
        if(!err)
            exports.removeWorkers(workers.map(function(worker) { return worker.id; }), callback);
        else
            callback && callback(err);
    });
};

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
};
