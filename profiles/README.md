
# Camera Profiles for you RAW converter

For instruction how to use them, see the documentation or help of you software.

Note: The profiles were made on 35mm for Fresnel + PDLC. The difference to MF can probably be neglected if the 
Fresnel + PDLC type is the same. For other combinations (Film, PDLC only, Fresnel or EG-xxx only, PDLC and Fresnel inverted 
as on some MF types) we could do a separate calibration, if these current ones would not be good enough.

Note: All profiles of the same type have the same contents. That of the DCP profiles also should match the calibration data that is contained inside 
the DNG as of today. They differ only in name and metadata to match your exact ImBack type.

## DCP format

Usable for: [rawtherapee](#rawtherapee), lightroom, photoshop ... ??

The DCP profiles are dual-illuminant and should normally be interpolated for the actual illuminant/white-balance by the software.

 [for 35mm](profiles/DCP/ImBack%20ImB35mm.dcp)   
 [for MF 6x4.5](profiles/DCP/ImBack%20MF6x4.5.dcp)   
 [for MF 6x6](profiles/DCP/ImBack%20MF%206x6%20.dcp)   
 [for MF 6x7](profiles/DCP/ImBack%20MF%206x7%20.dcp)    

## ICC format

Usable for: [darktable](#darktable), [rawtherapee](#rawtherapee) (but prefer DCP), ...

The ICC profiles only are adjusted to D65 (daylight) illuminant.

 [for 35mm](profiles/ICC/ImBack%20ImB35mm.icc)   
 [for MF 6x4.5](profiles/ICC/ImBack%20MF6x4.5.icc)   
 [for MF 6x6](profiles/ICC/ImBack%20MF%206x6%20.icc)   
 [for MF 6x7](profiles/ICC/ImBack%20MF%206x7%20.icc)    

## rawtherapee

Placement for DCP profiles here on linux is `/usr/share/rawtherapee/dcpprofiles` .  
ICC profiles might be looked up from `/usr/share/rawtherapee/iccprofiles` or `/usr/share/color/icc` .

## darktable

Placement for ICC profiles here on linux can be `${HOME}/.config/darktable/color/in` or `/usr/share/darktable/color/in` .