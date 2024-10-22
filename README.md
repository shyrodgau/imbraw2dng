<!-- SPDX-License-Identifier: 0BSD -->
# imbraw2dng - Convert RAW files from [I'mBack<sup>&reg;</sup>](https://imback.eu) into DNG

Most of this is free software ([0-clause BSD-License](LICENSE.txt)) and not commercially supported.

oder [AUF DEUTSCH](https://shyrodgau.github.io/imbraw2dng/README_de)  
 [日本語](https://shyrodgau.github.io/imbraw2dng/README_ja)
 
## What to find here

- `imbraw2dng.html` - [Original converter](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.html) for use in browser from hard disk, internet, or directly from ImB   
also in different languages as `imbraw2dng_XX.html` (see [Internationalization](#internationalization))

- `imbapp.htm` - new [App-Like version of it](https://shyrodgau.github.io/imbraw2dng/imbapp.htm)

- `imbapp.apk` - [Real Android app](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk).  For Apple, see [here](#iphone).

- [`imbraw2dng.js`](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.js) - Node.js version for command line use   
also in different languages as `imbraw2dng_XX.js`  (see [Internationalization](#internationalization))

- Calibrated [Camera profiles for download](cameraprofiles.md) for ImB

- [`imbdng2raw.html`](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.html), [`imbdng2raw.js`](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.js) backward conversion from DNG to RAW, only for original DNGs converted using these tools


The ImB RAWs are not really "B&W RAW" but actually the RAW sensor data that also contains the colour filtering (unfortunately only 8 bit deep for 35mm and MF, but 12 bit for Film). 

DNG is an open TIFF-like format and consists mainly of constant data around the original image scanlines. 
If it is from an MF or Film ImB then the Color Filter Array is different.
Conversion to DNG currently sets the Timestamp Tags if the filename seems to be a reasonable I'm Back filename (i.e. `YYYY_MMDD_hhmmss`), and the 
OriginalRawFilename to the name of the RAW inputfile. That way you can name the DNG file whatever you like without losing much of the original information.

Problems and ideas can also be discussed on the "[Issues](https://github.com/shyrodgau/imbraw2dng/issues)" or "[Discussions](https://github.com/shyrodgau/imbraw2dng/discussions)" tabs 
of the [github repos](https://github.com/shyrodgau/imbraw2dng) or in the [I'm Back Users Group on Facebook](https://www.facebook.com/groups/1212628099691211).

## Get Started

If you use android, try the [Android app](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk)

If you prefer using it in the browser on your PC or smartphone, there are the choices:

- use one (or both) of the [newer `IMBAPP.HTM`](https://shyrodgau.github.io/imbraw2dng/imbapp.htm) or [classic `IMBRAW2DNG.HTML`](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.html) 
directly from the internet or copy them anywhere you like on your harddisk or memory.   
(**All data will stay inside your browser!**)   
In this case, you need to transfer the files from ImB or access the MicroSD via USB, adapter, original ImB App or whatsoever.

- <a name="browsing-on-the-imback">  </a>when you copy one (or both) of the versions onto the MicroSD into the `IMBACK` folder ([How do I do that?](#how-do-i-copy-html-files-to-the-microsd)), you can directly combine download and conversion to DNG: (videos and JPG can also be downloaded)    
`http://192.168.1.254/IMBACK/IMBAPP.HTM` (newer, also allows to set the clock time, record video or take pictures!) or   
`http://192.168.1.254/IMBACK/IMBRAW2DNG.HTML`  (classic, only download and conversion)   
**The device where you open the page needs to be in the ImB Wifi.**

If you like to use the command line, you can use the [imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) with node.js. It can also access the ImB if you are in the device Wifi. 
[Command line help](#command-line-using-nodejs)


## How do I copy HTML files to the MicroSD?

#### Android:

Install the [real app](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk) and use the extras menu.

#### Using a Micro SD reader/adapter or USB cable

Take the Micro SD from your back and insert it into Micro SD Adapter on your computer or phone, or connect ImB to your PC via USB and select `Mass Storage` on ImB.

Open the contents of the Micro SD/USB drive, it might be named `VOLUME1` or `0000-0001` and you should see a folder named `imback` or `IMBACK`.

Use your operating system/file explorer to copy the file `imbapp.htm` that you downloaded into the `imback` or `IMBACK` folder.  
<!--You can rename it with a language code `XX` (DE, JA, FR, more translations needed!) to `imbapp_XX.html` (note: `html` instead of `htm`!), but then you need to adjust the link below.-->

Eject the Micro SD from computer or phone and put back into your device - ready!

#### Via network

Put your Phone or PC into the ImB Wifi.

Use a new browser window or tab, navigate to [http://192.168.1.254/IMBACK/](http://192.168.1.254/IMBACK/).

Click on `Choose file` and select the `imbapp.htm` you just downloaded. Click `upload file` (wordings need to be checked) - ready!


## Usage

You can drag and drop all directories or files from the I'm back (i.e. from the micro SD inserted into your PC or the USB mass storage) into the blue field. It will then copy all non-RAW 
files exactly and convert the RAW files to DNG, replacing the `.raw`/`.RAW` file extension with `.dng`. When you use the `Choose Files` button, you can select RAW files directly. 

Your browser will download them according to its download settings, so it might pop up a dialog where to save it for each file if so configured, or 
throw all files into your Downloads directory (possibly renaming it) if so configured , or, or, or...

Conversion to DNG currently sets the Timestamp Tags if the filename seems to be a reasonable I'm Back filename (i.e. `YYYY_MMDD_hhmmss`), and the 
OriginalRawFilename to the name of the RAW inputfile. That way you can name the DNG file whatever you like without losing much of the original information.

If you ever need to revert the original RAW from the DNG (e.g. to do the conversion again with a never version), this is possbile using [imbdng2raw.html](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.html)


## Processing the DNG

Use your favourite software, e.g. darktable, lightroom, ufraw, rawtherapee etc.

Do **not** expect the image to be okay out-of-the-box. I will probably not be able to provide all tags in the DNG to satisfy all possible programmes. 
Take your time to adjust the colours and then the rest. *If anyone is experienced around DNGs or knows someone who would be willing to help - please get in contact* 
e.g. on [Discussion on pixls.us](https://discuss.pixls.us/t/converting-plain-raw-from-imback-to-dng/) for Darktable/RawSpeed or 
I'm Back digital back [Developers Group on Facebook](https://www.facebook.com/groups/2812057398929350).

A strong green or magenta tint all over the image should not happen any more! But if you have one and **can not** level it out using your software's 
color matrix/color calibration or white-balancing, a sample image might be interesing to fix it.

If a red highlighted spot is in the center of the image, a manual retouche after the processing is required, or use the following darktable setting, 
placing and sizing a circle shape manually around the area.

To avoid the red spot from the start, use a bigger aperture (smaller f-number) or combine the standard PDLC matte with a Fresnel screen from I'm Back 
or a Canon EG-xxx screen.

![darktable sample agains red circle](https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_redcircle.png "darktable sample agains red circle")


## Internationalization

The current supported langauges are english (EN), japanese (JA) and german (DE). If you save the html file with a name change to `imbraw2dng_XX.html` where `XX` 
is the language shortcut, it will open the page directly in that language. If you want to contribute to translating, translate what you are reading now or look 
[here](https://shyrodgau.github.io/imbraw2dng/translations.xls) and get in contact!

When you have [node.js](https://nodejs.org) version &ge; V20.10(LTS), you can get the file [imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js), 
save it as `imbraw2dng_00.js` and then call `node imbraw2dng_00.js -CSV > mytexts.csv` to generate a current CSV with texts to be translated.

## Command line using node.js

If and when you have [node.js](https://nodejs.org) version &ge; V20.10(LTS) installed, you can do the conversion via command line by getting the file 
[imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js). Naming conventions according to [Internationalization](#internationalization) 
apply. Parameter and calling help can be read with `node imbraw2dng.js`.
```
Usage: node imbraw2dng.js [-l lang] [-f | -r] [-d dir] [-nc | -co] [-np] [-ndcp] [-owb] [-cr copyright] [-R] [-J] [-O] [-n yyyy_mm_dd-hh_mm_ss] [-fla | -flx] [ [--] <files-or-dirs>* ]
Options:
 -h - show this help
 -nc - do not use coloured text
 -co - force coloured text
 -l XX - where XX is a valid language code (currently: DE, EN, FR, JA)
         Language can also be set by changing filename to imbraw2dng_XX.js .
 -d dir - put output files into dir
 -f - overwrite existing files
 -r - rename output file, if already exists
 -np - Do not add preview thumbnail to DNG
 -owb - Use old style constant white balance
 -ndcp - Do not include new DNG Color profile
 -cr 'copyright...' - add copyright to DNG
 -fla, -flx - add multiple images to fake long exposure, flx scales down
 -R - get RAW from ImB connected via Wifi or from given directories
 -J - get JPEG from ImB connected via Wifi or from given directories
 -O - get non-RAW/non-JPEG from ImB connected via Wifi or from given directories
 -n yyyy_mm_dd-hh_mm_ss (or prefix of any length) - select only newer than this timestamp from ImB or from given directories
 -----
 -- - treat rest of parameters as local files or dirs
 <files-or-dirs> - process local files or directories recursively, e.g. on MicroSD from ImB
```

About configuration see [imbraw2dng.json](imbraw2dng.json).

## Tipps, tricks, internals and details

Concerning `IMBAPP.HTM` and the Android app:    
Advantages over the [APP from ImB](https://imback.eu/home/app/):
- you can use it on any browser
- can display raw
- converts raw to DNG on download
- can be used offline just like imbraw2dng

Disadvantages over the APP from ImB:
- live image view for video not built in
- no local album browsing on PC/phone
- no tough guy looking at you

Differences over the APP from ImB:
- time on device not set automatically on connect, click menu manually (or use Setting to do it automatically)

Advantages over the my classic `imbraw2dng.html` when used on the ImB:
- can set the time of the ImB
- can take photos and film video
- faster jpeg previews
- can set image parameters (size, EV...)

Disadvantages over the classic imbraw2dng when not used on the ImB:
- step-by-step is gone, either process all (file select button) or use app-like the picture browser (on drag and drop)



The EXIF data in the JPEG files from ImB is of limited use, but if you would like to add it to your DNG files, this is possible. Process the JPEG first and then the corresponding RAW. 
Corresponding is defined as: time difference < 5 sec and counter (last part of filename) difference 1. It is not neccessary to be directly consecutive, first all JPEGs and then the RAWs should do it.

<a name="a-lot-more-tricks-and-details"> </a>
If you want to simulate a long "Long exposure" by several shorter ones to avoid the specific noise, you can do so by using the `-fla`/`-flx` parameters on node.js. 
Or set the checkbox below the blue field on the HTML page and then drag and drop the RAW-files you want to stack up together into the blue field.   
This is currently not working inside the android app.

Your preferred settings can be saved in a configuration file for node.js (see above) or in the browser when you load it from a web server (internet or from ImB).

You are welcome to browse the code, help translation or optimizing!

### iPhone

The android app consists of the same HTML/Javascript code as the html pages but wrapped with Apache Cordova. Building an IOS App should be possible similarly, but I neither own a Mac nor an iphone. If someone would like to help out??

---------------------------


## Original classic quick usage

`.../IMBACK` refers to the path of the device, either by mounting via USB cable (select `MassStorage` on device), or by inserting the Micro SD into the PC or smartphone.

1. Open [imbraw2dng.html](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.html) in browser. Drag and drop  `.../IMBACK/PHOTO` and `.../IMBACK/MOVIE` into the blue field. [(Details)](#usage)

1. (After copying [imbraw2dng.html](https://raw.githubusercontent.com/shyrodgau/imbraw2dng/master/imbraw2dng.html) into `.../IMBACK` folder on MicroSD and ejecting cleanly) 
Connect Smartphone or PC in ImB Wifi and navigate browser to [http://192.168.1.254/IMBACK/imbraw2dng.html](http://192.168.1.254/IMBACK/imbraw2dng.html) from ImB.

1. Download [imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) and invoke `node imbraw2dng.js .../IMBACK`.
[(Details)](#command-line-using-nodejs)

1. Connect PC into ImB Wifi, download [imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) and invoke `node imbraw2dng.js -R -J -O`.
[(Details)](#command-line-using-nodejs)


