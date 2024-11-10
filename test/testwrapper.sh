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

${TESTWORK}/test_node.sh 2>&1 | tee --output-error=exit -a $log 2>&1
xs=$(( ${PIPESTATUS[0]} + ${PIPESTATUS[1]} ))
test ${xs} -ne 0 && echo node failed && exit

touch ~/Downloads/imbraw2dng_test_${testid}_startmark
sleep 1

${TESTWORK}/test_html.js 2>&1 | tee -a $log 2>&1
sleep 3
touch ~/Downloads/imbraw2dng_test_${testid}_endmark

mkdir -p ${TESTWORK}/outdir/html
find ~/Downloads -newer ~/Downloads/imbraw2dng_test_${testid}_startmark -type f ! -name imbraw2dng_test_${testid}_endmark -exec mv -v {} ${TESTWORK}/outdir/html \; 2>&1 | tee -a $log
rm ~/Downloads/imbraw2dng_test_${testid}_endmark ~/Downloads/imbraw2dng_test_${testid}_startmark

touch ~/Downloads/imbraw2dng_test_${testid}_startmark
#( python3 -m http.server 8080 > ${log}_http 2>&1 )&
#ps -ef|grep -q 'appiu[m]'
#if [ $? -ne 0 ]; then
#	( PATH="/opt/google/android-studio/cmdline-tools/latest/bin/:/opt/google/android-studio/emulator/:$PATH" ANDROID_SDK_ROOT=/opt/google/android-studio ANDROID_HOME=/opt/google/android-studio appium \
#		server -a 127.0.0.1 --allow-insecure chromedriver_autodownload --allow-insecure adb_shell  > /dev/null 2>&1 ) &
#	sleep 6
#fi


#${TESTWORK}/test_app.js 2>&1 | tee -a $log 2>&1
sleep 3
touch ~/Downloads/imbraw2dng_test_${testid}_endmark

mkdir -p ${TESTWORK}/outdir/app
find ~/Downloads -newer ~/Downloads/imbraw2dng_test_${testid}_startmark -type f ! -name imbraw2dng_test_${testid}_endmark -exec mv -v {} ${TESTWORK}/outdir/app \; 2>&1 | tee -a $log
rm ~/Downloads/imbraw2dng_test_${testid}_endmark ~/Downloads/imbraw2dng_test_${testid}_startmark

for f in ${TESTWORK}/outdir/app/*.b64; do openssl base64 -A -d -in $f > ${f%%.b64} && rm $f; done
echo Appium Log >> $log
cat ${TESTWORK}/outdir/app/appium.log >> $log 2>&1
echo >> $log

kk=1
for f in $( ls ${TESTWORK}/outdir/html/imb*zip | sort ); do
	nn=$( basename "$f" | sed 's/\(imb[^_]*_\)[0-9]*_/\1'$kk'_/g' )
	kk=$(( $kk + 1 ))
	mv -v "$f" ${TESTWORK}/outdir/html/"$nn" 2>&1 | tee -a $log
done

pushd ${TESTWORK}/outdir
find . -name \*.zip | while read z; do
	rm -rf "${z}_tmp"
	mkdir "${z}_tmp"
	unzip -q -d "${z}_tmp" "${z}"
done

find */* -type f|while read x; do z=$( echo "$x" | sed 's@/@_@g' ); ln -sv "$x" "$z"; done >> $log 2>&1

find . -maxdepth 1 -name \*.[dD][nN][gG] -exec dcraw -e {} \; 2>/dev/null

find * -type f -print0 | sort -z | xargs -0 exiftool -r -X  > ${TESTWORK}/imbraw2dng_test_${testid}_exif.xml 2>&1
find * -type f -print0 | sort -z | xargs -0 exiv2 -pR -uvb  > ${TESTWORK}/imbraw2dng_test_${testid}_exiv2.xml 2>&1

echo 'ZIP TESTS' | tee -a $log
find . -name \*.zip -type f -print -exec unzip -v {} \; -exec unzip -t {} \; 2>&1 | tee -a $log

echo 'LINT TESTS' | tee -a $log
ln -sf ${TESTEXES}/imbraw2dng.js ih.mjs
echo imbraw2dng.js | tee -a $log
node /home/hegny/prog/imbraw2dng/github/node_modules/eslint/bin/eslint.js -c ${TESTEXES}/eslint.config-node.mjs ih.mjs 2>&1 | tee -a $log
stl=$( grep -n '<script' ${TESTEXES}/imbraw2dng.html|cut -d: -f1 )
endl=$( grep -n '</script' ${TESTEXES}/imbraw2dng.html|cut -d: -f1 )
head -$(( $endl - 1 )) ${TESTEXES}/imbraw2dng.html|tail -$(( $endl - $stl - 1 )) > ih.js
echo imbraw2dng.html | tee -a $log
node /home/hegny/prog/imbraw2dng/github/node_modules/eslint/bin/eslint.js -c ${TESTEXES}/eslint.config.mjs  ih.js 2>&1 | tee -a $log

stla=$( grep -n '<script' ${TESTEXES}/imbapp.htm|cut -d: -f1 | head -1 )
endla=$( grep -n '</script' ${TESTEXES}/imbapp.htm|cut -d: -f1 |head -1)
head -$(( $endla - 1 )) ${TESTEXES}/imbapp.htm|tail -$(( $endla - $stla - 1 )) > iaa.js
echo imbapp.html | tee -a $log
node /home/hegny/prog/imbraw2dng/github/node_modules/eslint/bin/eslint.js -c ${TESTEXES}/eslint.config.mjs  iaa.js 2>&1 | tee -a $log

stlb=$( grep -n '<script' ${TESTEXES}/imbapp.htm|cut -d: -f1 | tail -1 )
endlb=$( grep -n '</script' ${TESTEXES}/imbapp.htm|cut -d: -f1 |tail -1)
head -$(( $endlb - 1 )) ${TESTEXES}/imbapp.htm|tail -$(( $endlb - $stlb - 1 )) > iaw.js
echo imbapp.html worker | tee -a $log
node /home/hegny/prog/imbraw2dng/github/node_modules/eslint/bin/eslint.js -c ${TESTEXES}/eslint.config.mjs  iaw.js 2>&1 | tee -a $log
ls -l ia*.js

cd ..
for f in imbraw2dng_test_${testid}* ; do
	cp -v $f results/$( echo $f | sed 's/_'${testid}'//g' )
done


#rm -rf *_${$}_tmp 2>&1 | tee -a $log 2>&1

kill $webid 2>&1 | tee -a $log 2>&1
kill %1
kill %2
kill %3
