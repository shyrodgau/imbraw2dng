#!/usr/bin/env node
/* 
***************************************************** 

imbraw2dng.js

Convert RAW from I'm back(R)(https://imback.eu) into DNG

Based on work by Michele Asciutti.

https://github.com/shyrodgau/imbraw2dng

Usage: node imbraw2dng.js [-l lang] [-f] [-d dir] [-nc | -co] [-np] [-owb] [-ndcp] [-cr copyright] [-R] [-J] [-O] [-fla | -flx] [-n yyyy_mm_dd-hh_mm_ss] [ [--] <files-or-dirs>* ]
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
 -owb - Use old style constant white balance
 -ndcp - Do not include new DNG Color profile
 -cr 'copyright...' - add copyright to DNG
 -fla, -flx - add multiple images to fake long exposure, flx scales down'
 -R - get RAW from ImB connected via Wifi or from given directories
 -J - get JPEG from ImB connected via Wifi or from given directories
 -O - get non-RAW/non-JPEG from ImB connected via Wifi or from given directories
 -n yyyy_mm_dd-hh_mm_ss (or prefix of any length) - select only newer than this timestamp from ImB or from given directories
 -----
 -- - treat rest of parameters as local files or dirs
 <files-or-dirs> - process local files or directories recursively, e.g. on MicroSD from ImB

The following js code is identical to the js inside imbraw2dng.html for the classes IFDOut, TIFFOut, ZIPHelp, ImBCBase, ImBCBackw.

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
exifdataptr = -1; // the exif ifd, pointers therein must be adjusted
// rest is private:
#entrys = [];
#currentoff = 0;
// imgdata can be view or array
#imgdata = null;
#imglen = 0;
#imglen0 = 0;
#dyndata = [] ; //new Uint8Array(20000);
/* IFDOut: add image data to ifd */
addImageStrip(typ, view, width, height) {
	this.#imgdata = view;
	this.#imglen0 = view.byteLength ? this.#imgdata.byteLength : view.length;
	this.#imglen = (this.#imglen0 + 3) & 0xFFFFFFFC;
	this.addEntry(254 , 'LONG', [ typ ]); /* SubFileType */
	this.addEntry(256 , 'SHORT', [ width ]); /* width */
	this.addEntry(257 , 'SHORT', [ height ]); /* height */
	this.addEntry(273 , 'LONG', [ 0xFFFFFFFF ]); /* StipOffsets , special */
	this.addEntry(279 , 'LONG', [ this.#imglen0 ]); /* StripByte count */
	this.addEntry(278 , 'LONG', [ height ]); /* Rows per strip */
}
/* IFDOut: add entry to ifd */
addEntry(tag, type, value) {
	let x = TIFFOut.tToNum(type);
	let l = value.length;
	if (type === 'ASCII') l++;
	else if (type === 'RATIONAL' || type === 'SRATIONAL') l /= 2;
	if (tag === 273 || tag === 330 || tag === 34665) { /* special cases */
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
		} else if (type === 'FLOAT') {
			let b = new ArrayBuffer(4);
			let c = new DataView(b);
			c.setFloat32(0, value[0], true);
			for (let k=0; k<4;k++)
				e.value[k]=c.getUint8(k);
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
		} else if (type === 'FLOAT') {
			let b = new ArrayBuffer(4*l);
			let c = new DataView(b);
			for (let k=0; k<l; k++)
				c.setFloat32(4*k, value[k], true);
			for (let k=0; k<l*4; k++)
				this.#dyndata.push(c.getUint8(k));
			this.#currentoff+=(4*l);
		} else if (type === 'FLOATBIN') {
			e.count = (l / 4);
			for (let k=0; k<l; k++) {
				this.#dyndata.push(value[k]);
				this.#currentoff ++;
			}
		}
		else console.log('IFD trying to write unknown typ ' + type);
		this.#entrys.push(e);
	}
}
/* IFDOut: get data for this ifd, shifted to actual offset in file */
getData(offset) {
	let ioff = 0, data = new Uint8Array(this.#imglen + (12 * this.#entrys.length) + this.#currentoff + 16);
	if (this.#imgdata?.getUint8) {
		for (let z=0; z<this.#imgdata.byteLength; z++) {
			if (this.#imglen === 30607488) {
				if ((z%3) === 0)
					data[ioff++] = this.#imgdata.getUint8(z+2);
				else if ((z%3) === 2)
					data[ioff++] = this.#imgdata.getUint8(z-2);
				else
					data[ioff++] = this.#imgdata.getUint8(z);
			}
			else
				data[ioff++] = this.#imgdata.getUint8(z);
		}
	} else if (this.#imgdata) {
		for (let z=0; z<this.#imgdata.length; z++)
			data[ioff++] = this.#imgdata[z];
	}
	while (ioff < this.#imglen)
		data[ioff++] = 0;
	TIFFOut.writeshorttoout(data, this.#entrys.length, ioff);
	ioff += 2;
	for (const i of this.#entrys.sort((a,b) => a.tag - b.tag )) {
		TIFFOut.writeshorttoout(data, i.tag, ioff);
		ioff+=2;
		TIFFOut.writeshorttoout(data, i.type, ioff);
		ioff+=2;
		TIFFOut.writeinttoout(data, i.count, ioff);
		ioff+=4;
		if (i.tag === 273) { /* strip offsets is set here, subifd (-2), exififd and private stuff outside */
			TIFFOut.writeinttoout(data, offset, ioff);
			ioff+=4;
		} else if (i.tag === 34665) { /* exififd */
			this.exifdataptr = offset + ioff + 8;
			ioff+=4;
		} else if (i.tag === 50933) { // camera profiles
			if (undefined !== i.value) // only one, profile ptr fits into value
				this.camprofptr = offset + ioff + 8;
			else {			// more than one, dereference
				TIFFOut.writeinttoout(data, i.ptr + offset + this.#imglen + 6 + (12 * this.#entrys.length), ioff);
				this.camprofptr = offset + this.#imglen + i.ptr + 6 + (12 * this.#entrys.length);
			}
			ioff+=4;
		} else if (undefined !== i.value) {
			data.set(i.value, ioff);
			ioff+=4;
		} else {
			TIFFOut.writeinttoout(data, i.ptr + offset + this.#imglen + 6 + (12 * this.#entrys.length), ioff);
			ioff+=4;
		}
	}
	TIFFOut.writeinttoout(data, 0, ioff);
	// next ifd - stays zero if has sub ifd
	ioff += 4;
	data.set(this.#dyndata, ioff);
	return data.slice(0, ioff + this.#currentoff);
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
#bincameraprofiles = [];
#currentifd = null;
#exifdata = null;
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
/* TIFFOut: add exif ifd */
addExifIfd(data) {
	this.#currentifd.addEntry(34665, 'LONG', [ 0 ]); /* Exif ifd */
	this.#exifdata = data;
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
	{ n: 'FLOAT', t: 11, l: 4 },
	// currently only for parsing exif:
	{ n: 'DOUBLE', t: 12, l: 8 },
	// buffer with values already prepared:
	{ n: 'FLOATBIN', t: 11, l: 4 },
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
	const partlens = this.#ifds.map(x => (100000+x.getOffset())).reduce((sum, a) => (sum + a), 0);
	let data = new Uint8Array(partlens + 1000000);
	if ((this.#bincameraprofiles.length + this.#cameraprofiles.length) > 0) {
		let camprofarr = [];
		for (let j=0; j<this.#cameraprofiles.length; j++) camprofarr.push(1);
		for (let j=0; j<this.#bincameraprofiles.length; j++) camprofarr.push(1);
		this.#ifds[0].addEntry(50933, 'LONG', camprofarr); /* camera profiles pointer */
	}
	TIFFOut.writeshorttoout(data, 0x4949, 0); // magics
	TIFFOut.writeshorttoout(data, 42, 2);
	let lastoffpos = 4;
	let lastlen = 8;
	for (const i of this.#ifds) {
		TIFFOut.writeinttoout(data, i.getOffset() + lastlen, lastoffpos);
		let d = i.getData(lastlen);
		data.set(d, lastlen);
		lastoffpos = i.getNextIfdPosOffset() + lastlen;
		lastlen += d.length;
	}
	TIFFOut.writeinttoout(data, 0, lastoffpos);
	if (-1 !== this.#ifds[0].camprofptr && this.#cameraprofiles.length > 0) {
		for (let l=0; l<this.#cameraprofiles.length; l++) {
			TIFFOut.writeinttoout(data, lastlen, this.#ifds[0].camprofptr + (4*l));
			let cpd = this.#getCamProfData(this.#cameraprofiles[l]);
			data.set(cpd, lastlen);
			lastlen += cpd.length;
		}
	}
	if (-1 !== this.#ifds[0].camprofptr && this.#bincameraprofiles.length > 0) {
		for (let l=0; l<this.#bincameraprofiles.length; l++) {
			TIFFOut.writeinttoout(data, lastlen, this.#ifds[0].camprofptr + (4*l));
			let cpd = this.#bincameraprofiles[l];
			for (let k=0; k<cpd.length; k++)
				data[lastlen+k] = cpd[k];
			lastlen += cpd.length;
		}
	}
	if (-1 !== this.#ifds[0].exifdataptr && this.#exifdata !== null) {
		TIFFOut.writeinttoout(data, lastlen, this.#ifds[0].exifdataptr);
		let lastbase = lastlen, aoff = 2;
		let nent = TIFFOut.readshorta(this.#exifdata,0);
		TIFFOut.writeshorttoout(data, nent, lastlen);
		lastlen += 2;
		for (let j = 0; j < nent; j++) {
			let tag = TIFFOut.readshorta(this.#exifdata, aoff+0);
			let typ = TIFFOut.readshorta(this.#exifdata, aoff+2);
			let num = TIFFOut.readinta(this.#exifdata, aoff+4);
			let addr = TIFFOut.readinta(this.#exifdata, aoff+8);
			aoff += 12;
			let ee = TIFFOut.types.find(e => e.t === typ);
			if (undefined === ee) {
				console.log('EXIFOUT: TYP NOT FOUND ' + typ);
				continue;
			}
			TIFFOut.writeshorttoout(data, tag, lastlen);
			lastlen += 2;
			TIFFOut.writeshorttoout(data, typ, lastlen);
			lastlen += 2;
			TIFFOut.writeinttoout(data, num, lastlen);
			lastlen += 4;
			if (ee.l * num <= 4) {
				TIFFOut.writeinttoout(data, addr, lastlen);
			}
			else {
				// correct the addresse
				TIFFOut.writeinttoout(data, addr + lastbase, lastlen);
			}
			lastlen += 4;
		}
		for (let k = aoff; k<this.#exifdata.length; k++)
			data[lastlen++] = this.#exifdata[k];
	}
	return data.slice(0, lastlen);
}
// TIFFOut: add extra camera profile (will set this as current IFD), must go behind all other IFDs
createCamProf(name) {
	this.#cameraprofiles.push(new IFDOut());
	this.#cameraprofiles[this.#cameraprofiles.length - 1].addEntry(50936, 'ASCII', name); /* profile name */
}
/* TIFFOut: get camera profile data analog to ifd */
#getCamProfData(p) {
	let d = p.getData(8);
	let camprofbuf = new Uint8Array(d.length + 8);
	TIFFOut.writeshorttoout(camprofbuf, 0x4949, 0); // magics
	TIFFOut.writeshorttoout(camprofbuf, 0x4352, 2);
	TIFFOut.writeinttoout(camprofbuf, 8, 4);
	camprofbuf.set(d, 8);
	return camprofbuf.slice(0, 8 + d.length);
}
/* TIFFOut: helper to read dng or exif */
static readshort(view, off) {
	let res = view.getUint8(off);
	res += (256 * view.getUint8(off+1));
	return res;
}
/* TIFFOut: helper to read dng or exif */
static readint(view, off) {
	let res = TIFFOut.readshort(view, off);
	res += (65536 * TIFFOut.readshort(view,off+2));
	return res;
}
/* TIFFOut: helper to read dng or exif */
static readshorta(arr, off) {
	let res = arr[off];
	res += (256 * arr[off+1]);
	return res;
}
/* TIFFOut: helper to read dng or exif */
static readinta(arr, off) {
	let res = TIFFOut.readshorta(arr, off);
	res += (65536 * TIFFOut.readshorta(arr,off+2));
	return res;
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
/* ImBCBackw: backward: handle dng like raw */
static parseDng(f, onok, onerr) {
	// blindly assumes that it is one of our own DNG
	if (undefined === f.data) {
		const reader = f.imbackextension ? f : new FileReader();
		reader.onload = (evt) => {
			f.data = evt.target.result;
			ImBCBackw.parseDng(f, onok, onerr);
		}
		reader.onerror = () => { onerr(f.name); };
		reader.readAsArrayBuffer(f);
		return;
	}
	const v = new DataView(f.data);
	const ifd = TIFFOut.readint(v, 4);
	const zz = ImBCBase.infos.findIndex(v => v.size === ifd - 8);
	const nent = TIFFOut.readshort(v, ifd);
	let subifdstart = -1, rawstripstart = -1, datalen = -1;
	let off = ifd+2;
	if (TIFFOut.readshort(v, 2) !== 42 || TIFFOut.readshort(v,0) !== 18761 /* 0x4949 */ || zz === -1) {
		// seek sub ifd then therein the stripoffsets
		for (let k=0; k<((nent<50)? nent: 0); k++) {
			let tag = TIFFOut.readshort(v, off);
			if (tag === 330) {
				subifdstart = TIFFOut.readint(v, off+8);
				break;
			}
			off += 12;
		}
		if (-1 !== subifdstart) {
			let subnent = TIFFOut.readshort(v, subifdstart);
			off = subifdstart + 2;
			for (let j=0; j<((subnent < 50)? subnent: 0); j++) {
				let stag = TIFFOut.readshort(v, off);
				if (stag === 273) {
					rawstripstart = TIFFOut.readint(v, off+8);
					break;
				}
				off += 12;
			}
			if (-1 !== rawstripstart) {
				datalen = subifdstart - rawstripstart;
				const zzz = ImBCBase.infos.findIndex(v => v.size === datalen);
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
	if (datalen === 30607488) {
		const v = new DataView(fx.data);
		for (let k=0; k < datalen; k+=3) {
			let i = v.getUint8(k);
			v.setUint8(k, v.getUint8(k+2));
			v.setUint8(k+2, i);
		}
	}
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
		  this.imbc.resolver(f, (url, fx) => {
				this.imbc.allfiles[this.imbc.actnum] = fx;
				this.handleone(fx);
			}, (url) => {
				this.imbc.mappx(false, 'words.sorryerr');
				this.imbc.appmsgxl(true, 'process.erraccess', url);
				this.imbc.stats.error ++;
				if (undefined !== this.exitcode) this.exitcode++;
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
				if (undefined !== this.exitcode) this.exitcode++;
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
	const zz = ImBCBase.infos.findIndex(v => v.size === f.size);
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
			if (undefined !== this.exitcode) this.exitcode++;
			this.imbc.handlenext();
		}
		reader.readAsArrayBuffer(f);
	} else {
		this.imbc.appmsg("[" + (1 + this.imbc.actnum) + " / " + this.imbc.totnum + "] ", false);
		this.imbc.appmsg('Size of raw data of ' + f.name + ' seems not to match known formats, ignoring...', true);
		this.imbc.stats.error++;
		if (undefined !== this.exitcode) this.exitcode++;
		this.imbc.handlenext();
	}
}
/* Indentation in - end of class ImBCBackw */
}
/* *************************************** Backward helper class E N D *************************************** */
/* *************************************** ZIP Helper class *************************************** */
class ZIPHelp {
/* Indentation out */
#lochdrs = [];
#loclens = [];
#writecb = null;
#finishoff = 0;
#sizecent = 0;
static crcTable = [];
/* ZIPHelp: constructor */
constructor(writecb) {
	this.#writecb = writecb;
}
/* ZIPHelp: make dos date */
static makeDosDate(yr, mon, day, hr, min, sec)
{
    if (yr>1980)
        yr-=1980;
    else if (yr>80)
        yr-=80;
    return (((day + (32 * mon) + (512 * yr)) * 65536) |
		((sec/2) + (32* min) + (2048 * hr)));
}
/* ZIPHelp: dos date from filename */
static datefromfile(name) {
	let { yr, mon, day, hr, min, sec } = ImBCBase.nametotime(name);
	if (yr) {
		return ZIPHelp.makeDosDate(yr, mon, day, hr, min, sec);
	} else {
		let r = ImBCBase.nametotime(new Date(Date.now()).toISOString());
		return ZIPHelp.makeDosDate(r.yr, r.mon, r.day, r.hr, r.min, r.sec);
	}
}
/* ZIPHelp: crc32 stuff */
static makeCRCTable(){
    var c;
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        ZIPHelp.crcTable[n] = c;
    }
}
/* ZIPHelp: crc32 stuff */
static crc32(arr) {
	if (ZIPHelp.crcTable.length === 0) ZIPHelp.makeCRCTable();
    var crc = 0 ^ (-1);

    for (var i = 0; i < arr.length; i++ ) {
        crc = (crc >>> 8) ^ ZIPHelp.crcTable[(crc ^ arr[i]) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
};
/* ZIPHelp: finish zip with centraldirs and endcentral */
finish(cb, i) {
	if (i === undefined) i=0;
	if (i < this.#lochdrs.length) {
		let j = this.#lochdrs[i];
		let ch = new Uint8Array(46);
		ch[0] = 0x50; // P
		ch[1] = 0x4B; // K
		ch[2] = 0x1; // magic
		ch[3] = 0x2;
		ch[4] = 0x0; // version made
		ch[5] = 0x0;
		ch[6] = 0x14; // version extract
		ch[7] = 0x0;
		ch[8] = 0x0; // gp bitflags
		ch[9] = 0x8;
		ch[10] = 0x0; // compr
		ch[11] = 0x0;
		let dosdate = j.dosdate;
		ch[12] = dosdate % 256;
		ch[13] = Math.floor(dosdate/256) % 256;
		ch[14] = Math.floor(dosdate/65536) % 256;
		ch[15] = Math.floor(dosdate/(256*65536)) % 256;
		let crc = j.crc;
		ch[16] = crc % 256;
		ch[17] = Math.floor(crc/256) % 256;
		ch[18] = Math.floor(crc/65536) % 256;
		ch[19] = Math.floor(crc/(256*65536)) % 256;
		let dl = j.dl; // compr. length
		ch[20] = dl % 256;
		ch[21] = Math.floor(dl/256) % 256;
		ch[22] = Math.floor(dl/65536) % 256;
		ch[23] = Math.floor(dl/(256*65536)) % 256;
		// uncompr. size is same
		ch[24] = dl % 256;
		ch[25] = Math.floor(dl/256) % 256;
		ch[26] = Math.floor(dl/65536) % 256;
		ch[27] = Math.floor(dl/(256*65536)) % 256;
		let fl = j.fl; // name length
		ch[28] = fl % 256;
		ch[29] = Math.floor(fl/256) % 256;
		ch[30] = 0; // extra length
		ch[31] = 0;
		ch[32] = 0x0; // comment length
		ch[33] = 0x0;
		ch[34] = 0x0; // disk no
		ch[35] = 0x0;
		ch[36] = 0x0; // int attr
		ch[37] = 0x0;
		ch[38] = 0x0; // ext attr
		ch[39] = 0x0;
		ch[40] = 0x0;
		ch[41] = 0x0;
		ch[42] = this.#finishoff % 256;
		ch[43] = Math.floor(this.#finishoff/256) % 256;
		ch[44] = Math.floor(this.#finishoff/65536) % 256;
		ch[45] = Math.floor(this.#finishoff/(256*65536)) % 256;
		this.#sizecent += (46 + j.fl);
		this.#finishoff += this.#loclens[i];
		this.#writecb(ch, () => {
			this.#writecb(j.name, () => { this.finish(cb, i+1); });
		});
		return;
	}
	// end of central
	let ec = new Uint8Array(22);
	ec[0] = 0x50; // P
	ec[1] = 0x4B; // K
	ec[2] = 0x5; // magic
	ec[3] = 0x6;
	ec[4] = 0x0; // disk no
	ec[5] = 0x0;
	ec[6] = 0x0; // startdisk
	ec[7] = 0x0;
	ec[8] = i % 256; // num entries
	ec[9] = Math.floor(i/256) % 256;
	ec[10] = i % 256; // num entries
	ec[11] = Math.floor(i/256) % 256;
	ec[12] = this.#sizecent % 256; // size of cent.dir
	ec[13] = Math.floor(this.#sizecent/256) % 256;
	ec[14] = Math.floor(this.#sizecent/65536) % 256;
	ec[15] = Math.floor(this.#sizecent/(65536*256)) % 256;
	ec[16] = this.#finishoff % 256; // start of cent.dir
	ec[17] = Math.floor(this.#finishoff/256) % 256;
	ec[18] = Math.floor(this.#finishoff/65536) % 256;
	ec[19] = Math.floor(this.#finishoff/(65536*256)) % 256;
	ec[20] = 0; // comment length
	ec[21] = 0;
	this.#writecb(ec, () => { cb(); });
}
/* ZIPHelp: add a file */
add(data, name, cb) {
	let narr = new TextEncoder().encode(name);
	// output local header
	let lh = new Uint8Array(30);
	lh[0] = 0x50; // P
	lh[1] = 0x4B; // K
	lh[2] = 0x3; // magic
	lh[3] = 0x4;
	lh[4] = 0x14; // version 20
	lh[5] = 0x0;
	lh[6] = 0x0; // gp bitflags
	lh[7] = 0x8;
	lh[8] = 0x0; // compression
	lh[9] = 0x0;
	let dosdate = ZIPHelp.datefromfile(name);
	lh[10] = dosdate % 256;
	lh[11] = Math.floor(dosdate/256) % 256;
	lh[12] = Math.floor(dosdate/65536) % 256;
	lh[13] = Math.floor(dosdate/(256*65536)) % 256;
	let crc = ZIPHelp.crc32(data);
	lh[14] = crc % 256;
	lh[15] = Math.floor(crc/256) % 256;
	lh[16] = Math.floor(crc/65536) % 256;
	lh[17] = Math.floor(crc/(256*65536)) % 256;
	let dl = data.length;
	lh[18] = dl % 256; // compr. length
	lh[19] = Math.floor(dl/256) % 256;
	lh[20] = Math.floor(dl/65536) % 256;
	lh[21] = Math.floor(dl/(256*65536)) % 256;
	// uncompr. size is same
	lh[22] = dl % 256;
	lh[23] = Math.floor(dl/256) % 256;
	lh[24] = Math.floor(dl/65536) % 256;
	lh[25] = Math.floor(dl/(256*65536)) % 256;
	let fl = narr.length;
	lh[26] = fl % 256;
	lh[27] = Math.floor(fl/256) % 256;
	lh[28] = 0; // extra length
	lh[29] = 0;
	this.#lochdrs.push( { name: narr, dosdate: dosdate, crc: crc, dl: dl, fl: fl } );
	this.#loclens.push( 30+fl+dl );
	this.#writecb(lh, () => {
		this.#writecb(narr, () => {
			this.#writecb(data, () => { cb(); });
		})
	});
}
/* Indentation in - end of class ZIPHelp */
}
/* *************************************** ZIP Helper class E N D *************************************** */
/* *************************************** Main class *************************************** */
class ImBCBase {
/* Indentation out */
static version = "V4.0.8_619afc0"; // actually const
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
			ja: '\u001b[31m\u001b[1m申し訳ございません! エラー:\u001b[0m  ',
			htmlstyle: [ [ 'background-color','#ffdddd' ], [ 'font-weight', 'bold' ] ]
		},
		sorry: {
			de: '\u001b[31mENTSCHULDIGUNG!\u001b[0m ',
			en: '\u001b[31mSORRY!\u001b[0m  ',
			fr: '\u001b[31mDÉSOLÉE!\u001b[0m ',
			ja: '\u001b[31m申し訳ございません!\u001b[0m  ',
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
			en: 'Fake long exposure by adding up all (<a href="https://shyrodgau.github.io/imbraw2dng/moredoc#a-lot-more-tricks-and-details">read more</a>)',
			de: 'Langzeitbelichtung durch Addieren simulieren (<a href="https://shyrodgau.github.io/imbraw2dng/moredoc_de#mehr-tricks-und-details">mehr lesen</a>)',
			ja: 'すべてを加算して長時間露光をシミュレートする',
			scale: {
				en: 'Scale values down',
				de: 'Werte dabei herunterskalieren',
				ja: 'スケールダウン値'
			},
			added: {
				en: 'Added picture $$0',
				de: 'Bild $$0 hinzugefügt',
				ja: '画像を追加しました $$0'
			}
		},
		usezip: {
			de: 'Nicht mehrere Dateien einzeln, sondern in wenigen ZIP Archiven herunteladen.',
			en: 'Do not use several single downloads, but in fewer ZIP archives.',
			choosedest: {
				de: 'Ziel auswählen',
				en: 'Choose destination'
			}
		},
		newmsg: {
			en: 'New! <a href="imbraw2dng_ja.html">Japanese translation</a> thanks to Sadami Inoue! <a href="https://github.com/shyrodgau/imbraw2dng/issues" target="_new">Report bugs</a>',
			de: 'Neu! <a href="imbraw2dng_ja.html">Japanische Übersetung</a> Danke an Sadami Inoue! <a href="https://github.com/shyrodgau/imbraw2dng/issues" target="_new">Fehler melden</a>'
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
			de: 'Voreinstellungen für $$0 gespeichert',
			ja: 'デフォルト設定は $$0 で保存されます'
		},
		prefnotfile: {
			en: 'Preferences not possible for file:// URLs',
			de: 'Voreinstellungen für file:// URLs nicht möglich',
			ja: 'file:// URL でデフォルト設定はできません'
		},
		setfrom: {
			en: 'Set new prefereneces ',
			de: 'Voreinstellungen setzen ',
			ja: 'デフォルトを設定する'
		},
		forurl: {
			en: ' for URL $$0',
			de: ' für URL $$0',
			ja: 'URL $$0 の場合'
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
			ja: '\u001b[31mエラー\u001b[0m $$0 でImB に接続しています! ImB WiFi ですか?'
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
			de: 'Copyright hinzufügen',
			ja: '著作権を追加'
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
			ja: '$$0 にコピー'
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
			de: 'Konnte Datei $$0 nicht speichern.',
			en: 'Could not write file $$0',
			fr: 'Impossible d\'écrire le fiche $$0.',
			ja: 'ファイル $$0 に書き込めませんでした'
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
			fr: 'Petite image d\'aperçu en DNG',
			ja: 'プレビューのサムネイルを DNG に追加する'
		},
		addexif: {
			en: 'Add EXIF data from $$0',
			de: 'Gebe EXIF Daten von $$0 dazu'
		},
		includedcp: {
			en: 'Include the new DNG colour profile (DCP)',
			de: 'Neues DNG Farbprofil (DCP) einbetten'
		},
		oldstylewb: {
			en: 'Use old-style constant white balance',
			de: 'Alten konstanten Weißabgleich verwenden'
		},
		adddcp: {
			en: 'Adding new DCP',
			de: 'Bette neues DCP Farbprofile ein'
		},
		foundwb: {
			en: 'Found whitebalance $$0 / $$1 / $$2',
			de: 'Weißabgleich $$0 / $$1 / $$2 gefunden'
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
					   ' <dateien> - lokale Dateien verarbeiten', ],
						ja: [ 'imbdng2raw $$0 (戻る!) へようこそ!', '使い方: node $$0 [-l lang] [-d dir] [ [--] <files>* ]', 'オプション:', 
							' -h - このヘルプを表示します',
							' -l XX - XX は有効な言語コードです (現在: DE、EN、FR、JA)',
							'         ファイル名を imbdng2raw_XX.js に変更することで言語を設定することもできます。',
							' -d dir - 出力ファイルを dir に置きます',
							' -----',
							' -- - 残りのパラメータをローカル ファイルまたはディレクトリとして扱います',
							' <files> - ローカル ファイルを処理します*'
						],
			   }
	    },
		help: {
			en: [ `\u001b[1mWelcome to imbraw2dng\u001b[0m $$0 !`, `Usage: node $$0 \u001b[1m[\u001b[0m-l lang\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-f\u001b[1m | \u001b[0m-r\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-d dir\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-nc \u001b[1m|\u001b[0m -co\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-np\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-owb\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-ndcp\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-cr copyright\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-R\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-J\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-O\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-n yyyy_mm_dd-hh_mm_ss\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-fla \u001b[1m|\u001b[0m -flx\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m \
\u001b[1m[\u001b[0m--\u001b[1m]\u001b[0m \u001b[1m<\u001b[0mfiles-or-dirs\u001b[1m>*\u001b[0m \u001b[1m]\u001b[0m`,
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
				' \u001b[1m-owb\u001b[0m - Use old style constant white balance',
				' \u001b[1m-ndcp\u001b[0m - Do not include new DNG Color profile',
				' \u001b[1m-cr \'copyright...\'\u001b[0m - add copyright to DNG',
				' \u001b[1m-fla\u001b[0m, \u001b[1m-flx\u001b[0m - add multiple images to fake long exposure, flx scales down',
				' \u001b[1m-R\u001b[0m - get RAW from ImB connected via Wifi or from given directories',
				' \u001b[1m-J\u001b[0m - get JPEG from ImB connected via Wifi or from given directories',
				' \u001b[1m-O\u001b[0m - get non-RAW/non-JPEG from ImB connected via Wifi or from given directories',
				' \u001b[1m-n yyyy_mm_dd-hh_mm_ss\u001b[0m (or prefix of any length) - select only newer than this timestamp from ImB or from given directories',
				' -----',
				' \u001b[1m--\u001b[0m - treat rest of parameters as local files or dirs',
				' <files-or-dirs> - process local files or directories recursively, e.g. on MicroSD from ImB',],
			fr: [ `\u001b[1mBienvenu a imbraw2dng\u001b[0m $$0 !`, `Operation: node $$0 \u001b[1m[\u001b[0m-l lang\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-f\u001b[1m | \u001b[0m-r\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-d repertoire\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-nc \u001b[1m|\u001b[0m -co\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-np\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-owb\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-ndcp\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-cr copyright\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-R\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-J\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-O\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-n yyyy_mm_dd-hh_mm_ss\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-fla \u001b[1m|\u001b[0m -flx\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m \
\u001b[1m[\u001b[0m \u001b[1m[\u001b[0m--\u001b[1m]\u001b[0m \u001b[1m<\u001b[0mfiches-ou-repertoires\u001b[1m>*\u001b[0m \u001b[1m]\u001b[0m`,
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
				' \u001b[1m-np\u001b[0m - Do not add preview thumbnail to DNG',
				' \u001b[1m-owb\u001b[0m - Use old style constant white balance',
				' \u001b[1m-cr \'copyright...\'\u001b[0m - add copyright to DNG',
				' \u001b[1m-fla\u001b[0m, \u001b[1m-flx\u001b[0m - add multiple images to fake long exposure, flx scales down',
				' \u001b[1m-R\u001b[0m - obtenez RAW d\'ImB connecté via Wifi ou repertoires donnés',
				' \u001b[1m-J\u001b[0m - obtenez JPEG d\'ImB connecté via Wifi ou repertoires donnés',
				' \u001b[1m-O\u001b[0m - obtenez du non-RAW/non-JPEG d\'ImB connecté via Wifi ou repertoires donnés',
				' \u001b[1m-n yyyy_mm_dd-hh_mm_ss\u001b[0m (ou préfixe de n\'importe quelle longueur) - sélectionnez uniquement plus récent que cet horodatage d\'ImB ou repertoires donnés',
				' -----',
				' \u001b[1m--\u001b[0m - traiter le reste des paramètres comme des fiches ou des répertoires locaux',
				' <fiches-ou-repertoires> - traiter des fiches ou des répertoires locaux de manière récursive, par exemple sur MicroSD d\'ImB',],
			de: [ `\u001b[1mWillkommen bei imbraw2dng\u001b[0m $$0 !`, `Aufruf: node $$0 \u001b[1m[\u001b[0m-l sprache\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-f\u001b[1m | \u001b[0m-r\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-d ordner\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-nc \u001b[1m|\u001b[0m -co\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-np\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-owb\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-ndcp\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-cr copyright\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-R\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-J\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-O\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-n yyyy_mm_dd-hh_mm_ss\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-fla \u001b[1m|\u001b[0m -flx\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m \
\u001b[1m[\u001b[0m \u001b[1m[\u001b[0m--\u001b[1m]\u001b[0m \u001b[1m<\u001b[0mdateien-oder-ordner\u001b[1m>*\u001b[0m \u001b[1m]\u001b[0m`,
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
				' \u001b[1m-owb\u001b[0m - Alten konstanten Weißabgleich verwenden',
				' \u001b[1m-ndcp\u001b[0m - neues DCP Profil nicht einbetten',
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
				`\u001b[1mimbraw2dng へようこそ\u001b[0m $$0 !`, `Usage: node $$0 \u001b[1m[\u001b[0m-l lang\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-f\u001b[1m | \u001b[0m-r\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-d dir\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-nc \u001b[1m|\u001b[0m -co\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-np\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-owb\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-ndcp\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-cr copyright\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-R\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-J\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-O\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m-n yyyy_mm_dd-hh_mm_ss\u001b[1m]\u001b[0m \
\u001b[1m[\u001b[0m-fla \u001b[1m|\u001b[0m -flx\u001b[1m]\u001b[0m \u001b[1m[\u001b[0m \
\u001b[1m[\u001b[0m \u001b[1m[\u001b[0m--\u001b[1m]\u001b[0m \u001b[1m<\u001b[0mfiles-or-dirs\u001b[1m>*\u001b[0m \u001b[1m]\u001b[0m`,
				'オプション:',
				'\u001b[1m-h\u001b[0m - このヘルプを表示する',
				' \u001b[1m-nc\u001b[0m - 色付きのテキストを使用しない',
				' \u001b[1m-co\u001b[0m - 色付きのテキストを強制',
				' \u001b[1m-l XX\u001b[0m - ここで、XX は有効な言語コードです (現在: DE、EN、FR、JA)',
				'         ファイル名を imbraw2dng_XX.js に変更することで言語を設定することもできます。',
				' \u001b[1m-d dir\u001b[0m - 出力ファイルを dir に置く',
				' \u001b[1m-f\u001b[0m - 現在のファイルを上書きする',
				' \u001b[1m-r\u001b[0m - rename output file, if already exists',
				' \u001b[1m-np\u001b[0m - Do not add preview thumbnail to DNG',
				' \u001b[1m-np\u001b[0m - Do not add preview thumbnail to DNG',
				' \u001b[1m-owb\u001b[0m - Use old style constant white balance',
				' \u001b[1m-cr \'copyright...\'\u001b[0m - add copyright to DNG',
				' \u001b[1m-fla\u001b[0m, \u001b[1m-flx\u001b[0m - add multiple images to fake long exposure, flx scales down',
				' \u001b[1m-R\u001b[0m - Wifi経由で接続されたImBまたは指定されたディレクトリからRAWを取得する',
				' \u001b[1m-J\u001b[0m - Wifi経由で接続されたImBまたは指定されたディレクトリからJPEGを取得する',
				' \u001b[1m-O\u001b[0m - Wifi経由で接続されたImBまたは指定されたディレクトリから非RAW/非JPEGを取得する',
				' \u001b[1m-n yyyy_mmdd_hhmmss\u001b[0m (または任意の長さのプレフィックス) - ImB からこのタイムスタンプより新しいもののみを選択する',
				' -----',
				' \u001b[1m--\u001b[0m - 残りのパラメータをローカル ファイルまたはディレクトリとして扱う',
				'<files-or-dirs> と -R/-J/-O/-n は同時に使用できません。'
				]
		},
		unkopt: {
			en: '\u001b[31mUnknown Option:\u001b[0m $$0',
			de: '\u001b[31mUnbekannte Option:\u001b[0m $$0',
			fr: '\u001b[31mOption inconnue:\u001b[0m $$0',
			ja: '\u001b[31m最後のパラメータの値が欠落しています。\u001b[0m'
		},
		missingval: {
			en: '\u001b[31mMissing value for last parameter.\u001b[0m',
			de: '\u001b[31mFehlender Wert für letzten Parameter.\u001b[0m',
			fr: '\u001b[31mValeur manquante pour le dernier paramètre.\u001b[0m',
			ja: '\u001b[31m最後のパラメータの値が欠落しています。\u001b[0m'
		},
		fnwarn: {
			en: '\u001b[31mWarning:\u001b[0m $$0 looks like a timestamp, did you forget \u001b[1m-n\u001b[0m or \u001b[1m--\u001b[0m in front of it?',
			de: '\u001b[31mWarnung:\u001b[0m $$0 sieht wie ein Zeitstempel aus, vielleicht \u001b[1m-n\u001b[0m oder \u001b[1m--\u001b[0m davor vergessen?',
			fr: '\u001b[31mAvertissement:\u001b[0m $$0 ressemble à un horodatage, oubliée \u001b[1m-n\u001b[0m ou \u001b[1m--\u001b[0m?',
			ja: '\u001b[31m警告:\u001b[0m $$0 lタイムスタンプのようですが、 \u001b[1m-n\u001b[0m または \u001b[1m--\u001b[0m 手前にあるのを忘れましたか?'
		},
		renamed: {
			en: '(renamed)',
			de: '(umbenannt)',
			fr: '(renomee)',
			ja: '(リネーム)'
		},
		readconfig: {
			en: '\u001b[2mConfig file $$0 read.\u001b[0m',
			de: '\u001b[2mKonfigurationsdatei $$0 eingelesen.\u001b[0m',
			ja: '\u001b[[2m構成ファイル $$0 が読み込まれます。\u001b[[0m'
		},
		noconfig: {
			de: '\u001b[2mKeine json Konfigurationsdatei gefunden, gesucht: $$0\u001b[0m',
			en: '\u001b[2mNo json config file found, searched: $$0\u001b[0m',
			ja: '\u001b[2mNo json 構成ファイルが見つかりません、検索: $$0\u001b[0m'
		},
		newmsg: {
			en: '\u001b[1mNew! Japanese translation thanks to Sadami Inoue!\u001b[0m Report Bugs: https://github.com/shyrodgau/imbraw2dng/issues',
			de: '\u001b[1mNeu! Japanische Übersetzung, danke an Sadami Inoue!\u001b[0m Fehler melden: https://github.com/shyrodgau/imbraw2dng/issues',
		}
	}
};

// ImBCBase: generic data
mylang = 'en';
withpreview = true;
// experimental
neutral = false;
copyright = '';
// { name: 'xxx.jpg', data: array-ifd... }
#exififds = [];

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
static zipmax = 50000000; // byte zip length, can be adjusted

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
//                  y      y     y     y      .      m     m     .      d      d      .      h     h      .      m     m      .      s     s
static tsregex = /^[02-3]([0-9]([0-9]([0-9](([^0-9])[01]([0-9](([^0-9])[0123]([0-9](([^0-9])[012]([0-9](([^0-9])[0-5]([0-9](([^0-9])[0-5]([0-9])?)?)?)?)?)?)?)?)?)?)?)?)?$/ // actually const
/* ImBCBase: Data for the Imback variants and exif stuff */
// generic imb filename format
//                   y    y    y    y     .         m    m     .        d     d      .        h    h      .        m    m      .        s    s     EXT
static fnregex = /^([2-3][0-9][0-9][0-9])([^0-9]?)([01][0-9])([^0-9]?)([0123][0-9])([^0-9]?)([012][0-9])([^0-9]?)([0-6][0-9])([^0-9]?)([0-6][0-9])(.*[.])([^.]*)$/ // actually const
// generic imb filename format, only timestamp
//                    y    y    y    y     .         m    m     .        d     d      .        h    h      .        m    m      .        s    s      .        n
static fnregexx = /^([2-3][0-9][0-9][0-9])([^0-9]?)([01][0-9])([^0-9]?)([0123][0-9])([^0-9]?)([012][0-9])([^0-9]?)([0-6][0-9])([^0-9]?)([0-6][0-9])([^0-9]?)([0-9]*)/ // actually const
static orients = [ '', 'none', '', 'upsidedown', '', '', 'clockwise', '', 'counterclockwise' ]; // actually const
static oriecw = [ 1, 6, 3, 8 ]; // clockwise indices // actually const
static types = [ "unknown", "ImB35mm", "MF 6x7 ", "MF6x4.5", "MF 6x6 ", "Film35 " ]; // all length 7, actually const
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
	},
	/* Film ! */
	{
		size: 30607488,
		w: 5216,
		h:3912,
		typ: 5,
		mode: ''
	}
];
// tone curve for profile in b64 gz:
tcb64gz = `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
7db//f0fZVIIVQggAAA=`;
// decoded tone curve:
tcbin = '';
// do not try dynamic wb:
constwb = false;
incdcp = true;
/* ImBCBase: debug */
debugflag = false;
useraw = null;
imbweb = 'http://192.168.1.254';
filmdemo = false;

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
subst(r, arg0, arg1, arg2, arg3) {
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
	if (name[name.length - offset] !== '_') return;
	let l = this.findlang(name.substring(name.length - offset + 1, name.length - offset + 3));
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
		} catch (e) {
			console.log(JSON.stringify(e));
			if (undefined !== this.exitcode) {
				this.exitcode++;
			}
		}
	}
	for (const ne of Object.keys(el).filter((k) => ((k !== 'en') && (k !== 'de') && (typeof(el[k]) !== 'string')))) {
		this.prxl(key + '.' + ne, el[ne]);
	}
}
/* ImBCBase: language helper */
findlang(i) {
	let found = 0;
	for (const l of ImBCBase.alllangs) {
		if (i.toUpperCase() === l.toUpperCase()) {
			this.mylang = l;
			found = 1;
			break;
		}
	}
	if ('zZ' === i || ('00' === this.mylang && document && window?.location.href.startsWith('http://127.0.0.1:8889'))) {
		this.mylang = 'en';
		this.imbweb = 'http://127.0.0.1:8889';
	}
	else if (!found) {
		this.mylang = 'en';
		console.log('Unknown language(2): ' + i);
	}
	else if ('00' === this.mylang)
		this.debugflag = true;
	return this.mylang;
}
/* ImBCBase: extract exif from jpeg */
xexif(name, view) {
	if (view.getUint8(0) !== 0xff) return; /* JFIF */
	if (view.getUint8(1) !== 0xd8) return;
	if (view.getUint8(2) !== 0xff) return; /* APP1 */
	if (view.getUint8(3) !== 0xe1) return;
	if (view.getUint8(6) !== 0x45) return; /* E */
	if (view.getUint8(7) !== 0x78) return; /* x */
	if (view.getUint8(8) !== 0x69) return; /* i */
	if (view.getUint8(9) !== 0x66) return; /* f */
	if (view.getUint8(12) !== 0x49) return; /* I */
	if (view.getUint8(13) !== 0x49) return; /* I */
	if (view.getUint8(14) !== 0x2a) return; /* magic */
	if (view.getUint8(15) !== 0x00) return; /* magic */
	let baseoff = 12, off = 12+4+4+2, exifoff = -1;
	let nent = TIFFOut.readshort(view, 12+4+4);
	for (let j=0; j<nent; j++) {
		let tag = TIFFOut.readshort(view, off);
		if (tag === 34665) {
			exifoff = TIFFOut.readint(view, off+8);
			break;
		}
		off += 12;
	}
	if (exifoff === -1) return;
	// but how long is it?
	let maxdat = 0;
	off = exifoff + baseoff;
	nent = TIFFOut.readshort(view, off);
	off += 2;
	for (let j=0; j<nent; j++) {
		// seek end of data for tags
		let typ = TIFFOut.readshort(view, off+2);
		let num = TIFFOut.readint(view, off+4);
		let addr = TIFFOut.readint(view, off+8);
		off += 12;
		let ee = TIFFOut.types.find(e => e.t === typ);
		if (undefined === ee) {
			console.log('EXIF: TYP NOT FOUND ' + typ);
			continue;
		}
		if (ee.l * num <= 4)
			continue;
		if (addr < exifoff) {
			console.log('EXIF OFFSET BEFORE IFD');
			continue;
		}
		if (addr + ee.l * num > maxdat) maxdat = addr + ee.l * num;
		// we correct the addresses so that 0 is start of exif ifd
		addr = addr - exifoff;
		view.setUint8(off-4, addr % 256);
		addr = Math.floor(addr / 256);
		view.setUint8(off-3, addr % 256);
		addr = Math.floor(addr / 256);
		view.setUint8(off-2, addr % 256);
		addr = Math.floor(addr / 256);
		view.setUint8(off-1, addr % 256);
		addr = Math.floor(addr / 256);
	}
	if (maxdat === 0) maxdat = off;
	if (maxdat - off > 10000) return;
	let na = [];
	for (let z = baseoff+exifoff; z<maxdat; z++)
		na.push(view.getUint8(z));
	this.#exififds.push( { name: name, data: na } );
}
/* ImBCBase: time values from filename */
static nametotime(name) {
	let res = ImBCBase.fnregexx.exec(name);
	if (res !== null) {
		const yr = Number.parseInt(res[1]);
		const mon = Number.parseInt(res[3]);
		const day = Number.parseInt(res[5]);
		const hr = Number.parseInt(res[7]);
		const min = Number.parseInt(res[9]);
		const sec = Number.parseInt(res[11]);
		const nn = Number.parseInt(res[13]);
		const dd = new Date(yr, mon -1, day, hr, min, sec);
		const datestr = "" + yr + ":" + ((mon < 10) ? "0":"") + mon + ":" + ((day < 10) ? "0":"") + day + " "+
			((hr < 10) ? "0":"") + hr + ":" + ((min < 10) ? "0":"") + min + ":" + ((sec < 10) ? "0":"") + sec;
		return { date: dd, datestr: datestr, nn: nn, yr: yr, mon: mon, day: day, hr: hr, min: min, sec: sec }
	}
	else return {};
}
/* ImBCBase: decode b64/gz */
static async mydecode(data, act) {
	let dcs = new DecompressionStream('gzip');
	let a = Uint8Array.from(atob(data), (m) => m.codePointAt(0));
	let blob = new Blob( [a] );
	//blob.arrayBuffer().then((r) => { console.log('BL ' + r.byteLength); });
	const decstr = blob.stream().pipeThrough(dcs);
	return new Response(decstr).arrayBuffer().then((r) => {
	   const v = new Uint8Array(r);
	   act(v);
	});
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
				if (undefined !== this.exitcode) this.exitcode++;
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
			if (rawname.substring(rawname.length - 4).toUpperCase() === '.JPG') this.xexif(rawname, view);
			this.writewrap(rawname, 'application/octet-stream', 'process.copyok' + (this.checkdlfolder ? 'checkdl' : ''), out, fromloop);
		}
		reader.onerror = (evt) => {
			console.log('Non-RAW process reader error for ' + f.name + ' ' + JSON.stringify(evt));
			this.mappx(false, 'words.sorryerr');
			this.mappx(true, 'process.errorreadingfile', f.name);
			this.stats.error++;
			if (undefined !== this.exitcode) this.exitcode++;
			this.handlenext(fromloop);
		}
		reader.readAsArrayBuffer(f);
		return;
	}
	let w, h, mode = "??";
	let typ = 0;
	const zz = ImBCBase.infos.findIndex(v => v.size === f.size);
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
			this.writewrap(rawname, 'application/octet-stream', 'process.copyok' + (this.checkdlfolder ? 'checkdl' : ''), out, fromloop);
		}
		reader.onerror = (evt) => {
			console.log('Unk-RAW process reader error for ' + f.name + ' ' + JSON.stringify(evt));
			this.mappx(false, 'words.sorryerr');
			this.mappx(true, 'process.errorreadingfile', f.name);
			this.stats.error++;
			if (undefined !== this.exitcode) this.exitcode++;
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
	let dateok = false;
	/*// date?
	if (undefined !== f.datestr) {
		datestr = f.datestr;
		dateok = true;
	}*/
	let { date, datestr, nn } = ImBCBase.nametotime(rawname);
	if (date && datestr) dateok = true;
	else datestr = '';

	const reader = f.imbackextension ? f : new FileReader();
	reader.onload = async (evt) => {
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
						} catch { ; }
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
		let ori = orientation ? orientation : (typ === 5 ? 3 : 1);
		let transp = false;
		if (ori !== 1) {
			this.mappx(0, 'process.orientation', this.xl0('preview.orients.' + ImBCBase.orients[ori]));
			if (ori === 6 || ori === 8) transp = true;
		}
		const wb = this.constwb ? [ 6, 10, 1, 1, 6, 10 ] : ImBCBase.getwb(view, zz);
		//console.log('WB ' + JSON.stringify(wb));
		if (!this.constwb)
			this.mappx(0, 'process.foundwb', Math.round(100*wb[0]/wb[1]), Math.round(100*wb[2]/wb[3]), Math.round(100*wb[4]/wb[5]));
		/* Here comes the actual building of the DNG */
		let ti = new TIFFOut();
		ti.addIfd(); /* **************************************** */
		if (this.withpreview && !this.neutral) {
			this.mappx(0, 'process.addpreview');
			/* **** PREVIEW image **** */
			let scale = 32;
			if (w < 4096 && h < 4096) scale=16;
			ti.addImageStrip(1, ImBCBase.buildpvarray(view, typ, w, h, ori, scale, wb), Math.floor(transp ? (h+scale-1)/scale:(w+scale-1)/scale), Math.floor(transp ? (w+scale-1)/scale: (h+scale-1)/scale));
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
		if (this.#historystring.length && !this.filmdemo)
			ti.addEntry(37395, 'ASCII', this.#historystring); /* image history */
		this.#historystring = '';
		if (dateok) {
			ti.addEntry(306, 'ASCII', datestr); /* datetime */
			ti.addEntry(36867, 'ASCII', datestr); /* Original date time */
			// do we have exifdata ?
			let odate = date, onn = nn, cand=[];
			for (const e of this.#exififds) {
				let { date, nn } = ImBCBase.nametotime(e.name);
				if (date) {
					//console.log('DGT ' + date.getTime() + ' OGT ' + odate.getTime() + ' nn ' + nn + ' onn ' + onn);
					if (Math.abs(date.getTime() - odate.getTime()) < 5000 && Math.abs(nn -onn) < 2) {
						cand.push( { e: e, td: date.getTime() - odate.getTime() });
					}
				}
			}
			if (cand.length) {
				let e =  cand.sort((a, b) => a.td - b.td)[0].e;
				this.mappx(0, 'process.addexif', e.name);
				ti.addExifIfd(e.data);
			}
		}
		ti.addEntry(50706, 'BYTE', [ 1, 4, 0, 0 ]); /* DNG Version */
		if (this.copyright != '') {
			// do UTF-8 bytes instead of ASCII if necessary
			let bytes = new TextEncoder().encode(this.copyright);
			//console.log('cr str ' + this.copyright.length + ' bytes ' + bytes.length);
			if (bytes.length === this.copyright.length)
				ti.addEntry(33432, 'ASCII', this.copyright); /* copyright */
			else
				ti.addEntry(33432, 'BYTE', bytes); /* copyright */
		}
		ti.addEntry(50707, 'BYTE', [ 1, 4, 0, 0 ]); /* DNG Backward Version */
		ti.addEntry(50717, 'LONG', [ (typ === 5) ? 4095 : 255 ]); /* White level */
		if (typ === 5) ti.addEntry(50714, 'SHORT', [ 240, 240, 240, 240 ] ); /* Blacklevel */
		if (typ === 5) ti.addEntry(50713, 'SHORT', [ 2, 2 ] ); /* Blacklevel Repeat dim */
		if (!this.neutral) {
			if (!this.filmdemo) ti.addEntry(50827, 'BYTE', rawnamearr); /* Raw file name */
			ti.addEntry(50728, 'RATIONAL', wb); /* As shot neutral */
			/*  new:  */
			if (this.incdcp) {
				this.mappx(0, 'process.adddcp');
				ti.addEntry(50721, 'SRATIONAL', [ 22391,10000, -14178,10000, 3345,10000, 2113,10000, 1690,10000, 6377,10000, -42,10000, -2569,10000, 6895,10000 ]); /* Color Matrix 1 */
				ti.addEntry(50722, 'SRATIONAL', [ 12256,10000, -4258,10000, -906,10000, -2245,10000, 10192,10000, 2418,10000, -47,10000, 1018,10000, 4580,10000 ]); /* Color Matrix 2 */
				ti.addEntry(50964, 'SRATIONAL', [ 4004,10000, 5488,10000, 151,10000, -152,10000, 10505,10000, -353,10000, -2088,10000, 6546,10000, 3793,10000 ]); /* Forward Matrix 1 */
				ti.addEntry(50965, 'SRATIONAL', [ 7341,10000, 1310,10000, 993,10000, 1930,10000, 8267,10000, -197,10000, 69,10000, -3866,10000, 12047,10000 ]); /* Forward Matrix 2 */
				ti.addEntry(50778, 'SHORT', [ 17 ]); /* Calibration Illuminant 1 - StdA */
				ti.addEntry(50779, 'SHORT', [ 21 ]); /* Calibration Illuminant 2 - D65 */
				if (0 === this.tcbin.length) {
					await ImBCBase.mydecode(this.tcb64gz, (d) => {
							this.tcbin = d;
					});
				}
				ti.addEntry(50940, 'FLOATBIN', this.tcbin); /* Profile tone curve */
				ti.addEntry(50936, 'ASCII', 'Generic ImB'); /* Camera calibration name */
				ti.addEntry(50941, 'LONG', [ 3 ]); /* profile embed policy unrestricted */
				ti.addEntry(50942, 'ASCII', "Stefan Hegny for ImBack CC0"); /* profile copyright */
				ti.addEntry(50932, 'ASCII', 'Generic ImB conv profile Sig'); /* Profile calibration signature */
				ti.addEntry(50931, 'ASCII', 'Generic ImB conv profile Sig'); /* Camera calibration signature */
				// above stuff is now replaced taken from a dual-illuminant DCP profile
			}
			else {
				// like before
				ti.addEntry(50721, 'SRATIONAL', [ 19624, 10000, -6105, 10000, -34134, 100000, -97877, 100000, 191614, 100000, 3345, 100000, 28687, 1000000, -14068, 100000, 1348676, 1000000 ]); /* Color Matrix 1 */
				ti.addEntry(50964, 'SRATIONAL', [ 7161, 10000, 10093, 100000, 14719, 100000, 25819, 100000, 72494, 100000, 16875, 1000000, 0, 1000000, 5178, 100000, 77342, 100000 ]); /* Forward Matrix 1 */
				ti.addEntry(50778, 'SHORT', [ 23 ]); /* Calibration Illuminant 1 - D50 */
			}
		}
		if (this.withpreview && !this.neutral) {
			ti.addEntry(50971, 'ASCII', new Date(Date.now()).toISOString() ); /* Preview date time */
			ti.addSubIfd(); /* **************************************** */
		}
		/* **** RAW image **** */
		ti.addImageStrip(0, view, w, h);
		ti.addEntry(258 , 'SHORT', [ (typ === 5) ? 12 : 8 ]); /* BitsPerSample */
		ti.addEntry(259 , 'SHORT', [ 1 ]); /* Compression - none */
		ti.addEntry(262, 'SHORT', [ 0x8023 ]); /* Photometric - CFA */
		ti.addEntry(277, 'SHORT', [ 1 ]); /* Samples per Pixel */
		ti.addEntry(284, 'SHORT', [ 1 ]); /* Planar config - chunky */
		ti.addEntry(33421, 'SHORT', [ 2, 2 ]); /* CFA Repeat Pattern Dim */
		ti.addEntry(33422, 'BYTE', (typ > 1 && typ < 5) ? [ 2, 1, 1, 0 ] : [ 1, 0, 2, 1 ]); /* CFA Pattern dep. on MF/35mm*/
		this.writewrap(rawname.substring(0, rawname.length - 3) + 'dng', 'image/x-adobe-dng', 'process.converted' + ((this.checkdlfolder && !this.zip) ? 'checkdl' : ''), ti.getData(), fromloop);
	};
	reader.onerror = (evt) => {
		console.log('Unk-RAW process reader error for ' + f.name + ' ' + JSON.stringify(evt));
		this.mappx(false, 'words.sorryerr');
		this.mappx(true, 'process.errorreadingfile', f.name);
		this.stats.error++;
		if (undefined !== this.exitcode) this.exitcode++;
		this.handlenext(fromloop);
	};
	reader.readAsArrayBuffer(f);
}
/* ImBCBase: wrapper for zip output */
writewrap(name, type, okmsg, arr1, fromloop) {
	if (this.zip) {
		this.zip.add(arr1, name, () => {
			this.mappx(true, okmsg, name);
			this.writepostok(name, fromloop);
			if (this.zipdata && this.zipdata.length > ImBCHtml.zipmax) {
				this.zip.finish(() => {
					let o = new Uint8Array(this.zipdata.length);
					for (let p=0; p<this.zipdata.length; p++) o[p] = this.zipdata[p];
					this.writefile('imbraw2dng_' + ('' + Date.now()).substring(3,10) + '_out.zip', 'application/zip', 'process.copyokcheckdl', o);
					this.zipdata = [];
					this.zip = new ZIPHelp((data, cb) => {
						for (let l=0; l<data.length; l++) this.zipdata.push(data[l]);
						cb();
					});
				});
			}
		});
	} else
		this.writefile(name, type, okmsg, arr1, fromloop);
}
/* ImBCBase: get white balance */
static getwb(view, typidx) {
	//console.log('GWB ' + typidx + ' ' + JSON.stringify(ImBCBase.infos[typidx]));
	const t = ImBCBase.infos[typidx];
	let r=1, g=1, b=1;
	for (let i=Math.round(0.05*t.h)*2; i<Math.ceil(0.9*t.h); i+=8) {
		for (let j=Math.round(0.05*t.w)*2; j<Math.ceil(0.9*t.w); j+=8) {
			let x = ImBCBase.getPix(j, i, t.w, view, t.typ);
			let lr = x[0];
			let lg = x[1];
			let lb = x[2];
			let p = Math.sqrt(lg*lg + lb*lb + lr*lr);
			if (p < 3 || p > (3*250)) continue;
			//if (((i*t.w + j) % 50000) < 10)
			//	console.log('i ' + i + ' j ' + j + ' R ' + lr + ' G ' + lg + ' B ' + lb + ' P ' + p);
			b += (lb)/(p);
			g += (lg)/(p);
			r += (lr)/(p);
		}
	}
	if ((r > b) && (r > g)) {
		return [ 10, 10, Math.ceil(300000*g/r), 300000, Math.ceil(300000*b/r), 300000 ];
	}
	else if ((b > r) && (b > g)) {
		return [ Math.ceil(300000*r/b), 300000, Math.ceil(300000*g/b), 300000, 10, 10 ];
	}
	else {
		return [ Math.ceil(300000*r/g), 300000, 10, 10, Math.ceil(300000*b/g), 300000 ];
	}
}
/* ImBCBase: get one downsampled median image value [ r g b ] */
static getPix(x, y, w, view, typ) {
	let outrgb = [];
	let reds = [];
	let w3 = w + (w>>1);
	let xx = x + (x>>1);
	if (typ === 5) {
		reds.push(((view.getUint8((y+0)*w3 + xx+0) +  ((view.getUint8((y+0)*w3 + xx+1) &0xF) << 8))-240)/16);
		reds.push(((view.getUint8((y+0)*w3 + xx+3) +  ((view.getUint8((y+0)*w3 + xx+4) &0xF) << 8))-240)/16);
		reds.push(((view.getUint8((y+2)*w3 + xx+0) +  ((view.getUint8((y+2)*w3 + xx+1) &0xF) << 8))-240)/16);
		reds.push(((view.getUint8((y+2)*w3 + xx+3) +  ((view.getUint8((y+2)*w3 + xx+4) &0xF) << 8))-240)/16);
	}
	else if (typ > 1) {
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
	if (typ === 5) {
		greens.push((((view.getUint8((y+0)*w3 + xx+2)<<4) +  ((view.getUint8((y+0)*w3 + xx+1) &0xF0) >> 4))-240)/16);
		greens.push(((view.getUint8((y+1)*w3 + xx+0) +  ((view.getUint8((y+1)*w3 + xx+1) &0xF) << 8))-240)/16);
		greens.push((((view.getUint8((y+0)*w3 + xx+5)<<4) +  ((view.getUint8((y+0)*w3 + xx+4) &0xF0) >> 4))-240)/16);
		greens.push(((view.getUint8((y+1)*w3 + xx+3) +  ((view.getUint8((y+1)*w3 + xx+4) &0xF) << 8))-240)/16);
		greens.push((((view.getUint8((y+2)*w3 + xx+2)<<4) +  ((view.getUint8((y+2)*w3 + xx+1) &0xF0) >> 4))-240)/16);
		greens.push(((view.getUint8((y+3)*w3 + xx+0) +  ((view.getUint8((y+3)*w3 + xx+1) &0xF) << 8))-240)/16);
		greens.push((((view.getUint8((y+2)*w3 + xx+5)<<4) +  ((view.getUint8((y+2)*w3 + xx+4) &0xF0) >> 4))-240)/16);
		greens.push(((view.getUint8((y+3)*w3 + xx+3) +  ((view.getUint8((y+3)*w3 + xx+4) &0xF) << 8))-240)/16);
	}
	else if (typ > 1) {
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
	if (typ == 5) {
		blues.push((((view.getUint8((y+1)*w3 + xx+2)<<4) +  ((view.getUint8((y+1)*w3 + xx+1) &0xF0) >> 4))-240)/16);
		blues.push((((view.getUint8((y+1)*w3 + xx+5)<<4) +  ((view.getUint8((y+1)*w3 + xx+4) &0xF0) >> 4))-240)/16);
		blues.push((((view.getUint8((y+3)*w3 + xx+2)<<4) +  ((view.getUint8((y+3)*w3 + xx+1) &0xF0) >> 4))-240)/16);
		blues.push((((view.getUint8((y+3)*w3 + xx+5)<<4) +  ((view.getUint8((y+3)*w3 + xx+4) &0xF0) >> 4))-240)/16);
	}
	else if (typ > 1) {
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
static buildpvarray(view, typ, w, h, orientation, scale, wb) {
	if (undefined === wb) wb = [ 6, 10, 1, 1, 6, 10 ];
	const sfact = scale ? scale : 8;
	const w8 = Math.floor((w+(sfact -1))/sfact);
	const h8 = Math.floor((h+(sfact -1))/sfact);
	const rfact = (wb[1]/wb[0]);
	const gfact = (wb[3]/wb[2]);
	const bfact = (wb[5]/wb[4]);
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
			if (rfact*a[0] > allmax) allmax = rfact*a[0];
			if (rfact*a[0] < allmin) allmin = rfact*a[0];
			outpix.push(a[1]);
			if (a[1] > maxgreen) maxgreen = a[1];
			if (a[1] < mingreen) mingreen = a[1];
			if (gfact*a[1] > allmax) allmax = a[1] * gfact;
			if (gfact*a[1] < allmin) allmin = a[1] * gfact;
			outpix.push(a[2]);
			if (a[2] > maxblue) maxblue = a[2];
			if (a[2] < minblue) minblue = a[2];
			if (bfact*a[2] > allmax) allmax = bfact*a[2];
			if (bfact*a[2] < allmin) allmin = bfact*a[2];
		}
	}
	const fact = 255 / (allmax - allmin);
	//console.log('ai ' + allmin + ' ax ' + allmax + ' ri ' + minred + ' rx ' + maxred + ' gi ' + mingreen + ' gx ' + maxgreen + ' bi ' + minblue + ' bx ' + maxblue);
	const o = scale ? 3 : 4;
	const uic = new Uint8ClampedArray(h8 * w8 * o);
	for (let i = 0; i < h8; i++) {
		for (let j=0; j< w8; j++) {
			if ((outpix[3*((i * w8) + j)] > rfact*250) &&
				(outpix[3*((i * w8) + j) + 2] > bfact*250) &&
				(outpix[3*((i * w8) + j) + 1] > gfact*250))
			{
				uic[o*((i*w8) + j)] = rfact*250;
				uic[o*((i*w8) + j) + 1] = gfact*250;
				uic[o*((i*w8) + j) + 2] = bfact*250;
			} else {
				// maybe some brightening gamma?
				const r = (fact * rfact*(outpix[3 * ((i*w8) + j)] - rfact*allmin));
				uic[o * ((i*w8) + j)] = 255-Math.round(255*((255-r)/255)*((255-r)/255));
				const g = (fact * gfact*(outpix[3 * ((i*w8) + j) + 1] - gfact*allmin));
				uic[o * ((i*w8) + j) + 1] = 255-Math.round(255*((255-g)/255)*((255-g)/255));
				const b = (fact * bfact*(outpix[3 * ((i*w8) + j) + 2] - bfact*allmin));
				uic[o * ((i*w8) + j) + 2] = 255-Math.round(255*((255-b)/255)*((255-b)/255));
				if (!scale) uic[o * ((i*w8) + j) + 3] = 255;
			}
		}
	}
	return uic;
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
			if (this.untypedclasses.findIndex(v => v === cl) === -1)
				this.untypedclasses.push(cl);
			if (this.typedclasses.findIndex(v => v === ('RAW' + cl)) === -1)
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
			if (this.untypedclasses.findIndex(v => v === cl) === -1)
				this.untypedclasses.push(cl);
			if (this.typedclasses.findIndex(v => v === ('JPG' + cl)) === -1)
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
			if (this.untypedclasses.findIndex(v => v === cl) === -1)
				this.untypedclasses.push(cl);
			if (this.typedclasses.findIndex(v => v === ('oth' + cl)) === -1)
				this.typedclasses.push('oth' + cl);
		}
	}
}
/* Indentation in - end of class ImBCBase */
}
/* *************************************** BASE class E N D *************************************** */
/* *************************************** Node js helper class *************************************** */
class ImBCNodeOut extends ImBCBase {
/* Indentation out */
// generic data
outdir = '.';
renamefiles = false;
withcolours = true;
ovwout = false;
typeflags = 0;
fromts = '0000';
exitcode = 0;
ptypeflags = 0; // from preferences
// tried configfiles
#configfiles = [ './.imbraw2dng.json' ];
#configloaded = '';
// string buffer for concatenating one line of output
#strbuff = '';
// zipping
writestream = null;
zipdata = null;
zip = null;
zipname = '';
ziperr = false;
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
				this.mappx(false, 'words.error');
				this.appmsgxl(0, 'process.errsave', outfile);
				this.appmsg(JSON.stringify(err), true);
				this.stats.error++;
				if (undefined !== this.exitcode) this.exitcode++;
				this.handlenext(fromloop);
			}
			else {
				this.appmsgxl(false, 'words.finished');
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
				console.log(this.xl('onimback.errconnect', this.imbweb));
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
				if (err) return onerr(url, fx);
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
			console.log(this.xl('onimback.errconnect', this.imbweb));
			console.log(JSON.stringify(e));
			if (undefined !== this.exitcode) this.exitcode++;
			onerr(url, fx);
		});
	}
	else {
		// read local (or cifs/nfs...) file
		this.fs.stat(url, (err, st) => {
			if (err) return onerr(url, fx);
			let ab = new ArrayBuffer(st.size);
			let ua = new Uint8Array(ab);
			let len = 0;
			const str = this.fs.createReadStream(url, { highWaterMark: st.size });
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
		});
	}
}
/* ImBCNodeOut: main handler function for one file */
handleonex() {
	if (this.zipname && !this.zip) {
		let first = true;
		this.zip = new ZIPHelp((data, cb) => {
			if (!this.ziperr) {
				this.fs.writeFile(this.zipname, data, {encoding: null, flush: true, flag: first?'wx':'a' }, (err) => {
						if (err) {
							this.ziperr = true;
							this.mappx(false, 'words.error');
							if (undefined !== this.exitcode) this.exitcode++;
							this.appmsg(JSON.stringify(err), true);
							require('process').exit(1);
						}
						else first = false;
						cb();
				});
			} else cb();
		});
	}
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
			let rawname = ImBCBase.basename(e);
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
		this.#configfiles[0] = './.imbraw2dng' + (this.filmdemo?'_film':'') + '.json';
	}
	else if (1 === tryno && process.env.HOME) {
		xch = process.env.HOME + this.pa.sep + '.config';
		dotflag = false;
		this.#configfiles.push(process.env.HOME + this.pa.sep + '.config' + this.pa.sep + 'imbraw2dng' + (this.filmdemo?'_film':'') + '.json');
	}
	else if (2 === tryno && process.env.XDG_CONFIG_HOME) {
		xch = process.env.XDG_CONFIG_HOME;
		dotflag = false;
		this.#configfiles.push(process.env.XDG_CONFIG_HOME + this.pa.sep + 'imbraw2dng' + (this.filmdemo?'_film':'') + '.json');
	}
	else {
		return callback();
	}
	this.fs.readFile(xch + this.pa.sep + (dotflag ? '.' : '' ) + 'imbraw2dng' + (this.filmdemo?'_film':'') + '.json', 'utf8',
		(err, data) => {
			//console.log(' READ: ' + xch + this.pa.sep + 'imbraw2dng.json' + ' ' + JSON.stringify(err) + ' ' + JSON.stringify(data));
			if (!err) {
				this.parseconfig(data);
				this.#configloaded = (xch + this.pa.sep + (dotflag ? '.' : '' ) + 'imbraw2dng' + (this.filmdemo?'_film':'') + '.json');
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
	if ('' !== this.#configloaded)
		this.mappx(true, 'node.readconfig', this.#configloaded);
	else
		this.mappx(true, 'node.noconfig', JSON.stringify(this.#configfiles));
}
/* ImBCNodeOut: nodejs: parse config */
parseconfig(data) {
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
	if (d.owb) this.constwb = true;
	if (d.ndcp) this.incdcp = false;
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
#connmsg = false;

/* ImBCNode: continue with the next file if any */
handlenext(/*fromloop*/) {
	if (this.actnum < this.allfiles.length - 1) {
		this.actnum++;
		this.handleonex();
	} else {
		if (this.zip) {
			this.zip.finish(() => {
				if (!this.ziperr) {
					this.mappx(false, 'words.finished');
					this.mappx(true, 'process.copyok', this.zipname);
				} else {
					this.mappx(false, 'words.error');
					this.mappx(true, 'process.errsave', this.zipname);
					if (undefined !== this.exitcode) this.exitcode++;
				}
				if (this.stats.total > 0) {
					this.appmsg('');
					this.mappx(true, 'process.totals', this.stats.total, this.stats.ok, this.stats.skipped, this.stats.error);
				}
				require('process').exit(this.exitcode);
			});
			return;
		}
		if (this.stats.total > 0) {
			this.appmsg('');
			this.mappx(true, 'process.totals', this.stats.total, this.stats.ok, this.stats.skipped, this.stats.error);
		}
		require('process').exit(this.exitcode);
	}
}
/* ImBCNode: nodejs: get imb data for node js */
checkimb(type, found) {
	//let subdir = '';
	let subdir = 'PHOTO';
	if (type) subdir='MOVIE';
	//this.ht.get('http://127.0.0.1:8000/PHOTO.html', (res) => {
	this.ht.get(this.imbweb + '/IMBACK/' + subdir + '/', (res) => {
			let err = false;
			if (res.statusCode !== 200 || !/^text\/html/.test(res.headers['content-type'])) {
				err = true;
				res.resume();
				if (!type) {
					return this.checkimb(true, false);
				}
				else if (type && !found) {
					console.log(this.xl('onimback.errconnect', this.imbweb));
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
						if (url.startsWith(this.imbweb))
							this.handle1imb(url);
						else
							this.handle1imb(this.imbweb+ url);
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
			console.log(this.xl('onimback.errconnect', this.imbweb));
			console.log(JSON.stringify(e));
			if (undefined !== this.exitcode) this.exitcode++;
		}
		else this.imbdoit();
	});
}
/* ImBCNode: post write ok handler */
writepostok(name, fromloop) {
	this.stats.ok++;
	this.handlenext(fromloop);
}
/* ImBCNode: nodejs: show help */
#help(caller) {
	caller = ImBCBase.basename(caller);
	let texts = this.xl0('node.help');
	console.log(this.subst(texts[0], ImBCBase.version));
	console.log(this.rmesc(this.xl0('node.newmsg')));
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
					if (v.substring(v.length -4).toUpperCase() === '.ZIP')
						this.zipname = v;
					else
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
						if (undefined !== this.exitcode) this.exitcode++;
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
				else if (v ==='-owb') {
					this.constwb = true;
				}
				else if (v ==='-ndcp') {
					this.incdcp = false;
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
						if (v.substring(v.length -4).toUpperCase() === '.ZIP')
							this.zipname = v.substring(2);
						else
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
							if (undefined !== this.exitcode) this.exitcode++;
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
				else if (v ==='-e') {
					this.neutral = true;
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
		console.log(this.rmesc(this.xl0('node.newmsg')));
		console.log('');
		console.log(this.xl0('main.coloursyourrisk'));
		console.log('');
		this.configinfo();
		if (this.typeflags === 0) this.typeflags = 7;
		this.handlerecurse();
	}
	else if (this.typeflags > 0) {
		console.log(this.subst(this.xl0('node.help')[0], ImBCBase.version));
		console.log(this.rmesc(this.xl0('node.newmsg')));
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
handlenext(/*fromloop*/) {
	if (this.actnum < this.allfiles.length - 1) {
		this.actnum++;
		this.handleonex();
	} else {
		if (this.zip) {
			this.zip.finish(() => {
				if (!this.ziperr) {
					this.mappx(false, 'words.finished');
					this.mappx(true, 'process.copyok', this.zipname);
				} else {
					this.mappx(false, 'words.error');
					this.mappx(true, 'process.errsave', this.zipname);
					if (undefined !== this.exitcode) this.exitcode++;
				}
				this.zip = null;
				this.zipdata = null;
				this.ziperr = false;
			});
		}
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
	if (ImBCBase.basename(process.argv[1].toUpperCase()).indexOf('IMBRAW2DNG_FILM') !== -1) {
		imbc.filmdemo = true;
		ImBCBase.version = 'V4.ZZZZZ';

	}
}
imbc.startnode();
