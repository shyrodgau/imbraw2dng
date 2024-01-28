<!-- SPDX-License-Identifier: 0BSD -->
# imbraw2dng - Convert RAW from [I'm Back(R)](https://imback.eu) into DNG

This is free software ([0-clause BSD-License](LICENSE.txt)) and not commercially supported.

In here: [Installation](#installation) - [Internationalization](#internationalization) -    
[Usage](#usage) - [Browsing on the ImBack](#browsing-on-the-imback) - [Command line usage via node.js](#command-line-using-nodejs) -   
[Processing the DNG](#processing-the-dng) - [How does it work](#how-does-it-work)

oder [AUF DEUTSCH](https://shyrodgau.github.io/imbraw2dng/README_de)

They are not really "B&W RAW" but actually the RAW sensor data that also contains the colour filtering (unfortunately only 8 bit deep..). 

The page can do parts (or partially more - display RAW) of the mobile phone app.

Currently known to work for current firmware on 35mm (also for "Angle medium" and "small") and MF I'm Back. Not all angle variants are 
covered for MF, if you need it and can help contact me.

Problems and ideas can also be discussed in the [I'm Back Users Group on Facebook](https://www.facebook.com/groups/1212628099691211).

## Basics ;tldr

There are the following possibilities to make use of files (pictures or movies) from ImB:

1. Take Micro-SD out of ImB and put into PC or (maybe using an adapter) into/to the smartphone. Copy files from the Micro-SD somewhere else

1. Connect Smartphone with ImB Wifi and use Android- or Apple App to copy files to smartphone

1. (not documented) Connect smartphone or PC with ImB Wifi and use browser on http://192.168.1.254 to browse and download files

These ways keep all files 1:1 as they were which usually is fine for JPEGs or movies. But on RAW images it can end up in a kind of dead end.   
The following ways focus on converting RAW files into DNG while copying. You only need one file for using with browser and/or one file for using with node.js.

1. Open [imbraw2dng.html](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.html) in browser, Take Micro-SD out of ImB and put into PC or smartphone. 
Drag and drop files from `IMBACK/PHOTO` and `IMBACK/MOVIE` into the blue field. [(Details)](#usage)

1. Take Micro-SD out of ImB and put into PC or smartphone. Copy [imbraw2dng.html](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.html) into `IMBACK` folder on MicroSD and put card back into ImB. 
Connect Smartphone or PC in ImB Wifi and navigate browser to [http://192.168.1.254/IMBACK/imbraw2dng.html](http://192.168.1.254/IMBACK/imbraw2dng.html) from ImB.
[(Details)](#browsing-on-the-imback)

1. Take Micro-SD out of ImB and put into PC. Download [imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) and invoke `node imbraw2dng.js <path_of_the_microsd>`.
[(Details)](#command-line-using-nodejs)

1. Connect PC into ImB Wifi, download [imbraw2dng.js](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.js) and invoke `node imbraw2dng.js -R -J -O`.
[(Details)](#command-line-using-nodejs)



## Installation

The current release is [V3.1.4_7062a51 - dont know what to do next](https://github.com/shyrodgau/imbraw2dng/releases/tag/V3.1.4_7062a51). 
Note: further development when errors reported, new translation contributed or new image format.

Copy the [imbraw2dng.html](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.html) file to your PC or extract it from the release 
"Source code".zip or .tar.gz and open in your favorite browser (any newer one should do).

If you can not install it locally, you can use it from the network like on [my github page](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.html) 
(should always be current version) or [from your own ImB](#browsing-on-the-imback) or at [imback.eu](https://imback.eu/home/im-back-raw-dng-converter-ib35/) 
(with automated translation to different languages, but might not be current). The image data will stay in your browser in any case.

For [node.js](#command-line-using-nodejs), only the Javascript file [imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js) is needed.

The github repository itself can be found [here](https://github.com/shyrodgau/imbraw2dng).

### Internationalization

The current supported langauges are english (EN), french (FR) and german (DE). If you save the html file with a name change to `imbraw2dng_XX.html` where `XX` 
is the language shortcut, it will open the page directly in that language. If you want to contribute to translating, translate what you are reading now or look 
[here](https://shyrodgau.github.io/imbraw2dng/translations.xls) and get in contact!

When you have [node.js](https://nodejs.org) version &ge; V20.10(LTS), you can get the file [imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js), 
save it under `imbraw2dng_00.js` and then call `node imbraw2dng_00.js -CSV > mytexts.csv` to generate a current CSV with texts to be translated.

## Usage

You can drag and drop all files from the I'm back (i.e. from the micro SD inserted into your PC) into the blue field. It will then copy all non-RAW 
files exactly and convert the RAW files to DNG, replacing the `.raw`/`.RAW` file extension with `.dng`. When you use the `Choose Files` button, you can select RAW files directly. 

Your browser will download them according to its download settings, so it might pop up a dialog where to save it for each file if so configured, or 
throw all files into your Downloads directory (possibly renaming it) if so configured , or, or, or...

Conversion to DNG currently sets the Timestamp Tags if the filename seems to be a reasonable I'm Back filename (i.e. `YYYY_MMDD_hhmmss`), and the 
OriginalRawFilename to the name of the RAW inputfile. That way you can name the DNG file whatever you like without losing much of the original information.

New: you can do a step-by-step walk with a preview of the raw file. For that, check the `Single Step with preview` checkbox. On each file, you can 
select if you want to process or skip it and also if this same action should be applied to the rest of your currently selected files. 

### Browsing on the ImBack

You can put the html file (also renamed according to [internationalization](#internationalization) ) on the micro-SD that is inside the ImBack, 
let's say into the `IMBACK` folder. Then you connect your PC to the ImBack Wifi and browse [your Imback](http://192.168.1.254/IMBACK/imbraw2dng.html) (or with the changed name).

It offers you direct processing/copying of files newer than a given timestamp, or you can use the visual browser to look at the files on the ImBack 
by type and/or date. RAW and JPEG images will be displayed. You can select files for conversion/download or deletion.

### Command line using node.js

If and when you have [node.js](https://nodejs.org) version &ge; V20.10(LTS) installed, you can do the conversion via command line by getting the file 
[imbraw2dng.js](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.js). Naming conventions according to [Internationalization](#internationalization) 
apply. Parameter and calling help can be read with `node imbraw2dng.js`.
```
Usage: node imbraw2dng_de.js [-l lang] [-f] [-d dir] [-nc | -co] { [-R] [-J] [-O] [-n yyyy_mmdd_hhmmss] | [--] <files-or-dirs> }
Options:
 -h - show this help
 -nc - do not use coloured text
 -co - force coloured text
 -l XX - where XX is a valid language code (currently: DE, EN, FR)
         Language can also be set by changing filename to imbraw2dng_XX.js .
 -d dir - put output files into dir
 -f - overwrite existing files
 -- - treat rest of parameters as local files or dirs
 -----
 <files-or-dirs> - process local files or directories recursively, e.g. on MicroSD from ImB
 -----
 -R - get RAW from ImB connected via Wifi
 -J - get JPEG from ImB connected via Wifi
 -O - get non-RAW/non-JPEG from ImB connected via Wifi
 -n yyyy_mmdd_hhmmss (or prefix of any length) - select only newer than this timestamp from ImB
 -----
<files-or-dirs> and -R/-J/-O/-n can not be used at the same time.
```

## Processing the DNG

Use your favourite software, e.g. darktable, lightroom, ufraw, rawtherapee etc.

Do **not** expect the image to be okay out-of-the-box. I will probably not be able to provide all tags in the DNG to satisfy all possible programmes. 
Take your time to adjust the colours and then the rest. *If anyone is experienced around DNGs or knows someone who would be willing to help - please get in contact* 
e.g. on [Discussion on pixls.us](https://discuss.pixls.us/t/converting-plain-raw-from-imback-to-dng/) for Darktable/RawSpeed or 
I'm Back digital back [Developers Group on Facebook](https://www.facebook.com/groups/2812057398929350).

A strong green or magenta tint all over the image should not happen any more! But if you have one and **can not** level it out using your software's 
color matrix/color calibration or white-balancing, a sample image might be interesing to fix it.

**Word on colours:** The right way to get the colours correct is to first adjust the color calibration or color matrix. I am trying to get this right somehow 
inside the DNG but I am far from it. Change the green/green value to something around 0.6..0.7. This will at first make the image look reddish with the 
(wrong) default white balance. But then you can use the white balance to adjust it correctly. Sample darktable pictures of how the matrix and the white balance on near neutral light should look:

![darktable sample color matrix green](https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_color_calib_ok.png "darktable sample color matrix green") 
![darktable sample neutral white balance  ](https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_neutral_white_balance.png "darktable sample neutral white balance")

If a red highlighted spot is in the center of the image, a manual retouche after the processing is required, or use the following darktable setting, 
placing and sizing a circle shape manually around the area.

To avoid the red spot from the start, use a bigger aperture (smaller f-number) or combine the standard PDLC matte with a Fresnel screen from I'm Back 
or a Canon EG-xxx screen.

![darktable sample agains red circle](https://shyrodgau.github.io/imbraw2dng/helpstuff/darktable_redcircle.png "darktable sample agains red circle")

## How does it work?

DNG is a TIFF-like format and consists mainly of constant data around the original image scanlines. The data varies depending on width, height 
(they are noted explicitly and there are a lot of offsets depending on the data length) and filename (for the OriginalRawFilename tag) of the image. 
If the date from the ImB filename looks valid, tags (EXIFTAG_DATETIMEORIGINAL, TIFFTAG_DATETIME) are added for that. If it is from a MF ImB then the Color Filter Array is different.
