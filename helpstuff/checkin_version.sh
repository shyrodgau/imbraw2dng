#!/bin/bash
#
if [ -z "$3" ]; then
	echo Usage: "$0" '<versionA> <versionI> <versionF>'
	exit
fi

alen=${#1}
va=$1
blen=${#2}
vb=$2
clen=${#3}
vc=$3
vlen=$(( $alen + $blen + $clen + 4 )) # V . . _
restlen=$(( 14 - $vlen ))

comm=$( git log --format=oneline  HEAD~..HEAD | while read a b c; do echo $a; done )
xcomm=${comm:0:$restlen}

devst=$(( 7 - $restlen ))
devstr="@_d_e_v"
xdevstr=${devstr:$devst:$restlen}

## version: "V5.5.3_@_d_e_v", // actually const // VERSION EYECATCHER
sed -i.bak \
	-e 's!\(version *[=:] *\)".............."\(.*\)// VERSION EYECATCHER!\1"V'$1'.'$2'.'$3'_'$xcomm'"\2// VERSION EYECATCHER!g' \
	~/prog/imbraw2dng/github/imbraw2dng.js \
	~/prog/imbraw2dng/github/imbraw2dng.html \
	~/prog/imbraw2dng/github/imbapp.htm \
	~/prog/imbraw2dng/github/cordova/imbapp/imbapp.html 

function rvt {
	echo back
      sed -i.bak2 \
	-e 's!\(version *[=:] *\)".............."\(.*\)// VERSION EYECATCHER!\1"V'$va'.'$vb'.'$vc'_'$xdevstr'"\2// VERSION EYECATCHER!g' \
	~/prog/imbraw2dng/github/imbraw2dng.jsxx #
	#~/prog/imbraw2dng/github/imbraw2dng.html \
	#~/prog/imbraw2dng/github/imbapp.html \
	#~/prog/imbraw2dng/github/cordova/github/imbapp.html 
}

#trap rvt INT TERM

#sleep 100

