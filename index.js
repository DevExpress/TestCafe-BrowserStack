var browserStack = require('browserstack'),
    browserStackTunnel = require('browserstacktunnel-wrapper');

var config = null,
    bsClient = null,
    bsTunnel = null;

function getWorkerName(browser) {
    return [browser.os, browser.os_version, browser.browser, browser.browser_version, browser.device].join(' ').trim();
}

exports.createWorkers = function createWorkers(browsers, callback) {
    if (browsers.length) {
        var browser = browsers.shift(),
            workerName = getWorkerName(browser),
            workerIds = arguments[2] || [];

        browser.url = 'http://' + config.TestCafe.hostname + ':' + config.TestCafe.controlPanelPort + 
            '/worker/add/' + encodeURI(workerName);

        bsClient.createWorker(browser, function(err, worker) {
            if (!err) {
                workerIds.push(worker.id);
                createWorkers(browsers, callback, workerIds);
            } else
                console.log(err);
        });
    } else
        callback && callback(arguments[2]);
}

exports.removeWorkers = function removeWorkers(workerIds, callback) {
    if (workerIds.length) {
        var workerId = workerIds.shift();

        bsClient.terminateWorker(workerId, function(err, data) {
            !err ? removeWorkers(workerIds, callback) : console.log(err);
        });
    } else
        callback && callback();
}

exports.removeAllWorkers = function removeAllWorkers(callback) {
    var workerArg = 1,
        workers = arguments[workerArg];

    if (workerArg in arguments) {
        bsClient.terminateWorker(workers.shift().id, function(err, data) {
            if (!err)
                workers.length ? removeAllWorkers(callback, workers) : callback && callback();
            else
                console.log(err);
        });
    } else {
        bsClient.getWorkers(function(err, workers) {
            !err ? removeAllWorkers(callback, workers) : console.log(err);
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
        bsTunnel = new browserStackTunnel({
            key: config.BrowserStack.accessKey,
            hosts: [{
                name: config.TestCafe.hostname,
                port: config.TestCafe.controlPanelPort
            }, {
                name: config.TestCafe.hostname,
                port: config.TestCafe.servicePort
            }]
        });

        bsTunnel.start(function(err) {
            if (!err) {
                console.log('Press Ctrl-C to close tunnel');
                callback && callback();
            } else
                console.log(err);
        });
    } else if (callback)
        callback();
}