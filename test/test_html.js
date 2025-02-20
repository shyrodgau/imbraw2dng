#!/usr/bin/env mocha 
/* Selenium tests */

const TESTDAT='/home/hegny/prog/imbraw2dng/samples/webroot';
const TESTDAT0='/home/hegny/prog/imbraw2dng/samples';

const TESTURL='http://127.0.0.1:8889/';

// test executable path:
const TESTEXES='/home/hegny/prog/imbraw2dng/github';

// workdir (this here):
const TESTWORK='/home/hegny/prog/imbraw2dng/github/test';

const {Builder, forBrowser, By, until, Browser, Capabilities, Select} = require('selenium-webdriver');
//const chrome = require('chromedriver');
//const { suite, test } = require('selenium-webdriver/testing');
//const { ChromeOptions } = require('selenium-webdriver/chrome');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function waitfor(driver, what, id, cnt=0) {
	if (cnt > 200) {
		console.log('W I xx ' + what + ' ' + id);
		return new Promise((resolve, reject) => {
			resolve(null);
		});
	}
	return new Promise((resolve, reject) => {
		driver.findElement(((what === 'id')?By.id:By.css)(id)).then(async (res) => {
			if (res) {
				res.isDisplayed().then(async (fl) => {
					if (fl)
						resolve(res);
					else {
						//console.log('W I 1 ' + what + ' ' + id);
						await sleep(50);
						resolve(await waitfor(driver, what, id, cnt+1));
					}
				});
			}
			else {
				//console.log('W I 2 ' + what + ' ' + id);
				await sleep(50);
				resolve(await waitfor(driver, what, id, cnt+1));
			}
		}).catch((e) => {
			console.log(e);
		})
	})
}
describe('A Convert Raw Local', function() {
	let driver, opts, errflg = false;
	before(async function() {
			this.timeout(36000);
			//const chromcapa = Capabilities.chrome();
			//const opts = [ 'prefs', { 'download.default_directory': '/home/hegny/Downloads/testoutputdir' } ];
			//chromcapa.set('chromeOptions', opts);
			driver = await new Builder().forBrowser(Browser.CHROME).build();
			//driver = await new Builder().forBrowser(Browser.CHROME).withCapabilities(chromcapa).build();
			await driver.get(TESTURL + 'IMBACK/imbraw2dng.html');
			driver.executeScript('window.onerror = (e) => {document.getElementById("thebody").setAttribute("data-err", JSON.stringify(e));alert(JSON.stringify(e));}');
	});
	it('A.1 Convert without question', async function dotest() {
			this.timeout(6000);
			const cb = await waitfor(driver, 'id', 'steppreview');
			const sel = await cb.isSelected();
			console.log('......turning off single step');
			await driver.actions({ async: true })
				.move({ origin: cb })
				.pause(300)
				.click()
				.pause(300)
				.perform();
			const sel2 = await cb.isSelected();
			const fi = await driver.findElement(By.id('infile'));
			await fi.sendKeys(TESTDAT + '/IMBACK/PHOTO/2020_0211_213011_001.raw');
			await driver.actions({async: true}).pause(900).perform();
			await driver.actions({async: true}).clear();
			await fi.clear();
	});
	it('A.2 Convert with question and rotation', async function dotest() {
			this.timeout(9000);
			const cb = await waitfor(driver, 'id', 'steppreview');
			const sel = await cb.isSelected();
			if (!sel) {
				console.log('......turning on single step');
				await driver.actions({ async: true })
					.move({ origin: cb })
					.pause(300)
					.click()
					.pause(300)
					.perform();
			}
			const fi = await waitfor(driver, 'id', 'infile');
			await fi.clear();
			await fi.sendKeys(TESTDAT + '/IMBACK/PHOTO/2024_1015_123011_001.raw');
			const rcw = await driver.findElement(By.id('procthiscw'));
			await driver.actions({async: true})
				.pause(300).move({origin: rcw}).pause(300).click().pause(300).perform();
			const doit = await driver.findElement(By.id('procthis'));
			await driver.actions({async: true})
				.move({origin: doit}).pause(300).click().pause(300).perform();
			await driver.actions({async: true}).pause(900).perform();
			await driver.actions({async: true}).clear();
	});
	it('A.3 Convert with question and more rotation', async function dotest() {
			this.timeout(29000);
			const cb = await driver.findElement(By.id('steppreview'));
			const sel = await cb.isSelected();
			if (!sel) {
				console.log('......turning on single step');
				await driver.actions({ async: true })
					.move({ origin: cb })
					.pause(300)
					.click()
					.pause(300)
					.perform();
			}
			const fi = await driver.findElement(By.id('infile'));
			await fi.clear();
			await fi.sendKeys(TESTDAT + '/IMBACK/PHOTO/2020_0211_213011_001.raw\n' + TESTDAT + '/IMBACK/PHOTO/2024_1015_123011_001.raw');
			const rcw = await driver.findElement(By.id('procthisccw'));
			await driver.actions({async: true})
				.pause(300).move({origin: rcw}).pause(300).click().pause(300).perform();
			await driver.actions({async: true})
				.pause(300).move({origin: rcw}).pause(300).click().pause(300).perform();
			const rrs = await driver.findElement(By.id('procthisrs'));
			await driver.actions({async: true})
				.pause(300).move({origin: rrs}).pause(300).click().pause(300).perform();
			const doit = await driver.findElement(By.id('procthis'));
			await driver.actions({async: true})
				.move({origin: doit}).pause(300).click().pause(300).perform();
			await driver.actions({async: true}).pause(900).perform();
			const doit2 = await driver.findElement(By.id('procthis'));
			await driver.actions({async: true})
				.move({origin: doit2}).pause(300).click().pause(300).perform();
			await driver.actions({async: true}).pause(900).perform();
			await driver.actions({async: true}).clear();
	});
	it('A.4 Convert to zip with copyright', async function dotest() {
			this.timeout(19000);
			const cb = await driver.findElement(By.id('steppreview'));
			const sel = await cb.isSelected();
			if (sel) {
				console.log('......turning off single step');
				await driver.actions({ async: true })
					.move({ origin: cb })
					.pause(600)
					.click()
					.pause(200)
					.perform();
			}
			const sel2 = await cb.isSelected();
			if (sel2) {
				console.log('......AGAIN turning off single step');
				await driver.actions({ async: true })
					.move({ origin: cb })
					.pause(200)
					.click()
					.pause(200)
					.perform();
			}
			const pv = await driver.findElement(By.id('dngpreview'));
			const psel = await pv.isSelected();
			if (psel) {
				console.log('......turning off preview');
				await driver.actions({ async: true })
					.move({ origin: pv })
					.pause(200)
					.click()
					.pause(300)
					.perform();
			}
			const zipb = await driver.findElement(By.id('usezip'));
			await driver.actions({async: true})
				.pause(200).move({origin: zipb}).pause(300).click().pause(300).perform();
			const crb = await driver.findElement(By.id('copycheck'));
			await driver.actions({async: true})
				.pause(300).move({origin: crb}).pause(300).click().pause(600).perform();
			const copytext = await driver.findElement(By.id('copytext'));
			await copytext.sendKeys('(c) Stefan Hegny debugging');
			const fi = await driver.findElement(By.id('infile'));
			await fi.clear();
			await fi.sendKeys(TESTDAT + '/IMBACK/PHOTO/2023_1114_113011_001.raw' + '\n' + TESTDAT + '/IMBACK/PHOTO/2024_1015_123011_001.raw' + '\n' + TESTDAT + '/IMBACK/PHOTO/2020_0211_213011_001.raw' + '\n' + TESTDAT + '/IMBACK/PHOTO/2029_0710_010203_001.raw');
			// do something to make it flutsch
			await driver.actions({async: true})
				.pause(700).move({ origin: cb }).pause(700).perform();
	});
	it('A.5 Convert to zip with exif', async function dotest() {
			this.timeout(11000);
			const cb = await driver.findElement(By.id('steppreview'));
			const zipb = await driver.findElement(By.id('usezip'));
			await driver.actions({async: true})
				.pause(200).move({origin: zipb}).pause(300).click().pause(300).perform();
			const fi = await driver.findElement(By.id('infile'));
			await fi.clear();
			await fi.sendKeys(TESTDAT + '/IMBACK/PHOTO/2024_0217_121754_002.JPG' + '\n' + TESTDAT + '/IMBACK/PHOTO/2024_0217_121752_001.RAW');
			// do something to make it flutsch
			await driver.actions({async: true})
				.pause(700).move({ origin: cb }).pause(700).perform();
	});
	it('A.6 Convert without date', async function dotest() {
			this.timeout(11000);
			const cb = await driver.findElement(By.id('steppreview'));
			const sel = await cb.isSelected();
			if (sel) {
				console.log('......turning off single step');
				await driver.actions({ async: true })
					.move({ origin: cb })
					.pause(600)
					.click()
					.pause(200)
					.perform();
			}
			const sel2 = await cb.isSelected();
			if (sel2) {
				console.log('......AGAIN turning off single step');
				await driver.actions({ async: true })
					.move({ origin: cb })
					.pause(200)
					.click()
					.pause(200)
					.perform();
			}
			const pv = await driver.findElement(By.id('dngpreview'));
			const psel = await pv.isSelected();
			if (psel) {
				console.log('......turning off preview');
				await driver.actions({ async: true })
					.move({ origin: pv })
					.pause(200)
					.click()
					.pause(300)
					.perform();
			}
			const fi = await driver.findElement(By.id('infile'));
			await fi.clear();
			await fi.sendKeys(TESTDAT0 + '/kb_large_10.raw\n' + TESTDAT0 + '/mf6x6_large_1.raw');
			// do something to make it flutsch
			await driver.actions({async: true})
				.pause(700).move({ origin: cb }).pause(700).perform();
	});
	it('A.7 Old style wb', async function dotest() {
			this.timeout(11000);
			const cb = await driver.findElement(By.id('oldstylewb'));
			const sel = await cb.isSelected();
			if (!sel) {
				console.log('......turning on old style wb');
				await driver.actions({ async: true })
					.move({ origin: cb })
					.pause(600)
					.click()
					.pause(200)
					.perform();
			}
			const cb2 = await driver.findElement(By.id('incdcp'));
			const sel2 = await cb2.isSelected();
			if (sel2) {
				console.log('......turning off include DCP');
				await driver.actions({ async: true })
					.move({ origin: cb2 })
					.pause(200)
					.click()
					.pause(200)
					.perform();
			}
			const pv = await driver.findElement(By.id('dngpreview'));
			const psel = await pv.isSelected();
			if (!psel) {
				console.log('......turning on preview');
				await driver.actions({ async: true })
					.move({ origin: pv })
					.pause(200)
					.click()
					.pause(300)
					.perform();
			}
			const fi = await driver.findElement(By.id('infile'));
			await fi.clear();
			await fi.sendKeys(TESTDAT0 + '/kb_large_10.raw\n' + TESTDAT0 + '/mf6x6_large_1.raw');
			// do something to make it flutsch
			await driver.actions({async: true})
				.pause(700).move({ origin: cb }).pause(700).perform();
	});
	after(async function() {
			let me = await driver.findElement(By.id('thebody'));
			let ma = await me.getAttribute('data-err');
			console.log('Message Content:');
			console.log('= = = = = = = = = = = = = = = = = = =');
			let m = await driver.findElement(By.id('xmsg'));
			let t = await m.getText();
			console.log(t);
			console.log('= = = = = = = = = = = = = = = = = = =');
			if (ma) {
				console.log('***ERR: ' + ma);
			} else if (undefined === process.env.KEYX)
				driver.quit();
	});
});

