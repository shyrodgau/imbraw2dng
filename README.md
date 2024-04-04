<!-- SPDX-License-Identifier: 0BSD -->
# imbraw2dng - Convert RAW files from [I'mBack<sup>&reg;</sup>&nbsp;35mm/MF](https://imback.eu) into DNG - Quick doc

This is free software ([0-clause BSD-License](LICENSE.txt)) and not commercially supported.

Full doc: [here](https://shyrodgau.github.io/imbraw2dng/moredoc)

oder [AUF DEUTSCH](https://shyrodgau.github.io/imbraw2dng/README_de)

They are not really "B&W RAW" but actually the RAW sensor data that also contains the colour filtering (unfortunately only 8 bit deep..). 

The page can do parts (or partially more - display RAW) of the mobile phone app.

Currently known to work for current firmware on 35mm (also for "Angle medium" and "small") and I'm Back MF (medium format). Not all angle variants are 
covered for MF, if you need it and can help contact me.

Problems and ideas can also be discussed on the "[Issues](https://github.com/shyrodgau/imbraw2dng/issues)" or "[Discussions](https://github.com/shyrodgau/imbraw2dng/discussions)" tabs 
of the [github repos](https://github.com/shyrodgau/imbraw2dng) or in the [I'm Back Users Group on Facebook](https://www.facebook.com/groups/1212628099691211).

## Basics ;tldr

The following ways focus on converting RAW files into DNG while copying. You only need one file for using with browser and/or one file for using with node.js.

`.../IMBACK` refers to the path of the device, either by mounting via USB cable (select `MassStorage` on device), or by inserting the Micro SD into the PC or smartphone.

1. Open [imbraw2dng.html](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.html) in browser. Drag and drop files from `.../IMBACK/PHOTO` and `.../IMBACK/MOVIE` into the blue field. [(Details)](https://shyrodgau.github.io/imbraw2dng/moredoc#usage)

1. (After copying [imbraw2dng.html](https://raw.githubusercontent.com/shyrodgau/imbraw2dng/master/imbraw2dng.html) into `.../IMBACK` folder on MicroSD and ejecting cleanly) 
Connect Smartphone or PC in ImB Wifi and navigate browser to [http://192.168.1.254/IMBACK/imbraw2dng.html](http://192.168.1.254/IMBACK/imbraw2dng.html) from ImB.
[(Details)](https://shyrodgau.github.io/imbraw2dng/moredoc#browsing-on-the-imback)

1. Download [imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) and invoke `node imbraw2dng.js .../IMBACK`.
[(Details)](https://shyrodgau.github.io/imbraw2dng/moredoc#command-line-using-nodejs)

1. Connect PC into ImB Wifi, download [imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) and invoke `node imbraw2dng.js -R -J -O`.
[(Details)](https://shyrodgau.github.io/imbraw2dng/moredoc#command-line-using-nodejs)


## Processing the DNG

Use your favourite software, e.g. darktable, lightroom, ufraw, rawtherapee etc.

Do **not** expect the image to be okay out-of-the-box. I will probably not be able to provide all tags in the DNG to satisfy all possible programmes. 
Take your time to adjust the colours and then the rest. *If anyone is experienced around DNGs or knows someone who would be willing to help - please get in contact* 
e.g. on [Discussion on pixls.us](https://discuss.pixls.us/t/converting-plain-raw-from-imback-to-dng/) for Darktable/RawSpeed or 
I'm Back digital back [Developers Group on Facebook](https://www.facebook.com/groups/2812057398929350).

A strong green or magenta tint all over the image should not happen any more! But if you have one and **can not** level it out using your software's 
color matrix/color calibration or white-balancing, a sample image might be interesing to fix it.

**Word on colours:** I don't have the slightest idea...

If a red highlighted spot is in the center of the image, a manual retouche after the processing is required, or use the following darktable setting, 
placing and sizing a circle shape manually around the area.

To avoid the red spot from the start, use a bigger aperture (smaller f-number) or combine the standard PDLC matte with a Fresnel screen from I'm Back 
or a Canon EG-xxx screen.

![darktable sample agains red circle](https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_redcircle.png "darktable sample agains red circle")

