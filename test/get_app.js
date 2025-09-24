#!/usr/bin/env node 
/* Appium tests */

var fs = require('fs');


const TESTDAT='/home/hegny/prog/imbraw2dng/samples/webroot';
const TESTDAT0='/home/hegny/prog/imbraw2dng/samples';

const TESTURL='http://127.0.0.1:8889/';

const FILELIST=[ /*'2024_0217_121752_001.dng', '2029_0710_010203_001.dng', '2024_0217_121754_002.JPG', '2024_0217_131752_002.JPG', '2024_0217_131750_001.dng', '2029_0707_120426_021.dng', '2024_0217_131750_001_x.jpg'*/ ];
let dirzip;

// test executable path:
const TESTEXES='/home/hegny/prog/imbraw2dng/github';

// workdir (this here):
const TESTWORK='/home/hegny/prog/imbraw2dng/github/test';

const {remote, Select} = require('webdriverio');

const capabilities = {
  'platformName': 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Android',
  'appium:appPackage': 'eu.imback.os.app',
  'appium:appActivity': '.MainActivity',
  'appium:autoWebview': true,
  'appium:newCommandTimeout': 320,
  'appium:chromeOptions': { 'w3c': false }
};

const wdOpts = {
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
  logLevel: 'silent',
  capabilities,
};
//  logLevel: 'info',

async function ffile(driver, idx, cb) {
	//console.log('J ' + idx);
	dirzip = await driver.executeScript('mobile: pullFolder', [{remotePath: '/storage/emulated/0/DCIM/nn'}]);
	if (dirzip) {
		fs.writeFile('/home/hegny/Downloads/appium_dirzip.b64', dirzip, {encoding: null, flush: true, flag: 'w' }, async (e) => {
			if (e) console.log(e?.toString());
			if (cb) cb();
		});
	}
	else if (cb) cb();
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  const driver = await remote(wdOpts);
  try {
    let proc = true;
    let fileidx = 0;
  	driver.executeScript('mobile: shell', [{command:'ls', args: [ '/storage/emulated/0/DCIM/nn/' ]}]);
	await ffile(driver, 0, async () => {
		//await driver.deleteSession();
		proc = false;
	});
    while (proc) await sleep(1000);
  } finally {
    await driver.pause(1000);
    await driver.deleteSession();
  }
}

runTest().catch(console.error);