describe('B Convert Raw from Imback', function() {
	let driver, opts, errflg = false;
	before(async function() {
			this.timeout(36000);
			//const chromcapa = Capabilities.chrome();
			const opts = [ 'prefs', { 'download.default_directory': '/home/hegny/Downloads/testoutputdir' } ];
			//chromcapa.set('chromeOptions', opts);
			driver = await new Builder().forBrowser(Browser.CHROME).build();
			//driver = await new Builder().forBrowser(Browser.CHROME).withCapabilities(chromcapa).build();
			await driver.get(TESTURL + 'IMBACK/imbraw2dng_00.html');
			driver.executeScript('window.onerror = (e) => {document.getElementById("thebody").setAttribute("data-err", JSON.stringify(e));alert(JSON.stringify(e));}');
	});
	it('B.1 Convert without question', async function dotest() {
			this.timeout(36000);
			const zipb = await driver.findElement(By.id('usezip'));
			await driver.actions({async: true})
				.pause(200).move({origin: zipb}).pause(300).click().pause(300).perform();
			const cb = await driver.findElement(By.id('steppreview'));
			const sel = await cb.isSelected();
			console.log('......turning off single step');
			await driver.actions({ async: true })
				.move({ origin: cb })
				.pause(900)
				.click()
				.pause(900)
				.perform();
			const cpc = await waitfor(driver, 'id', 'copycheck');
			await driver.actions({ async: true })
				.move({ origin: cpc })
				.pause(100)
				.click()
				.pause(600)
				.perform();
			const copytext = await waitfor(driver,'id','artist');
			await copytext.sendKeys('isch debugging');
			const sel2 = await cb.isSelected();
			const fi = await driver.findElement(By.id('imbstartts'));
			await fi.sendKeys('2025');
			const doit = await driver.findElement(By.id('imbdoit'));
			await driver.actions({ async: true })
				.move({ origin: doit })
				.pause(90)
				.click()
				.pause(900)
				.perform();
			await driver.actions({async: true}).pause(100);
			await driver.actions({async: true}).clear();
			const stpv = await waitfor(driver, 'id', 'steppreview');
			await driver.actions({async: true})
				.pause(700).move({ origin: stpv }).pause(300).click().pause(700).perform();
			await fi.clear();
	});
	it('B.2 Convert from visual browser', async function dotest() {
			this.timeout(36000);
			const cb = await waitfor(driver, 'id', 'imbvisbrows');
			await driver.actions({ async: true })
				.move({ origin: cb })
				.pause(300)
				.click()
				.pause(300)
				.perform();
			const fix = await waitfor(driver, 'css', '#gg_2029_X .ggttpp');
			await driver.actions({ async: true })
				.move({ origin: fix })
				.pause(300)
				.click()
				.pause(600)
				.perform();
			const fi = await driver.findElement(By.id('SELC_2029'));
			await driver.actions({ async: true })
				.move({ origin: fi })
				.pause(300)
				.click()
				.pause(600)
				.perform();
			const sbt = await driver.findElement(By.id('sbytype'));
			await driver.actions({ async: true })
				.move({ origin: sbt })
				.pause(300)
				.click()
				.pause(600)
				.perform();
			const rcw = await driver.findElement(By.id('doselbut'));
			await driver.actions({ async: true })
				.move({ origin: rcw })
				.pause(300)
				.click()
				.pause(600)
				.perform();
			try {
				await driver.actions({ async: true })
					.pause(300)
					.move({ origin: fi })
					.pause(600)
					.perform();
			} catch (e) {
				await driver.actions({ async: true })
					.pause(300)
					.move({ origin: cb })
					.pause(600)
					.perform();
			}
			await driver.actions({async:true}).clear();
			const dlmsgbut = await waitfor(driver, 'id', 'dlmsgbut');
			await driver.actions({async: true})
				.pause(700).move({ origin: dlmsgbut }).pause(300).click().pause(700).perform();
	});
	after(async function() {
			let me = await driver.findElement(By.id('thebody'));
			let ma = await me.getAttribute('data-err');
			console.log('Message Content:');
			console.log('= = = = = = = = = = = = = = = = = = =');
			let m = await driver.findElement(By.id('xmsg'));
			let t = await m.getText();
			console.log(t);
			console.log('= = = = = = = = = = = = = = = = = = =');
			if (ma) {
				console.log('***ERR: ' + ma);
			} else if (undefined === process.env.KEYX)
				driver.quit();
	});
});

