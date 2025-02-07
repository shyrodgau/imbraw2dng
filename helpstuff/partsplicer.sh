#!/bin/bash

if [ -z "$3" ]; then
	echo Usage: $0 'partname  fromfile  tofile'
	echo partnames: IFDOut, WORKER, Top_class_for_App, Backward_helper_class
	exit
fi


pns=( "$1" )
pncnt=1
shift
while [ ! -e "$1" ]; do
	pns[$pncnt]="$1"
	pncnt=$(( $pncnt + 1 ))
	shift
done
frf="$1"
tof="$2"

if [ "$tof" -nt "$frf" ]; then
	echo $tof is NEWER than $frf
	echo are you 'sure? [Y]'
	read yn
	if [ $yn != 'Y' ]; then
		exit
	fi
fi

validcomb="
IFDOut  imbapp.htm  imbapp.html  imbraw2dng.html  imbraw2dng.js
Browser_specifics  imbapp.htm  imbapp.html  imbraw2dng.html
Backward_helper_class  imbraw2dng.html  imbraw2dng.js
WORKER  imbapp.htm  imbapp.html
Top_class_for_App  imbapp.htm  imbapp.html
app_only  imbapp.htm  imbapp.html
"

frb=$( basename $frf )
tob=$( basename $tof )

function spliceone()
{
	pn=$1
	echo "$validcomb" | grep -iq "$pn .* $frb .* $tob"
	if [ $? -ne 0 ]; then
		echo "$validcomb" | grep -iq "$pn .* $tob .* $frb"
		if [ $? -ne 0 ]; then
			echo "$pn $tob $frb seems not allowed"
			return
		fi
	fi

	spl=$( grep -ne '^/[*] [*][*][*][*][*]* \([^*]*\) [*][*][*].*/' "$frf" | sed 's/[^a-zA-Z0-9][^a-zA-Z0-9]*/_/g' | grep -i "_${pn}_" | head -1 | cut -d_ -f1 )

	if [ -z "$spl" ]; then
		echo block $pn start not found in src $frf
		return
	fi

	le=$( tail -n+$(( $spl + 1 )) "$frf" | grep -ne '^/[*] [*][*][*][*][*]* \([^*]*\) [*][*][*].*/' | head -1 | cut -d: -f1 )

	if [ -z "$le" ]; then
		echo block $pn not finished in src $frf
		return
	fi

	splx=$( grep -ne '^/[*] [*][*][*][*][*]* \([^*]*\) [*][*][*].*/' "$tof" | sed 's/[^a-zA-Z0-9][^a-zA-Z0-9]*/_/g' | grep -i "_${pn}_" | head -1 | cut -d_ -f1 )

	if [ -z "$splx" ]; then
		echo block $pn start not found in dest $tof
		return
	fi

	lex=$( tail -n+$(( $splx + 1 )) "$tof" | grep -ne '^/[*] [*][*][*][*][*]* \([^*]*\) [*][*][*].*/' | head -1 | cut -d: -f1 )

	if [ -z "$lex" ]; then
		echo block $pn not finished in dest $tof
		return
	fi

	head -$splx "$tox" > "$tof"

	tail -n+$(( $spl + 1 )) "$frf" | head -$le >> "$tof"

	tail -n+$(( $splx + $lex + 1 )) "$tox" >> "$tof"

}

tox=$( dirname $tof )/.${tob}_$( date +%m%d%M%S )
cp -v "$tof" "$tox"

k=0
while [ $k -lt $pncnt ]; do
	spliceone ${pns[$k]}
	if [ $(( $k + 1 )) -lt $pncnt ] ; then
		toxn=$( dirname $tof )/.${tob}.tmp
		cp "$tof" "$toxn"
		tox="$toxn"
	fi
	k=$(( $k + 1 ))
done

test -e "$toxn" && rm "$toxn"
