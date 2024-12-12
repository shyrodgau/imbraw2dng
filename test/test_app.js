#!/usr/bin/env node 
/* Appium tests */

var fs = require('fs');


const TESTDAT='/home/hegny/prog/imbraw2dng/samples/webroot';
const TESTDAT0='/home/hegny/prog/imbraw2dng/samples';

const TESTURL='http://127.0.0.1:8889/';

const FILELIST=[ '2024_0217_121752_001.dng', '2029_0710_010203_001.dng', '2024_0217_121754_002.JPG', '2024_0217_121754_002_001.JPG', '2024_0217_121752_001_001.dng', '2029_0707_120426_021.dng' ];

// test executable path:
const TESTEXES='/home/hegny/prog/imbraw2dng/github';

// workdir (this here):
const TESTWORK='/home/hegny/prog/imbraw2dng/github/test';

const {remote} = require('webdriverio');

const capabilities = {
  'platformName': 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Android',
  'appium:appPackage': 'eu.imback.os.app',
  'appium:appActivity': '.MainActivity',
  'appium:autoWebview': true,
  'appium:newCommandTimeout': 320
};

const wdOpts = {
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
  logLevel: 'silent',
  capabilities,
};
//  logLevel: 'info',

async function ffile(driver, idx, cb) {
	const ff = await driver.executeScript('mobile: pullFile', [{remotePath: '/storage/emulated/0/DCIM/nn/' + FILELIST[idx]}]);
	fs.writeFile('/home/hegny/Downloads/appium_' + FILELIST[idx] + '.b64', ff, {encoding: null, flush: true, flag: 'w' }, async (e) => {
    	if (e) console.log(e?.toString());
    	if (idx < FILELIST.length - 1) {
    		ffile(driver, idx + 1, cb);
    	}
    	else if (cb) cb();
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  const driver = await remote(wdOpts);
  try {
  	// empty the dir, first add a file so it is not empty
  	driver.executeScript('mobile: pushFile', [{remotePath: '/storage/emulated/0/DCIM/nn/x', payload: 'bml4Cg=='}]);
  	driver.executeScript('mobile: shell', [{command:'rm', args: [ '/storage/emulated/0/DCIM/nn/*' ]}]);
	await driver.pause(3000);
    //const batteryItem = await driver.$('#tobrows');
    //await batteryItem.click();
	await driver.pause(4000);
    const imgrp = await driver.$('#SELC_2029_07');
    await imgrp.click();
	await driver.pause(3000);
    const rotviox = await driver.$('#gg_2029_07_07_X .eeraw');
    await rotviox.click();
	await driver.pause(300);
    const rotvio = await driver.$('#gg_2029_07_07_X .rotbtnr');
    await rotvio.click();
	await driver.pause(3000);
    const imgrp2 = await driver.$('#SELC_2024_02_17');
    await imgrp2.click();
	await driver.pause(2000);
	const sbytype = await driver.$('#sbytype');
	await sbytype.click();
	await driver.pause(3000);

	await rotviox.click();
	await driver.pause(800);
	const zoom0 = await driver.$('#gg_RAW2029_07_07_X .magbtn');
	await zoom0.click();
	await driver.pause(4000);
	const rrr = await driver.$('#xmag .rotbtn');
	await rrr.click();
	await driver.pause(6000);
	const rrrr = await driver.$('#xmag .rotbtnr');
	await rrrr.click();
	await driver.pause(6000);
	const zoomr = await driver.$('#backnr');
	await zoomr.click();
	await driver.pause(6000);
	const bbb = await driver.$('#magnix .whbtn');
	await bbb.click();
	await driver.pause(3000);


	/*const mp4s = await driver.$('#SELC_oth2024_02');
	await mp4s.click();*/
    const delbut = await driver.$('#delselbut');
    await delbut.click();
	await driver.pause(700);
    const delokbut = await driver.$('#delokbut');
    await delokbut.click();
	await driver.pause(3000);
    await delokbut.click();
	await driver.pause(2000);
    const selbut = await driver.$('#doselbut');
    await selbut.click();
	await driver.pause(7000);
	//const ctxx = await driver.getContexts();
	//console.log(JSON.stringify(ctxx));
	//await driver.context('NATIVE_APP');
    const logbut = await driver.$('#dlprogresslogbtn');
    const okbut = await driver.$('#progokbut');
    while (1) {
		const cliki = await logbut.getAttribute('disabled')
		//console.log('CLICK *** ' + cliki + '*** CLIC ');
		if (!cliki) break;
		await sleep(500);
	}
	await okbut.click();
	await driver.pause(2000);
	//await driver.pause(27000);
	await sbytype.click();
	await driver.pause(2000);
    await imgrp2.click();
	await driver.pause(7000);
    await selbut.click();
	await driver.pause(7000);
    //const fold = await driver.$('=USE THIS FOLDER');
    while (1) {
		const cliki = await logbut.getAttribute('disabled')
		//console.log('CLICK *** ' + cliki + '*** CLIC ');
		if (!cliki) break;
		await sleep(500);
	}
    await logbut.click();
	await driver.pause(1000);
    const msglog = await driver.$('#outmsg');
    const txt = await msglog.getText();
    console.log(txt);
    let proc = true;
    let fileidx = 0;
    await fs.writeFile('/home/hegny/Downloads/appium.log', txt, {encoding: null, flush: true, flag: 'w' }, async (e) => {
    	if (e) console.log(e?.toString());
		await ffile(driver, 0, async () => {
			//await driver.deleteSession();
			proc = false;
		});
    });
    while (proc) await sleep(1000);
  } finally {
    await driver.pause(1000);
    await driver.deleteSession();
  }
}

runTest().catch(console.error);