describe('C Convert Backward', function() {
	let driver, opts, errflg = false;
	before(async function() {
			this.timeout(36000);
			//const chromcapa = Capabilities.chrome();
			const opts = [ 'prefs', { 'download.default_directory': '/home/hegny/Downloads/testoutputdir' } ];
			//chromcapa.set('chromeOptions', opts);
			driver = await new Builder().forBrowser(Browser.CHROME).build();
			//driver = await new Builder().forBrowser(Browser.CHROME).withCapabilities(chromcapa).build();
			await driver.get(TESTURL + 'IMBACK/imbdng2raw.html');
			driver.executeScript('window.onerror = (e) => {document.getElementById("thebody").setAttribute("data-err", JSON.stringify(e));}');
	});
	it('C.1 Convert without question', async function dotest() {
			this.timeout(36000);
			const fi = await driver.findElement(By.id('infileb'));
			await fi.clear();
			await fi.sendKeys('/home/hegny/Downloads/mf6x6_large_1.dng\n/home/hegny/Downloads/kb_large_10.dng');
			await driver.actions({async: true})
				.pause(300).move({ origin: fi }).pause(1000).perform();
	});
	after(async function() {
			let me = await driver.findElement(By.id('thebody'));
			let ma = await me.getAttribute('data-err');
			console.log('Message Content:');
			console.log('= = = = = = = = = = = = = = = = = = =');
			let m = await driver.findElement(By.id('xmsg'));
			let t = await m.getText();
			console.log(t);
			console.log('= = = = = = = = = = = = = = = = = = =');
			if (ma) {
				console.log('***ERR: ' + ma);
			} else if (undefined === process.env.KEYX)
				driver.quit();
	});
});

