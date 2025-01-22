#!/bin/bash
#

abc=$( grep 'version *[=:] *"V.*// VERSION EYECATCHER' ~/prog/imbraw2dng/github/cordova/imbapp/imbapp-dbg.html | sed 's!^.*version *[=:] *"V\([0-9]*\)[.]\([0-9]*\)[.]\([0-9]*\).*$!\1 \2 \3!g' )
#grep 'version *[=:] *"V.*// VERSION EYECATCHER' ~/prog/imbraw2dng/github/cordova/imbapp/imbapp-dbg.html | sed 's!^.*version *[=:] *"V\([0-9]*\)[.]\([0-9]*\)[.]\([0-9]*\).*$!\1 \2 \3!g'
#grep 'version *[=:] *"V.*// VERSION EYECATCHER' ~/prog/imbraw2dng/github/cordova/imbapp/imbapp-dbg.html

va=$( echo $abc | awk '{print $1}' )
vb=$( echo $abc | awk '{print $2}' )
vc=$( echo $abc | awk '{print $3}' )

alen=${#va}
blen=${#vb}
clen=${#vc}
vlen=$(( $alen + $blen + $clen + 4 )) # V . . _
restlen=$(( 14 - $vlen ))

comm=$( git log --format=oneline  HEAD~..HEAD | while read a b c; do echo $a; done )
xcomm=${comm:0:$restlen}

devst=$(( 7 - $restlen ))
devstr="@_d_e_v"
xdevstr=${devstr:$devst:$restlen}

## version: "V5.5.3_@_d_e_v", // actually const // VERSION EYECATCHER
sed -i.bak \
	-e 's!\(version *[=:] *\)".............."\(.*\)// VERSION EYECATCHER!\1"V'$va'.'$vb'.'$vc'_'$xdevstr'"\2// VERSION EYECATCHER!g' \
	~/prog/imbraw2dng/github/imbraw2dng.js \
	~/prog/imbraw2dng/github/imbraw2dng.html \
	~/prog/imbraw2dng/github/imbapp.htm \
	~/prog/imbraw2dng/github/cordova/imbapp/imbapp.html 

