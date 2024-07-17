<!-- SPDX-License-Identifier: 0BSD -->
# imbraw2dng - Convert RAW files from [I'mBack<sup>&reg;</sup>&nbsp;35mm/MF](https://imback.eu) into DNG

# new: [imbapp](imbapp)

This is free software ([0-clause BSD-License](LICENSE.txt)) and not commercially supported.

In here: [Installation](#installation) - [Internationalization](#internationalization) -    
[Usage](#usage) - [Browsing on the ImBack](#browsing-on-the-imback) - [Command line usage via node.js](#command-line-using-nodejs) - [How does it work](#how-does-it-work) - [A lot more tricks and details](#a-lot-more-tricks-and-details)

Quick doc: [here](https://shyrodgau.github.io/imbraw2dng/README)

oder [AUF DEUTSCH](https://shyrodgau.github.io/imbraw2dng/moredoc_de)  
 [日本語](https://shyrodgau.github.io/imbraw2dng/moredoc_ja)


## Installation

[The current release is](https://github.com/shyrodgau/imbraw2dng/releases/latest).
Note: further development when errors reported, new translation contributed or new image format.

Copy the [imbraw2dng.html](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.html) file to your PC or extract it from the release 
"Source code".zip or .tar.gz and open in your favorite browser (any newer one should do).

If you can not install it locally, you can use it from the network like on [my github page](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.html) 
(should always be current version) or [from your own ImB](#browsing-on-the-imback) or at [imback.eu](https://imback.eu/home/im-back-raw-dng-converter-ib35/) 
(with automated translation to different languages, but might not be current). The image data will stay in your browser in any case.

For [node.js](#command-line-using-nodejs), only the Javascript file [imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js) is needed.

The github repository itself can be found [here](https://github.com/shyrodgau/imbraw2dng).

### Internationalization

The current supported langauges are english (EN), japanese (JA), french (FR) and german (DE). If you save the html file with a name change to `imbraw2dng_XX.html` where `XX` 
is the language shortcut, it will open the page directly in that language. If you want to contribute to translating, translate what you are reading now or look 
[here](https://shyrodgau.github.io/imbraw2dng/translations.xls) and get in contact!

When you have [node.js](https://nodejs.org) version &ge; V20.10(LTS), you can get the file [imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js), 
save it under `imbraw2dng_00.js` and then call `node imbraw2dng_00.js -CSV > mytexts.csv` to generate a current CSV with texts to be translated.

## Usage

You can drag and drop all files from the I'm back (i.e. from the micro SD inserted into your PC or the USB mass storage) into the blue field. It will then copy all non-RAW 
files exactly and convert the RAW files to DNG, replacing the `.raw`/`.RAW` file extension with `.dng`. When you use the `Choose Files` button, you can select RAW files directly. 

Your browser will download them according to its download settings, so it might pop up a dialog where to save it for each file if so configured, or 
throw all files into your Downloads directory (possibly renaming it) if so configured , or, or, or...

Conversion to DNG currently sets the Timestamp Tags if the filename seems to be a reasonable I'm Back filename (i.e. `YYYY_MMDD_hhmmss`), and the 
OriginalRawFilename to the name of the RAW inputfile. That way you can name the DNG file whatever you like without losing much of the original information.

New: you can do a step-by-step walk with a preview of the raw file. For that, check the `Single Step with preview` checkbox. On each file, you can 
select if you want to process or skip it and also if this same action should be applied to the rest of your currently selected files. 

### Browsing on the ImBack

You can put the html file (also renamed according to [internationalization](#internationalization)) on the micro-SD that is inside the ImBack, 
let's say into the `IMBACK` folder. Then you connect your PC to the ImBack Wifi and browse [your Imback](http://192.168.1.254/IMBACK/imbraw2dng.html) (or with the changed name).

It offers you direct processing/copying of files newer than a given timestamp, or you can use the visual browser to look at the files on the ImBack 
by type and/or date. RAW and JPEG images will be displayed. You can select files for conversion/download or deletion.

### Command line using node.js

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

## How does it work?

DNG is a TIFF-like format and consists mainly of constant data around the original image scanlines. The data varies depending on width, height 
(they are noted explicitly and there are a lot of offsets depending on the data length) and filename (for the OriginalRawFilename tag) of the image. 
If the date from the ImB filename looks valid, tags (EXIFTAG_DATETIMEORIGINAL, TIFFTAG_DATETIME) are added for that. If it is from a MF ImB then the Color Filter Array is different.

About colours, please also read [Processing the DNG](README#processing-the-dng).

## A lot more tricks and details

If you ever need to revert the original RAW from the DNG (e.g. to do the conversion again with a never version), this is possbile using [imbdng2raw.html](https://shyrodgau.github.io/imbraw2dng/imbdng2raw.html)

The EXIF data in the JPEG files from ImB is of limited use, but if you would like to add it to your DNG files, this is possible. Process the JPEG first and then the corresponding RAW. 
Corresponding is defined as: time difference < 5 sec and counter (last part of filename) difference 1. It is not neccessary to be directly consecutive, first all JPEGs and then the RAWs should do it.

If you want to simulate a long "Long exposure" by several shorter ones to avoid the specific noise, you can do so by using the `-fla`/`-flx` parameters on node.js. 
Or set the checkbox below the blue field on the HTML page and then drag and drop the RAW-files you want to stack up together into the blue field.

Your preferred settings can be saved in a configuration file for node.js (see above) or in the browser when you load it from a web server (internet or from ImB).
