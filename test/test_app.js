#!/usr/bin/env node 
/* Appium tests */

var fs = require('fs');


const TESTDAT='/home/hegny/prog/imbraw2dng/samples/webroot';
const TESTDAT0='/home/hegny/prog/imbraw2dng/samples';

const TESTURL='http://127.0.0.1:8889/';

const FILELIST=[ '2024_0217_121752_001.dng', '2029_0710_010203_001.dng', '2024_0217_121754_002.JPG', '2024_0217_131752_002.JPG', '2024_0217_131750_001.dng', '2029_0707_120426_021.dng' ];

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

function waitfor(driver, id, cnt=0) {
	if (cnt > 200) {
		console.log('W I xx ' + id);
		return new Promise((resolve, reject) => {
			resolve(null);
		});
	}
	return new Promise((resolve, reject) => {
	  try {
		driver.$(id).then(async (res) => {
			if (res) {
				res.isDisplayed().then(async (fl) => {
					if (fl)
						resolve(res);
					else {
						//console.log('W I 1 ' + id);
						await sleep(50);
						resolve(await waitfor(driver, id, cnt+1));
					}
				});
			}
			else {
				//console.log('W I 2 ' + id);
				await sleep(50);
				resolve(await waitfor(driver, id, cnt+1));
			}
		}).catch((e) => {
			console.log(e);
		});
	  } catch (e) {
				(async () => { //console.log('W I 3 ' + id);
				await sleep(100);
				resolve(await waitfor(driver, id, cnt+1)); })();
	  }
	})
}

