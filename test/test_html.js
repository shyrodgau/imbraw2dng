#!/usr/bin/env mocha 
/* Selenium tests */

const TESTDAT='/home/hegny/prog/imbraw2dng/samples/webroot';
const TESTDAT0='/home/hegny/prog/imbraw2dng/samples';

const TESTURL='http://127.0.0.1:8889/';

// test executable path:
const TESTEXES='/home/hegny/prog/imbraw2dng/github';

// workdir (this here):
const TESTWORK='/home/hegny/prog/imbraw2dng/github/test';

const {Builder, forBrowser, By, until, Browser, Capabilities} = require('selenium-webdriver');
//const chrome = require('chromedriver');
//const { suite, test } = require('selenium-webdriver/testing');
//const { ChromeOptions } = require('selenium-webdriver/chrome');


describe('A Convert Raw Local', function() {
	let driver, opts, errflg = false;
	before(async function() {
			this.timeout(6000);
			//const chromcapa = Capabilities.chrome();
			//const opts = [ 'prefs', { 'download.default_directory': '/home/hegny/Downloads/testoutputdir' } ];
			//chromcapa.set('chromeOptions', opts);
			driver = await new Builder().forBrowser(Browser.CHROME).build();
			//driver = await new Builder().forBrowser(Browser.CHROME).withCapabilities(chromcapa).build();
			await driver.get(TESTURL + 'IMBACK/imbraw2dng.html');
			driver.executeScript('window.onerror = (e) => {document.getElementById("thebody").setAttribute("data-err", JSON.stringify(e));}');
	});
	it('A.1 Convert without question', async function dotest() {
			this.timeout(6000);
			const cb = await driver.findElement(By.id('steppreview'));
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
			await driver.actions({async: true}).pause(1900).perform();
			await driver.actions({async: true}).clear();
			await fi.clear();
	});
	it('A.2 Convert with question and rotation', async function dotest() {
			this.timeout(9000);
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
			await fi.sendKeys(TESTDAT + '/IMBACK/PHOTO/2024_1015_123011_001.raw');
			const rcw = await driver.findElement(By.id('procthiscw'));
			await driver.actions({async: true})
				.pause(300).move({origin: rcw}).pause(300).click().pause(300).perform();
			const doit = await driver.findElement(By.id('procthis'));
			await driver.actions({async: true})
				.move({origin: doit}).pause(300).click().pause(300).perform();
			await driver.actions({async: true}).pause(1900).perform();
			await driver.actions({async: true}).clear();
	});
	it('A.3 Convert with question and more rotation', async function dotest() {
			this.timeout(11000);
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
			} else
				driver.quit();
	});
});

describe('B Convert Raw from Imback', function() {
	let driver, opts, errflg = false;
	before(async function() {
			this.timeout(6000);
			//const chromcapa = Capabilities.chrome();
			const opts = [ 'prefs', { 'download.default_directory': '/home/hegny/Downloads/testoutputdir' } ];
			//chromcapa.set('chromeOptions', opts);
			driver = await new Builder().forBrowser(Browser.CHROME).build();
			//driver = await new Builder().forBrowser(Browser.CHROME).withCapabilities(chromcapa).build();
			await driver.get(TESTURL + 'IMBACK/imbraw2dng_00.html');
			driver.executeScript('window.onerror = (e) => {document.getElementById("thebody").setAttribute("data-err", JSON.stringify(e));}');
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
			const sel2 = await cb.isSelected();
			const fi = await driver.findElement(By.id('imbstartts'));
			await fi.sendKeys('2025');
			const doit = await driver.findElement(By.id('imbdoit'));
			await driver.actions({ async: true })
				.move({ origin: doit })
				.pause(900)
				.click()
				.pause(900)
				.perform();
			await driver.actions({async: true}).pause(1900);
			await driver.actions({async: true}).clear();
			await driver.actions({async: true})
				.pause(7000).move({ origin: cb }).pause(3000).click().pause(700).perform();
			await fi.clear();
	});
	it('B.2 Convert from visual browser', async function dotest() {
			this.timeout(36000);
			const cb = await driver.findElement(By.id('imbvisbrows'));
			await driver.actions({ async: true })
				.move({ origin: cb })
				.pause(300)
				.click()
				.pause(300)
				.perform();
			const fi = await driver.findElement(By.id('SELC_2029'));
			await driver.actions({ async: true })
				.move({ origin: fi })
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
			} else
				driver.quit();
	});
});

