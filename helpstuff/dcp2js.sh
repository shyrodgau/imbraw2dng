#/usr/bin/bash -vx

# insert the DCP profile values into the js code to build the DNG

infile="$1"

echo -e -n 'II\x2A\x00\x08\x00\x00\x00' > .tmptif
tail -c +9 "$1" >> .tmptif

exiv2 -pR .tmptif > .tmptifx

function xtag {
	tg="$1"
	echo '// ' $tg ' b64 gz'
	tlx=$( grep -w "$tg" .tmptifx )
	ty=$( echo $tlx | awk '{print $6}' )
	if [ "x$ty" != "xFLOAT" ]; then
		echo unexpected type for $tg
		exit 2
	fi
	le=$( echo $tlx | awk '{print $8}' )
	off=$( echo $tlx | awk '{print $10}' )
	tt=$(( ( 4 * $le ) + $off ))
	echo -n 'dcp'$tg'_b64gz=`'
	head -c $tt "$infile" | tail -c $(( 4 * $le )) | gzip | openssl base64 -e
	echo '`;'
	echo '// ' $tg ' unpack'
	echo 'dcp'$tg'_u='\'\'';'
	
}

function ytag {
	tg="$1"
	#echo '// ' $tg 
	tlx=$( grep -w "$tg" .tmptifx )
	ty=$( echo $tlx | awk '{print $6}' )
	if [ "x$ty" != "xSRATIONAL" ]; then
		echo unexpected type for $tg
		exit 2
	fi
	id=$( echo $tlx | awk '{print $3}' )
	decid=$( echo $id | cut -c3-99 | ( read x && echo $(( 16#${x} + 0 )) ) )
	echo -n "ti.addEntry(${decid}, 'SRATIONAL', [ "
	stt=$( exiv2 -Pv -g${tg} .tmptif |sed -e 's@/@,@g' -e 's@\([0-9]\) \([-0-9]\)@\1, \2@g' )
	echo -n $stt
	echo " ]); /* $tg */"	
}

function ztag {
	tg="$1"
	#echo '// ' $tg 
	tlx=$( grep -w "$tg" .tmptifx )
	ty=$( echo $tlx | awk '{print $6}' )
	id=$( echo $tlx | awk '{print $3}' )
	decid=$( echo $id | cut -c3-99 | ( read x && echo $(( 16#${x} + 0 )) ) )
	echo -n "ti.addEntry(${decid}, '${ty}', [ "
	stt=$( exiv2 -Pv -g${tg} .tmptif |sed -e 's@/@,@g' -e 's@\([0-9]\) \([-0-9]\)@\1, \2@g' )
	echo -n $stt
	echo " ]); /* $tg */"	
}

function insdyn {
	into="$1"
	txt="$2"
	sl=$( grep -n '//////// DYNAMIC SOURCE '$txt $into | cut -d: -f 1 )
	el=$( tail -n +$sl $into | grep -n '////    DYNAMIC SOURCE END:' | head -1 | cut -d: -f 1 )
	head -$sl $into > .tmptifx1a
	cat .tmptifx${txt} >> .tmptifx1a
	tail -n +$(( $sl + $el +1 )) $into >> .tmptifx1a
	mv .tmptifx1a ${into}
}

echo '////////////////////////////////////////////' > .tmptifx1
echo "////    DYNAMIC SOURCE: $1" >> .tmptifx1

xtag ProfileToneCurve >> .tmptifx1
xtag ProfileHueSatMapData1 >> .tmptifx1
xtag ProfileHueSatMapData2 >> .tmptifx1
xtag ProfileLookTableData >> .tmptifx1

echo "////    DYNAMIC SOURCE END: $1" >> .tmptifx1
echo '////////////////////////////////////////////' >> .tmptifx1

echo '////////////////////////////////////////////' > .tmptifx2
echo "////    DYNAMIC SOURCE: $1" >> .tmptifx2

ytag ColorMatrix1 >> .tmptifx2
ytag ColorMatrix2 >> .tmptifx2
ytag ForwardMatrix1 >> .tmptifx2
ytag ForwardMatrix2 >> .tmptifx2

ztag CalibrationIlluminant1 >> .tmptifx2
ztag CalibrationIlluminant2 >> .tmptifx2
ztag ProfileHueSatMapDims >> .tmptifx2
ztag ProfileLookTableDims >> .tmptifx2
ztag ProfileLookTableEncoding >> .tmptifx2

echo "////    DYNAMIC SOURCE END: $1" >> .tmptifx2
echo '////////////////////////////////////////////' >> .tmptifx2

insdyn ~/prog/imbraw2dng/imbraw2dng/imbraw2dng.js 1
insdyn ~/prog/imbraw2dng/imbraw2dng/imbraw2dng.js 2
insdyn ~/prog/imbraw2dng/imbraw2dng/imbraw2dng.html 2
insdyn ~/prog/imbraw2dng/imbraw2dng/imbraw2dng.html 1
