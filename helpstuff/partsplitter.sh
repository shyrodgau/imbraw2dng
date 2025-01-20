#!/bin/bash

outfiles=""

function onepart { # basename startline endline
	pth="$1"
	st="$2"
	en="$3"
	bn=$( basename "$pth" )
	tag=$( head -$st "$pth" | tail -1 | sed 's/^.*[*][*][*] \([^*]*\) [*][*][*].*/\1/g' | sed 's/[^a-zA-Z0-9][^a-zA-Z0-9]*/_/g' )
	#head -$en "$pth" | tail -$(( 1 + $en - $st ))  | sed 's/^\(.*[*][*][*] \)\([^*]*\)\( [*][*][*].*\)$/\1 '$st' - '$en' \2 \3/g' > "${bn}_${st}_${tag}.js"
	head -$en "$pth" | tail -$(( 1 + $en - $st ))  > "${bn}_${st}_${tag}.js"
	outfiles="$outfiles ${bn}_${st}_${tag}.js"
}


function onefile { # path
	pth="$1"
	spl=$( grep -ne '^/[*] [*][*][*][*][*]' "$pth" | grep -vi 'backward.*helper.*stuff' | cut -d: -f1 )
	ind=0
	for n in $spl ; do
		if [ $ind -eq 0 ]; then
			nn=$n
			ind=1
			continue;
		fi
		onepart $pth $nn $n
		ind=0
	done
	if [ $ind -ne 0 ]; then
		echo Warning $pth unbalanced comments
	fi
}


if [ -z "$1" ]; then
	for f in /home/hegny/prog/imbraw2dng/github/imbraw2dng.js /home/hegny/prog/imbraw2dng/github/imbraw2dng.html /home/hegny/prog/imbraw2dng/github/imbapp.htm /home/hegny/prog/imbraw2dng/github/cordova/imbapp/imbapp.html /home/hegny/prog/imbraw2dng/github/cordova/imbapp/imbapp-dbg.html; do
		onefile $f
	done
	for t in android_init.js Android_spec_class.js Backward_helper_class.js CSS.js IFDOut.js Top_class_for_App.js WORKER.js; do
		echo; echo $t; echo =======
		for f in $outfiles; do
			if [ ${f%%$t} != $f ]; then
				cksum $f
			fi
		done | sort
	done
else
	onefile "$1"
fi