describe('C Convert Backward', function() {
	let driver, opts, errflg = false;
	before(async function() {
			this.timeout(6000);
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
				.pause(3000).move({ origin: fi }).pause(300).perform();
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
			} else
				driver.quit();
	});
});

/*describe('D Film Demo', function() {
	let driver, opts, errflg = false;
	before(async function() {
			this.timeout(6000);
			//const chromcapa = Capabilities.chrome();
			const opts = [ 'prefs', { 'download.default_directory': '/home/hegny/Downloads/testoutputdir' } ];
			//chromcapa.set('chromeOptions', opts);
			driver = await new Builder().forBrowser(Browser.CHROME).build();
			//driver = await new Builder().forBrowser(Browser.CHROME).withCapabilities(chromcapa).build();
			await driver.get(TESTURL + 'IMBACK/imbraw2dng_film.html');
			driver.executeScript('window.onerror = (e) => {document.getElementById("thebody").setAttribute("data-err", JSON.stringify(e));}');
	});
	it('D.1 Convert Without Question', async function dotest() {
			this.timeout(36000);
			const owb = await driver.findElement(By.id('oldstylewb'));
			const osel = await owb.isSelected();
			if (!osel) {
				console.log('......turning on old style wb');
				await driver.actions({ async: true })
					.move({ origin: owb })
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
			if (psel) {
				console.log('......turning off preview');
				await driver.actions({ async: true })
					.move({ origin: pv })
					.pause(200)
					.click()
					.pause(300)
					.perform();
			}
			const cb = await driver.findElement(By.id('steppreview'));
			const sel = await cb.isSelected();
			console.log('......turning off single step');
			await driver.actions({ async: true })
				.move({ origin: cb })
				.pause(300)
				.click()
				.pause(300)
				.perform();
			const fi = await driver.findElement(By.id('infile'));
			await fi.clear();
			await fi.sendKeys(TESTDAT + '/IMBACK/PHOTO/2029_0710_010203_001.raw');
			await driver.actions({async: true})
				.pause(3000).move({ origin: cb }).pause(300).perform();
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
			} else
				driver.quit();
	});
});*/

describe('E Convert Raw from Imback APP', function() {
	let driver, opts, errflg = false;
	before(async function() {
			this.timeout(6000);
			//const chromcapa = Capabilities.chrome();
			const opts = [ 'prefs', { 'download.default_directory': '/home/hegny/Downloads/testoutputdir' } ];
			//chromcapa.set('chromeOptions', opts);
			driver = await new Builder().forBrowser(Browser.CHROME).build();
			//driver = await new Builder().forBrowser(Browser.CHROME).withCapabilities(chromcapa).build();
			await driver.get(TESTURL + 'IMBACK/imbapp.htm');
			driver.executeScript('window.onerror = (e) => {document.getElementById("thebody").setAttribute("data-err", JSON.stringify(e));}');
	});
	it('E.1 Convert from visual browser', async function dotest() {
			this.timeout(36000);
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
				.pause(300)
				.click()
				.pause(600)
				.perform();
			const fi2 = await driver.findElement(By.id('SELC_2024_02_17'));
			await driver.actions({ async: true })
				.move({ origin: fi2 })
				.pause(300)
				.click()
				.pause(600)
				.perform();
			const sor = await driver.findElement(By.id('sbytype'));
			await driver.actions({ async: true })
				.move({ origin: sor })
				.pause(300)
				.click()
				.pause(600)
				.perform();
			const rcw = await driver.findElement(By.id('doselbut'));
			await driver.actions({ async: true })
				.move({ origin: rcw })
				.pause(300)
				.click()
				.pause(2600)
				.perform();
			const okb = await driver.findElement(By.id('progokbut'));
			await driver.actions({ async: true })
				.move({ origin: okb })
				.pause(300)
				.click()
				.pause(1900)
				.perform();
			const hm = await driver.findElement(By.id('hamb'));
			await driver.actions({ async: true })
				.move({ origin: hm })
				.pause(300)
				.click()
				.pause(600)
				.perform();
			const hml = await driver.findElement(By.id('hamlog'));
			await driver.actions({ async: true })
				.move({ origin: hml })
				.pause(300)
				.click()
				.pause(600)
				.perform();
			await driver.actions({async:true}).clear();
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
			} else
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
			const okb = await driver.findElement(By.id('dlprogresslogbtn'));
			await driver.actions({ async: true })
				.move({ origin: okb })
				.pause(300)
				.click()
				.pause(900)
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
			} else
				driver.quit();
	});
});


