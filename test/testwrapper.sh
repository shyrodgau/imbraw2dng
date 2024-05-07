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

( ${TESTWORK}/test_node.sh ; echo $? > trc ) 2>&1 | tee -a $log 2>&1

touch ~/Downloads/imbraw2dng_test_${testid}_startmark
sleep 1

grep -v '^0$' trc && exit

${TESTWORK}/test_html.js 2>&1 | tee -a $log 2>&1
sleep 3
touch ~/Downloads/imbraw2dng_test_${testid}_endmark

mkdir -p ${TESTWORK}/outdir/html
find ~/Downloads -newer ~/Downloads/imbraw2dng_test_${testid}_startmark -type f ! -name imbraw2dng_test_${testid}_endmark -exec mv -v {} ${TESTWORK}/outdir/html \;
rm ~/Downloads/imbraw2dng_test_${testid}_endmark ~/Downloads/imbraw2dng_test_${testid}_startmark

pushd ${TESTWORK}/outdir
find . -name \*.zip | while read z; do
	mkdir ${z}_${$}_tmp
	unzip -q -d ${z}_${$}_tmp ${z}
done

find */* -type f|while read x; do z=$( echo "$x" | sed 's@/@_@g' ); ln -sv "$x" "$z"; done >> $log 2>&1

find . -maxdepth 1 -name \*.[dD][nN][gG] -exec dcraw -e {} \; 2>/dev/null

find * -type f -print0 | xargs -0 exiftool -r -X  > ${TESTWORK}/imbraw2dng_test_${testid}_exif.xml

#rm -rf *_${$}_tmp 2>&1 | tee -a $log 2>&1

kill $webid 2>&1 | tee -a $log 2>&1
