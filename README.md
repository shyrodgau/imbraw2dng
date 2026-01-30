<!-- SPDX-License-Identifier: 0BSD -->
<!-- pandoc -f markdown -t html -o README.html README.md -->
# imbraw2dng - Convert RAW files from [I'mBack<sup>&reg;</sup>](https://imback.eu) 35/MF/Film into DNG

Most of this is free software ([0-clause BSD-License](LICENSE.txt)) and not commercially supported.

oder [AUF DEUTSCH&#x1f1e9;&#x1f1ea;](https://shyrodgau.github.io/imbraw2dng/README_de)  
 [日本語&#x1f1ef;&#x1f1f5;](https://shyrodgau.github.io/imbraw2dng/README_ja)    
 [**&rarr;MiMi&larr;**](https://shyrodgau.github.io/imbraw2dng/README_MiMi)
 
## What to find here

[Get started](#getstarted) - [Usage](#usage) - [Processing the DNG](#processingdng) - [Metadata/Exif](#metaexif) - [Credits](#credits) - and more

- [**&#x261e;**`imbapp.htm`](https://shyrodgau.github.io/imbraw2dng/imbapp.htm) - App-Like converter for use in browser from hard disk, internet, or directly from ImB   
also in different languages as `imbapp_XX.htm` (see [Internationalization](#internationalization))   
Can also do backward dng to raw.

- [**&#x261e;**`imbapp.apk`](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk) - Real Android app.  For Apple, see [here](#iphone).

- [**&#x261e;**`imbraw2dng.js`](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) - Node.js version for command line use   
also in different languages as `imbraw2dng_XX.js`  (see [Internationalization](#internationalization))

<!-- - [**&#x261e;**`imbraw2dng.html`](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.html) - Historic version   
also in different languages as `imbraw2dng_XX.html` (see [Internationalization](#internationalization))-->

- Calibrated [Camera profiles for download](https://shyrodgau.github.io/imbraw2dng/profiles/README) for ImB

- [**&#x261e;**`imbdng2raw.html`](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.html), [**&#x261e;**`imbdng2raw.js`](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.js) backward conversion from DNG to RAW, only for original DNGs converted using these tools


The ImB RAWs are not really "B&W RAW" but actually the RAW sensor data that also contains the colour filtering (unfortunately only 8 bit deep for 35mm and MF, but 12 bit for Film and MiMi). 

DNG (Adobe&reg; Digital NeGative) is an open format and consists mainly of the original image scanlines. 

Problems and ideas can also be discussed on the "[Issues](https://github.com/shyrodgau/imbraw2dng/issues)" or "[Discussions](https://github.com/shyrodgau/imbraw2dng/discussions)" tabs
of the [github repos](https://github.com/shyrodgau/imbraw2dng) or in the [I'm Back Users Group on Facebook](https://www.facebook.com/groups/1212628099691211).


## <a id="getstarted" name="getstarted">  </a>Get Started

If you use **android**, try the [Android app](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk) with your android device in (or out of) the ImB Wifi.

If you prefer using it in the **browser** on your PC or smartphone, there are the choices (All data will stay inside your browser!):

- use the [**&#x261e;**`IMBAPP.HTM`](https://shyrodgau.github.io/imbraw2dng/imbapp.htm) directly from the internet or copy it anywhere you like on your harddisk or memory.      
Some browsers (even on mobiles) will allow you to install it as PortableWebApp for easy offline use. It might also be called or hidden behind "Add to desktop".   
In this case, you need to transfer the files from ImB or access the MicroSD via USB, adapter, original ImB App or whatsoever.

- <a id="browsing-on-theimback" name="browsing-on-the-imback">  </a>when you copy that file directly onto the MicroSD into the `IMBACK` folder ([How do I do that?](#how-do-i-copy-html-files-to-the-microsd)), you can directly combine download and conversion to DNG    
(videos and JPG can also be downloaded, also allows to set the clock time, delete files, record video or take pictures!)    
`http://192.168.1.254/IMBACK/IMBAPP.HTM`    
The device where you open the page needs to be in the ImB Wifi.

If you like to use the **command line**, you can use the [imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) with node.js. It can also access the ImB if you are in the device Wifi. 
[Command line help](#command-line-using-nodejs)


## How do I copy HTML files to the MicroSD?

.... when you want to download/convert directly in your browser from ImB.

#### Android:

Install the [real app](https://shyrodgau.github.io/imbraw2dng/cordova/imbapp/apk/imbapp.apk), then enter ImB Wifi and use the extras menu.

#### Using a Micro SD reader/adapter or USB cable
Take the Micro SD from your back and insert it into Micro SD Adapter on your computer or phone, or connect ImB to your PC via USB and select `Mass Storage` on ImB.    
Open the contents of the Micro SD/USB drive, it might be named `VOLUME1` or `0000-0001` and you should see a folder named `imback` or `IMBACK`.    
Use your operating system/file explorer to copy the file [`imbapp.htm` that you downloaded](https://raw.githubusercontent.com/shyrodgau/imbraw2dng/master/imbapp.htm) into the `imback` or `IMBACK` folder.      
Eject the Micro SD from computer or phone and put back into your device - ready!

#### Via network
Put your Phone or PC into the ImB Wifi.    
Use a new browser window or tab, navigate to [http://192.168.1.254/IMBACK/](http://192.168.1.254/IMBACK/).    
Click on `Choose file` and select the [`imbapp.htm` you just downloaded](https://raw.githubusercontent.com/shyrodgau/imbraw2dng/master/imbapp.htm). Click `upload file` (wordings need to be checked) - ready!    

## <a id="usage" name="usage"> </a>Usage

You can drag and drop all directories or files from the I'm back (i.e. from the micro SD inserted into your PC or the USB mass storage) into the blue field. It will then copy all non-RAW 
files exactly and convert the RAW files to DNG, replacing the `.raw`/`.RAW` file extension with `.dng`. When you use the `Choose Files` button, you can select RAW files directly. 

Your browser will download them according to its download settings, so it might pop up a dialog where to save it for each file if so configured, or 
throw all files into your Downloads directory (possibly renaming it) if so configured , or, or, or...

When you use the android app or point browser directly to the converter page on your ImB, it should be intuitive! If you do not think so, let me know.

Conversion to DNG currently sets the Timestamp Tags if the filename seems to be a reasonable I'm Back filename, and the 
OriginalRawFilename to the name of the RAW inputfile. That way you can name the DNG file whatever you like without losing <strike>much</strike> any of the original information.

If you ever need to revert the original RAW from the DNG (e.g. to do the conversion again with a never version), <a href="#revert-to-raw"> see here </a>.

![](https://shyrodgau.github.io/imbraw2dng/helpstuff/usercontrols.png "User controls")

1: <span style="font-weight:bold;">&#x22ee;</span> Menu    
2: Battery level (when connected to ImB)    
3: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x1f5d1;&#xfe0e;</span> Delete selected (when connected to ImB)    
4: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x2b73;&#xfe0e;</span> Download/Convert selected (only Picture Browser)    
5: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x1f3d4;&#xfe0e;</span> Picture Browser (when files loaded)    
6: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x1f4f7;&#xfe0e;</span> Take Photos (when connected to ImB)    
7: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x1f4fd;&#xfe0e;</span> Take Videos (when connected to ImB)    
8: Grouping (only Picture Browser)    
9: Sorting (only Picture Browser)    
10: Select all/none (only Picture Browser)    
11: <span style="display:inline-block;width:1.2em; height:1.2em; border: 2px solid grey; border-radius:0.63em;">&#x1f5c2;&#xfe0e;</span> File Selection (when not connected to ImB. Sharing files with app is always possible)    
12: &#x2b73;&#xfe0e; Download/Convert this     
13: &#x2b6e;&#xfe0e; Rotate clockwise  (if raw)  
14: &#x2b6f;&#xfe0e; Rotate counterclockwise  (if raw)   
15: &#x231a;&#xfe0e; Correct timestamp     
16: Download raw JPEG  (if raw and configured)    
17: &#x1f5d1;&#xfe0e; Delete    
18: Select this for action in picture browser   
19: &#x270e;&#xfe0e; Set description  (if raw)    
20: &#x1f50d;&#xfe0e; View magnified


## <a id="processingdng" name="processingdng">  </a>Processing the DNG

Use your favourite software, e.g. darktable, lightroom, ufraw, rawtherapee etc.


Do **not** expect the image to be okay out-of-the-box.
Take your time to adjust the colours and then the rest. *If anyone is experienced around DNGs or knows someone who would be willing to help - please get in contact* 
e.g. on [Discussion on pixls.us](https://discuss.pixls.us/t/converting-plain-raw-from-imback-to-dng/) for Darktable/RawSpeed or 
I'm Back digital back [Developers Group on Facebook](https://www.facebook.com/groups/2812057398929350).


If a red highlighted spot is in the center of the image (ImB 35mm/MF), a manual retouche after the processing is required, or use the <a href="https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_redcircle.png">this darktable setting</a>, 
placing and sizing a circle shape manually around the area. To avoid the red spot from the start, use a bigger aperture (smaller f-number) or combine the standard PDLC matte with a Fresnel screen from I'm Back 
or a Canon EG-xxx screen.

<!-- ![darktable sample agains red circle](https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_redcircle.png "darktable sample agains red circle") -->


## Internationalization

The current supported langauges are english (EN), japanese (JA) and german (DE). If you save the imbraw2dng.js file with a name change to `imbraw2dng_XX.js` where `XX` 
is the language shortcut, it will run directly in that language. **If you want to contribute to translating, translate what you are reading now or look 
[here](https://shyrodgau.github.io/imbraw2dng/translations.xls) and get in contact!**

E.g. [german version](https://shyrodgau.github.io/imbraw2dng/imbapp_de.htm), [japanese version](https://shyrodgau.github.io/imbraw2dng/imbapp_ja.htm) (same files, different names). 

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
 -l XX - where XX is a valid language code (currently: DE, EN, JA)
         Language can also be set by changing filename to imbraw2dng_XX.js .
 -d dir - put output files into dir
 -f - overwrite existing files
 -np - Do not add preview thumbnail to DNG
 -owb - Use old style constant white balance
 -ndcp - Do not include new DNG Color profile
 -cr "copyright..." - add copyright to DNG
 -at "author..." - add author/creator to DNG
 -fla, -flx - add multiple images to fake long exposure, flx scales down
 -j - JPEG handling: 1: download, 2: use exif for dng, 3: both (default)
 -R - convert RAW from ImB connected via Wifi or from given directories
 -J - get JPEG from ImB connected via Wifi or from given directories
 -O - get non-RAW/non-JPEG from ImB connected via Wifi or from given directories
 -da correcttimestamp=cameratimestamp - time stamp correction (format yyyy_mm_dd-hh_mm_ss)
 -n yyyy_mm_dd-hh_mm_ss (or prefix of any length) - select only newer than this timestamp from ImB or from given directories
 -----
 -- - treat rest of parameters as local files or dirs
 <files-or-dirs> - process local files or directories recursively, e.g. on MicroSD from ImB
```

About configuration see [imbraw2dng.json](imbraw2dng.json).

## Tipps, tricks, internals and details

### <a id="metadexif" name="metaexif">  </a>Metadata, EXIF

The EXIF data in the JPEG files from ImB is of limited use (excl. MiMi!), because it reflects the perspective of the ImB optics and sensor and not of the actual camera. But if you would like to add it to your DNG files, this is possible. 
Process the JPEG first and then the corresponding RAW (in same run).
Corresponding is defined as: time difference < 5 sec and counter (last part of filename) difference &lt;= 1. It is not neccessary to be directly consecutive, first all JPEGs and then the RAWs should do it.

Author/creator and copyright metadata can be set globally, and per-image a description (&#x270e;&#xfe0e;) can be set.

Time correction can be applied automatically (&#x231a;&#xfe0e;).

### Long Exposure<a name="a-lot-more-tricks-and-details" id="a-lot-more-tricks-and-details"> </a>

If you want to simulate a long "Long exposure" by several shorter ones to avoid the specific noise, you can do so by using the `-fla`/`-flx` parameters on node.js. 
Or set the checkbox below the blue field on the HTML page and then drag and drop the RAW- or DNG-files you want to stack up together into the blue field.   
In the app, you first need to convert all RAWs to DNGs. Then select the DNGs (&gt;1) you want to stack in your file browser and share these with the ImB OS App.

### <a id="revert-to-raw" name="revert-to-raw"> </a>Revert to RAW

If you want back the original raw (e.g. to do the conversion again) for an original converted DNG in the app, select only one single DNG in the file browser and share it with the ImB OS App.

Or use the normal imbapp page and check the corresponding checkbox.

Or use [imbdng2raw.html](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.html) or [imbdng2raw.js](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.js)

### iPhone

The android app consists of the same HTML/Javascript code as the html pages but wrapped with Apache Cordova. Building an IOS App should be possible similarly, but I neither own a Mac nor an iphone. If someone would like to help out??

[Would look somehow like this](https://www.facebook.com/groups/imbackofficial/posts/1656635048623845/?__cft__[0]=AZUQGC5WjATUlof9OXx2kE7BZLYYyqvhqUxhPdWTr9FO4NQBNIas8aA9MyhgNrgwVi49RuFZHBUUa-BH2mrAIYT1HQ8NRqvdRuaopAgHHT71hD1ZsDm4yuag3Lez_Ok74OVOYIY2tGymh9nIzngaZ9bCO0_dj-dGBLbPSxlXcZJc5g&__tn__=%2CO%2CP-R)

### Comparison

Concerning `IMBAPP.HTM` and the Android app:    
Advantages over the [APP from ImB](https://imback.eu/home/app/):

- you can use it on any browser

- can display raw

- converts raw to DNG on download

- can be used offline for local files

Disadvantages over the APP from ImB:

- live image view for video not built in

- no local album browsing on PC/phone

- no tough guy looking at you

Differences over the APP from ImB:

- time on device not set automatically on connect, click menu manually (or use Setting to do it automatically)    
(is an advantage on ImB Film because setting the time always sets 0:00h)

<!--Advantages over the historic `imbraw2dng.html` when used on the ImB:
- can set the time of the ImB
- can take photos and film video
- faster jpeg previews
- can set image parameters (size, EV...)
-->

### etc.

Your preferred settings can be saved in a configuration file for node.js (see above) or in the browser when you load it from a web server (internet or from ImB).

You are welcome to browse the code, help translation or optimizing!


## <a id="fmt" name="fmt">  </a>Formats

18000000 B = 4000 x 3000 (12bpp) = MiMi

30607488 B = 5216 x 3912 (12bpp) = Film

15335424 B = 4608 x 3328 = 35mm

7667520 B = 3260 x 2352 = 35mm Small-angle

11618752 B = 4012 x 2896 = 35mm Medium-angle

11943936 B = 3456 x 3456 = MF6x6

12937632 B = 4152 x 3116 = MF6x4.5

6470944 B = 2936 x 2204 = MF6x4.5 Small-angle

9806592 B = 3616 x 2712 = MF6x4.5 Medium-angle

15925248 B = 4608 x 3456 = MF6x7

14065920 B = 4320 x 3256 = unknown historic

---------------------------

## <a id="credits" name="credits">  </a>Credits

Special Thanks to:

**Michele Asciutti** - first one to decode the ImB colour filter array pattern

**Sadami Inoue** - japanese translations

**Samuel Mello Medeiros** - inventor of ImBack