describe('E Convert Raw from Imback APP', function() {
	let driver, opts, errflg = false;
	before(async function() {
			this.timeout(96000);
			//const chromcapa = Capabilities.chrome();
			const opts = [ 'prefs', { 'download.default_directory': '/home/hegny/Downloads/testoutputdir' } ];
			//chromcapa.set('chromeOptions', opts);
			driver = await new Builder().forBrowser(Browser.CHROME).build();
			//driver = await new Builder().forBrowser(Browser.CHROME).withCapabilities(chromcapa).build();
			await driver.get(TESTURL + 'IMBACK/imbapp.htm');
			driver.executeScript('window.onerror = (e) => {document.getElementById("thebody").setAttribute("data-err", JSON.stringify(e));}');
	});
	it('E.1 Convert from visual browser', async function dotest() {
			this.timeout(96000);
			await driver.actions({ async: true })
				.pause(1000)
				.click()
				.pause(1000)
				.perform();
			const cb = await driver.findElement(By.id('tobrows'));
			await driver.actions({ async: true}).pause(900).perform();
			await driver.actions({ async: true })
				.move({ origin: cb })
				.pause(300)
				.click()
				.pause(300)
				.perform();
			const fi = await driver.findElement(By.id('SELC_2029_07'));
			await driver.actions({ async: true })
				.move({ origin: fi })
				.pause(10)
				.click()
				.pause(10)
				.perform();
			const fiyy = await driver.findElement(By.id('gg_2019_01_01_X'));
			await driver.actions({ async: true })
				.move({ origin: fiyy })
				.pause(300)
				.perform();
			const fiy = await waitfor(driver, 'css', '#gg_2019_01_01_X .eeraw');
			await driver.actions({ async: true })
				.move({ origin: fiy })
				.pause(2000)
				.perform();
			const fi2 = await driver.findElement(By.id('SELC_2024_02_17'));
			await driver.actions({ async: true })
				.move({ origin: fi2 })
				.pause(10)
				.click()
				.pause(30)
				.perform();
			const rotviox = await driver.findElement(By.css('#gg_2029_07_07_X .onepic'));
			await driver.actions({ async: true })
				.move({ origin: rotviox })
				.pause(30)
				.perform();
			const rotvio = await waitfor(driver, 'css', '#gg_2029_07_07_X .rotbtnr');
			await driver.actions({ async: true })
				.move({ origin: rotvio })
				.pause(10)
				.click()
				.pause(30)
				.perform();
			const sor = await driver.findElement(By.css('#grpsel'));
			const sore = new Select(sor);
			await sore.selectByIndex(0);
			await driver.actions({ async: true })
				.pause(100)
				.perform();
			const zoom0x = await waitfor(driver,'css','#gg_RAW2029_07_10_X .onepic');
			await driver.actions({ async: true })
				.move({ origin: zoom0x })
				.pause(30)
				.perform();
			const zoom0 = await waitfor(driver, 'css','#gg_RAW2029_07_10_X .magbtn');
			await driver.actions({ async: true })
				.move({ origin: zoom0 })
				.pause(10)
				.click()
				.pause(190)
				.perform();
			const zoomr = waitfor(driver, 'id', 'backnr');
			await driver.actions({ async: true })
				.move({ origin: zoomr })
				.pause(50)
				.click()
				.pause(20)
				.perform();
			const rrr = await waitfor(driver, 'css', '#xmag .rotbtn');
			await driver.actions({ async: true })
				.move({ origin: rrr })
				.pause(100)
				.click()
				.pause(1900)
				.perform();
			const bbb = await waitfor(driver, 'css', '#magnix .whbtn');
			await driver.actions({ async: true })
				.move({ origin: bbb })
				.pause(100)
				.click()
				.pause(90)
				.perform();
			const del = await waitfor(driver, 'id', 'delselbut');
			await driver.actions({ async: true })
				.move({ origin: del })
				.pause(100)
				.click()
				.pause(600)
				.perform();
			const delok = await driver.findElement(By.id('delokbut'));
			await driver.actions({ async: true })
				.move({ origin: delok })
				.pause(100)
				.click()
				.pause(3000)
				.click()
				.pause(1000)
				.perform();
			const rcw = await driver.findElement(By.id('doselbut'));
			await driver.actions({ async: true })
				.move({ origin: rcw })
				.pause(100)
				.click()
				.pause(600)
				.perform();
			const okb = await waitfor(driver, 'id', 'progokbut');
			await driver.actions({ async: true })
				.move({ origin: okb })
				.pause(300)
				.click()
				.pause(900)
				.perform();
			const sorb = await driver.findElement(By.css('#grpsel'));
			const sorbe = new Select(sor);
			await sorbe.selectByIndex(1);
			await driver.actions({ async: true })
				.pause(100)
				.perform();
			await driver.actions({ async: true })
				//.move({ origin: sor })
				//.pause(10)
				//.click()
				.pause(600)
				.perform();
			await driver.actions({ async: true })
				.move({ origin: fi2 })
				.pause(300)
				.click()
				.pause(600)
				.perform();
			const hm = await waitfor(driver, 'id', 'hamb');
			await driver.actions({ async: true })
				.move({ origin: hm })
				.pause(100)
				.click()
				.pause(600)
				.perform();
			const hms = await waitfor(driver, 'id', 'hamsett');
			await driver.actions({ async: true })
				.move({ origin: hms })
				.pause(100)
				.click()
				.pause(600)
				.perform();
			const cpc = await waitfor(driver, 'id', 'copycheck');
			await driver.actions({ async: true })
				.move({ origin: cpc })
				.pause(100)
				.click()
				.pause(600)
				.perform();
			const copytext = await waitfor(driver,'id','artist');
			await copytext.sendKeys('isch debugging');
			const setb = await waitfor(driver, 'id', 'settback');
			await driver.actions({ async: true })
				.move({ origin: setb })
				.pause(100)
				.click()
				.pause(600)
				.perform();
			const zoom0x2 = await driver.findElement(By.css('#gg_2024_02_17_X .onepic'));
			await driver.actions({ async: true })
				.move({ origin: zoom0x2 })
				.pause(30)
				.perform();
			const zoom03 = await waitfor(driver, 'css','#gg_2024_02_17_X .magbtn');
			await driver.actions({ async: true })
				.move({ origin: zoom03 })
				.pause(10)
				.click()
				.pause(90)
				.perform();
			const timebtn = await waitfor(driver, 'css','#xmag .timebtn');
			await driver.actions({ async: true })
				.move({ origin: timebtn })
				.pause(100)
				.click()
				.pause(600)
				.perform();
			const timetxt = await waitfor(driver, 'css','#xmag .timetxt');
			await timetxt.sendKeys('2024-02-17T13:17:52');
			//const bbb2 = await waitfor(driver, 'css', '#magnix .whbtn');
			/*await driver.actions({ async: true })
				.move({ origin: bbb })
				.pause(100)
				.click()
				.pause(90)
				.perform();*/
			const zoom0x4 = await driver.findElement(By.id('backnr'));
			await driver.actions({ async: true })
				.move({ origin: zoom0x4 })
				.pause(100)
				.click()
				.pause(600)
				.perform();
			const descbtn = await waitfor(driver, 'css','#xmag .descbtn');
			await driver.actions({ async: true })
				.move({ origin: descbtn })
				.pause(100)
				.click()
				.pause(600)
				.perform();
			const desctxt = await waitfor(driver, 'css','#xmag .desctxt');
			await desctxt.sendKeys('Krokus');
			await driver.actions({ async: true })
				.move({ origin: bbb })
				.pause(100)
				.click()
				.pause(90)
				.perform();
			await driver.actions({ async: true })
				.move({ origin: rcw })
				.pause(100)
				.click()
				.pause(600)
				.perform();
			const okbb = await waitfor(driver, 'id', 'progokbut');
			await driver.actions({ async: true })
				.move({ origin: okbb })
				.pause(100)
				.click()
				.pause(900)
				.perform();
			const hm2 = await waitfor(driver, 'id', 'hamb');
			await driver.actions({ async: true })
				.move({ origin: hm2 })
				.pause(100)
				.click()
				.pause(600)
				.perform();
			const hml = await waitfor(driver, 'id', 'hamlog');
			await driver.actions({ async: true })
				.move({ origin: hml })
				.pause(100)
				.click()
				.pause(600)
				.perform();
			await driver.actions({async:true}).clear();
			const dlmsgbut = await waitfor(driver, 'id', 'dlmsgbut');
			await driver.actions({async: true})
				.pause(700).move({ origin: dlmsgbut }).pause(300).click().pause(700).perform();
	});
	after(async function() {
			let me = await driver.findElement(By.id('thebody'));
			let ma = await me.getAttribute('data-err');
			console.log('Message Content:');
			console.log('= = = = = = = = = = = = = = = = = = =');
			let m = await driver.findElement(By.id('xmsg'));
			let t = await m.getText();
			console.log(t);
			console.log('= = = = = = = = = = = = = = = = = = =');
			if (ma) {
				console.log('***ERR: ' + ma);
			} else if (undefined === process.env.KEYX)
				driver.quit();
	});
});

