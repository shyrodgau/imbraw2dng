#!/bin/bash

if [ -z "$3" ]; then
	echo Usage: $0 'partname  fromfile  tofile'
	echo partnames: IFDOut, WORKER, Top_class_for_App, Backward_helper_class
	exit
fi


pn="$1"
frf="$2"
tof="$3"

if [ "$tof" -nt "$frf" ]; then
	echo $tof is newer that $frf
	echo are you 'sure? [Y]'
	read yn
	if [ $yn != 'Y' ]; then
		exit
	fi
fi

validcomb="
IFDOut imbapp.htm imbapp.html imbraw2dng.html imbraw2dng.js
WORKER imbapp.htm imbapp.html
Top_class_for_App imbapp.htm imbapp.html
CSS imbapp.htm imbapp.html
Backward_helper_class imbraw2dng.html imbraw2dng.js
"

frb=$( basename $frf )
tob=$( basename $tof )

echo $validcomb | grep -iq "$pn .* $frb . $tob"
if [ $? -ne 0 ]; then
	echo $validcomb | grep -iq "$pn .*$tob .*$frb"
	if [ $? -ne 0 ]; then
		echo "$pn $tob $frb seems not allowed"
		exit
	fi
fi

spl=$( grep -ne '^/[*] [*][*][*][*][*]* \([^*]*\) [*][*][*].*/' "$frf" | sed 's/[^a-zA-Z0-9][^a-zA-Z0-9]*/_/g' | grep -i "_${pn}_" | head -1 | cut -d_ -f1 )

if [ -z "$spl" ]; then
	echo block $pn not found in $frf
	exit
fi

le=$( tail -n+$(( $spl + 1 )) "$frf" | grep -ne '^/[*] [*][*][*][*][*]* \([^*]*\) [*][*][*].*/' | head -1 | cut -d: -f1 )

if [ -z "$le" ]; then
	echo block $pn not finished in $frf
	exit
fi

splx=$( grep -ne '^/[*] [*][*][*][*][*]* \([^*]*\) [*][*][*].*/' "$tof" | sed 's/[^a-zA-Z0-9][^a-zA-Z0-9]*/_/g' | grep -i "_${pn}_" | head -1 | cut -d_ -f1 )

if [ -z "$splx" ]; then
	echo block $pn not found in $tof
	exit
fi

lex=$( tail -n+$(( $splx + 1 )) "$tof" | grep -ne '^/[*] [*][*][*][*][*]* \([^*]*\) [*][*][*].*/' | head -1 | cut -d: -f1 )

if [ -z "$lex" ]; then
	echo block $pn not finished in $tof
	exit
fi

tox=$( dirname $tof )/.${tob}_$( date +%m%d%M%S )
cp -v "$tof" "$tox"

head -$splx "$tox" > "$tof"

tail -n+$(( $spl + 1 )) "$frf" | head -$le >> "$tof"

tail -n+$(( $splx + $lex + 1 )) "$tox" >> "$tof"

