# imbraw2dng - Convert RAW from [I'm Back(R)](https://imback.eu) into DNG
They are not really "B&W RAW" but actually the RAW sensor data that also contains the colour filtering. You can see it when you import them as RAW into photoshop as Samuel described - zoom in and you see the gray values rastered in 2x2 squares. So even for B&W it is better to go the DNG way.

Currently known to work for current firmware on 35mm (also for "Angle medium" and "small") and MF I'm Back. Not all angle variants are covered for MF, if you need it and can help contact me.

Problems and ideas can also be discussed in the [I'm Back Users Group on Facebook](https://www.facebook.com/groups/1212628099691211).

**Installation:**

The current release is [V2.1.0_04ed8ae - Add Compatibility neutral colour matrix option](https://github.com/shyrodgau/imbraw2dng/releases/tag/V2.1.0_04ed8ae).

Copy the [imbraw2dng.html](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.html) file to your PC or extract it from the release "Source code".zip or .tar.gz and open in your favorite browser (any newer one should do).

If you can not install it locally, you can use it from the network like on [my github page](https://shyrodgau.github.io/imbraw2dng/imbraw2dng.html) (should always be current version) or at [imback.eu](https://imback.eu/home/im-back-raw-dng-converter-ib35/) (with automated translation to different languages, but might not be current). The image data will stay in your browser in any case.

The github repository itself can be found [here](https://github.com/shyrodgau/imbraw2dng).

**Usage:**

You can drop all files from the I'm back into the blue field. It will then copy all non-RAW files exactly and convert the RAW files to DNG, replacing the `.raw`/`.RAW` file extension with `.dng`. When you use the `Choose Files` button, you can select RAW files directly. 

Your browser will download them according to its download settings, so it might pop up a dialog where to save it for each file if so configured, or throw all files into your Downloads directory if so configured , or, or, or...

Conversion to DNG currently sets the Timestamp Tags if the filename seems to be a reasonable I'm Back filename, and the OriginalRawFilename to the name of the RAW inputfile. That way you can name the DNG file whatever you like without losing any of the original information.

New: you can do a step-by-step walk with a preview of the raw file. For that, check the "Single Step with preview" checkbox. On each file, you can select if you want to process or skip it and also if this same action should be applied to the rest of your currently selected files. When you check the "Add separate download link for each file" checkbox, then the files can be downloaded again (after the download that will be done automatically in the processing). It may cost memory to keep all these so I do not do it any more by default - you can always select the file(s) simply again.

**Processing the DNG:**

Use your favourite software, e.g. darktable, lightroom, ufraw, rawtherapee etc.

A strong green or magenta tint all over the image should not happen any more! But if you have one and **can not** level it out using your software's white-balancing, a sample image might be interesing to fix it.

If a red highlighted spot is in the center of the image, a manual retouche after the processing is required, or use the following darktable setting, placing and sizing a circle shape manually around the area.

To avoid the red spot from the start, use a bigger aperture (smaller number) or combine the standard PDLC matte with a Fresnel screen from I'm Back or a Canon EG-xxx screen.

![darktable sample agains red circle](https://github.com/shyrodgau/imbraw2dng/blob/master/helpstuff/darktable_redcircle.png?raw=true "darktable sample agains red circle")

**How does it work?**

DNG is a TIFF-like format and consists mainly of constant data around the original image scanlines. The data varies depending on width, height (they are noted explicitly and there are a lot of offsets depending on the data length) and filename (for the OriginalRawFilename tag) of the image. If the date from the ImB filename looks valid, tags (EXIFTAG_DATETIMEORIGINAL, TIFFTAG_DATETIME) are added for that. If it is from a MF ImB then the Color Filter Array is different.