describe('F Convert Raw Local APP', function() {
	let driver, opts, errflg = false;
	before(async function() {
			this.timeout(36000);
			//const chromcapa = Capabilities.chrome();
			//const opts = [ 'prefs', { 'download.default_directory': '/home/hegny/Downloads/testoutputdir' } ];
			//chromcapa.set('chromeOptions', opts);
			driver = await new Builder().forBrowser(Browser.CHROME).build();
			//driver = await new Builder().forBrowser(Browser.CHROME).withCapabilities(chromcapa).build();
			await driver.get('file://' + TESTDAT + '/IMBACK/imbapp.htm');
			driver.executeScript('window.onerror = (e) => {document.getElementById("thebody").setAttribute("data-err", JSON.stringify(e));}');
	});
	it('F.1 Convert without question', async function dotest() {
			this.timeout(6000);
			const fi = await driver.findElement(By.id('infile'));
			await fi.sendKeys(TESTDAT + '/IMBACK/PHOTO/2020_0211_213011_001.raw');
			await driver.actions({async: true}).pause(900).perform();
			await driver.actions({async: true}).clear();
			const okb = await waitfor(driver, 'id','progokbut');
			await driver.actions({ async: true })
				.move({ origin: okb })
				.pause(300)
				.click()
				.pause(900)
				.perform();
			//await fi.clear();
	});
	it('F.2 Convert multipe', async function dotest() {
			this.timeout(9000);
			const fi = await driver.findElement(By.id('infile'));
			await fi.clear();
			await fi.sendKeys(TESTDAT + '/IMBACK/PHOTO/2020_0211_213011_001.raw' + '\n' + TESTDAT + '/IMBACK/PHOTO/2024_0217_121754_002.JPG' + '\n' + TESTDAT + '/IMBACK/PHOTO/2024_0217_121752_001.RAW');
			await driver.actions({async: true}).pause(900).perform();
			await driver.actions({async: true}).clear();
			const selall = await waitfor(driver, 'id', 'selall');
			await driver.actions({async: true})
				.move({origin: selall })
				.pause(100)
				.click()
				.pause(100)
				.perform();
			const dosel = await waitfor(driver,'id','doselbut');
			await driver.actions({async: true})
				.move({origin: dosel })
				.pause(100)
				.click()
				.pause(100)
				.perform();
			const okb = await waitfor(driver, 'id','dlprogresslogbtn');
			await driver.actions({ async: true })
				.move({ origin: okb })
				.pause(300)
				.click()
				.pause(1900)
				.perform();
			//await fi.clear();
	});
	after(async function() {
			this.timeout(36000);
			let me = await driver.findElement(By.id('thebody'));
			let ma = await me.getAttribute('data-err');
			console.log('Message Content:');
			console.log('= = = = = = = = = = = = = = = = = = =');
			let m = await driver.findElement(By.id('xmsg'));
			let t = await m.getText();
			console.log(t);
			console.log('= = = = = = = = = = = = = = = = = = =');
			if (ma) {
				console.log('***ERR: ' + ma);
			} else if (undefined === process.env.KEYX)
				driver.quit();
	});
});


