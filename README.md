# imbraw2dng
Convert RAW from I'm Back(R) into DNG. They are not really "B&W RAW" but actually the RAW sensor data that also contains the colour filtering.

Currently known to work for current firmware on 35mm (also for "Angle medium" and "small") and MF I'm Back.

**Installation:**

Copy the [imbraw2dng.html](https://github.com/shyrodgau/imbraw2dng/raw/master/imbraw2dng.html) file to your PC or extract it from the release "Source code".zip or .tar.gz and open in your favorite browser (any newer one should do).

If you can not install it locally, you can use it from the network like [HTML Preview of the imbraw2dng.html](https://htmlpreview.github.io/?https://github.com/shyrodgau/imbraw2dng/blob/master/imbraw2dng.html) or at [imback.eu](https://imback.eu/home/im-back-raw-dng-converter-ib35/) but the image data will stay in your browser!

Problems can also be discussed in the [I'm Back Users Group on Facebook](https://www.facebook.com/groups/1212628099691211).

**Usage:**

You can drop all files from the I'm back into the blue field. It will then copy all non-RAW files exactly and convert the RAW files to DNG, replacing the `.raw`/`.RAW` file extension with `.dng` to the name. When you use the `Choose Files` button, you can select RAW files directly. 

Your browser will download them according to its download settings, so it might pop up a dialog where to save it for each file if so configured, or throw all files into your Downloads directory if so configured , or, or, or ...

Conversion to DNG currently sets the Timestamp Tags if the filename seems to be a reasonable I'm Back filename, and the OriginalRawFilename to the name of the RAW inputfile. That way you can name the DNG file whatever you like without losing any of the original information.

**Processing the DNG:**

Use your favourite software, e.g. darktable, lightroom, ufraw, rawtherapee etc.

A strong green or magenta tint all over the image should not happen any more! But if you have one and **can not** level it out using your software's white-balancing, a sample image might be interesing to fix it.

If a red highlighted spot is in the center of the image, a manual retouche after the processing is required, or use the following darktable setting, placing and sizing a circle shape manually around the area.

To avoid the red spot from the start, use a bigger aperture (smaller number) or combine the standard PDLC matte with a Fresnel screen from I'm Back or a Canon EG-xxx screen.

![darktable sample agains red circle](https://github.com/shyrodgau/imbraw2dng/blob/master/helpstuff/darktable_redcircle.png?raw=true "darktable sample agains red circle")
