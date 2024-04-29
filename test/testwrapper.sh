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
python3 -m http.server 8889 2>&1 | tee -a $log 2>&1
webid=$!

${TESTWORK}/test_node.sh 2>&1 | tee -a $log 2>&1

touch ~/Downloads/imbraw2dng_test_${testid}_startmark
${TESTWORK}/test_html.js 2>&1 | tee -a $log 2>&1
sleep 1
touch ~/Downloads/imbraw2dng_test_${testid}_endmark

mkdir -p ${TESTWORK}/outdir/html
mv -v ~/Downloads/imbraw2dng_test_${testid}_endmark ${TESTWORK}/outdir/html
find ~/Downloads -newer ~/Downloads/imbraw2dng_test_${testid}_startmark -type f -exec mv -v {} ${TESTWORK}/outdir/html \;

pushd ${TESTWORK}/outdir
find . -name \*.zip | while read z; do
	mkdir ${z}_${$}_tmp
	unzip -q -d ${z}_${$}_tmp ${z}
done

exiftool -r -X * > ${TESTWORK}/imbraw2dng_test_${testid}_exif.xml

rm -rf *_${$}_tmp 2>&1 | tee -a $log 2>&1

kill $webid 2>&1 | tee -a $log 2>&1
