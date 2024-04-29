#!/usr/bin/env mocha 
/* Selenium tests */

const TESTDAT='/home/hegny/prog/imbraw2dng/samples/webroot';

const TESTURL='http://127.0.0.1:8889/';

// test executable path:
const TESTEXES='/home/hegny/prog/imbraw2dng/github';

// workdir (this here):
const TESTWORK='/home/hegny/prog/imbraw2dng/github/test';

const {Builder, forBrowser, By, until, Browser, Capabilities} = require('selenium-webdriver');
//const chrome = require('chromedriver');
//const { suite, test } = require('selenium-webdriver/testing');
//const { ChromeOptions } = require('selenium-webdriver/chrome');

describe('convert raw local', function() {
	let driver, opts, errflg = false;
	before(async function() {
			//const chromcapa = Capabilities.chrome();
			const opts = [ 'prefs', { 'download.default_directory': '/home/hegny/Downloads/testoutputdir' } ];
			//chromcapa.set('chromeOptions', opts);
			driver = await new Builder().forBrowser(Browser.CHROME).build();
			//driver = await new Builder().forBrowser(Browser.CHROME).withCapabilities(chromcapa).build();
			await driver.get(TESTURL + 'IMBACK/imbraw2dng.html');
	});
	it('convert without question', async function dotest() {
			this.timeout(6000);
			const cb = await driver.findElement(By.id('steppreview'));
			const sel = await cb.isSelected();
			console.log('turning on single step');
			await driver.actions({ async: true })
				.move({ origin: cb })
				.pause(300)
				.click()
				.pause(300)
				.perform();
			const sel2 = await cb.isSelected();
			//console.log('pressed checkbox ' + JSON.stringify(cb) + ' sel2 ' + sel2);
			const fi = await driver.findElement(By.id('infile'));
			//console.log('found fileinput ' + JSON.stringify(fi));
			await fi.sendKeys(TESTDAT + '/IMBACK/PHOTO/2021_1102_123011_001.raw');
			//fi.sendKeys(TESTDAT + '/IMBACK/PHOTO/2034_1015_123011.raw');
			await driver.actions({async: true}).pause(1900);
			await driver.actions({async: true}).clear();
			await fi.clear();
	});
	it('convert with question and rotation', async function dotest() {
			this.timeout(9000);
			const cb = await driver.findElement(By.id('steppreview'));
			const sel = await cb.isSelected();
			//console.log('found checkbox ' + JSON.stringify(cb));
			if (!sel) {
				console.log('turning on single step');
				await driver.actions({ async: true })
					.move({ origin: cb })
					.pause(300)
					.click()
					.pause(300)
					.perform();
			}
			//console.log('pressed checkbox ' + JSON.stringify(cb));
			const fi = await driver.findElement(By.id('infile'));
			await fi.clear();
			//console.log('found fileinput ' + JSON.stringify(fi));
			await fi.sendKeys(TESTDAT + '/IMBACK/PHOTO/2024_1015_123011_001.raw');
			//await driver.actions({async: true}).pause(900);
			const rcw = await driver.findElement(By.id('procthiscw'));
			await driver.actions({async: true})
				.pause(300).move({origin: rcw}).pause(300).click().pause(300).perform();
			const doit = await driver.findElement(By.id('procthis'));
			await driver.actions({async: true})
				.move({origin: doit}).pause(300).click().pause(300).perform();
			await driver.actions({async: true}).pause(1900);
			await driver.actions({async: true}).clear();
	});
	it('convert with question and more rotation', async function dotest() {
			this.timeout(11000);
			const cb = await driver.findElement(By.id('steppreview'));
			const sel = await cb.isSelected();
			//console.log('found checkbox ' + JSON.stringify(cb));
			if (!sel) {
				console.log('turning on single step');
				await driver.actions({ async: true })
					.move({ origin: cb })
					.pause(300)
					.click()
					.pause(300)
					.perform();
			}
			//console.log('pressed checkbox ' + JSON.stringify(cb));
			const fi = await driver.findElement(By.id('infile'));
			await fi.clear();
			//console.log('found fileinput ' + JSON.stringify(fi));
			await fi.sendKeys(TESTDAT + '/IMBACK/PHOTO/2021_1102_123011_001.raw');
			//await driver.actions({async: true}).pause(900);
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
			await driver.actions({async: true}).pause(1900);
			await driver.actions({async: true}).clear();
	});
	it('convert to zip with copyright', async function dotest() {
			this.timeout(11000);
			const cb = await driver.findElement(By.id('steppreview'));
			const sel = await cb.isSelected();
			//console.log('found checkbox ' + JSON.stringify(cb));
			if (sel) {
				console.log('turning off single step');
				await driver.actions({ async: true })
					.move({ origin: cb })
					.pause(600)
					.click()
					.pause(200)
					.perform();
			}
			const sel2 = await cb.isSelected();
			if (sel2) {
				console.log('AGAIN turning off single step');
				await driver.actions({ async: true })
					.move({ origin: cb })
					.pause(200)
					.click()
					.pause(200)
					.perform();
			}
			const pv = await driver.findElement(By.id('dngpreview'));
			const psel = await pv.isSelected();
			//console.log('found checkbox ' + JSON.stringify(cb));
			if (psel) {
				console.log('turning off preview');
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
			//console.log('pressed checkbox ' + JSON.stringify(cb));
			const fi = await driver.findElement(By.id('infile'));
			await fi.clear();
			//console.log('found fileinput ' + JSON.stringify(fi));
			await fi.sendKeys(TESTDAT + '/IMBACK/PHOTO/2020_0211_213011_001.raw' + '\n' + TESTDAT + '/IMBACK/PHOTO/2024_1015_123011_001.raw' + '\n' + TESTDAT + '/IMBACK/PHOTO/2021_1102_123011_001.raw');
			// do something to make it flutsch
			await driver.actions({async: true})
				.pause(700).move({ origin: cb }).pause(700).click().pause(700).perform();
	});
	after(async function() {
			console.log('Message Content:');
			let m = await driver.findElement(By.id('xmsg'));
			let t = await m.getText();
			console.log(t);
			if (!errflg) driver.quit();
	});
});

