#!/usr/bin/env node
/* 
***************************************************** 

imbraw2dng.js

Convert RAW from I'm back(R)(https://imback.eu) into DNG

Based on work by Michele Asciutti.

https://github.com/shyrodgau/imbraw2dng

Usage: node imbraw2dng.js [-l lang] [-f] [-d dir] [-nc | -co] [-np] [-cr copyright] [-R] [-J] [-O] [-fla | -flx] [-n yyyy_mm_dd-hh_mm_ss] [ [--] <files-or-dirs>* ]
Options:
 -h - show this help
 -nc - do not use coloured text
 -co - force coloured text
 -l XX - where XX is a valid language code (currently: DE, EN, FR)
         Language can also be set by changing filename to imbraw2dng_XX.js .
 -d dir - put output files into dir
 -f - overwrite existing files
 -r - rename output file, if already exists
 -np - Do not add preview thumbnail to DNG
 -cr 'copyright...' - add copyright to DNG
 -fla, -flx - add multiple images to fake long exposure, flx scales down'
 -R - get RAW from ImB connected via Wifi or from given directories
 -J - get JPEG from ImB connected via Wifi or from given directories
 -O - get non-RAW/non-JPEG from ImB connected via Wifi or from given directories
 -n yyyy_mm_dd-hh_mm_ss (or prefix of any length) - select only newer than this timestamp from ImB or from given directories
 -----
 -- - treat rest of parameters as local files or dirs
 <files-or-dirs> - process local files or directories recursively, e.g. on MicroSD from ImB

The following js code is identical to the js inside imbraw2dng.html for the classes IFDOut, TIFFOut, ImBCBase, ImBCBackw.

***************************************************** 

Copyright (C) 2023,2024 by Stefan Hegny, stefan@hegny.de

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. 
IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, 
DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

// SPDX-License-Identifier: 0BSD

***************************************************** 
*/
"use strict;"
/* *************************************** IFDOut *************************************** */
/* Tiff IFD helper class */
class IFDOut {
/* Indentation out */
camprofptr = -1; // first of the pointers, they are sequential, accessed by TIFFOut
// rest is private:
#entrys = [];
#currentoff = 0;
// imgdata can be view or array
#imgdata = null;
#imglen = 0;
#data = new Uint8Array(20000000);
#dyndata = [] ; //new Uint8Array(20000);
/* IFDOut: add image data to ifd */
addImageStrip(typ, view, width, height) {
	this.#imgdata = view;
	this.#imglen = view.byteLength ? ((this.#imgdata.byteLength + 3) & 0xFFFFFFFC) : (view.length + 3) & 0xFFFFFFFC;
	this.addEntry(254 , 'LONG', [ typ ]); /* SubFileType */
	this.addEntry(256 , 'SHORT', [ width ]); /* width */
	this.addEntry(257 , 'SHORT', [ height ]); /* height */
	this.addEntry(273 , 'LONG', [ 0xFFFFFFFF ]); /* StipOffsets , special */
	this.addEntry(279 , 'LONG', [ this.#imgdata.byteLength ? this.#imgdata.byteLength : view.length ]); /* StripByte count */
	this.addEntry(278 , 'LONG', [ height ]); /* Rows per strip */
}
/* IFDOut: add entry to ifd */
addEntry(tag, type, value) {
	let x = TIFFOut.tToNum(type);
	let l = value.length;
	if (type === 'ASCII') l++;
	else if (type === 'RATIONAL' || type === 'SRATIONAL') l /= 2;
	if (tag === 273 || tag === 330) { /* special cases */
		let e = {
			tag: tag,
			type: x.t,
			count: l,
			ptr: value[0]
		};
		this.#entrys.push(e);
	} else if (l * x.l <= 4) { /* fits into data */
		let e = {
			tag: tag,
			type: x.t,
			count: l,
			value: [ 0, 0, 0, 0 ]
		};
		if (type === 'BYTE' || type === 'SBYTE' || type === 'UNDEFINED') {
			for (let k=0; k<l; k++) e.value[k] = value[k];
		} else if (type === 'ASCII') {
			for (let k=0; k<l-1; k++) e.value[k] = value.charCodeAt(k) % 256;
		} else if (type === 'LONG') {
			TIFFOut.writeinttoout(e.value, value[0], 0);
		} else if (type === 'SLONG') {
			TIFFOut.writeinttoout(e.value, (65536*65536)+value[0], 0);
		} else if (type === 'SHORT') {
			TIFFOut.writeshorttoout(e.value, value[0], 0);
			if (l === 2) TIFFOut.writeshorttoout(e.value, value[1], 2);
		} else if (type === 'SSHORT') {
			if (value[0] < 0) TIFFOut.writeshorttoout(e.value, 65536+value[0], 0);
			else TIFFOut.writeshorttoout(e.value, value[0], 0);
			if (l === 2) {
				if (value[1] < 0) TIFFOut.writeshorttoout(e.value, 65536+value[1], 2);
				else TIFFOut.writeshorttoout(e.value, value[1], 2);
			}
		}
		this.#entrys.push(e);
	}
	else { /* data accessed via pointer */
		let e = {
			tag: tag,
			type: x.t,
			count: l,
			ptr: this.#currentoff
		};
		if (type === 'BYTE' || type === 'SBYTE' || type === 'UNDEFINED') {
			for (let k=0; k<l; k++) this.#dyndata.push(value[k]);
			this.#currentoff += l;
			if (this.#currentoff % 2) { // alignment
				this.#dyndata.push(0); this.#currentoff++;
			}
		} else if (type === 'ASCII') {
			for (let k=0; k<l-1; k++) this.#dyndata.push(value.charCodeAt(k) % 256);
			this.#dyndata.push(0);
			this.#currentoff += l;
			if (this.#currentoff % 2) { // alignment
				this.#dyndata.push(0); this.#currentoff++;
			}
		} else if (type === 'LONG') {
			for (let k = 0; k < l; k++) {
				TIFFOut.writeinttoout(this.#dyndata, value[k], this.#currentoff);
				this.#currentoff += 4;
			}
		} else if (type === 'SLONG') {
			for (let k = 0; k < l; k++) {
				if (value[k] < 0) TIFFOut.writeinttoout(this.#dyndata, (65536*65536)+value[k], this.#currentoff);
				else TIFFOut.writeinttoout(this.#dyndata, value[k], this.#currentoff);
				this.#currentoff += 4;
			}
		} else if (type === 'SHORT') {
			for (let k = 0; k < l; k++) {
				TIFFOut.writeshorttoout(this.#dyndata, value[k], this.#currentoff);
				this.#currentoff += 2;
			}
		} else if (type === 'SSHORT') {
			for (let k = 0; k < l; k++) {
				if (value[k] < 0) TIFFOut.writeinttoout(this.#dyndata, 65536 + value[k], this.#currentoff);
				else TIFFOut.writeshorttoout(this.#dyndata, value[k], this.#currentoff);
				this.#currentoff += 2;
			}
		} else if (type === 'RATIONAL') {
			for (let k = 0; k < l; k++) {
				TIFFOut.writeinttoout(this.#dyndata, value[2*k], this.#currentoff);
				TIFFOut.writeinttoout(this.#dyndata, value[2*k + 1], this.#currentoff + 4);
				this.#currentoff += 8;
			}
		} else if (type === 'SRATIONAL') {
			for (let k = 0; k < l; k++) {
				if (value[2*k] < 0) TIFFOut.writeinttoout(this.#dyndata, (65536*65536)+value[2*k], this.#currentoff);
				else TIFFOut.writeinttoout(this.#dyndata, value[2*k], this.#currentoff);
				if (value[2*k + 1] < 0) TIFFOut.writeinttoout(this.#dyndata, (65536*65536)+value[2*k + 1], this.#currentoff + 4);
				else TIFFOut.writeinttoout(this.#dyndata, value[2*k + 1], this.#currentoff + 4);
				this.#currentoff += 8;
			}
		}
		//console.log('After ptr tag ' + tag +  ' type ' + type + ' * ' + l + ' :' + this.#currentoff);
		this.#entrys.push(e);
	}
}
/* IFDOut: get data for this ifd, shifted to actual offset in file */
getData(offset) {
	let ioff = 0;
	if (this.#imgdata?.byteLength) {
		for (let z=0; z<this.#imgdata.byteLength; z++)
			this.#data[ioff++] = this.#imgdata.getUint8(z);
	} else if (this.#imgdata) {
		for (let z=0; z<this.#imgdata.length; z++)
			this.#data[ioff++] = this.#imgdata[z];
	}
	while (ioff < this.#imglen)
		this.#data[ioff++] = 0;
	TIFFOut.writeshorttoout(this.#data, this.#entrys.length, ioff);
	ioff += 2;
	for (const i of this.#entrys.sort((a,b) => a.tag - b.tag )) {
		let parr = [ 0, 0, 0, 0 ];
		TIFFOut.writeshorttoout(parr, i.tag, 0);
		this.#data.set(parr, ioff);
		TIFFOut.writeshorttoout(parr, i.type, 0);
		this.#data.set(parr, ioff+2);
		TIFFOut.writeinttoout(parr, i.count, 0);
		this.#data.set(parr, ioff+4);
		if (i.tag === 273) { /* strip offsets is set here, subifd (-2) and private stuff outside */
			let parr = [ 0, 0, 0, 0 ];
			TIFFOut.writeinttoout(parr, offset, 0);
			this.#data.set(parr, ioff + 8);
		} else if (i.tag === 50933) { // camera profiles
			if (undefined !== i.value) // only one, profile ptr fits into value
				this.camprofptr = offset + ioff + 8;
			else {			// more than one, dereference
				let parr = [ 0, 0, 0, 0 ];
				TIFFOut.writeinttoout(parr, i.ptr + offset + this.#imglen + 6 + (12 * this.#entrys.length), 0);
				this.#data.set(parr, ioff + 8);
				this.camprofptr = offset + this.#imglen + i.ptr + 6 + (12 * this.#entrys.length);
			}
		} else if (undefined !== i.value) {
			this.#data.set(i.value, ioff + 8);
		} else {
			let parr = [ 0, 0, 0, 0 ];
			TIFFOut.writeinttoout(parr, i.ptr + offset + this.#imglen + 6 + (12 * this.#entrys.length), 0);
			this.#data.set(parr, ioff + 8);
		}
		ioff += 12;
	}
	let oarr = [ 0, 0, 0, 0 ];
	// next ifd - stays zero if has sub ifd
	this.#data.set(oarr, ioff);
	ioff += 4;
	this.#data.set(this.#dyndata, ioff);
	return this.#data.slice(0, ioff + this.#currentoff);
}
/* IFDOut: tiff directory is placed after image data */
getOffset() {
	return this.#imglen;
}
/* IFDOut: if has sub ifd, then return that */
getNextIfdPosOffset() {
	if (this.hassub) {
		const i = this.#entrys.findIndex(v => v.tag === 330);
		return this.#imglen + 2 + (12 * i) + 8;
	} else {
		return this.#imglen + 2 + (12 * this.#entrys.length);
	}
}
/* Indentation in - end of class IFD */
};
/* *************************************** IFDOut E N D *************************************** */
/* *************************************** TIFFOut *************************************** */
/* main TIFF class */
class TIFFOut {
/* Indentation out */
#ifds = [];
#cameraprofiles = [];
#currentifd = null;
#data = new Uint8Array(20000000);
/* TIFFOut: add an ifd  (will set this as current IFD) */
addIfd(issub) {
	if (null !== this.#currentifd) {
		this.#ifds.push(this.#currentifd);
	}
	this.#currentifd = new IFDOut();
	if (issub) this.#currentifd.issub = true;
}
/* TIFFOut: add sub ifd  (will set this as current IFD) */
addSubIfd() {
	if (null !== this.#currentifd) {
		this.#currentifd.hassub = true;
		this.#currentifd.addEntry(330, 'LONG', [ 0xFFFFFFFE ]); /* subifd, special */
	}
	this.addIfd(true);
}
/* TIFFOut: add image data to current ifd */
addImageStrip(typ, view, width, height) {
	this.#currentifd.addImageStrip(typ, view, width, height);
}
/* TIFFOut: add an entry to current ifd */
addEntry(tag, type, data) {
	if (this.#cameraprofiles.length > 0) {
		this.#cameraprofiles[this.#cameraprofiles.length - 1].addEntry(tag, type, data);
	} else
		this.#currentifd.addEntry(tag, type, data);
}
/* TIFFOut: map string type to tiff id */
static types = [
	{ n: 'BYTE', t: 1, l: 1 },
	{ n: 'ASCII', t: 2, l: 1 },
	{ n: 'SHORT', t: 3, l: 2 },
	{ n: 'LONG', t: 4, l: 4 },
	{ n: 'RATIONAL', t: 5, l: 8 },
	{ n: 'SBYTE', t: 6, l: 1 },
	{ n: 'UNDEFINED', t: 7, l: 1 },
	{ n: 'SSHORT', t: 8, l: 2 },
	{ n: 'SLONG', t: 9, l: 4 },
	{ n: 'SRATIONAL', t: 10, l: 8 },
	//{ n: 'FLOAT', t: 11, l: 4 },
	//{ n: 'DOUBLE', t: 12, l: 8 },
];
/* TIFFOut: map string type to tiff id */
static tToNum(type) {
	return (TIFFOut.types.filter(v =>  v.n === type )[0]);
}
/* TIFFOut: helper function to put integer into dng */
static writeinttoout(out, num, off) {
	TIFFOut.writeshorttoout(out, num % 65536, off);
	TIFFOut.writeshorttoout(out, (Math.floor(num / 65536)) % 65536, off+2);
}
/* TIFFOut: helper function to put short integer into dng */
static writeshorttoout(out, num, off) {
	out[off] = (num % 256);
	out[off + 1] = Math.floor(num / 256) % 256;
}
/* TIFFOut: return the tiff binary data */
getData() {
	if (null !== this.#currentifd) {
		this.#ifds.push(this.#currentifd);
	}
	if (this.#cameraprofiles.length > 0) {
		let camprofarr = [];
		for (const j of this.#cameraprofiles) camprofarr.push(1);
		this.#ifds[0].addEntry(50933, 'LONG', camprofarr); /* camera profiles pointer */
	}
	TIFFOut.writeshorttoout(this.#data, 0x4949, 0); // magics
	TIFFOut.writeshorttoout(this.#data, 42, 2);
	let lastoffpos = 4;
	let lastlen = 8;
	for (const i of this.#ifds) {
		TIFFOut.writeinttoout(this.#data, i.getOffset() + lastlen, lastoffpos);
		let d = i.getData(lastlen);
		this.#data.set(d, lastlen);
		lastoffpos = i.getNextIfdPosOffset() + lastlen;
		lastlen += d.length;
	}
	TIFFOut.writeinttoout(this.#data, 0, lastoffpos);
	if (-1 !== this.#ifds[0].camprofptr && this.#cameraprofiles.length > 0) {
		for (let l=0; l<this.#cameraprofiles.length; l++) {
			TIFFOut.writeinttoout(this.#data, lastlen, this.#ifds[0].camprofptr + (4*l));
			let cpd = this.#getCamProfData(this.#cameraprofiles[l]);
			this.#data.set(cpd, lastlen);
			lastlen += cpd.length;
		}
	}
	return this.#data.slice(0, lastlen);
}
// TIFFOut: add extra camera profile (will set this as current IFD), must go behind all other IFDs
createCamProf(name) {
	this.#cameraprofiles.push(new IFDOut());
	this.#cameraprofiles[this.#cameraprofiles.length - 1].addEntry(50936, 'ASCII', name); /* profile name */
}
/* TIFFOut: get camera profile data analog to ifd */
#getCamProfData(p) {
	let camprofbuf = new Uint8Array(3000);
	TIFFOut.writeshorttoout(camprofbuf, 0x4949, 0); // magics
	TIFFOut.writeshorttoout(camprofbuf, 0x4352, 2);
	TIFFOut.writeinttoout(camprofbuf, 8, 4);
	let d = p.getData(8);
	camprofbuf.set(d, 8);
	return camprofbuf.slice(0, 8 + d.length);
}
/* Indentation in - end of class TIFFOut */
}
/* *************************************** TIFFOut E N D *************************************** */
/* *************************************** Backward helper class *************************************** */
class ImBCBackw {
/* Indentation out */
constructor (imbcout) {
	this.imbc = imbcout;
}
/* ImBCBackw: backward: helper to read dng */
static readshort(view, off) {
	let res = view.getUint8(off);
	res += (256 * view.getUint8(off+1));
	return res;
}
/* ImBCBackw: backward: helper to read dng */
static readint(view, off) {
	let res = ImBCBackw.readshort(view, off);
	res += (65536 * ImBCBackw.readshort(view,off+2));
	return res;
}
/* ImBCBackw: backward: handle dng like raw */
static parseDng(f, onok, onerr) {
	// blindly assumes that it is one of our own DNG
	if (undefined === f.data) {
		const reader = f.imbackextension ? f : new FileReader();
		reader.onload = (evt) => {
			f.data = evt.target.result;
			ImBCBackw.parseDng(f, onok, onerr);
		}
		reader.onerror = (evt) => { onerr(f.name); };
		reader.readAsArrayBuffer(f);
		return;
	}
	const v = new DataView(f.data);
	const ifd = ImBCBackw.readint(v, 4);
	const zz = ImBCBase.infos.findIndex((v, i, o) => v.size === ifd - 8);
	const nent = ImBCBackw.readshort(v, ifd);
	let subifdstart = -1, rawstripstart = -1, datalen = -1;
	let off = ifd+2;
	if (ImBCBackw.readshort(v, 2) !== 42 || ImBCBackw.readshort(v,0) !== 18761 /* 0x4949 */ || zz === -1) {
		// seek sub ifd then therein the stripoffsets
		for (let k=0; k<((nent<50)? nent: 0); k++) {
			let tag = ImBCBackw.readshort(v, off);
			if (tag === 330) {
				subifdstart = ImBCBackw.readint(v, off+8);
				break;
			}
			off += 12;
		}
		if (-1 !== subifdstart) {
			let subnent = ImBCBackw.readshort(v, subifdstart);
			off = subifdstart + 2;
			for (let j=0; j<((subnent < 50)? subnent: 0); j++) {
				let stag = ImBCBackw.readshort(v, off);
				if (stag === 273) {
					rawstripstart = ImBCBackw.readint(v, off+8);
					break;
				}
				off += 12;
			}
			if (-1 !== rawstripstart) {
				datalen = subifdstart - rawstripstart;
				const zzz = ImBCBase.infos.findIndex((v, i, o) => v.size === datalen);
				if (-1 === zzz) {
					this.imbc.appmsg('Works only for originally created DNGs.', true);
					return onerr(f.name);
				}
			}
			else {
				this.imbc.appmsg('Works only for originally created DNGs.', true);
				return onerr(f.name);
			}
		}
		else {
			this.imbc.appmsg('Works only for originally created DNGs.', true);
			return onerr(f.name);
		}
	}
	else {
		rawstripstart = 8;
		datalen = ifd - 8;
	}
	let fx = {
		imbackextension: true,
		name: f.name.substring(0, f.name.length - 4) + '.raw',
		size: datalen,
		data: f.data.slice(rawstripstart, datalen + rawstripstart)
	};
	/*off = ifd+2;
	for (let k=0; k<((nent<50)? nent: 0); k++) {
		let tag = ImBCBackw.readshort(v, off);
		if (tag === 274)
			fx.rot = ImBCBackw.readshort(v, off+8); // rotation handling has problems
		else if (tag === 306) {
			fx.datestr = '';
			let xoff = ImBCBackw.readint(v, off+8);
			const len = ImBCBackw.readshort(v, off+4)-1;
			for (let j=0; j<len;j++)
				fx.datestr += String.fromCharCode(v.getUint8(xoff++));
		}
		off += 12;
	}*/
	fx.readAsArrayBuffer = (fy) => {
		fy.onload({
				target: { result: fy.data }
		});
	};
	setTimeout(() => {
			onok(f.name, fx, fx.rot);
	});
}
/* ImBCBackw: backward: actual processing function for one file */
handleone(fx) {
	const f = (fx !== undefined) ? fx : this.imbc.allfiles[this.imbc.actnum];
	if (undefined === f) {
		this.imbc.appmsgxl(true, 'process.nothing');
		return this.imbc.handlenext();
	}
	if (undefined === f.size) {
		setTimeout(() => {
		  this.imbc.resolver(f, (url, fx, rot) => {
				this.imbc.allfiles[this.imbc.actnum] = fx;
				this.handleone(fx);
			}, (url) => {
				this.imbc.mappx(false, 'words.sorryerr');
				this.imbc.appmsgxl(true, 'process.erraccess', url);
				this.imbc.stats.error ++;
				this.imbc.handlenext();
		  });
		});
		return;
	}
	let rawname = ImBCBase.basename(f.name);
	if (rawname.substring(rawname.length -4).toUpperCase() === '.DNG') {
		ImBCBackw.parseDng(f,
			(name, fx) => {
				this.handleone(fx);
			},
			() => {
				this.imbc.appmsg('Error reading DNG: ' + f.name);
				this.imbc.handlenext();
				this.imbc.stats.error++;
			});
		return;
	}
	else if (rawname.substring(rawname.length -4).toUpperCase() !== '.RAW') {
		this.imbc.appmsg("[" + (1 + this.imbc.actnum) + " / " + this.imbc.totnum + "] ", false);
		this.imbc.appmsg('Seems not to be DNG: ' + f.name, true);
		this.imbc.stats.error++;
		return this.imbc.handlenext();
	}
	let w, h, mode = "??";
	let typ = 0;
	const zz = ImBCBase.infos.findIndex((v, i, o) => v.size === f.size);
	if (zz !== -1) {
		this.imbc.appmsg("[" + (1 + this.imbc.actnum) + " / " + this.imbc.totnum + "] ");
		const reader = f.imbackextension ? f : new FileReader();
		reader.onload = (evt) => {
			const contents = evt.target.result;
			const view = new DataView(contents);
			const out = new Uint8Array(f.size);
			for (let j=0; j<view.byteLength; j++) {
				out[j] = view.getUint8(j);
			}
			this.imbc.writefile(rawname, 'application/octet-stream', 'process.converted', out);
		}
		reader.onerror = (evt) => {
			console.log('Unk-RAW process reader error for ' + f.name + ' ' + JSON.stringify(evt));
			this.imbc.appmsg('Error processing or reading file ' +  f.name, true);
			this.imbc.stats.error++;
			this.imbc.handlenext();
		}
		reader.readAsArrayBuffer(f);
	} else {
		this.imbc.appmsg("[" + (1 + this.imbc.actnum) + " / " + this.imbc.totnum + "] ", false);
		this.imbc.appmsg('Size of raw data of ' + f.name + ' seems not to match known formats, ignoring...', true);
		this.imbc.stats.error++;
		this.imbc.handlenext();
	}
}
/* Indentation in - end of class ImBCBackw */
}
/* *************************************** Backward helper class E N D *************************************** */
/* *************************************** Main class *************************************** */
class ImBCBase {
/* Indentation out */
static version = "V3.7.1_dev"; // actually const
static alllangs = [ 'de' , 'en', 'fr', 'ru', 'ja', '00' ]; // actually const
static texts = { // actually const
	langs: { de: 'DE', en: 'EN', fr: 'FR' , ru: 'RU', ja: 'JA' },
	words: {
		error: {
			de: '\u001b[31m\u001b[1mFEHLER:\u001b[0m ',
			en: '\u001b[31m\u001b[1mERROR:\u001b[0m ',
			fr: '\u001b[31m\u001b[1mERREUR:\u001b[0m ',
			ja: '\u001b[31m\u001b[1mエラー:\u001b[0m ',
			htmlstyle: [ [ 'background-color','#ffdddd' ], [ 'font-weight', 'bold' ] ]
		},
		warning: {
			de: '\u001b[31mWarnung:\u001b[0m ',
			en: '\u001b[31mWarning:\u001b[0m ',
			fr: '\u001b[31mAvertissement:\u001b[0m ',
			ja: '\u001b[31m警告:\u001b[0m',
			htmlstyle: [ [ 'background-color','#ffdddd' ] ]
		},
		finished: {
			de: '\u001b[32m\u001b[1mFertig!\u001b[0m ',
			en: '\u001b[32m\u001b[1mFinished!\u001b[0m ',
			fr: '\u001b[32m\u001b[1mFini!\u001b[0m ',
			ja: '\u001b[32m\u001b[1m終了!\u001b[0m ',
			htmlstyle: [ [ 'background-color','#ddffdd' ], [ 'font-weight', 'bold' ] ]
		},
		sorryerr: {
			de: '\u001b[31m\u001b[1mENTSCHULDIGUNG! FEHLER:\u001b[0m ',
			en: '\u001b[31m\u001b[1mSORRY! ERROR:\u001b[0m  ',
			fr: '\u001b[31m\u001b[1mDÉSOLÉE! ERREUR:\u001b[0m ',
			ja: '\u001b[31m\u001b[1m申し訳ございません! エラー:\u001b[0m  ',
			htmlstyle: [ [ 'background-color','#ffdddd' ], [ 'font-weight', 'bold' ] ]
		},
		sorry: {
			de: '\u001b[31mENTSCHULDIGUNG!\u001b[0m ',
			en: '\u001b[31mSORRY!\u001b[0m  ',
			fr: '\u001b[31mDÉSOLÉE!\u001b[0m ',
			ja: '\u001b[31m申し訳ございません!\u001b[0m  ',
			htmlstyle: [ [ 'background-color','#ffdddd' ], [ 'font-weight', 'bold' ] ]
		}
	},
	main: {
		coloursyourrisk: {
			de: 'Bei Farben bin ich raus! Eigenes Risiko, fraach mich net!',
			en: 'About colurs, I am out! Own risk, do not ask me!',
			fr: 'About colurs, I am out! Own risk, do not ask me!',
			ja: '色については、アウトです！ 自己責任ですので、私に尋ねないでください。'
		},
		title: {
			de: 'ImB RAW nach DNG Konverter',
			en: 'ImB RAW to DNG converter',
			fr: 'Convertisseur ImB RAW a DNG',
			ru: 'Конвертер ImB RAW в DNG',
			ja: 'ImB RAW を DNG に変換'
		},
	    backw: {
			   title:  { en: 'ImB DNG to RAW back converter' },
			   generaladvice: { en: 'Only works for the exact original converted DNG.' },
			   selectdng: { en: 'Select orig. DNG' },
			   drophere: { en: 'Drop DNGs here' }
	    },
		file: {
			de: 'Datei',
			en: 'File',
			fr: 'Fiche',
			ru: 'файл',
			ja: 'ファイル'
		},
		help: {
			de: '? Hilfe Doku',
			en: '? Help Doc',
			fr: '? Aide Doc',
			ru: '? Помощь Док',
			ja: '? ヘルプ資料'
		},
		helplink: {
			de: 'https://shyrodgau.github.io/imbraw2dng/README_de',
			en: 'https://shyrodgau.github.io/imbraw2dng/',
			fr: 'https://shyrodgau.github.io/imbraw2dng/',
			ja: 'https://shyrodgau.github.io/imbraw2dng/README_ja'
		},
		generaladvice: {
			de: 'Daten werden nur im Browser verarbeitet, nicht im \'Internet\'.<br>Kann sein, dass der Browser fragt, ob Sie zulassen wollen, dass mehrere Dateien heruntergeladen werden.<br>Dateien, die nicht oder unbekannte RAW-Dateien sind, werden 1:1 kopiert.',
			en: 'Data processing is entirely in the browser, not in \'the internet\'<br>Browser may ask you if you want to allow downloading multiple files.<br>Not or unrecognized RAW Files simply will be copied.',
			fr: 'L\'information est entièrement traitée dans le navigateur et non sur \'Internet\'<br>Le navigateur peux questionner que vous acceptez le téléchargement de beaucoup de fiches.<br>Fiches pas-RAW ou RAW inconnue sont copiée 1:1.',
			ru: 'Данные обрабатываются только в браузере, а не в \'Интернете\'.<br>Браузер может спросить, хотите ли вы разрешить загрузку нескольких файлов.<br>Файлы, которые не являются или неизвестными файлами RAW, копируются 1:1.',
			ja: 'データ処理は完全にブラウザ内で行われ、\'インターネット\'では行われません。<br>ブラウザにより複数のファイルのダウンロードを許可するかを尋ねることがあります。<br>RAW ファイルが存在しない、または認識されない場合は、単純にコピーされます。'
		},
		drophere: {
			de: 'Dateien von ImB hier ablegen: ',
			en: 'Drop Files from ImB here: ',
			fr: 'Posez fiches de ImB ici: ',
			ru: 'Храните файлы из ImB здесь: ',
			ja: 'ここに ImB のファイルをドロップします。: '
		},
		selectraw: {
			de: 'Oder diese Seite per WLAN <a href=\'https://github.com/shyrodgau/imbraw2dng/blob/master/moredoc_de.md#gucken-auf-imback-selbst\'>direkt von ImB</a> verwenden.<br>Oder <tt>.RAW</tt> Datei(en) auswählen:',
			en: 'Or use this page via Wifi <a href=\'https://github.com/shyrodgau/imbraw2dng/blob/master/moredoc.md#browsing-on-the-imback\'>directly from ImB</a>.<br>Or select <tt>.RAW</tt> File(s):',
			fr: 'Ou utiliez cette page <a href=\'https://github.com/shyrodgau/imbraw2dng/blob/master/moredoc.md#browsing-on-the-imback\'>via Wifi sur ImB</a>.<br>Ou selectez <tt>.RAW</tt> fiche(s):',
			ru: 'Или используйте эту страницу через Wi-Fi <a href=\'https://github.com/shyrodgau/imbraw2dng/blob/master/moredoc.md#browsing-on-the-imback\'>прямо из ImB</a>.<br>Или выберите файл(ы) <tt>RAW</tt>:',
			ja: 'または、Wifi 経由で <a href=\'https://github.com/shyrodgau/imbraw2dng/blob/master/moredoc_ja.md#imback-での閲覧\'>ImB から直接</a>このページを使用します。<br> または、 <tt>.RAW</tt> ファイルを選択します。:'
		},
		stillcounting: {
			de: '... zähle ... ',
			en: '... counting ... ',
			fr: '... compter ...',
			ru: '... подсчет ...',
			ja: '... カウント中 ... '
		},
		types: {
			rawpics: {
				de: 'RAW Bilder',
				en: 'RAW Pictures',
				fr: 'RAW images',
				ja: 'RAW 画像'
			},
			jpgpics: {
				de: 'JPEG-Bilder',
				en: 'JPEG Pictures',
				fr: 'JPEG images',
				ja: 'JPEG 画像'
			},
			other: {
				de: 'Andere',
				en: 'Other',
				fr: 'Autre',
				ja: 'その他'
			},
			notpic: {
				de: 'Keine Bilder',
				en: 'Not pictures',
				fr: 'Pas images',
				ja: '画像ではない'
			}
		},
		file: {
			jpeg: {
				de: 'Datei $$0 (JPEG)',
				en: 'File $$0 (JPEG)',
				fr: 'Fiche $$0 (JPEG)',
				ja: 'ファイル $$0 (JPEG)'
			},
			nopreview: {
				de: 'Datei $$0<br>Nicht jpeg oder raw, keine Vorschau...',
				en: 'File $$0<br>Not jpeg or raw, no preview...',
				fr: 'Fiche $$0<br>Ni jpeg ni raw, pas de aperçu...',
				ja: 'ファイル $$0<br>jpeg または、raw 以外、プレビューなし...'
			},
			rawunknown: {
				de: 'Datei $$0<br>Unerkannte RAW Dateigröße $$1, bitte Entwickler kontaktieren! Keine Vorschau...',
				en: 'File $$0<br>Unknown raw size $$1, please contact developer! No preview...',
				fr: 'Fiche $$0<br>taille de fiche $$1 non reconnue, contacter le développeur, pas de aperçu...',
				ja: 'File $$0<br>不明な raw サイズ $$1, 開発者にお問い合わせください! プレビューなし...'
			},
			dngimpnote: {
				de: 'Import eines DNG geht nur, wenn diese genau das hiermit erzeugte Original ist.',
				en: 'Re-import of a DNG is only possible if this is exactly the original that was created here.',
				fr: 'La réimportation d\'un DNG n\'est possible que s\'il s\'agit exactement de l\'original créé ici.',
				ja: 'DNG の再インポートは、これがここで作成されたオリジナルである場合にのみ可能です。'
			},
			de: 'Datei $$0',
			en: 'File $$0',
			fr: 'Fiche $$0',
			ja: 'ファイル $$0'
		},
		sort: {
			de: 'Sortiere',
			en: 'Sort:',
			fr: 'Trier:',
			ja: 'ソート:'
		},
		or: {
			de: 'Oder ',
			en: 'Or ',
			fr: 'Ou ',
			ja: 'または '
		},
		log: {
			de: 'Protokoll-Ausgabe:',
			en: 'Message Log:',
			fr: 'Journal des messages',
			ja: 'メッセージ ログ:'
		},
		selected: {
			de: 'Ausgewählt',
			en: 'Selected',
			fr: 'Sélectionné(s)',
			ja: '選択済み'
		},
		fakelong: {
			en: 'Fake long exposure by adding up all',
			de: 'Langzeitbelichtung durch Addieren simulieren',
			scale: {
				en: 'Scale values down',
				de: 'Werte dabei herunterskalieren'
			},
			added: {
				en: 'Added picture $$0',
				de: 'Bild $$0 hinzugefügt'
			}
		}
	},
	browser: {
		bytype: {
			de: 'nach Typ',
			en: 'by type',
			fr: 'par type',
			ja: '種類別'
		},
		olderfirst: {
			de: 'Ältere nach oben',
			en: 'Older first',
			fr: 'Plus anciens ci-dessus',
			ja: '古い順'
		},
		selall: {
			tooltip: {
				de: 'Wenn Haken nicht gesetzt, wähle alles aus. Bei Klick wenn angehakt setze Auswahl auf Nichts.',
				en: 'If not selected then select all. If it is selected and clicked then unselect all.',
				fr: 'S\'il n\'est pas sélectionner, sélectionner tout. Au clic si sélectionné, vider la sélection',
				ja: '選択されていない場合は、すべてを選択します。 選択してクリックした場合は、すべての選択を解除します。'
			},
			de: 'Alle de-/ oder selektieren',
			en: 'De-/select all',
			fr: 'De-/sélectionner tout',
			ja: 'すべての選択を解除'
		},
		procall: {
			de: 'Alle ausgewählte kopieren/verarbeiten',
			en: 'Copy/process all selected',
			fr: 'Traiter les sélectionnés',
			ja: '選択したものをすべてコピー/処理'
		},
		delall: {
			de: 'Alle ausgewählte löschen',
			en: 'Delete all selected',
			fr: 'Supprimer les sélectionnés',
			ja: '選択したものをすべて削除'
		},
		settingsset: {
			en: 'Preferences are set for source $$0',
			de: 'Voreinstellungen für $$0 gespeichert'
		},
		prefnotfile: {
			en: 'Preferences not possible for file:// URLs',
			de: 'Voreinstellungen für file:// URLs nicht möglich'
		},
		setfrom: {
			en: 'Set new prefereneces ',
			de: 'Voreinstellungen setzen '
		},
		forurl: {
			en: ' for URL $$0',
			de: ' für URL $$0'
		}
	},
	onimback: {
		connected: {
			de: 'ImB Verbunden! ',
			en: 'ImB Connected! ',
			fr: 'ImB Connecté! ',
			ja: 'ImB 接続済み! '
		},
		dlconvert: {
			de: 'Konvertiere / Lade herunter: ',
			en: 'Download / convert: ',
			fr: 'Telecharger / convertir',
			ja: 'ダウンロード / 変換: '
		},
		totalnum: {
			de: 'gesamt:',
			en: 'total:',
			fr: 'total:',
			ja: '合計:'
		},
		fromtime: {
			de: 'ab Zeitstempel bzw. jünger als ',
			en: 'from timestamp or younger than ',
			fr: 'à partir de l\'horodatage ou plus jeune que ',
			ja: 'タイムスタンプ以降またはそれより古い '
		},
		nullforall: {
			de: '0000 oder leer für \'alle\'',
			en: '0000 or empty for \'all\'',
			fr: '0000 ou déposer pour \'tout\'',
			ja: '0000 または、 \'すべて\' 空 '
		},
		doit: {
			de: 'Mach es',
			en: 'Do it',
			fr: 'Fais-le',
			ja: '実行'
		},
		visual: {
			de: 'Bild-Browser benutzen',
			en: 'Use visual Picture Browser',
			fr: 'Ou outilizer navigateur visuel des images',
			ja: 'ビジュアルな画像ブラウザを使用する'
		},
		errconnect: {
			de: '\u001b[31mFEHLER\u001b[0m bei der Verbindung zu ImB auf $$0! Im ImB WLAN?',
			en: '\u001b[31mERROR\u001b[0m connecting to ImB on $$0! In the ImB WiFi?',
			fr: '\u001b[31mERREUR\u001b[0m lors de la connexion à imback. Dans le Wifi ImB?',
			ja: '\u001b[31mエラー\u001b[0m $$0 でImB に接続しています! ImB WiFi ですか?'
		},
		nomatch: {
			de: 'Keine passenden Dateien gefunden. Kann vorübergehend sein.',
			en: 'No matching files found. Might be temporary.',
			fr: 'Aucun fiche correspondant trouvé. Peut-etre temporaire.',
			ja: '一致するファイルが見つかりませんでした。 一時的なものかもしれません。'
		},
		strangename: {
			de: 'Komischer Dateiname: $$0',
			en: 'Strange file name: $$0',
			fr: 'Nom de fiche inhabituel: $$0',
			ja: '無効なファイル名: $$0'
		},
		invaltime: {
			de: 'Ungültiger Zeitstempel: $$0',
			en: 'Invalid timestamp: $$0',
			fr: 'Horodatage invalide: $$0',
			ja: '無効なタイムスタンプ: $$0'
		},
	},
	process: {
		singlestep: {
			de: 'Einzelschritt mit Vorschau',
			en: 'Single Step with preview',
			fr: 'Seule étape avec aperçu',
			ja: 'プレビューありでシングルステップ'
		},
		addcopyright: {
			en: 'Add copyright',
			de: 'Copyright hinzufügen'
		},
		nothing: {
			de: 'Nichts ausgewählt.. ?',
			en: 'Nothing selected...?',
			fr: 'Rien de sélectionné',
			ja: '何も選択されていません...?'
		},
		erraccess: {
			de: 'beim Zugriff auf $$0.',
			en: 'occured accessing $$0.',
			fr: 'lors de l\'accès à $$0.',
			ja: '>アクセス中にエラーが発生しました $$0.'
		},
		notraw: {
			de: 'Durchleitung weil nicht raw: $$0',
			en: 'Passing through as not raw: $$0',
			fr: 'Passage comme non RAW: $$0',
			ja: 'RAW ではないのでスルー: $$0'
		},
		selectedn: {
			de: '$$0 Datei(en) wurden ausgewählt.',
			en: 'Got $$0 file(s) selected.',
			fr: '$$0 fiche(s) sélectionné(s)',
			ja: '$$0 ファイルが選択されました。'
		},
		copyokcheckdl: {
			de: 'Nach $$0 kopiert (Downloads-Ordner prüfen)</b>&nbsp;',
			en: 'Copied to $$0 (Check Downloads Folder)</b>&nbsp;',
			fr: 'Copié sur $$0 (Vérifier le dossier de téléchargements/Downloads)</b>&nbsp;',
			ja: '$$0 にコピーされました (ダウンロードフォルダーを確認)</b>&nbsp;'
		},
		copyok: {
			de: 'Nach $$0 kopiert',
			en: 'Copied to $$0',
			fr: 'Copié sur $$0',
			ja: '$$0 にコピー'
		},
		errorreadingfile: {
			de: 'beim Lesen der Datei $$0',
			en: 'occured reading file $$0',
			fr: 'de lecture du fiche $$0',
			ja: 'ファイル $$0 の読み取り中にエラーが発生しました。 '
		},
		unknownsize: {
			de: 'Die Dateigröße <b>$$1</b> passt zu keinem bekannten Format. Bitte Entwickler kontaktieren!',
			en: 'File Size <b>$$1</b> does not match known formats. Please contact developer!',
			fr: 'La taille du fiche $$1 ne correspond pas au format connu. Veuillez contacter le développeur',
			ja: 'が、ファイルサイズ <b>$$1</b> は既知の形式と一致しません。開発者にお問い合わせください。'
		},
		processing: {
			de: 'Verarbeite Datei: $$0 ',
			en: 'Processing file: $$0',
			fr: 'Je suis en train de traiter le fiche $$0',
			ja: '処理中のファイル: $$0'
		},
		assuming: {
			de: 'Annahme: $$0 $$1',
			en: 'Assuming $$0 $$1',
			fr: 'Hypothèse: $$0 $$1',
			ja: '認識 $$0 $$1'
		},
		datetime: {
			de: 'Datum/Zeit: $$0',
			en: 'Date/Time: $$0 ',
			fr: 'Date/heure: $$0',
			ja: '日付/時刻: $$0 '
		},
		orientation: {
			de: 'Drehung: $$0',
			en: 'Orientation: $$0',
			fr: 'Rotation: $$0',
			ja: '向き: $$0'
		},
		convertedcheckdl: {
			de: 'Nach $$0 konvertiert (Downloads-Ordner prüfen)',
			en: 'Converted to $$0 (Check Downloads Folder)',
			fr: 'Converti en $$0 (Vérifier le dossier de téléchargements/Downloads)',
			ja: '$$0 に変換されました (ダウンロードフォルダーを確認してください)'
		},
		converted: {
			de: 'Nach $$0 konvertiert',
			en: 'Converted to $$0',
			fr: 'Converti en $$0',
			ja: '$$0 に変換'
		},
		errsave: {
			de: '\u001b[31mFEHLER!\u001b[0m Konnte Datei $$0 nicht speichern.',
			en: '\u001b[31mERROR!\u001b[0m Could not write file $$0',
			fr: '\u001b[31mERREUR\u001b[0m Impossible d\'écrire le fiche $$0.',
			ja: '\u001b[31mエラー!\u001b[0m ファイル $$0 に書き込めませんでした'
		},
		droppedn: {
			de: '$$0 Datei(en) wurden abgelegt.',
			en: 'Got $$0 file(s) dropped.',
			fr: '$$0 fiche(s) ont été stockés',
			ja: '$$0 個のファイルがドロップされました。'
		},
		frombackn: {
			de: '$$0 Datei(en) vom ImB zu verarbeiten.',
			en: 'Got $$0 file(s) from ImB.',
			fr: 'J\'ai reçu $$0 fiche(s) d\'ImB',
			ja: 'ImB から $$0 ファイルを取得しました。'
		},
		frombrowsern: {
			de: '$$0 Datei(en) vom Bild-Browser zu verarbeiten.',
			en: 'Got $$0 file(s) from Visual browser.',
			fr: 'J\'ai obtenu $$ fiche(s) du navigateur visuel',
			ja: 'ビジュアル ブラウザから $$0 ファイルを取得しました。'
		},
		skipped: {
			remaining: {
				de: 'Verbleibende $$0 Dateien auf Anforderung übersprungen',
				en: 'Skipping remaining $$0 images at your request',
				fr: '$$0 fiches restants ignorés sur demande',
				ja: 'リクエストに応じてスキップ: $$0'
			},
			de: 'Auf Anforderung übersprungen: $$0',
			en: 'Skipped at your request: $$0',
			fr: 'Ignoré à votre demande: $$0',
			ja: 'リクエストに応じて残りの $$0 画像をスキップします'
		},
		totals: {
			en: 'Total: $$0, ok: $$1, skipped: $$2, Errors: $$3',
			de: 'Total: $$0, ok $$1, übersprungen: $$2, Fehler: $$3',
			fr: 'Total: $$0, ok: $$1, Ignoré: $$2, Erreur: $$3',
			ja: '合計 $$0、OK $$1、スキップ $$2、エラー $$3'
		},
		addpreview: {
			en: 'Add preview thumbnail to DNG',
			de: 'Kleines Vorschaubild im DNG',
			fr: 'Petite image d\'aperçu en DNG'
		}
	},
	preview: {
		err: {
			de: 'Fehler bei Vorschau :-(',
			en: 'Error with Preview :-(',
			fr: 'Erreur dans l\'aperçu :-(',
			ja: 'プレビューでのエラー :-('
		},
		rotcw: {
			de: 'im Uhrzeigersinn drehen',
			en: 'Rotate clockwise',
			fr: 'tourner dans le sens des aiguilles d\'une montre',
			ja: '時計回りに回転'
		},
		rotccw: {
			de: 'gegen den Uhrzeigersinn drehen',
			en: 'rotate counterclockwise',
			fr: 'tourner dans le sens inverse des aiguilles d\'une montre',
			ja: '反時計回りに回転'
		},
		rot180: {
			de: 'auf den Kopf',
			en: 'Rotate 180°',
			fr: 'retourné',
			ja: '180°回転'
		},
		rotreset: {
			de: 'Drehung zurücksetzen',
			en: 'Reset',
			fr: 'Réinitialiser la rotation',
			ja: 'リセット',
			tooltip: {
				de: 'Ursprüngliche Bildausrichtung wiederherstellen',
				en: 'Reset original image orientation',
				fr: 'Restaurer l\'orientation originale de l\'image',
				ja: '元の画像の向きにリセット'
			}
		},
		process: {
			de: 'Kopieren/Konvertieren',
			en: 'Copy/Convert',
			fr: 'Copie/Convertir',
			ja: '元の画像の向きにリセット'
		},
		skip: {
			de: 'Überspringen',
			en: 'Skip',
			fr: 'Sauter',
			ja: 'コピー/変換'
		},
		forall: {
			de: 'Für alle weiteren das selbe',
			en: 'Do this for all following',
			fr: 'Faites ceci pour tous les suivants',
			ja: '以下のすべてに対してこれを実行します'
		},
		orients: {
			none: {
				de: 'keine',
				en: 'none',
				fr: 'aucune',
				ja: 'なし'
			},
			upsidedown: {
				de: '180°',
				en: '180°',
				ja: '180°',
				fr: '180°'
			},
			clockwise: {
				de: 'im Uhrzeigersinn',
				en: 'clockwise',
				fr: 'dans le sens des aiguilles d\'une montre',
				ja: '時計回り'
			},
			counterclockwise: {
				de: 'gegen den Uhrzeigersinn',
				en: 'counterclockwise',
				fr: 'dans le sens inverse des aiguilles d\'une montre',
				ja: '反時計回り'
			}
		}
	},
	raw: {
		unknownsize: {
			de: 'Unerkannte RAW-Dateigröße, Entwickler kontaktieren',
			en: 'Unrecognized RAW file size, contact developer',
			fr: 'La taille du fiche RAW ne correspond pas au format connu. Veuillez contacter le développeur',
			ja: '反時計回り'
		},
	},
	selection: {
		got: {
			de: '$$0 Dateien wurden ausgewählt.',
			en: 'Got $$0 files selected.',
			fr: '$$0 dossiers ont été sélectionnés.',
			ja: '$$0 ファイルが選択されました。'
		},
	},
	del: {
		question: {
			en: 'Deleting $$0 file(s) can not be undone! Are you sure you want to continue?',
			de: 'Löschen von $$0 Datei(en) kann nicht rückgängig gemacht werden. Sicher damit weitermachen?',
			fr: 'La suppression de $$0 fiche(s) est irréversible. Es-tu sur de vouloir continuer?',
			ja: '$$0 ファイルを削除すると、元に戻すことはできません。 続行してもよろしいですか?',
			ok: {
				de: 'Ok',
				en: 'Ok',
				fr: 'Ok',
				ja: 'はい'
			},
			cancel: {
				de: 'Abbrechen',
				en: 'Cancel',
				fr: 'Annuler',
				ja: 'キャンセル'
			}
		},
		nostatus: {
			de: 'Der Status des Löschens kann nicht sicher geprüft werden. Bitte laden Sie die Seite nach dem Löschen neu.',
			en: 'The status of the delete can not be checked safely. Reload the page after deleting.',
			fr: 'Le statut de la suppression ne peut pas être vérifié avec certitude. Veuillez recharger la page après la suppression.',
			ja: '削除のステータスを安全に確認することはできません。 削除後はページを再読み込みしてください。'
		},
		reload: {
			de: 'Bitte Seite neu laden.',
			en: 'Please reload page.',
			fr: 'Veuillez recharger la page.',
			ja: 'ページをリロードしてください。'
		}
	},
	node: {
	    backw: {
			   help: {
					   en: [ 'Welcome to imbdng2raw $$0 (BACKWARD!) !', 'Usage: node $$0 [-l lang] [-d dir] [ [--] <files>* ]',
					   'Options:',
					   ' -h - show this help',
					   ' -l XX - where XX is a valid language code (currently: DE, EN, FR, JA)',
					   '         Language can also be set by changing filename to imbdng2raw_XX.js .',
					   ' -d dir - put output files into dir',
					   ' -----',
					   ' -- - treat rest of parameters as local files or dirs',
					   ' <files> - process local files' ],
					   de: [ 'Willkommen bei imbdng2raw $$0 (RÜCKWÄRTS!) !', 'Aufruf: node $$0 [-l sprache] [-d ordner] [ [--] <dateien>* ]',
					   'Optionen:',
						' -h - diesen Hilfetext zeigen',
						' -l XX - wo XX ein gültiger Sprachcode ist (derzeit: DE, EN, FR, JA)',
						'         Die Sprache kann auch durch Umbenennen in imbdng2raw_XX.js geändert werden.',
						' -d ordner - Ausgabedateien in diesen Ordner ablegen',
						' -----',
						' -- - weitere Parameter als lokale Dateien oder Ordner betrachten',
						' <dateien> - lokale Dateien verarbeiten',],
			   }
	    },
		help: {
			en: [ '\u001b[1mWelcome to imbraw2dng\u001b[0m $$0 !', 'Usage: node $$0 \u001b[1m[\u001b[0m-l lang\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-f\u001b[1m | \u001b[0m-r\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-d dir\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-nc \u001b[1m|\u001b[0m -co\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-np\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-cr copyright\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-R\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-J\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-O\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-n yyyy_mm_dd-hh_mm_ss\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-fla \u001b[1m|\u001b[0m -flx\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m \
\u001b[1m[\u001b[0m--\u001b[1m]\u001b[0m \u001b[1m<\u001b[0mfiles-or-dirs\u001b[1m>*\u001b[0m \u001b[1m]\u001b[0m',
				'Options:',
				' \u001b[1m-h\u001b[0m - show this help',
				' \u001b[1m-nc\u001b[0m - do not use coloured text',
				' \u001b[1m-co\u001b[0m - force coloured text',
				' \u001b[1m-l XX\u001b[0m - where XX is a valid language code (currently: DE, EN, FR, JA)',
				'         Language can also be set by changing filename to imbraw2dng_XX.js .',
				' \u001b[1m-d dir\u001b[0m - put output files into dir',
				' \u001b[1m-f\u001b[0m - overwrite existing files',
				' \u001b[1m-r\u001b[0m - rename output file, if already exists',
				' \u001b[1m-np\u001b[0m - Do not add preview thumbnail to DNG',
				' \u001b[1m-cr \'copyright...\'\u001b[0m - add copyright to DNG',
				' \u001b[1m-fla\u001b[0m, \u001b[1m-flx\u001b[0m - add multiple images to fake long exposure, flx scales down',
				' \u001b[1m-R\u001b[0m - get RAW from ImB connected via Wifi or from given directories',
				' \u001b[1m-J\u001b[0m - get JPEG from ImB connected via Wifi or from given directories',
				' \u001b[1m-O\u001b[0m - get non-RAW/non-JPEG from ImB connected via Wifi or from given directories',
				' \u001b[1m-n yyyy_mm_dd-hh_mm_ss\u001b[0m (or prefix of any length) - select only newer than this timestamp from ImB or from given directories',
				' -----',
				' \u001b[1m--\u001b[0m - treat rest of parameters as local files or dirs',
				' <files-or-dirs> - process local files or directories recursively, e.g. on MicroSD from ImB',],
			fr: [ '\u001b[1mBienvenu a imbraw2dng\u001b[0m $$0 !', 'Operation: node $$0 \u001b[1m[\u001b[0m-l lang\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-f\u001b[1m | \u001b[0m-r\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-d repertoire\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-nc \u001b[1m|\u001b[0m -co\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-np\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-cr copyright\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-R\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-J\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-O\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-n yyyy_mm_dd-hh_mm_ss\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-fla \u001b[1m|\u001b[0m -flx\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m \
\u001b[1m[\u001b[0m \u001b[1m[\u001b[0m--\u001b[1m]\u001b[0m \u001b[1m<\u001b[0mfiches-ou-repertoires\u001b[1m>*\u001b[0m \u001b[1m]\u001b[0m',
				'Choix:',
				' \u001b[1m-h\u001b[0m - montrer cette aide',
				' \u001b[1m-nc\u001b[0m - n\'utilisez pas de texte en couleur',
				' \u001b[1m-co\u001b[0m - utilisez de texte en couleur',
				' \u001b[1m-l XX\u001b[0m - quand XX est une code du langue valide (actuellement: DE, EN, FR, JA)',
				'         La langue peut également être définie en changeant le nom du fiche en imbraw2dng_XX.js .',
				' \u001b[1m-d repertoire\u001b[0m - mettre les fiches de sortie dans le répertoire',
				' \u001b[1m-f\u001b[0m - écraser les fiches existants',
				' \u001b[1m-r\u001b[0m - quand fiche existe, renommer le résultat',
				' \u001b[1m-np\u001b[0m - Pas petite image d\'aperçu en DNG',
				' \u001b[1m-cr \'copyright...\'\u001b[0m - add copyright to DNG',
				' \u001b[1m-fla\u001b[0m, \u001b[1m-flx\u001b[0m - add multiple images to fake long exposure, flx scales down',
				' \u001b[1m-R\u001b[0m - obtenez RAW d\'ImB connecté via Wifi ou repertoires donnés',
				' \u001b[1m-J\u001b[0m - obtenez JPEG d\'ImB connecté via Wifi ou repertoires donnés',
				' \u001b[1m-O\u001b[0m - obtenez du non-RAW/non-JPEG d\'ImB connecté via Wifi ou repertoires donnés',
				' \u001b[1m-n yyyy_mm_dd-hh_mm_ss\u001b[0m (ou préfixe de n\'importe quelle longueur) - sélectionnez uniquement plus récent que cet horodatage d\'ImB ou repertoires donnés',
				' -----',
				' \u001b[1m--\u001b[0m - traiter le reste des paramètres comme des fiches ou des répertoires locaux',
			' <fiches-ou-repertoires> - traiter des fiches ou des répertoires locaux de manière récursive, par exemple sur MicroSD d\'ImB',],
			de: [ '\u001b[1mWillkommen bei imbraw2dng\u001b[0m $$0 !', 'Aufruf: node $$0 \u001b[1m[\u001b[0m-l sprache\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-f\u001b[1m | \u001b[0m-r\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-d ordner\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-nc \u001b[1m|\u001b[0m -co\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-np\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-cr copyright\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-R\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-J\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-O\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-n yyyy_mm_dd-hh_mm_ss\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-fla \u001b[1m|\u001b[0m -flx\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m \
\u001b[1m[\u001b[0m \u001b[1m[\u001b[0m--\u001b[1m]\u001b[0m \u001b[1m<\u001b[0mdateien-oder-ordner\u001b[1m>*\u001b[0m \u001b[1m]\u001b[0m',
				'Optionen:',
				' \u001b[1m-h\u001b[0m - diesen Hilfetext zeigen',
				' \u001b[1m-nc\u001b[0m - keinen farbigen Text zeigen',
				' \u001b[1m-co\u001b[0m - farbigen Text zeigen',
				' \u001b[1m-l XX\u001b[0m - wo XX ein gültiger Sprachcode ist (derzeit: DE, EN, FR, JA)',
				'         Die Sprache kann auch durch Umbenennen in imbraw2dng_XX.js geändert werden.',
				' \u001b[1m-d ordner\u001b[0m - Ausgabedateien in diesen Ordner ablegen',
				' \u001b[1m-f\u001b[0m - existierende Dateien überschreiben',
				' \u001b[1m-r\u001b[0m - Ausgabedatei umbenennen, falls schon existiert',
				' \u001b[1m-np\u001b[0m - Kein kleines Vorschaubild im DNG',
				' \u001b[1m-cr \'copyright...\'\u001b[0m - copyright dem DNG hinzufügen',
				' \u001b[1m-fla\u001b[0m, \u001b[1m-flx\u001b[0m - mehrere Bilder als Langzeitbelichtung aufaddieren, flx skaliert dabei herunter',
				' \u001b[1m-R\u001b[0m - RAW von per WLAN verbundener ImB oder übergebenen Verzeichnissen konvertieren',
				' \u001b[1m-J\u001b[0m - JPEG von per WLAN verbundener ImB oder übergebenen Verzeichnissen kopieren',
				' \u001b[1m-O\u001b[0m - Nicht-JPEG/Nicht-RAW von per WLAN verbundener ImB oder übergebenen Verzeichnissen kopieren',
				' \u001b[1m-n yyyy_mm_dd-hh_mm_ss\u001b[0m (oder beliebig langer Anfang davon) - nur Dateien neuer als dieser Zeitstempel von ImB oder übergebenen Verzeichnissen holen',
				' -----',
				' \u001b[1m--\u001b[0m - weitere Parameter als lokale Dateien oder Ordner betrachten',
				' <dateien-oder-ordner> - lokale Dateien oder Ordner rekursiv (z.B. von der MicroSD Karte aus ImB) verarbeiten',],
			ja: [
				'\u001b[1mimbraw2dng へようこそ\u001b[0m $$0 !', 'Usage: node $$0 \u001b[1m[\u001b[0m-l lang\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-f\u001b[1m | \u001b[0m-r\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-d dir\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-nc \u001b[1m|\u001b[0m -co\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-np\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-cr copyright\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-R\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-J\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-O\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-n yyyy_mm_dd-hh_mm_ss\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-fla \u001b[1m|\u001b[0m -flx\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m \
\u001b[1m[\u001b[0m \u001b[1m[\u001b[0m--\u001b[1m]\u001b[0m \u001b[1m<\u001b[0mfiles-or-dirs\u001b[1m>*\u001b[0m \u001b[1m]\u001b[0m',
				'オプション:',
				' \u001b[1m-h\u001b[0m - このヘルプを表示する',
				' \u001b[1m-nc\u001b[0m - 色付きのテキストを使用しない',
				' \u001b[1m-co\u001b[0m - 色付きのテキストを強制',
				' \u001b[1m-l XX\u001b[0m - ここで、XX は有効な言語コードです (現在: DE、EN、FR、JA)',
				'         ファイル名を imbraw2dng_XX.js に変更することで言語を設定することもできます。',
				' \u001b[1m-d dir\u001b[0m - 出力ファイルを dir に置く',
				' \u001b[1m-f\u001b[0m - 現在のファイルを上書きする',
				' \u001b[1m-r\u001b[0m - rename output file, if already exists',
				' \u001b[1m-np\u001b[0m - Do not add preview thumbnail to DNG',
				' \u001b[1m-cr \'copyright...\'\u001b[0m - add copyright to DNG',
				' \u001b[1m-fla\u001b[0m, \u001b[1m-flx\u001b[0m - add multiple images to fake long exposure, flx scales down',
				' \u001b[1m-R\u001b[0m - Wifi経由で接続されたImBまたは指定されたディレクトリからRAWを取得する',
				' \u001b[1m-J\u001b[0m - Wifi経由で接続されたImBまたは指定されたディレクトリからJPEGを取得する',
				' \u001b[1m-O\u001b[0m - Wifi経由で接続されたImBまたは指定されたディレクトリから非RAW/非JPEGを取得する',
				' \u001b[1m-n yyyy_mmdd_hhmmss\u001b[0m (または任意の長さのプレフィックス) - ImB からこのタイムスタンプより新しいもののみを選択する',
				' -----',
				' \u001b[1m--\u001b[0m - 残りのパラメータをローカル ファイルまたはディレクトリとして扱う',
				'<files-or-dirs> と -R/-J/-O/-n は同時に使用できません。'
				]
		},
		unkopt: {
			en: '\u001b[31mUnknown Option:\u001b[0m $$0',
			de: '\u001b[31mUnbekannte Option:\u001b[0m $$0',
			fr: '\u001b[31mOption inconnue:\u001b[0m $$0',
			ja: '\u001b[31m最後のパラメータの値が欠落しています。\u001b[0m'
		},
		missingval: {
			en: '\u001b[31mMissing value for last parameter.\u001b[0m',
			de: '\u001b[31mFehlender Wert für letzten Parameter.\u001b[0m',
			fr: '\u001b[31mValeur manquante pour le dernier paramètre.\u001b[0m',
			ja: '\u001b[31m最後のパラメータの値が欠落しています。\u001b[0m'
		},
		fnwarn: {
			en: '\u001b[31mWarning:\u001b[0m $$0 looks like a timestamp, did you forget \u001b[1m-n\u001b[0m or \u001b[1m--\u001b[0m in front of it?',
			de: '\u001b[31mWarnung:\u001b[0m $$0 sieht wie ein Zeitstempel aus, vielleicht \u001b[1m-n\u001b[0m oder \u001b[1m--\u001b[0m davor vergessen?',
			fr: '\u001b[31mAvertissement:\u001b[0m $$0 ressemble à un horodatage, oubliée \u001b[1m-n\u001b[0m ou \u001b[1m--\u001b[0m?',
			ja: '\u001b[31m警告:\u001b[0m $$0 lタイムスタンプのようですが、 \u001b[1m-n\u001b[0m または \u001b[1m--\u001b[0m 手前にあるのを忘れましたか?'
		},
		renamed: {
			en: '(renamed)',
			de: '(umbenannt)',
			fr: '(renomee)'
		},
		readconfig: {
			en: '\u001b[2mConfig file $$0 read.\u001b[0m',
			de: '\u001b[2mKonfigurationsdatei $$0 eingelesen.\u001b[0m',
		},
		noconfig: {
			de: '\u001b[2mKeine json Konfigurationsdatei gefunden, gesucht: $$0\u001b[0m',
			en: '\u001b[2mNo json config file found, searched: $$0\u001b[0m'
		}
	}
};

// ImBCBase: generic data
mylang = 'en';
withpreview = true;
copyright = '';

// ImBCBase: fake long exposure:
#addimgs = [];
addall = false;
addscaleall = false;
#historystring = '';

/* ImBCBase: For processing several files */
totnum=0;
actnum=0;
stats = { total: 0, skipped: 0, ok: 0, error: 0 };
allfiles = [];

// ImBCBase: from the back itself
imbpics = [];  // found jpegs
rimbpics = []; // found raws
imbmovies = []; // found other
earliestmov = '9999';  // upper/lower bounds of dates for types
latestmov='0000';
earliestjpg='9999';
latestjpg='0000';
earliestraw='9999';
latestraw='0000';

// generic user input timestamp (any prefix)
//           y      y     y     y      .      m     m     .      d      d      .      h     h      .      m     m      .      s     s
static tsregex = /^[02-3]([0-9]([0-9]([0-9](([^0-9])[01]([0-9](([^0-9])[0123]([0-9](([^0-9])[012]([0-9](([^0-9])[0-5]([0-9](([^0-9])[0-5]([0-9])?)?)?)?)?)?)?)?)?)?)?)?)?$/ // actually const
/* ImBCBase: Data for the Imback variants and exif stuff */
// generic imb filename format
//            y    y    y    y     .         m    m     .        d     d      .        h    h      .        m    m      .        s    s            EXT
static fnregex = /^([2-3][0-9][0-9][0-9])([^0-9]?)([01][0-9])([^0-9]?)([0123][0-9])([^0-9]?)([012][0-9])([^0-9]?)([0-6][0-9])([^0-9]?)([0-6][0-9])(.*[.])([^.]*)$/ // actually const
// generic imb filename format, only timestamp
//             y    y    y    y     .         m    m     .        d     d      .        h    h      .        m    m      .        s    s
static fnregexx = /^([2-3][0-9][0-9][0-9])([^0-9]?)([01][0-9])([^0-9]?)([0123][0-9])([^0-9]?)([012][0-9])([^0-9]?)([0-6][0-9])([^0-9]?)([0-6][0-9])/ // actually const
static orients = [ '', 'none', '', 'upsidedown', '', '', 'clockwise', '', 'counterclockwise' ]; // actually const
static oriecw = [ 1, 6, 3, 8 ]; // clockwise indices // actually const
static types = [ "unknown", "ImB35mm", "MF 6x7 ", "MF6x4.5", "MF 6x6 " ]; // all length 7, actually const
static infos = [ // actually const
	{
		size: 14065920,
		w: 4320,
		h: 3256,
		typ: 0,
		mode: "historic"
	},
	{ /* MF 6x7 */
		size: 15925248,
		w: 4608,
		h: 3456,
		typ: 2,
		mode: ""
	},
	{ /* MF 6x4.5 */
		size: 12937632,
		w: 4152, h: 3116,
		typ: 3,
		mode: ""
	},
	{
		size: 9806592,
		w: 3616, h: 2712,
		typ: 3,
		mode: "Medium-angle"
	},
	{
		size: 6470944,
		w: 2936, h: 2204,
		typ: 3,
		mode: "Small-angle"
	},
	{ /* MF 6x6 */
		size: 11943936,
		w: 3456, h: 3456,
		typ: 4,
		mode: ""
	},
	{ /* 35mm */
		size: 15335424,
		w: 4608, h: 3328,
		typ: 1,
		mode: ""
	},
	{
		size: 11618752,
		w: 4012, h: 2896,
		typ: 1,
		mode: "Medium-angle"
	},
	{
		size: 7667520,
		w: 3260, h: 2352,
		typ: 1,
		mode: "Small-angle"
	}
	/* Film ? */
];

/* ImBCBase: debug */
debugflag = false;
useraw = null;

constructor() {
}
/* ImBCBase: primitive basename helper */
static basename(n) {
	while (n.lastIndexOf("/") > -1) {
		n = n.substring(n.lastIndexOf("/") + 1);
	}
	return n;
}
/* ImBCBase: compare timestamp */
comptime(fname, compts) {
	const res = ImBCBase.fnregex.exec(fname);
	if (res === null) {
		this.appmsgxl(false, 'words.warning');
		this.appmsgxl(0, 'onimback.strangename', fname);
		return (compts === '0000');
	} else {
		const ts = res[1] + '_' + res[3] + '_' + res[5] + '-' + res[7] + '_' + res[9] + '_' + res[11];
		if (ts.substring(0, ts.length) >= compts)
			return true;
	}
	return false;
}
/* ImBCBase: translated append to main log */
mappx(nlflag, key, arg0, arg1, arg2, arg3) {
	this.appmsgxl((nlflag === 0) ? undefined : nlflag, key, arg0, arg1, arg2, arg3);
}
/* ImBCBase: remove VT100 color escapes for html or windows */
rmesc(str) {
	if (!document && this.withcolours) return (str);
	let i = 0, j, k;
	while ((j = str.substring(i).indexOf('\u001b')) !== -1) {
		k = str.substring(i+j).indexOf('m');
		if (j !== -1 && k !== -1) {
			str = str.substring(0, i+j) + str.substring(i+j+k+1);
			i += j;
		} else i++;
	}
	return str;
}
/* ImBCBase: get part of translation */
xl0(str, base) {
	if (undefined === base) base = ImBCBase.texts;
	const i = str.indexOf('.');
	if (i === -1) {
		let r = base[str][this.mylang];
		if (undefined === r) r = base[str]['en'];
		if (typeof r === 'string')
			return this.rmesc(r);
		else {
			let res = [];
			for (const e of r)
				res.push(this.rmesc(e));
			return res;
		}
	}
	else {
		const e = base[str.substring(0,i)];
		return this.xl0(str.substring(i+1),e);
	}
}
/* ImBCBase: substitute in translation */
subst(r, arg0, arg1, arg2, arg3, base) {
	if (r.indexOf('$$0') !== -1 && arg0 !== undefined) {
		r = r.substring(0, r.indexOf('$$0')) + arg0 + r.substring(r.indexOf('$$0') + 3);
		if (r.indexOf('$$1') !== -1 && arg1 !== undefined) {
			r = r.substring(0, r.indexOf('$$1')) + arg1 + r.substring(r.indexOf('$$1') + 3);
			if (r.indexOf('$$2') !== -1 && arg2 !== undefined) {
				r = r.substring(0, r.indexOf('$$2')) + arg2 + r.substring(r.indexOf('$$2') + 3);
				if (r.indexOf('$$3') !== -1 && arg3 !== undefined) {
					r = r.substring(0, r.indexOf('$$3')) + arg3 + r.substring(r.indexOf('$$3') + 3);
				}
			}
		}
	}
	return this.rmesc(r);
}
/* ImBCBase: translate one string with parameters */
xl(str, arg0, arg1, arg2, arg3, base) {
	// console.log(' XL ' + str + ' - ' + base + ' - ' + arg0 + ' - ' + arg1);
	if (undefined === base) base = ImBCBase.texts;
	if (this.mylang === '00') {
		let res = '[' + str;
		if (undefined !== arg0) {
			res += ',' + arg0;
			if (undefined !== arg1) {
				res += ',' + arg1;
				if (undefined !== arg2) {
					res += ',' + arg2;
					if (undefined !== arg3) {
						res += ',' + arg3;
					}
				}
			}
		}
		return (res + ']');
	}
	const i = str.indexOf('.');
	if (i === -1) {
		let r = base[str][this.mylang];
		if (undefined === r) r = base[str]['en'];
		return this.rmesc(this.subst(r, arg0, arg1, arg2, arg3));
	}
	else {
		const e = base[str.substring(0,i)];
		return this.xl(str.substring(i+1), arg0, arg1, arg2, arg3, e);
	}
}
/* ImBCBase: find language from filename or nodejs scriptfile */
querylang(name, offset) {
	if (undefined === offset) offset = 8;
	let found = 0;
	for (const l of ImBCBase.alllangs) {
		if (name.substring(name.length - offset, name.length - offset + 4).toUpperCase() === ('_' + l.toUpperCase() + '.')) {
			this.mylang = l;
			if ('00' === l) {
				this.debugflag = true;
				if (document) { // translation output into browser log
					for (const el of Object.keys(ImBCBase.texts))
						this.prxl(el, ImBCBase.texts[el]);
					document.getElementById('langsel').innerHTML += '<option value="00" onclick="imbc.setlang()">00</option></select>';
				}
			}
			if (document) {
				document.getElementById('langsel').value = l;
			}
			found = 1;
			break;
		}
	}
	if (!found) {
		if (name.substring(name.length - offset, name.length - offset+1) === '_') console.log('Unknown language: ' + name.substring(name.length - offset+1).substring(0,2));
	}
	// followed by xlall anyway
}
/* ImBCBase: debug: print translations for csv */
prxl(key, el) {
	if (el['de'] && el['en']) {
		try{
		if (typeof el['de'] === 'string') {
			let out = key + ';';
			for (const l of ImBCBase.alllangs) {
				if (undefined !== el[l]) {
					let a = el[l];
					let b = '"';
					if (-1 !== a.indexOf('"')) b = '\'';
					out += b + a  + b + ';';
				} else out += ';'
			}
			console.log(out);
		}
		else if (typeof el['de'][0] === 'string') {
			for (let i=0; i< el['de'].length; i++) {
				let out = key + '[' + i + '];';
				for (const l of ImBCBase.alllangs) {
					if (undefined !== el[l] && undefined !== el[l][i]) {
						let a = el[l][i];
						let b = '"';
						if (-1 !== a.indexOf('"')) b = '\'';
						out += b + a  + b + ';';
					} else out += ';';
				}
				console.log(out);
			}
		}
		} catch (e) { if (!document) require('process').exit(); }
	}
	for (const ne of Object.keys(el).filter((k) => ((k !== 'en') && (k !== 'de') && (typeof(el[k]) !== 'string')))) {
		this.prxl(key + '.' + ne, el[ne]);
	}
}
/* ImBCBase: language helper */
findlang(i) {
	let found = 0, langchg = false;
	for (const l of ImBCBase.alllangs) {
		if (i.toUpperCase() === l.toUpperCase()) {
			if (this.mylang !== l) langchg = true;
			this.mylang = l;
			found = 1;
			break;
		}
	}
	if (!found) {
		if (this.mylang !== 'en') langchg = true;
		this.mylang = 'en';
		console.log('Unknown language(2): ' + i);
	}
	else if ('00' === this.mylang)
		this.debugflag = true;
	return this.mylang;
}
/* ImBCBase: actual processing function for one file */
handleone(orientation, fromloop) {
	const f = (this.debugflag && this.useraw) ? this.useraw : this.allfiles[this.actnum];
	if (undefined === f) {
		this.mappx(true, 'process.nothing');
		return this.handlenext(fromloop);
	}
	if (undefined === f.size) {
		setTimeout(() => {
		  this.resolver(f, (url, fx, rot) => {
				this.allfiles[this.actnum] = fx;
				this.handleone(rot ? rot: orientation, fromloop);
			}, (url) => {
				this.mappx(false, 'words.sorryerr');
				this.mappx(true, 'process.erraccess', url);
				this.stats.error ++;
				this.handlenext(fromloop);
		  });
		});
		return;
	}
	let rawname = ImBCBase.basename(f.name);
	if (rawname.substring(rawname.length - 4).toUpperCase() !== '.RAW') {
		const reader = f.imbackextension ? f : new FileReader();
		reader.onload = (evt) => {
			if (this.totnum > 1) {
				this.appmsg("[" + (1 + this.actnum) + " / " + this.totnum + "] ", false);
			}
			this.mappx(0, 'process.notraw',rawname);
			const contents = evt.target.result;
			const view = new DataView(contents);
			const out = new Uint8Array(f.size);
			for (let j=0; j<contents.byteLength; j++) {
				out[j] = view.getUint8(j);
			}
			this.writefile(rawname, 'application/octet-stream', 'process.copyok' + (this.checkdlfolder ? 'checkdl' : ''), out, fromloop);
		}
		reader.onerror = (evt) => {
			console.log('Non-RAW process reader error for ' + f.name + ' ' + JSON.stringify(evt));
			this.mappx(false, 'words.sorryerr');
			this.mappx(true, 'process.errorreadingfile', f.name);
			this.stats.error++;
			this.handlenext(fromloop);
		}
		reader.readAsArrayBuffer(f);
		return;
	}
	let w, h, mode = "??";
	let typ = 0;
	const zz = ImBCBase.infos.findIndex((v, i, o) => v.size === f.size);
	if (zz === -1) {
		if (this.totnum > 1) {
			this.appmsg("[" + (1 + this.actnum) + " / " + this.totnum + "] ", false);
		}
		this.appmsg('[' + f.name + '] ', false);
		this.mappx(false, 'words.sorry');
		this.mappx(0, 'process.unknownsize', f.size);
		const reader = f.imbackextension ? f : new FileReader();
		reader.onload = (evt) => {
			const contents = evt.target.result;
			const view = new DataView(contents);
			const out = new Uint8Array(f.size);
			for (let j=0; j<view.byteLength; j++) {
				out[j] = view.getUint8(j);
			}
			this.writefile(rawname, 'application/octet-stream', 'process.copyok' + (this.checkdlfolder ? 'checkdl' : ''), out, fromloop);
		}
		reader.onerror = (evt) => {
			console.log('Unk-RAW process reader error for ' + f.name + ' ' + JSON.stringify(evt));
			this.mappx(false, 'words.sorryerr');
			this.mappx(true, 'process.errorreadingfile', f.name);
			this.stats.error++;
			this.handlenext(fromloop);
		}
		reader.readAsArrayBuffer(f);
		return;
	} else {
		w = ImBCBase.infos[zz].w;
		h = ImBCBase.infos[zz].h;
		mode = ImBCBase.infos[zz].mode;
		if (mode.length !== 0) mode += ' ';
		mode += '(' + w + ' x ' + h + ')';
		typ = ImBCBase.infos[zz].typ;
	}
	const rawnamearr = new TextEncoder().encode(rawname);
	let datestr="", dateok = false;
	/*// date?
	if (undefined !== f.datestr) {
		datestr = f.datestr;
		dateok = true;
	}*/
	let res = ImBCBase.fnregexx.exec(rawname);
	if (res !== null && !dateok) {
		const yr = Number.parseInt(res[1]);
		const mon = Number.parseInt(res[3]);
		const day = Number.parseInt(res[5]);
		const hr = Number.parseInt(res[7]);
		const min = Number.parseInt(res[9]);
		const sec = Number.parseInt(res[11]);
		datestr = "" + yr + ":" + ((mon < 10) ? "0":"") + mon + ":" + ((day < 10) ? "0":"") + day + " "+
			((hr < 10) ? "0":"") + hr + ":" + ((min < 10) ? "0":"") + min + ":" + ((sec < 10) ? "0":"") + sec;
		dateok = true;
	}

	const reader = f.imbackextension ? f : new FileReader();
	reader.onload = (evt) => {
		if (this.totnum > 1) {
			this.appmsg("[" + (1 + this.actnum) + " / " + this.totnum + "] ", false);
		}
		const contents = evt.target.result;
		const view = new DataView(contents);
		if (this.addall) {
			if (this.#addimgs.length === 0 && this.addscaleall)
				this.#historystring='(';
			else if (this.#addimgs.length === 0)
				this.#historystring='';
			this.#addimgs.push(view);
			this.mappx(0, 'main.fakelong.added', rawname);
			if (this.#historystring.length < 2)
				this.#historystring += rawname;
			else
				this.#historystring += ('+' + rawname);
			if (this.actnum === this.totnum - 1) {
				this.appmsg('', true);
				let npic = this.#addimgs.length;
				for (let j=0; j < w*h; j++) {
					let res = 0;
					for (const k of this.#addimgs) {
						try {
							res += k.getUint8(j);
						} catch (e) { }
					}
					if (this.addscaleall) {
						res = Math.floor(res / npic);
					}
					if (res > 255) {
						view.setUint8(j, 255);
					}
					else view.setUint8(j, res);
				}
				if (this.addscaleall) {
					this.#historystring += (')/' + npic);
				}
				this.#addimgs = [];
			}
			else {
				return this.handlenext(fromloop);
			}
		}
		this.mappx(0, 'process.processing', rawname);
		this.mappx(0, 'process.assuming', ImBCBase.types[typ], mode);
		if (dateok) {
			this.mappx(0, 'process.datetime', datestr);
		}
		let ori = orientation ? orientation : 1;
		let transp = false;
		if (ori !== 1) {
			this.mappx(0, 'process.orientation', this.xl0('preview.orients.' + ImBCBase.orients[ori]));
			if (ori === 6 || ori === 8) transp = true;
		}
		/* Here comes the actual building of the DNG */
		let ti = new TIFFOut();
		ti.addIfd(); /* **************************************** */
		if (this.withpreview) {
			this.mappx(0, 'process.addpreview');
			/* **** PREVIEW image **** */
			let scale = 32;
			if (w <= 4096 && h <= 4096) scale=16;
			ti.addImageStrip(1, ImBCBase.buildpvarray(view, typ, w, h, ori, scale), Math.floor(transp ? (h+scale-1)/scale:(w+scale-1)/scale), Math.floor(transp ? (w+scale-1)/scale: (h+scale-1)/scale));
			ti.addEntry(258 , 'SHORT', [ 8, 8, 8 ]); /* BitsPerSample */
			ti.addEntry(259 , 'SHORT', [ 1 ]); /* Compression - none */
			ti.addEntry(262, 'SHORT', [ 2 ]); /* Photometric - RGB */
			ti.addEntry(277, 'SHORT', [ 3 ]); /* Samples per Pixel */
			ti.addEntry(284, 'SHORT', [ 1 ]); /* Planar config - chunky */
			ti.addEntry(282, 'RATIONAL', [ 30, 1 ]); /* X resolution */
			ti.addEntry(283, 'RATIONAL', [ 30, 1 ]); /* y resolution */
		}
		ti.addEntry(271, 'ASCII', 'ImBack'); /* Make */
		ti.addEntry(50708, 'ASCII', 'ImBack' + ' ' + ImBCBase.types[typ]); /* Unique model */
		ti.addEntry(272, 'ASCII', ImBCBase.types[typ]); /* Model */
		ti.addEntry(274, 'SHORT', [ ori ]); /* Orientation */
		ti.addEntry(305, 'ASCII', 'imbraw2dng ' + ImBCBase.version); /* SW and version */
		if (this.#historystring.length)
			ti.addEntry(37395, 'ASCII', this.#historystring); /* image history */
		this.#historystring = '';
		if (dateok) {
			ti.addEntry(306, 'ASCII', datestr); /* datetime */
			ti.addEntry(36867, 'ASCII', datestr); /* Original date time */
		}
		ti.addEntry(50706, 'BYTE', [ 1, 2, 0, 0 ]); /* DNG Version */
		if (this.copyright != '') {
			// do UTF-8 bytes instead of ASCII
			let bytes = new TextEncoder().encode(this.copyright);
			ti.addEntry(33432, 'BYTE', bytes); /* copyright */
		}
		ti.addEntry(50707, 'BYTE', [ 1, 2, 0, 0 ]); /* DNG Backward Version */
		ti.addEntry(50717, 'LONG', [ 255 ]); /* White level */
		/* **** TODOs: **** */
		ti.addEntry(50721, 'SRATIONAL', [ 19624, 10000, -6105, 10000, -34134, 100000, -97877, 100000, 191614, 100000, 3345, 100000, 28687, 1000000, -14068, 100000, 1348676, 1000000 ]); /* Color Matrix 1 */
		ti.addEntry(50964, 'SRATIONAL', [ 7161, 10000, 10093, 100000, 14719, 100000, 25819, 100000, 72494, 100000, 16875, 1000000, 0, 1000000, 5178, 100000, 77342, 100000 ]); /* Forward Matrix 1 */
		ti.addEntry(50778, 'SHORT', [ 23 ]); /* Calibration Illuminant 1 - D50 */
		ti.addEntry(50728, 'RATIONAL', [ 6, 10, 1, 1, 6, 10 ]); /* As shot neutral */
		ti.addEntry(50827, 'BYTE', rawnamearr); /* Raw file name */
		ti.addEntry(50932, 'ASCII', 'Generic ImB conv profile Sig'); /* Profile calibration signature */
		ti.addEntry(50931, 'ASCII', 'Generic ImB conv profile Sig'); /* Camera calibration signature */
		//ti.addEntry(50936, 'ASCII', 'Generic ImB neutral'); /* Camera calibration name */
		if (this.withpreview) {
			ti.addEntry(50971, 'ASCII', new Date(Date.now()).toISOString() ); /* Preview date time */
			ti.addSubIfd(); /* **************************************** */
		}
		/* **** RAW image **** */
		ti.addImageStrip(0, view, w, h);
		ti.addEntry(258 , 'SHORT', [ 8 ]); /* BitsPerSample */
		ti.addEntry(259 , 'SHORT', [ 1 ]); /* Compression - none */
		ti.addEntry(262, 'SHORT', [ 0x8023 ]); /* Photometric - CFA */
		ti.addEntry(277, 'SHORT', [ 1 ]); /* Samples per Pixel */
		ti.addEntry(284, 'SHORT', [ 1 ]); /* Planar config - chunky */
		ti.addEntry(33421, 'SHORT', [ 2, 2 ]); /* CFA Repeat Pattern Dim */
		ti.addEntry(33422, 'BYTE', (typ > 1) ? [ 2, 1, 1, 0 ] : [ 1, 0, 2, 1 ]); /* CFA Pattern dep. on MF/35mm*/
		//ti.createCamProf('Generic ImB darker'); /* **************************************** */
		//ti.addEntry(50941, 'LONG', [ 3 ]); /* profile embed policy */
		//ti.addEntry(50932, 'ASCII', 'Generic ImB conv profile Sig'); /* Profile calibration signature */
		//ti.createCamProf('Generic ImB brighter');
		//ti.addEntry(50941, 'LONG', [ 3 ]); /* profile embed policy */
		//ti.addEntry(50932, 'ASCII', 'Generic ImB conv profile Sig'); /* Profile calibration signature */
		this.writefile(rawname.substring(0, rawname.length - 3) + 'dng', 'image/x-adobe-dng', 'process.converted' + (this.checkdlfolder ? 'checkdl' : ''), ti.getData(), fromloop);
	};
	reader.onerror = (evt) => {
		console.log('Unk-RAW process reader error for ' + f.name + ' ' + JSON.stringify(evt));
		this.mappx(false, 'words.sorryerr');
		this.mappx(true, 'process.errorreadingfile', f.name);
		this.stats.error++;
		this.handlenext(fromloop);
	};
	reader.readAsArrayBuffer(f);
}
/* ImBCBase: get one downsampled median image value [ r g b ] */
static getPix(x, y, w, view, typ) {
	let outrgb = [];
	let reds = [];
	if (typ > 1) {
		reds.push(view.getUint8((y+1)*w + x + 1));
		reds.push(view.getUint8((y+1)*w + x + 3));
		reds.push(view.getUint8((y+1)*w + x + 2*w + 1));
		reds.push(view.getUint8((y+1)*w + x + 2*w + 3));
	} else {
		reds.push(view.getUint8(y*w + x + 1));
		reds.push(view.getUint8(y*w + x + 3));
		reds.push(view.getUint8(y*w + x + 2*w + 1));
		reds.push(view.getUint8(y*w + x + 2*w + 3));
	}
	reds.sort(function(a,b) { return a - b; });
	// median of red pixels
	outrgb.push((reds[1] + reds[2]) / 2.0);
	let greens = [];
	if (typ > 1) {
		greens.push(view.getUint8(y*w + x + 1));
		greens.push(view.getUint8(y*w + x + w));
		greens.push(view.getUint8(y*w + x + 3));
		greens.push(view.getUint8(y*w + x + 2 + w));
		greens.push(view.getUint8(y*w + x + 2*w + 1));
		greens.push(view.getUint8(y*w + x + 3*w));
		greens.push(view.getUint8(y*w + x + 2*w + 3));
		greens.push(view.getUint8(y*w + x + 3*w + 2));
	} else {
		greens.push(view.getUint8(y*w + x));
		greens.push(view.getUint8(y*w + x + w + 1));
		greens.push(view.getUint8(y*w + x + 2));
		greens.push(view.getUint8(y*w + x + 3 + w));
		greens.push(view.getUint8(y*w + x + 2*w));
		greens.push(view.getUint8(y*w + x + 3*w +1));
		greens.push(view.getUint8(y*w + x + 2*w + 2));
		greens.push(view.getUint8(y*w + x + 3*w + 3));
	}
	greens.sort(function(a,b) { return a - b; });
	outrgb.push((greens[3] + greens[4]) / 2.0);
	let blues = [];
	if (typ > 1) {
		blues.push(view.getUint8(y*w + x));
		blues.push(view.getUint8(y*w + x + 2));
		blues.push(view.getUint8(y*w + x + 2*w));
		blues.push(view.getUint8(y*w + x + 2*w + 2));
	} else {
		blues.push(view.getUint8((y+1)*w + x));
		blues.push(view.getUint8((y+1)*w + x + 2));
		blues.push(view.getUint8((y+1)*w + x + 2*w));
		blues.push(view.getUint8((y+1)*w + x + 2*w + 2));
	}
	blues.sort(function(a,b) { return a - b; });
	outrgb.push((blues[1] + blues[2]) / 2.0);
	return outrgb;
}
/* ImBCBase: build preview in array */
static buildpvarray(view, typ, w, h, orientation, scale) {
	const sfact = scale ? scale : 8;
	const w8 = Math.floor((w+(sfact -1))/sfact) - (scale ? 0 : 1);
	const h8 = Math.floor((h+(sfact -1))/sfact) - (scale ? 0 : 1);
	let minred=255, minblue = 255, mingreen = 255, maxred = 0, maxblue = 0, maxgreen = 0, allmin = 255, allmax = 0;
	let outpix = [];
	let rowiterstart, rowiterend;
	let coliterstart, coliterend;
	let transpose = false;
	if (orientation === 3) {
		rowiterstart = -1*(h8 -1);
		rowiterend = 1;
		coliterstart = -1*(w8 - 1);
		coliterend = 1;
	} else if (orientation === 6) {
		transpose = true;
		rowiterstart = 0;
		rowiterend = w8;
		coliterstart = -1*(h8 - 1);
		coliterend = 1;
	} else if (orientation === 8) {
		transpose = true;
		rowiterstart = -1*(w8 -1);
		rowiterend = 1;
		coliterstart = 0;
		coliterend = h8;
	} else {
		rowiterstart = 0;
		rowiterend = h8;
		coliterstart = 0;
		coliterend = w8;
	}
	for (let i = rowiterstart; i < rowiterend; i +=1) {
		for (let j = coliterstart; j < coliterend; j+=1) {
			let a = ImBCBase.getPix(Math.abs(transpose ? i :j)*sfact, Math.abs(transpose ? j :i)*sfact, w, view, typ);
			outpix.push(a[0]);
			if (a[0] > maxred) maxred = a[0];
			if (a[0] < minred) minred = a[0];
			if (a[0] > allmax) allmax = a[0];
			if (a[0] < allmin) allmin = a[0];
			outpix.push(a[1]);
			if (a[1] > maxgreen) maxgreen = a[1];
			if (a[1] < mingreen) mingreen = a[1];
			if (0.6*a[1] > allmax) allmax = a[1] * 0.6;
			if (0.6*a[1] < allmin) allmin = a[1] * 0.6;
			outpix.push(a[2]);
			if (a[2] > maxblue) maxblue = a[2];
			if (a[2] < minblue) minblue = a[2];
			if (a[2] > allmax) allmax = a[2];
			if (a[2] < allmin) allmin = a[2];
			if (!scale) outpix.push(255);
		}
	}
	const fact = 255 / (allmax - allmin);
	const o = scale ? 3 : 4;
	for (let i = 0; i < h8; i++) {
		for (let j=0; j< w8; j++) {
			if ((outpix[o*((i * w8) + j)] > 250) &&
				(outpix[o*((i * w8) + j) + 2] > 250) &&
				(outpix[o*((i * w8) + j) + 1] > 0.6 * 250))
			{
				outpix[o*((i*w8) + j) + 1] = 255;
			} else {
				// maybe some brightening gamma?
				const r = (fact * (outpix[o * ((i*w8) + j)] - allmin));
				outpix[o * ((i*w8) + j)] = 255-Math.round(255*((255-r)/255)*((255-r)/255));
				const g = (fact * 0.6 * (outpix[o * ((i*w8) + j) + 1] - allmin* 0.6));
				outpix[o * ((i*w8) + j) + 1] = 255-Math.round(255*((255-g)/255)*((255-g)/255));
				const b = (fact * (outpix[o * ((i*w8) + j) + 2] - allmin));
				outpix[o * ((i*w8) + j) + 2] = 255-Math.round(255*((255-b)/255)*((255-b)/255));
			}
		}
	}
	return outpix;
}
/* ImBCBase: handle one entry from imb PHOTO/MOVIE listing page */
handle1imb(url) {
	let rawname = ImBCBase.basename(url);
	if (rawname.substring(0,10).toUpperCase() === 'IMBRAW2DNG') return;
	let timestx = ImBCBase.fnregex.exec(rawname);
	let timest = null, cl = '9999_99_99-99';
	if (null !== timestx) {
		timest = timestx[1] + '_' + timestx[3] + '_' + timestx[5] + '-' + timestx[7] + '_' + timestx[9] + '_' + timestx[11];
		cl = timestx[1] + '_' + timestx[3] + '_' + timestx[5] + '-' + timestx[7];
	} else {
		this.mappx(false, 'words.warning');
		this.mappx(true, 'onimback.strangename', rawname);
	}
	if (rawname.substring(rawname.length -4).toUpperCase() === '.RAW') {
		if (null !== timest) {
			if (timest < this.earliestraw) this.earliestraw = timest;
			if (timest > this.latestraw) this.latestraw = timest;
		}
		this.rimbpics.push(url);
		if (this.imbeles && this.typedclasses) {
			this.imbeles.push({
					type: 'RAW',
					url: url,
					raw: rawname,
					ts: cl,
					selected: false,
					preview: null,
					entry: null,
					waiting: false,
					error: false,
					processed: false
			});
			if (this.untypedclasses.findIndex((v, i, o) => v === cl) === -1)
				this.untypedclasses.push(cl);
			if (this.typedclasses.findIndex((v, i, o) => v === ('RAW' + cl)) === -1)
				this.typedclasses.push('RAW' + cl);
		}
	}
	else if (rawname.substring(rawname.length -4).toUpperCase() === '.JPG') {
		if (null !== timest) {
			if (timest < this.earliestjpg) this.earliestjpg = timest;
			if (timest > this.latestjpg) this.latestjpg = timest;
		}
		this.imbpics.push(url);
		if (this.imbeles && this.typedclasses) {
			this.imbeles.push({
					type: 'JPG',
					url: url,
					raw: rawname,
					ts: cl,
					selected: false,
					preview: null,
					entry: null,
					waiting: false,
					error: false,
					processed: false
			});
			if (this.untypedclasses.findIndex((v, i, o) => v === cl) === -1)
				this.untypedclasses.push(cl);
			if (this.typedclasses.findIndex((v, i, o) => v === ('JPG' + cl)) === -1)
				this.typedclasses.push('JPG' + cl);
		}
	}
	else {
		if (null !== timest) {
			if (timest < this.earliestmov) this.earliestmov = timest;
			if (timest > this.latestmov) this.latestmov = timest;
		}
		this.imbmovies.push(url);
		if (this.imbeles && this.typedclasses) {
			this.imbeles.push({
					type: 'oth',
					url: url,
					raw: rawname,
					ts: cl,
					selected: false,
					preview: null,
					entry: null,
					waiting: false,
					error: false,
					processed: false
			});
			if (this.untypedclasses.findIndex((v, i, o) => v === cl) === -1)
				this.untypedclasses.push(cl);
			if (this.typedclasses.findIndex((v, i, o) => v === ('oth' + cl)) === -1)
				this.typedclasses.push('oth' + cl);
		}
	}
}
/* Indentation in - end of class ImBCBase */
}
/* *************************************** Main class E N D *************************************** */
/* *************************************** Node js helper class *************************************** */
class ImBCNodeOut extends ImBCBase {
/* Indentation out */
// generic data
outdir = '.';
renamefiles = false;
withcolors = true;
ovwout = false;
typeflags = 0;
fromts = '0000';
ptypeflags = 0; // from preferences
// tried configfiles
#configfiles = [ './.imbraw2dng.json' ];
// string buffer for concatenating one line of output
#strbuff = '';
constructor() {
	super();
	this.fs = require('fs');
	this.ht = require('http');
	this.pa = require('path');
	if (process.platform.substring(0,3) === 'win') this.withcolours = false;
	if (process.stdout.isTTY !== true) this.withcolours = false;
}

/* ImBCNodeOut: output one thing via nodejs */
writefile(name, type, okmsg, arr1, fromloop, renameidx) {
	let outfile;
	if (this.outdir.length > 0 && this.outdir.substring(this.outdir.length - 1) !== this.pa.sep)
		outfile = this.outdir + this.pa.sep + name;
	else
		outfile = this.outdir + name;

	this.fs.writeFile(outfile, arr1, {encoding: null, flush: true, flag: this.ovwout ? 'w' : 'wx' }, (err) => {
			if (err) {
				if (err.errno === -17 && this.renamefiles) {
					// try renaming
					if (undefined !== renameidx) {
						let newname = name;
						const ldot = name.lastIndexOf('.');
						const lunder = name.lastIndexOf('_');
						newname = name.substring(0, lunder) + '_';
						if (renameidx < 100) newname += '0';
						if (renameidx < 10) newname += '0';
						newname += renameidx;
						newname += '.' + name.substring(ldot + 1);
						this.writefile(newname, type, okmsg, arr1, fromloop, renameidx + 1);
					}
					else {
						let newname = name;
						const ldot = name.lastIndexOf('.');
						newname = name.substring(0, ldot) + '_001.' + name.substring(ldot + 1);
						this.writefile(newname, type, okmsg, arr1, fromloop, 2);
					}
					return;
				}
				this.appmsgxl(0, 'process.errsave', outfile);
				this.appmsg(JSON.stringify(err), true);
				this.stats.error++;
				this.handlenext(fromloop);
			}
			else {
				this.appmsgxl(0, okmsg, outfile);
				if (undefined !== renameidx) this.appmsgxl(true, 'node.renamed');
				else this.appmsg('');
				this.stats.ok++;
				this.handlenext(fromloop);
			}
	});
}
/* ImBCNodeOut: message output function */
appmsg(msg, opt) {
	if (opt === false)
		this.#strbuff = this.#strbuff + msg;
	else {
		console.log(this.rmesc(this.#strbuff + msg));
		this.#strbuff = '';
	}
	if (opt === true) console.log('');
}
/* ImBCNodeOut: output function to main log */
appmsgxl(opt, msg, arg0, arg1, arg2, arg3) {
	this.appmsg(this.xl(msg, arg0, arg1, arg2, arg3), opt);
}
/* ImBCNodeOut: nodejs: handle given files/dirs recursive */
handlerecurse(already, index) {
	if (!already) {
		// initializsation
		already = [];
		index = 0;
		this.stats.total = 0;
		this.totnum = 0;
	}
	const d = this.allfiles[index];
	if (undefined === d) {
		// beyond end of allfiles, finished recursion
		this.allfiles = already;
		this.stats.total = this.totnum = already.length;
		if (this.totnum > 0) this.handleonex();
		else this.appmsgxl(true, 'onimback.nomatch');
		return;
	}
	this.fs.stat(d, (err, stat) => {
		if (err) {
			this.mappx(false, 'words.sorryerr');
			this.mappx(1, 'process.erraccess', d);
			console.log(JSON.stringify(err));
			console.log('');
		}
		else if (stat.isDirectory()) {
			// recurse into
			this.fs.readdir(d, { withFileTypes: true, recursive: true }, (err2, f) => {
				if (err2) {
					this.mappx(false, 'words.sorryerr');
					this.mappx(1, 'process.erraccess', d);
					console.log(JSON.stringify(err2));
				}
				else for (let i of f.filter(e => e.isFile())) {
					const n = i.name;
					if (n.substring(0,10).toUpperCase() === 'IMBRAW2DNG') continue;
					if (((n.substring(n.length -4).toUpperCase() === '.RAW') && (this.typeflags % 2)) ||
						((n.substring(n.length -5).toUpperCase() === '.JPEG' || n.substring(n.length -4).toUpperCase() === '.JPG') && ((this.typeflags % 4) > 1)) ||
						(n.substring(n.length -5).toUpperCase() !== '.JPEG' && n.substring(n.length -4).toUpperCase() !== '.JPG' &&
							n.substring(n.length -4).toUpperCase() !== '.RAW' && ((this.typeflags % 8) > 3))) {
						if (this.comptime(i.name, this.fromts))
							already.push(i.path + this.pa.sep + i.name);
					}
					//console.log(i);
				}
			});
		}
		else {
			// plain files simply go
			already.push(d);
		}
		this.handlerecurse(already, index + 1);
	});
}
/* ImBCNodeOut: nodejs: file/filereader like interface for node js */
resolver(url, onok, onerr) {
	if (url.url) {
		let e = url;
		url = e.url;
	}
	let fx = {
		imbackextension: true,
		name: url
	};
	if (url.startsWith('http://')) {
		// http to imback
		this.ht.get(url, (res) => {
			let err = false;
			if (res.statusCode !== 200) {
				err = true;
				console.log(this.xl('onimback.errconnect', '192.168.1.254'));
				console.log('Status: ' + res.statusCode + ' Type: ' + res.headers['content-type']);
				res.resume();
				return onerr(url, fx);
			}
			let c = 0;
			let b = new ArrayBuffer(res.headers['content-length']);
			let a = new Uint8Array(b);
			res.on('data', (chunk) => {
				a.set(chunk, c);
				c += chunk.length;
			});
			res.on('end', () => {
				fx.size = c;
				fx.data = b;
				fx.readAsArrayBuffer = (fy) => {
					fy.onload({
							target: { result: fy.data }
					});
				};
				setTimeout(() => {
					onok(url, fx);
				});
			});
		}).on('error', (e) => {
			console.log(this.xl('onimback.errconnect', '192.168.1.254'));
			console.log(JSON.stringify(e));
			onerr(url, fx);
		});
	}
	else {
		// read local (or cifs/nfs...) file
		let ab = new ArrayBuffer(20000000);
		let ua = new Uint8Array(ab);
		let len = 0;
		const str = this.fs.createReadStream(url, { highWaterMark: 20*1024*1024 });
		str.on('error', () => onerr(url,fx));
		str.on('data', (chunk) =>  {
			ua.set(chunk, len);
			len += chunk.length;
			fx.size = len;
			fx.data = ab.slice(0, len);
			fx.readAsArrayBuffer = (fy) => {
				fy.onload({
						target: { result: fy.data }
				});
			};
			setTimeout(() => {
					str.close();
					onok(url, fx);
			});
		});
	}
}
/* ImBCNodeOut: main handler function for one file */
handleonex() {
	const f = (this.debugflag && this.useraw) ? this.useraw : this.allfiles[this.actnum];
	this.currentrot = 1;
	if (this.imbcb)
		this.imbcb.handleone();
	else
		this.handleone(f.rot);
}
/* ImBCNodeOut: handle the normal selection from imback (do it button), also for nodejs */
imbdoit() {
	if (this.actnum !== this.allfiles.length) return;
	let selecteds = [];
	let compval = '0000';
	compval = this.fromts;
	if (this.typeflags % 2) {
		for (const e of this.rimbpics) {
			let rawname = basename(e);
			if (this.comptime(rawname, compval))
				selecteds.push(e);
		}
	}
	if ((this.typeflags % 4) > 1) {
		for (const e of this.imbpics) {
			let rawname = ImBCBase.basename(e);
			if (this.comptime(rawname, compval))
				selecteds.push(e);
		}
	}
	if ((this.typeflags % 8) > 3) {
		for (const e of this.imbmovies) {
			let rawname = ImBCBase.basename(e);
			if (this.comptime(rawname, compval))
				selecteds.push(e);
		}
	}
	selecteds.sort((a, b) => {
		let ra = ImBCBase.basename(a);
		let rb = ImBCBase.basename(b);
		if (ra < rb) return -1;
		else if (ra === rb) return 0;
		else return 1;
	});
    this.stepmode = 0;
	this.totnum = selecteds.length;
	this.stats = { total: this.totnum, skipped: 0, error: 0, ok: 0 };
	this.actnum = 0;
	this.allfiles = selecteds;
	this.mappx(true, 'process.frombackn', this.totnum);
	if (this.totnum > 0) this.handleonex();
	else this.mappx(true, 'onimback.nomatch');
}
/* ImBCNodeOut: nodejs: read config */
readconfig(callback, tryno) {
	let xch, dotflag;
	if (undefined === tryno) {
		xch = '.';
		dotflag = true;
	}
	else if (1 === tryno && process.env.HOME) {
		xch = process.env.HOME + this.pa.sep + '.config';
		dotflag = false;
		this.#configfiles.push(process.env.HOME + this.pa.sep + '.config' + this.pa.sep + 'imbraw2dng.json');
	}
	else if (2 === tryno && process.env.XDG_CONFIG_HOME) {
		xch = process.env.XDG_CONFIG_HOME;
		dotflag = false;
		this.#configfiles.push(process.env.XDG_CONFIG_HOME + this.pa.sep + 'imbraw2dng.json');
	}
	else {
		return callback();
	}
	this.fs.readFile(xch + this.pa.sep + (dotflag ? '.' : '' ) + 'imbraw2dng.json', 'utf8',
		(err, data) => {
			//console.log(' READ: ' + xch + this.pa.sep + 'imbraw2dng.json' + ' ' + JSON.stringify(err) + ' ' + JSON.stringify(data));
			if (!err) {
				this.parseconfig(data);
				this.configloaded = (xch + this.pa.sep + (dotflag ? '.' : '' ) + 'imbraw2dng.json');
				callback();
			}
			else if (!tryno) {
				return this.readconfig(callback, 1);
			}
			else return this.readconfig(callback, tryno + 1);
		});
}
/* ImBCNodeOut: nodejs: config info */
configinfo() {
	if ('' !== this.configloaded)
		this.mappx(true, 'node.readconfig', this.configloaded);
	else
		this.mappx(true, 'node.noconfig', JSON.stringify(this.#configfiles));
}
/* ImBCNodeOut: nodejs: parse config */
parseconfig(data, fornode) {
	const d = JSON.parse(data);
	if (d.nc) this.withcolours = false;
	if (d.co) this.withcolours = true;
	if (d.np) this.withpreview = false;
	else this.withpreview = true;
	if (undefined !== d.cr) this.copyright = d.cr;
	if (d.l) this.findlang(d.l);
	if (d.d) this.outdir = d.d;
	if (d.f) this.ovwout = true;
	if (d.r) this.renamefiles = true;
	if (d.R && (!(this.ptypeflags % 2))) this.ptypeflags += 1;
	if (d.J && ((this.ptypeflags % 4) < 2)) this.ptypeflags += 2;
	if (d.O && ((this.ptypeflags % 8) < 4)) this.ptypeflags += 4;
	this.stepmode = 0;
}
/* Indentation in - end of class ImBCNodeOut */
}
/* *************************************** Node js helper class E N D *************************************** */
/* *************************************** Main class for nodejs, forward *************************************** */
class ImBCNode extends ImBCNodeOut {
/* Indentation out */
constructor() {
	super();
}
/* node js: */
#configloaded = '';
#connmsg = false;

/* ImBCNode: continue with the next file if any */
handlenext(fromloop) {
	if (this.actnum < this.allfiles.length - 1) {
		this.actnum++;
		this.handleonex();
	} else {
		this.actnum = 0;
		this.allfiles = [];
		if (this.stats.total > 0) {
			this.appmsg('');
			this.mappx(true, 'process.totals', this.stats.total, this.stats.ok, this.stats.skipped, this.stats.error);
		}
	}
}
/* ImBCNode: nodejs: get imb data for node js */
checkimb(type, found) {
	//let subdir = '';
	let subdir = 'PHOTO';
	if (type) subdir='MOVIE';
	//this.ht.get('http://127.0.0.1:8000/PHOTO.html', (res) => {
	this.ht.get('http://192.168.1.254/IMBACK/' + subdir, (res) => {
			let err = false;
			if (res.statusCode !== 200 || !/^text\/html/.test(res.headers['content-type'])) {
				err = true;
				res.resume();
				if (!type) {
					return this.checkimb(true, false);
				}
				else if (type && !found) {
					console.log(this.xl('onimback.errconnect', '192.168.1.254'));
					console.log('Status: ' + res.statusCode + ' Type: ' + res.headers['content-type']);
					process.exit(1);
				}
				else this.imbdoit();
				return;
			}
			let b = '';
			res.on('data', (chunk) => {
				if (!this.#connmsg) console.log(this.rmesc('\u001b[32m' + this.xl('onimback.connected') + '\u001b[0m'));
				this.#connmsg = true;
				b += chunk;
			});
			res.on('end', () => {
				let i=0, j;
				while ((j = b.substring(i).toLowerCase().indexOf('<a href=')) !== -1) {
					let delim = b.substring(i+j+8, i+j+9);
					let endstr = b.substring(i+j+9).indexOf(delim);
					let url = b.substring(i+j+9, i+j+9+endstr);
					if (-1 === url.indexOf('?del=')) {
						if (url.startsWith('http://192.168.1.254'))
							this.handle1imb(url);
						else
							this.handle1imb('http://192.168.1.254'+ url);
					}
					i=i+j+10;
				}
				if (type) { if (!err || found) this.imbdoit(); }
				else this.checkimb(true, !err);
			});
	}).on('error', (e) => {
		if (!type) {
			return this.checkimb(true, false);
		}
		else if (type && !found) {
			console.log(this.xl('onimback.errconnect', '192.168.1.254'));
			console.log(JSON.stringify(e));
			process.exit(1);
		}
		else this.imbdoit();
	});
}
/* ImBCNode: nodejs: show help */
#help(caller) {
	caller = ImBCBase.basename(caller);
	let texts = this.xl0('node.help');
	console.log(this.subst(texts[0], ImBCBase.version));
	console.log('\u001b[1mNew! Internal Overwork, please report errors to me... & Japanese translation thanks to Sadami Inoue!\u001b[0m');
	console.log('');
	console.log(this.subst(texts[1], caller));
	for (let j=2; j<texts.length; j++) {
		console.log(this.rmesc(texts[j]));
		if (this.debugflag && j === 7) {
			console.log(' \u001b[1m-CSV\u001b[0m - Translation CSV');
		}
	}
}
/* ImBCNode: nodejs runup */
startnode(notfirst) {
	if (!notfirst) return this.readconfig(() => this.startnode(true));
	this.querylang(process.argv[1], 6);
	let wanthelp = false, wantxl = false, flagging=0, datefound = false, restisfiles = false;
	if (process.argv.length < 3) {
		wanthelp = true;
	}
	process.argv.forEach((v,i) => {
			if (i >= 2) {
				//console.log(` ${i} -- ${v} ${flagging}`);
				if (v ==='--') {
					restisfiles = true;
				}
				else if (restisfiles) {
					this.allfiles.push(v);
					this.totnum ++;
				}
				else if (flagging === 1) {
					flagging = 0;
					this.findlang(v);
				}
				else if (flagging === 2) {
					flagging = 0;
					this.outdir = v;
				}
				else if (flagging === 3) {
					flagging = 0;
					if (null !== ImBCBase.tsregex.exec(v)) {
						this.fromts = v;
						datefound = true;
					} else {
						wanthelp = true;
						this.mappx(false, 'words.error');
						this.mappx(true, 'onimback.invaltime', v);
					}
				}
				else if (flagging === 4) {
					flagging = 0;
					this.copyright = v;
				}
				else if (v.substring(0,4)==='-CSV' && this.debugflag) {
					for (const el of Object.keys(ImBCBase.texts))
						this.prxl(el, ImBCBase.texts[el]);
					wantxl = true;
				}
				else if (v ==='-fla') {
					this.addall = true;
					this.addscaleall = false;
				}
				else if (v ==='-flx') {
					this.addall = true;
					this.addscaleall = true;
				}
				else if (v ==='-nc') {
					this.withcolours = false;
				}
				else if (v ==='-co') {
					this.withcolours = true;
				}
				else if (v ==='-np') {
					this.withpreview = false;
				}
				else if (v.substring(0,3)==='-cr') {
					if (v.substring(3).length > 0) {
						this.copyright = v.substring(3);
					}
					else
						flagging=4;
				}
				else if (v.substring(0,2)==='-l') {
					if (v.substring(2).length > 0) {
						let l = v.substring(2);
						this.findlang(l);
					}
					else
						flagging=1;
				}
				else if (v.substring(0,2)==='-d') {
					if (v.substring(2).length > 0) {
						this.outdir = v.substring(2);
					}
					else
						flagging=2;
				}
				else if (v.substring(0,2)==='-n') {
					if (v.substring(2).length > 0) {
						if (null !== ImBCBase.tsregex.exec(v.substring(2))) {
							this.fromts = v.substring(2);
							datefound = true;
						} else {
							wanthelp = true;
							this.mappx(false, 'words.error');
							this.mappx(true, 'onimback.invaltime', v.substring(2));
						}
					}
					else
						flagging=3;
				}
				else if (v ==='-h') {
					wanthelp = true;
				}
				else if (v ==='-f') {
					this.ovwout = true;
				}
				else if (v ==='-r') {
					this.renamefiles = true;
				}
				else if (v ==='-R') {
					if (!(this.typeflags % 2)) this.typeflags += 1;
				}
				else if (v ==='-J') {
					if ((this.typeflags % 4) < 2) this.typeflags += 2;
				}
				else if (v ==='-O') {
					if ((this.typeflags % 8) < 4) this.typeflags += 4;
				}
				else if (v.substring(0,1) === '-') {
					console.log(this.subst(this.xl0('node.unkopt'), v));
					wanthelp = true;
				}
				else {
					if (null !== ImBCBase.tsregex.exec(v)) {
						this.mappx(true, 'node.fnwarn', v);
						wanthelp = true;
					}
					this.allfiles.push(v);
					this.totnum ++;
				}
			}
	});
	if (wantxl) return;
	else if (flagging) {
		console.log(this.xl0('node.missingval'));
		wanthelp = true;
	}
	else if (datefound && 0 === this.typeflags) {
		if (0 === this.ptypeflags) this.typeflags = 7;
		else this.typeflags = this.ptypeflags;
	}

	if (wanthelp || (this.typeflags === 0 && this.totnum === 0)) {
		this.#help(process.argv[1]);
		console.log(this.xl0('main.coloursyourrisk'));
		console.log('');
		this.configinfo();
		return;
	}
	else if (this.totnum > 0) {
		console.log(this.subst(this.xl0('node.help')[0], ImBCBase.version));
		console.log('\u001b[1mNew! Internal Overwork, please report errors to me...& Japanese translation thanks to Sadami Inoue!\u001b[0m');
		console.log('');
		console.log(this.xl0('main.coloursyourrisk'));
		console.log('');
		this.configinfo();
		if (this.typeflags === 0) this.typeflags = 7;
		this.handlerecurse();
	}
	else if (this.typeflags > 0) {
		console.log(this.subst(this.xl0('node.help')[0], ImBCBase.version));
		console.log('\u001b[1mNew! Internal Overwork, please report errors to me...& Japanese translation thanks to Sadami Inoue!\u001b[0m');
		console.log('');
		console.log(this.xl0('main.coloursyourrisk'));
		console.log('');
		this.configinfo();
		this.checkimb();
	}
}
/* Indentation in - end of class ImBCNode */
}
/* *************************************** Main class for nodejs, forward E N D *************************************** */
/* *************************************** Main class for nodejs, backward *************************************** */
class ImBCNodeBackw extends ImBCNodeOut {
/* Indentation out */
constructor() {
	super();
	this.imbcb = new ImBCBackw(this);
	this.withcolours = false;
}
/* ImBCNodeBackw: nodejs runup */
startnode() {
	let wanthelp = false, restisfiles = false, flagging = 0;
	if (process.argv.length < 3) {
		wanthelp = true;
	}
	process.argv.forEach((v,i) => {
			if (i >= 2) {
				if (v ==='--') {
					restisfiles = true;
				}
				else if (restisfiles) {
					this.allfiles.push(v);
					this.totnum ++;
				}
				else if (flagging === 1) {
					flagging = 0;
					this.findlang(v);
				}
				else if (flagging === 2) {
					flagging = 0;
					this.outdir = v;
				}
				else if (v.substring(0,2)==='-l') {
					if (v.substring(2).length > 0) {
						let l = v.substring(2);
						this.findlang(l);
					}
					else
						flagging=1;
				}
				else if (v.substring(0,2)==='-d') {
					if (v.substring(2).length > 0) {
						this.outdir = v.substring(2);
					}
					else
						flagging=2;
				}
				else if (v ==='-h') {
					wanthelp = true;
				}
				else if (v.substring(0,1) === '-') {
					console.log(this.subst(this.xl0('node.unkopt'), v));
					wanthelp = true;
				}
				else {
					this.allfiles.push(v);
					this.totnum ++;
				}
			}
	});
	if (flagging) {
		console.log(this.xl0('node.missingval'));
		wanthelp = true;
	}
	else if (wanthelp) {
		let caller = ImBCBase.basename(process.argv[1]);
		let texts = this.xl0('node.backw.help');
		console.log(this.subst(texts[0], ImBCBase.version));
		console.log(this.subst(texts[1], caller));
		for (let j=2; j<texts.length; j++) {
			console.log(this.rmesc(texts[j]));
		}
	}
	else if (this.totnum > 0) {
		console.log(this.subst(this.xl0('node.backw.help')[0], ImBCBase.version));
		this.handlerecurse();
	}
}
/* ImBCNodeBackw: continue with the next file if any */
handlenext(fromloop) {
	if (this.actnum < this.allfiles.length - 1) {
		this.actnum++;
		this.handleonex();
	} else {
		this.actnum = 0;
		this.allfiles = [];
		if (this.stats.total > 0) {
			this.appmsg('');
			this.mappx(true, 'process.totals', this.stats.total, this.stats.ok, this.stats.skipped, this.stats.error);
		}
	}
}
/* Indentation in - end of class ImBCNodeBackw */
}
/* *************************************** Main class for nodejs, backward E N D *************************************** */
/* outside of classes: */
let imbc;
/* node js handling main function */
var document = undefined;
if (ImBCBase.basename(process.argv[1].toUpperCase()).indexOf('IMBDNG2RAW') !== -1) {
	imbc = new ImBCNodeBackw();
}
else {
	imbc = new ImBCNode();
}
imbc.startnode();
