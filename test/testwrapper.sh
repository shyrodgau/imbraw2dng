#!/usr/bin/bash

# wrapper script
# expects test data:
TESTDAT=/home/hegny/prog/imbraw2dng/samples/webroot

# test executable path:
TESTEXES=/home/hegny/prog/imbraw2dng/github

# workdir (this here):
TESTWORK=/home/hegny/prog/imbraw2dng/github/test

# logfile
testid=$( date +%s )
log=${TESTWORK}/imbraw2dng_test_${testid}.log

# start webserver
pushd $TESTDAT
( python3 -m http.server 8889 > ${log}_http 2>&1 )&
webid=$!
( cd $TESTEXES && python3 -m http.server 8181 > /dev/null 2>&1 )&
webidc=$!
rm -rf ${TESTWORK}/outdir/*

${TESTWORK}/test_node.sh 2>&1 | tee --output-error=exit -a $log 2>&1
xs=$(( ${PIPESTATUS[0]} + ${PIPESTATUS[1]} ))
test ${xs} -ne 0 && echo node failed && exit

rm -rf ~/Downloads/.tmpimbtest

touch ~/Downloads/imbraw2dng_test_${testid}_startmark
sleep 1

${TESTWORK}/test_html.js 2>&1 | tee -a $log 2>&1
sleep 3
touch ~/Downloads/imbraw2dng_test_${testid}_endmark

mkdir -p ${TESTWORK}/outdir/html
ls -tr ~/Downloads/.tmpimbtest/*  |  while read xuqf; do
	uqf=$( basename "$xuqf")
	nf="${uqf%%@*}"
	if [ -e ${TESTWORK}/outdir/html/$nf ]; then
		i=1
		while [ -e ${TESTWORK}/outdir/html/${nf%%.*}" ("$i")."${nf##*.} ]; do
			i=$(( $i + 1 ))
		done
		mv -v ~/Downloads/.tmpimbtest/$uqf ${TESTWORK}/outdir/html/${nf%%.*}" ("$i")."${nf##*.} 2>&1 | tee -a $log
	else
		mv -v ~/Downloads/.tmpimbtest/$uqf ${TESTWORK}/outdir/html/$nf 2>&1 | tee -a $log
	fi
done
#	mv -v {} ${TESTWORK}/outdir/html \; 2>&1 | tee -a $log
find ~/Downloads/ -newer ~/Downloads/imbraw2dng_test_${testid}_startmark -type f ! -name imbraw2dng_test_${testid}_endmark -exec rm -v {} \; 2>&1 | tee -a $log
rm ~/Downloads/imbraw2dng_test_${testid}_endmark ~/Downloads/imbraw2dng_test_${testid}_startmark

touch ~/Downloads/imbraw2dng_test_${testid}_startmark
( python3 -m http.server 8080 > ${log}_http 2>&1 )&
ps -ef|grep -q 'appiu[m]'
if [ $? -ne 0 ]; then
	( PATH="/opt/google/android-studio/cmdline-tools/latest/bin/:/opt/google/android-studio/emulator/:$PATH" ANDROID_SDK_ROOT=/opt/google/android-studio ANDROID_HOME=/opt/google/android-studio appium \
		server -a 127.0.0.1 --allow-insecure chromedriver_autodownload,adb_shell  > /dev/null 2>&1 ) &
	sleep 6
fi


${TESTWORK}/test_app.js 2>&1 | tee -a $log 2>&1
sleep 3
touch ~/Downloads/imbraw2dng_test_${testid}_endmark

mkdir -p ${TESTWORK}/outdir/app
find ~/Downloads -newer ~/Downloads/imbraw2dng_test_${testid}_startmark -type f ! -name imbraw2dng_test_${testid}_endmark -exec mv -v {} ${TESTWORK}/outdir/app \; 2>&1 | tee -a $log
rm ~/Downloads/imbraw2dng_test_${testid}_endmark ~/Downloads/imbraw2dng_test_${testid}_startmark

for f in ${TESTWORK}/outdir/app/*.b64; do openssl base64 -A -d -in $f > ${f%%.b64} && rm $f; done
echo Appium Log >> $log
cat ${TESTWORK}/outdir/app/appium.log >> $log 2>&1
echo >> $log

pushd ${TESTWORK}/outdir/app
( unzip -j appium_dirzip | grep -i inflating | awk '{print $2}' | while read x; do mv $x appium_${x}; done ) >> $log
popd
echo >> $log

# unify zip and msg.html filenames from timestamps to serial
kk=1
for f in $( ls ${TESTWORK}/outdir/html/imb*zip | sort ); do
	nn=$( basename "$f" | sed 's/\(imb[^_]*_\)[0-9]*_/\1'$kk'_/g' )
	kk=$(( $kk + 1 ))
	mv -v "$f" ${TESTWORK}/outdir/html/"$nn" 2>&1 | tee -a $log
done

# unzip zip archives
pushd ${TESTWORK}/outdir
find . -name \*.zip | while read z; do
	rm -rf "${z}_tmp"
	mkdir "${z}_tmp"
	unzip -q -d "${z}_tmp" "${z}"
done

kk=1
for f in $( ls ${TESTWORK}/outdir/html/imb*msg.html | sort ); do
	nn=$( basename "$f" | sed 's/\(imb[^_]*_\)[0-9]*_/\1'$kk'_/g' )
	kk=$(( $kk + 1 ))
	mv -v "$f" ${TESTWORK}/outdir/html/"$nn" 2>&1 | tee -a $log
done

kk=1
for f in $( find ${TESTWORK}/outdir/ -name \*.csv | sort ); do
	d=$( dirname $f )
	nn=$( basename "$f" | sed 's/\(imb[^_]*_\)[0-9]*_/\1'$kk'_/g' )
	kk=$(( $kk + 1 ))
	mv -v "$f" ${d}/"$nn" 2>&1 | tee -a $log
done

# link files inside zips
find */* -type f|while read x; do z=$( echo "$x" | sed 's@/@_@g' ); ln -sv "$x" "$z"; done >> $log 2>&1