async function runTest() {
  const driver = await remote(wdOpts);
  try {
  	/*const contexts = await driver.getContexts();
  	const webviewContext = contexts.find(context => context.includes('WEBVIEW'));
  	const appContext = contexts.find(context => context.includes('eu.imback'));
  	await driver.switchContext(webviewContext);*/

  	// Initialize or set localStorage (for example, setting a key-value pair)
  	await driver.executeScript('window.localStorage.setItem("imbapp_expflags", "4")',[]);

  	// empty the dir, first add a file so it is not empty
  	driver.executeScript('mobile: pushFile', [{remotePath: '/storage/emulated/0/DCIM/nn/x', payload: 'bml4Cg=='}]);
  	driver.executeScript('mobile: shell', [{command:'rm', args: [ '/storage/emulated/0/DCIM/nn/*' ]}]);
	await driver.pause(300);

	await driver.pause(400);
    const imgrp = await waitfor(driver,'#SELC_2029_07');
    await imgrp.click();
	await driver.pause(300);
    const rotviox = await waitfor(driver, '#gg_2029_07_07_X .eeraw');
	await driver.pause(300);
    await rotviox.click();
	await driver.pause(300);
    const rotvio = await waitfor(driver, '#gg_2029_07_07_X .rotbtnr');
    await rotvio.click();
	await driver.pause(600);
    const rotviox2 = await waitfor(driver, '#gg_2029_07_07_X .eeraw');
	await driver.pause(900);
	await driver.executeScript('mobile:swipeGesture', [{left:350,top:300,width:10,height:1200,direction:'up',percent:0.95}]);
	const iyy2 = await waitfor(driver, '#div_2019_0101_002053_001_RAW_X .eeraw');
	await driver.pause(300);
	await driver.executeScript('mobile:swipeGesture', [{left:350,top:300,width:10,height:1000,direction:'down',percent:0.7}]);
    const imgrpz = await waitfor(driver, '#gg_2024_02_19_X');
    const imgrp2 = await waitfor(driver, '#SELC_2024_02_17');
	await driver.executeScript('mobile:swipeGesture', [{left:350,top:300,width:10,height:50,direction:'up',percent:0.3}]);
    await imgrp2.click();
	await driver.pause(1000);
	const sbytype = await waitfor(driver, '#sbytype');
	await sbytype.click();
	await driver.pause(600);

    const rotviox3 = await waitfor(driver, '#gg_RAW2029_07_07_X .eeraw');
	await driver.pause(300);
	await rotviox3.click();
	const zoom0 = await waitfor(driver,'#gg_RAW2029_07_07_X .magbtn');
	await zoom0.click();
	await driver.pause(400);
	const rrr = await waitfor(driver, '#xmag .rotbtn');
	await rrr.click();
	await driver.pause(600);
	const rrrr = await waitfor(driver, '#xmag .rotbtnr');
	await rrrr.click();
	await driver.pause(600);
	await driver.executeScript('mobile:swipeGesture', [{left:80,top:300,width:300,height:100,direction:'left',percent:0.9}]);
	//const zoomr = await waitfor(driver, '#backnr');
	//await zoomr.click();
	await driver.pause(600);
	const rawbig = await waitfor(driver, '#magni .eeraw');
	await driver.pause(600);
	const bbb = await waitfor(driver, '#magnix .whbtn');
	await driver.pause(900);
	await bbb.click();
	await driver.pause(300);


	/*const mp4s = await driver.$('#SELC_oth2024_02');
	await mp4s.click();*/
    const delbut = await waitfor(driver,'#delselbut');
    await delbut.click();
	await driver.pause(700);
    const delokbut = await waitfor(driver,'#delokbut');
    await delokbut.click();
	await driver.pause(1000);
    while (1) {
		const cliki = await delokbut.getAttribute('disabled')
		//console.log('CLICK *** ' + cliki + '*** CLIC ');
		if (!cliki) break;
		await sleep(500);
	}
    await delokbut.click();
	await driver.pause(1000);
    const selbut = await driver.$('#doselbut');
    await selbut.click();
	await driver.pause(1000);
	//const ctxx = await driver.getContexts();
	//console.log(JSON.stringify(ctxx));
	//await driver.context('NATIVE_APP');
    const logbut = await waitfor(driver, '#dlprogresslogbtn');
    const okbut = await waitfor(driver, '#progokbut');
    while (1) {
		const cliki = await logbut.getAttribute('disabled')
		//console.log('CLICK *** ' + cliki + '*** CLIC ');
		if (!cliki) break;
		await sleep(500);
	}
	await okbut.click();
	await driver.pause(200);
	//await driver.pause(27000);
	const sbytype2 = await waitfor(driver, '#sbytype');
	await sbytype2.click();
	await driver.pause(200);
    const imgrp2b = await waitfor(driver, '#SELC_2024_02_17');
    await imgrp2b.click();
    
    
	const hm = await waitfor(driver, '#hamb');
	await hm.click();
	await driver.pause(200);
	const hms = await waitfor(driver, '#hamsett');
	await hms.click();
	await driver.pause(200);
	const cpc = await waitfor(driver, '#copycheck');
	await cpc.click();
	await driver.pause(200);
	const copytext = await waitfor(driver,'#artist');
	await copytext.click();
	const astr = 'isch debugging';
	await copytext.sendKeys([astr]);
	const setb = await waitfor(driver, '#settback');
	await setb.click();
	await driver.pause(200);
	const zoom0x2 = await waitfor(driver,'#gg_2024_02_17_X .onepic');
	await zoom0x2.click();
	await driver.pause(200);
	const zoom03 = await waitfor(driver, '#gg_2024_02_17_X .magbtn');
	await zoom03.click();
	await driver.pause(200);
	const timebtn = await waitfor(driver, '#xmag .timebtn');
	await timebtn.click();
	await driver.pause(200);
	const timetxt = await waitfor(driver, '#xmag .timetxt');
	await timetxt.click();
	const str = '2024-02-17T13:17:52';
	await timetxt.sendKeys([str]);
	await driver.pause(700);
	const bnrx = await waitfor(driver, '#backnr');
	await bnrx.click();
	await driver.pause(200);
	const xdb = await waitfor(driver, '#xmag .descbtn');
	await xdb.click();
	await driver.pause(200);
	const xdbt = await waitfor(driver, '#xmag .desctxt');
	await xdbt.click();
	const dstr = 'Krokus';
	await xdbt.sendKeys([dstr]);
	const bbb2 = await waitfor(driver, '#magnix .whbtn');
	await driver.pause(900);
	await bbb2.click();
    const selbut2 = await driver.$('#doselbut');
    await selbut2.click();
	await driver.pause(1000);
	const logbut2 = await driver.$('#dlprogresslogbtn');
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

