#!/bin/bash

function onepart { # basename startline endline
	pth="$1"
	st="$2"
	en="$3"
	bn=$( basename "$pth" )
	tag=$( head -$st "$pth" | tail -1 | sed 's/^.*[*][*][*] \([^*]*\) [*][*][*].*/\1/g' | sed 's/[^a-zA-Z0-9]/_/g' )
	head -$en "$pth" | tail -$(( 1 + $en - $st )) > "${bn}_${tag}.js"
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
else
	onefile "$1"
fi