# generate thumb and tiff
find . -maxdepth 1 -name \*.[dD][nN][gG] -print0 | xargs -0  dcraw -e  2>/dev/null
exiftool -b -preview:all -w .tif *.[dD][nN][gG] > /dev/null 2>&1 # -execute -overwrite_original -orientation= %f.tif

## dng and gps
cp 'html_2024_0217_121752_001 (2).dng' 'zhtml_2024_0217_121752_001.dng'
cp '2019_0101_002053_001_002.dng' 'z2019_0101_002053_001_002.dng'
cp 'test1.zip_tmp_2029_0710_010203_001.dng' 'ztest1.zip_tmp_2029_0710_010203_001.dng'

gpscorrelate -g ${TESTWORK}/sample.gpx ztest1.zip_tmp_2029_0710_010203_001.dng | tee -a $log 2>&1
darktable-cli ztest1.zip_tmp_2029_0710_010203_001.dng ${TESTWORK}/ztest1.zip_tmp_2029_0710_010203_001.dng.xmp ztest1.zip_tmp_2029_0710_010203_001.jpg | tee -a $log 2>&1
darktable-cli 'zhtml_2024_0217_121752_001.dng' ${TESTWORK}/'zhtml_2024_0217_121752_001.dng.xmp' 'zhtml_2024_0217_121752_001.jpg' | tee -a $log 2>&1
darktable-cli z2019_0101_002053_001_002.dng ${TESTWORK}/z2019_0101_002053_001_002.dng.xmp z2019_0101_002053_001_002.jpg | tee -a $log 2>&1
gpscorrelate -g ${TESTWORK}/sample.gpx  z2019_0101_002053_001_002.jpg | tee -a $log 2>&1

# generate xmp xml
echo '<packs>' > ${TESTWORK}/imbraw2dng_test_${testid}_xmp.xmlx 2>&1
find * -name \*[jJdD][pPnN][gG] -type f -exec \
	sh -c  'echo "<pack n="\""{}""\">" ; exiv2 -pX "{}" ; echo "</pack>" '  \; |sed -e  's/<[?]xml[^>]*>//g'  >> ${TESTWORK}/imbraw2dng_test_${testid}_xmp.xmlx 2>&1
echo '</packs>' >> ${TESTWORK}/imbraw2dng_test_${testid}_xmp.xmlx 2>&1
git restore ${TESTWORK}/results/imbraw2dng_test_xmp.xml
xsltproc --stringparam refdoc ${TESTWORK}/results/imbraw2dng_test_xmp.xml ../../helpstuff/sortmetadata.xsl ${TESTWORK}/imbraw2dng_test_${testid}_xmp.xmlx | \
	sed 's/  */ /g' | xmllint -format - > ${TESTWORK}/imbraw2dng_test_${testid}_xmp.xml 2>&1

# generate exif xml
find * -type f | sort |  exiftool -X -@ - > ${TESTWORK}/imbraw2dng_test_${testid}_exif.xmlx
git restore ${TESTWORK}/results/imbraw2dng_test_exif.xml
xsltproc --stringparam refdoc ${TESTWORK}/results/imbraw2dng_test_exif.xml ../../helpstuff/sortmetadata.xsl ${TESTWORK}/imbraw2dng_test_${testid}_exif.xmlx | \
	xmllint -format - > ${TESTWORK}/imbraw2dng_test_${testid}_exif.xml 2>&1

# generate exiv2 output
find * -name \*[jJdD][pPnN][gG] -type f -print0 | sort -z | xargs  -0 exiv2 -pR -uvb  > ${TESTWORK}/imbraw2dng_test_${testid}_exiv2.txt 2>&1
find * -name \*[jJdD][pPnN][gG] -type f -print0 | sort -z | xargs  -0 exiv2 -PXEItk | sed 's/^\(.\{190\}\).*$/\1/g' > ${TESTWORK}/imbraw2dng_test_${testid}_exiv2x.txt 2>&1


