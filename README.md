Add remote workers from the BrowserStack web service to the TestCafe
====================================================================

This module allows to enrich the TestCafe browsers list by adding remote workers from the BrowserStack web site that provides a large list of browsers for testing.

The module contains a set of functions that help to initialise, create and remove a remote worker.

Installation
------------

`npm install testcafe-browserstack`

init ( config, callback )
-------------------------

Module initialization

* `config`: Configuration that is required for the module initialization
	* `TestCafe`: TestCafe Configuration
		* `hostname`: The hostname of your computer
		* `controlPanelPort`: The port number where you can access TestCafe Control Panel
		* `servicePort`: The port number used by TestCafe to perform testing
	* `BrowserStack`: BrowserStack Configuration
		* `username`: Your BrowserStack username
		* `password`: Your BrowserStack password
		* `accessKey`: Your BrowserStack access key
		* `localTesting`: `true` if your TestCafe is installed in the local PC, otherwise `false`

* `callback`( `function()` ): Invokes when the initialization is completed

createWorkers( browsers, callback )
-----------------------------------
Creates new BrowserStack workers and returns an array of workers ids.

* `browsers`: An array of browsers objects from the BrowserStack service
	* `browserObject`
		* `os`: The operation system
		* `os_version`: The operation system version
		* `browser`: The browser name
		* `browser_version`: The browser version
		* `device`: The device name
		* `worker_name`: The worker name that will be used by TestCafe to identify the browser for test execution
* `callback`( `function( workerIds )` ): Invoked when workers are created
	* `workerIds`: An array of workers id

removeWorkers( workerIds, callback )
------------------------------------
Delete the specified BrowserStack workers.

* `workerIds`: An array of workers id
* `callback`( `function()` ): Invokes when the specified workers are deleted

removeAllWorkers ( callback )
-----------------------------
Delete all BrowserStack workers.

* `callback`( `function()` ): Invokes when all workers are deleted

Example
=======

This example demonstrates how to create a new worker for running tests in Chrome with the OS X Snow Leopard operating system. The worker is created in a local TestCafe instance.

    var testCafeBrowserStack = require('testcafe-browserstack');
    
    testCafeBrowserStack.init({
    	TestCafe: {
    		hostname: '127.0.0.1',
    		controlPanelPort: 1337,
    		servicePort: 1338
    	},
    	BrowserStack: {
    		username: 'username',
    		password: 'password',
    		accessKey: 'accessKey',
    		localTesting: true
    	}
    }, function() {
    	testCafeBrowserStack.createWorkers([{
    		os: 'OS X',
    		os_version: 'Snow Leopard',
    		browser: 'chrome',
    		browser_version: '40.0',
    		device: null
    	}], function(e) {
    		console.log('All workers are created!')
    	});
    });
    
Check if a required browser is supported by BrowserStack: a list of supported browsers.

https://www.browserstack.com/list-of-browsers-and-platforms?product=live