describe('G Stacking DNG and RAW on old html', function() {
	let driver, opts, errflg = false;
	before(async function() {
			this.timeout(36000);
			//const chromcapa = Capabilities.chrome();
			const opts = [ 'prefs', { 'download.default_directory': '/home/hegny/Downloads/testoutputdir' } ];
			//chromcapa.set('chromeOptions', opts);
			driver = await new Builder().forBrowser(Browser.CHROME).build();
			//driver = await new Builder().forBrowser(Browser.CHROME).withCapabilities(chromcapa).build();
			await driver.get(TESTURL + 'IMBACK/imbraw2dng.html');
			driver.executeScript('window.onerror = (e) => {document.getElementById("thebody").setAttribute("data-err", JSON.stringify(e));}');
	});
	it('G.1 Convert stacking RAW', async function dotest() {
			this.timeout(36000);
			const zipb = await driver.findElement(By.id('fakelongexpadd'));
			await driver.actions({async: true})
				.pause(200).move({origin: zipb}).pause(300).click().pause(300).perform();
			const fi = await driver.findElement(By.id('infile'));
			await fi.clear();
			await fi.sendKeys(TESTDAT + '/IMBACK/PHOTO/2020_0211_213011_001.raw\n' + TESTDAT + '/IMBACK/PHOTO/2024_1015_123011_001.raw');
			await driver.actions({async: true})
				.pause(300).move({ origin: fi }).pause(2000).perform();
	});
	it('G.2 Convert stacking DNG', async function dotest() {
			this.timeout(36000);
			const fi = await driver.findElement(By.id('infile'));
			await fi.clear();
			await fi.sendKeys('/home/hegny/Downloads/mf6x6_large_1.dng\n/home/hegny/Downloads/kb_large_10.dng');
			await driver.actions({async: true})
				.pause(300).move({ origin: fi }).pause(2000).perform();
	});
	after(async function() {
			let me = await driver.findElement(By.id('thebody'));
			let ma = await me.getAttribute('data-err');
			console.log('Message Content:');
			console.log('= = = = = = = = = = = = = = = = = = =');
			let m = await driver.findElement(By.id('xmsg'));
			let t = await m.getText();
			console.log(t);
			console.log('= = = = = = = = = = = = = = = = = = =');
			if (ma) {
				console.log('***ERR: ' + ma);
			} else if (undefined === process.env.KEYX)
				driver.quit();
	});
});

