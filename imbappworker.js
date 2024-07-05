let cmd, name, cache, ori, fl, base;
onmessage = (e) => {
	//console.log(JSON.stringify(e.data));
	name = e.data.n;
	cmd = e.data.cmd;
	ori = e.data.o;
	fl = e.data.fl;
	cache = {};
	switch (cmd) {
	case 'seturl':
		base = e.data.url;
		break;
	case 'resolveandpreview':
		resolver(name, true);
		// this.previewworker.postMessage({ cmd: 'resolveandpreview', n: (f.url ? f.url :f), o: orientation });
 	  	// onmessage: { pix: array, n: name, o: orientation, c: cacheentry }
		break;
	case 'previewfromcache':
		buildpreviewcache(e.data.c, e.data.o);
		// this.previewworker.postMessage({ cmd: 'previewfromcache', c: cachehit, n: (f.url ? f.url :f), o: orientation });
		// onmessage: { pix: array, c: cache, n: name, o: orientation }
		break;
	case 'resolveandhandle':
		resolver(name, false);
		//this.previewworker.postMessage({ cmd: 'resolveandhandle', n: (f.name ? f.name : f), o: orientation, fl: fromloop });
		// onmessage: { ok?, n: f.name, o: orientation, fl: fromloop, c: cacheentry }
	}
};
/* WORKER: handle communication */
resolver = (url, preview, notfirst) => {
	let rot, e = url;
	if (url.url) {
		e = url;
		url = e.url;
		rot = e.rot;
	}
	let fx = {
		imbackextension: true,
		name: url
	};
	let xhr = new XMLHttpRequest();
	xhr.onload = (/*evt*/) => {
		let len = JSON.parse(xhr.getResponseHeader('content-length'));
		if (0 >= len) len=1;
		cache.data = xhr.response;
		cache.len = xhr.response.byteLength;
		fx.data = xhr.response;
		fx.size = xhr.response.byteLength;
		fx.readAsArrayBuffer = (fy) => {
			fy.onload({
				target: {
					result: fy.data				}
			});
		};
		xhr.onerror = undefined;
		xhr.ontimeout = undefined;
		xhr.onabort = undefined;
		if (notfirst) {
			if (!preview) {
				//console.log('POSTING ' + url);
				postMessage({ cmd: cmd, ok: true, n: url, o: ori, fl: fl, c: cache });
			}
			else {
				buildpreview(fx, ori);
			}
		} else resolver(e, preview, len);
	};
	xhr.onerror = (evt, typ) => {
		if (undefined === typ) typ = 'err';
		console.log('WORKER XHR err (createfx, ' + typ + ') for ' + url + ' readyState:' + xhr.readyState + ' http status:' + xhr.status + ' text: ' + xhr.statusText);
		xhr.onerror = undefined;
		xhr.onload = undefined;
		xhr.ontimeout = undefined;
		xhr.onabort = undefined;
		postMessage({ cmd: cmd, ok: false, n: name });
	};
	xhr.onabort = (evt) => { xhr.onerror(evt, 'abort'); };
	xhr.ontimeout = (evt) => { xhr.onerror(evt, 'timeout'); };
	if (notfirst && preview && (url.substring(url.length -4).toUpperCase() !== '.RAW')) {
		xhr.open('GET', base + adjurl(url) +'?custom=1&cmd=4001');
	} else {
		//fetch(base + adjurl(url), { mode: 'no-cors' }).then((rs) => {
		//		console.log('RRR ' + url + ' ' + JSON.stringify(rs.url));
		//});
		xhr.open(notfirst ? 'GET' : 'HEAD', base + adjurl(url));
	}
	xhr.setRequestHeader('Cache-control','max-stale');
	xhr.responseType = 'arraybuffer';
	xhr.timeout = (!notfirst || notfirst < 10000000) ? 30000 : Math.round(notfirst / 600);
	try {
		xhr.send();
	} catch (e) {
		console.log('WORKER XHR send exception (createfx) for ' + url + ' ' + e.toString());
		xhr.onerror = undefined;
		xhr.onload = undefined;
		xhr.ontimeout = undefined;
		xhr.onabort = undefined;
		postMessage({ cmd: cmd, ok: false, n: name });
	}
}
/* WORKER: build preview in array */
buildpvarray = (view, typ, w, h, orientation, scale, wb) => {
	if (undefined === wb) wb = [ 6, 10, 1, 1, 6, 10 ];
	const sfact = scale ? scale : 8;
	const w8 = Math.floor((w+(sfact -1))/sfact);
	const h8 = Math.floor((h+(sfact -1))/sfact);
	const rfact = (wb[1]/wb[0]);
	const gfact = (wb[3]/wb[2]);
	const bfact = (wb[5]/wb[4]);
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
	let hist = new Array(256);
	for (let i = 0; i < 256; i++) hist[i] = 0;
	let cnt = 0;
	for (let i = rowiterstart; i < rowiterend; i +=1) {
		for (let j = coliterstart; j < coliterend; j+=1) {
			let a = getPix(Math.abs(transpose ? i :j)*sfact, Math.abs(transpose ? j :i)*sfact, w, view, typ);
			outpix.push(a[0]);
			outpix.push(a[1]);
			outpix.push(a[2]);
			const v = Math.ceil((rfact*a[0] + gfact*a[1] + bfact*a[2])/3);
			if (v >= 255) hist[255]++;
			else hist[v]++;
			cnt++;
		}
	}
	// cut off top and bottom 7%
	let cntx = 0, allmin = 0, allmax = 255;
	while (cntx < (cnt * 0.07))
		cntx += hist[allmin++];
	allmin --;
	cntx = 0;
	while (cntx < (cnt * 0.07))
		cntx += hist[allmax--];
	allmax++;
	let fact;
	if (allmax > 247 && allmin < 8) fact = 1;
	/*else if (allmax - allmin < 33) {
		const d = ((255-33-allmin)/2)
		if (allmin < 255-33) {
			allmin += d;
			allmax += d;
		}
		fact = 8;
	}*/
	else fact = 240/(allmax - allmin);
	//console.log('ai ' + allmin + ' aa ' + allmax + ' ff ' + fact);
	const o = scale ? 3 : 4;
	const uic = new Uint8ClampedArray(h8 * w8 * o);
	for (let i = 0; i < h8; i++) {
		for (let j=0; j< w8; j++) {
			let nr = ((outpix[3*((i * w8) + j)] * rfact) - allmin) * fact + allmin;
			let ng = ((outpix[3*((i * w8) + j) + 1] * gfact) - allmin) * fact + allmin;
			let nb = ((outpix[3*((i * w8) + j) + 2] * bfact) - allmin) * fact + allmin;
			if (nr >= 255) {
				if (ng < 250) ng = Math.round(ng * 255 / nr);
				if (nb < 250) nb = Math.round(nb * 255 / nr);
				nr = 255;
			}
			else if (nr <= 0) nr = 0;
			if (ng >= 255) {
				if (nr < 250) nr = Math.round(nr * 255 / ng);
				if (nr >= 255) nr = 255;
				if (nb < 250) nb = Math.round(nb * 255 / ng);
				ng = 255;
			}
			else if (ng <= 0) ng = 0;
			if (nb >= 255) {
				if (ng < 250) ng = Math.round(ng * 255 / nb);
				if (ng >= 255) ng = 255;
				if (nr < 250) nr = Math.round(nr * 255 / nb);
				if (nr >= 255) nr = 255;
				nb = 255;
			}
			else if (nb <= 0) nb = 0;
			// maybe some brightening gamma?
			uic[o * ((i*w8) + j)] = 255-Math.round(255*((255-nr)/255)*((255-nr)/255));
			uic[o * ((i*w8) + j) + 1] = 255-Math.round(255*((255-ng)/255)*((255-ng)/255));
			uic[o * ((i*w8) + j) + 2] = 255-Math.round(255*((255-nb)/255)*((255-nb)/255));
			if (!scale) uic[o * ((i*w8) + j) + 3] = 255;
		}
	}
	return uic;
}
/* WORKER: browserdisplay: build preview */
// orientation: 1: norm, 3: rot 180, 6 rot 90 CW, 8: rot 270 CCW
buildpreview = (f, orientation) => {
	let w, h, typ;
	const zz = infos.findIndex(v => v.size === f.size);
	if (zz === -1) {
		console.log('WORKER preview: unsupported size ' + f.size + ' of ' + f.name);
		postMessage({ cmd: cmd, ok: false, n: name });
		return;
	}
	w = infos[zz].w;
	typ = infos[zz].typ;
	h = infos[zz].h;

	const w8 = Math.floor((w+7)/8);
	const h8 = Math.floor((h+7)/8);
	const reader = f.imbackextension ? f : new FileReader();
	reader.onload = (evt) => {
		postMessage({ cmd: 'afterload' });
		const contents = evt.target.result;
		const view = new DataView(contents);
		const wb = this.constwb ? [ 6, 10, 1, 1, 6, 10 ] : getwb(view, zz);
		let transpose = false;
		console.log('WOrKER ' + JSON.stringify(wb));
		let outpix = buildpvarray(view, typ, w, h, orientation, false, wb);
		// onmessage: { pix: array, n: name, o: orientation, c: cacheentry }
		postMessage({ cmd: cmd, pix: outpix, n: name, o: ori, c: cache });
	};
	reader.onerror = (/*evt*/) => {
		console.log('WORKER preview: error reading ' + f.name);
		postMessage({ cmd: cmd, ok: false, n: name });
	};
	reader.readAsArrayBuffer(f);
}
/* WORKER: browserdisplay: build preview from cache */
// orientation: 1: norm, 3: rot 180, 6 rot 90 CW, 8: rot 270 CCW
buildpreviewcache = (f, orientation) => {
	let w, h, typ;
	const zz = infos.findIndex(v => v.size === f.l);
	if (zz === -1) {
		console.log('WORKER preview: unsupported size ' + f.l + ' of ' + f.n);
		postMessage({ cmd: cmd, ok: false, n: name });
		return;
	}
	w = infos[zz].w;
	typ = infos[zz].typ;
	h = infos[zz].h;

	const w8 = Math.floor((w+7)/8);
	const h8 = Math.floor((h+7)/8);
	const contents = f.d;
	const view = new DataView(contents);
	const wb = this.constwb ? [ 6, 10, 1, 1, 6, 10 ] : getwb(view, zz);
	let transpose = false;
	console.log(JSON.stringify(wb));
	let outpix = buildpvarray(view, typ, w, h, orientation, false, wb);
	// onmessage: { pix: array, n: name, o: orientation, c: cacheentry }
	postMessage({ cmd: cmd, pix: outpix, n: name, o: ori, c: cache });
}
/* WORKER: get white balance */
getwb = (view, typidx) => {
	//console.log('GWB ' + typidx + ' ' + JSON.stringify(ImBCBase.infos[typidx]));
	const t = infos[typidx];
	let r=1, g=1, b=1;
	for (let i=Math.round(0.05*t.h)*2; i<Math.ceil(0.9*t.h); i+=8) {
		for (let j=Math.round(0.05*t.w)*2; j<Math.ceil(0.9*t.w); j+=8) {
			let x = getPix(j, i, t.w, view, t.typ);
			let lr = x[0];
			let lg = x[1] + 1;
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
/* WORKER: get one downsampled median image value [ r g b ] */
getPix = (x, y, w, view, typ) => {
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
/* WORKER: adjust A:\imback\... format to /imback/... */
adjurl = (url) => {
	if (url.url) url = url.url;
	if (url.toUpperCase().substring(0,3) !== 'A:\\')
		return url;
	let n = url.substring(2);
	while (n.indexOf("\\") > -1) {
		n = n.substring(0, n.indexOf("\\")) + '/' + n.substring(n.indexOf('\\') +1);
	}
	return n;
}
/* WORKER image formats */
infos = [ // actually const
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