echo 'ZIP TESTS' | tee -a $log
find . -name \*.zip -type f -print -exec unzip -v {} \; -exec unzip -t {} \; 2>&1 | tee -a $log

echo 'LINT TESTS' | tee -a $log
ln -sf ${TESTEXES}/imbraw2dng.js ih.mjs
echo imbraw2dng.js | tee -a $log
node /home/hegny/prog/imbraw2dng/github/node_modules/eslint/bin/eslint.js -c ${TESTEXES}/eslint.config-node.mjs ih.mjs 2>&1 | tee -a $log

stl=$( grep -n '<script' ${TESTEXES}/imbraw2dng.html|cut -d: -f1 )
endl=$( grep -n '</script' ${TESTEXES}/imbraw2dng.html|cut -d: -f1 )
head -$(( $endl - 1 )) ${TESTEXES}/imbraw2dng.html|tail -$(( $endl - $stl - 1 )) > ih.js
echo  imbraw2dng.html $stl | tee -a $log
node /home/hegny/prog/imbraw2dng/github/node_modules/eslint/bin/eslint.js -c ${TESTEXES}/eslint.config.mjs  ih.js 2>&1 | tee -a $log

stla=$( grep -n '<script' ${TESTEXES}/imbapp.htm|cut -d: -f1 | head -1 )
endla=$( grep -n '</script' ${TESTEXES}/imbapp.htm|cut -d: -f1 |head -1)
head -$(( $endla - 1 )) ${TESTEXES}/imbapp.htm|tail -$(( $endla - $stla - 1 )) > iaa.js
echo  imbapp.html $stla | tee -a $log
node /home/hegny/prog/imbraw2dng/github/node_modules/eslint/bin/eslint.js -c ${TESTEXES}/eslint.config.mjs  iaa.js 2>&1 | tee -a $log

stlb=$( grep -n '^<script.*js-netwwor' ${TESTEXES}/imbapp.htm|cut -d: -f1 | tail -1 )
endlb=$( grep -n '^</script>.*js-netwwor' ${TESTEXES}/imbapp.htm|cut -d: -f1 |tail -1)
head -$(( $endlb - 1 )) ${TESTEXES}/imbapp.htm|tail -$(( $endlb - $stlb - 1 )) | sed 's@</*script[^>]*>@@g' > iaw.js
echo imbapp.html net worker $stlb | tee -a $log
node /home/hegny/prog/imbraw2dng/github/node_modules/eslint/bin/eslint.js -c ${TESTEXES}/eslint.config.mjs  iaw.js 2>&1 | tee -a $log

stlc=$( grep -n '^<script.*js-previewwor' ${TESTEXES}/imbapp.htm|cut -d: -f1 | tail -1 )
endlc=$( grep -n '^</script>.*js-previewwor' ${TESTEXES}/imbapp.htm|cut -d: -f1 |tail -1)
head -$(( $endlc - 1 )) ${TESTEXES}/imbapp.htm|tail -$(( $endlc - $stlc - 1 )) | sed 's@</*script[^>]*>@@g' > iapw.js
echo imbapp.html preview worker $stlc | tee -a $log
node /home/hegny/prog/imbraw2dng/github/node_modules/eslint/bin/eslint.js -c ${TESTEXES}/eslint.config.mjs  iapw.js 2>&1 | tee -a $log

ls -l ia*.js ih.mjs ih.js

find ${TESTDAT}/.. ${TESTWORK} \( -name mf6x6_large_1\*.[rR][aA][wW] -o -name kb_large_10\*.[rR][aA][wW] -o -name 2029_0710_010203_001\*.[rR][aA][wW] \) -exec cksum {} \; 2>&1 | sort | tee -a $log

# texts
#sed -i.bk -e 's/imbapp_app/imbapp/g' -e 's/imbapp.htm/imbapp/g' *.csv
rm -f zz
cat [a-z]*.csv|sort -u > 0.csv
cut -d: -f1 0.csv | grep -v '^"langs$' | sort -u | while read w
do
	n=$( grep '^'$w':' [a-z]*.csv |cut -d';' -f 2-9999|sort -u|wc -l )
	if [ $n -gt 1 ]
	then
		grep -Fh "$w"':' [a-z]*csv >> zz
	else
		grep -Fh "$w"':' [a-z]*csv | sed 's/^\("[^":]*\):[^"]*"/\1"/g' | sort -u >> zz
	fi
done
echo -en '"langs","DE","EN","JA"\015\012' > ../imbraw2dng_test_${testid}_texts.csv
grep '^"version' zz >> ../imbraw2dng_test_${testid}_texts.csv
grep -v '^"version' zz >> ../imbraw2dng_test_${testid}_texts.csv

cd ..
for f in imbraw2dng_test_${testid}* ; do
	cp -v $f results/$( echo $f | sed 's/_'${testid}'//g' )
done


#rm -rf *_${$}_tmp 2>&1 | tee -a $log 2>&1

kill $webid 2>&1 | tee -a $log 2>&1
kill $webidc
kill %1
kill %2
kill %3
kill %4

