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

( ${TESTWORK}/test_node.sh ; echo $? > trc ) 2>&1 | tee -a $log 2>&1

touch ~/Downloads/imbraw2dng_test_${testid}_startmark
sleep 1

grep -v '^0$' trc && exit

${TESTWORK}/test_html.js 2>&1 | tee -a $log 2>&1
sleep 3
touch ~/Downloads/imbraw2dng_test_${testid}_endmark

mkdir -p ${TESTWORK}/outdir/html
find ~/Downloads -newer ~/Downloads/imbraw2dng_test_${testid}_startmark -type f ! -name imbraw2dng_test_${testid}_endmark -exec mv -v {} ${TESTWORK}/outdir/html \; 2>&1 | tee -a $log
rm ~/Downloads/imbraw2dng_test_${testid}_endmark ~/Downloads/imbraw2dng_test_${testid}_startmark

pushd ${TESTWORK}/outdir
find . -name \*.zip | while read z; do
	mkdir ${z}_${$}_tmp
	unzip -q -d ${z}_${$}_tmp ${z}
done

find */* -type f|while read x; do z=$( echo "$x" | sed 's@/@_@g' ); ln -sv "$x" "$z"; done >> $log 2>&1

find . -maxdepth 1 -name \*.[dD][nN][gG] -exec dcraw -e {} \; 2>/dev/null

find * -type f -print0 | xargs -0 exiftool -r -X  > ${TESTWORK}/imbraw2dng_test_${testid}_exif.xml 2>&1
find * -type f -print0 | xargs -0 exiv2 -pR -uvb  > ${TESTWORK}/imbraw2dng_test_${testid}_exiv2.xml 2>&1

echo 'ZIP TESTS' | tee -a $log
find . -name \*.zip -type f -print -exec unzip -v {} \; -exec unzip -t {} \; 2>&1 | tee -a $log

echo 'LINT TESTS' | tee -a $log
ln -sf ${TESTEXES}/imbraw2dng.js ih.mjs
node /home/hegny/prog/imbraw2dng/github/node_modules/eslint/bin/eslint.js -c ${TESTEXES}/eslint.config-node.mjs ih.mjs 2>&1 | tee -a $log
stl=$( grep -n '<script' ${TESTEXES}/imbraw2dng.html|cut -d: -f1 )
endl=$( grep -n '</script' ${TESTEXES}/imbraw2dng.html|cut -d: -f1 )
head -$(( $endl - 1 )) ${TESTEXES}/imbraw2dng.html|tail -$(( $endl - $stl - 1 )) > ih.js
node /home/hegny/prog/imbraw2dng/github/node_modules/eslint/bin/eslint.js -c ${TESTEXES}/eslint.config.mjs  ih.js 2>&1 | tee -a $log

cd ..
for f in imbraw2dng_test_${testid}* ; do
	cp -v $f results/$( echo $f | sed 's/_'${testid}'//g' )
done


#rm -rf *_${$}_tmp 2>&1 | tee -a $log 2>&1

kill $webid 2>&1 | tee -a $log 2>&1