describe('H Stack DNG and Raw Local APP', function() {
	let driver, opts, errflg = false;
	before(async function() {
			this.timeout(39000);
			//const chromcapa = Capabilities.chrome();
			//const opts = [ 'prefs', { 'download.default_directory': '/home/hegny/Downloads/testoutputdir' } ];
			//chromcapa.set('chromeOptions', opts);
			driver = await new Builder().forBrowser(Browser.CHROME).build();
			//driver = await new Builder().forBrowser(Browser.CHROME).withCapabilities(chromcapa).build();
			await driver.get('file://' + TESTDAT + '/IMBACK/imbapp.htm');
			driver.executeScript('window.onerror = (e) => {document.getElementById("thebody").setAttribute("data-err", JSON.stringify(e));}');
	});
	it('H.1 stack raw', async function dotest() {
			this.timeout(9000);
			const zipb = await waitfor(driver, 'id', 'fakelongexpadd');
			await driver.actions({async: true})
				.pause(200).move({origin: zipb}).pause(300).click().pause(300).perform();
			const fi = await driver.findElement(By.id('infile'));
			await fi.sendKeys(TESTDAT + '/IMBACK/PHOTO/2020_0211_213011_001.raw\n' + TESTDAT + '/IMBACK/PHOTO/2024_1015_123011_001.raw');
			await driver.actions({async: true}).pause(900).perform();
			await driver.actions({async: true}).clear();
			const okb = await driver.findElement(By.id('progokbut'));
			await driver.actions({ async: true })
				.move({ origin: okb })
				.pause(300)
				.click()
				.pause(1900)
				.perform();
			//await fi.clear();
	});
	it('H.1 stack DNG', async function dotest() {
			this.timeout(9000);
			const fi = await waitfor(driver, 'id', 'infile');
			await fi.sendKeys('/home/hegny/Downloads/mf6x6_large_1.dng\n/home/hegny/Downloads/kb_large_10.dng');
			await driver.actions({async: true}).pause(900).perform();
			await driver.actions({async: true}).clear();
			const okc = await driver.findElement(By.id('dlprogresslogbtn'));
			await driver.actions({ async: true })
				.move({ origin: okc })
				.pause(300)
				.click()
				.pause(1900)
				.perform();
			//await fi.clear();
	});
	after(async function() {
			this.timeout(36000);
			let me = await driver.findElement(By.id('thebody'));
			let ma = await me.getAttribute('data-err');
			console.log('Message Content:');
			console.log('= = = = = = = = = = = = = = = = = = =');
			let m = await driver.findElement(By.id('xmsg'));
			let t = await m.getText();
			console.log(t);
			console.log('= = = = = = = = = = = = = = = = = = =');
			if (ma) {
				console.log('***ERR: ' + ma);
			} else if (undefined === process.env.KEYX)
				driver.quit();
	});
});

