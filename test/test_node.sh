#!/usr/bin/bash

# test script for node.js
# expects test data:
TESTDAT=/home/hegny/prog/imbraw2dng/samples/webroot

# test executable path:
TESTEXES=/home/hegny/prog/imbraw2dng/github

# workdir (this here):
TESTWORK=/home/hegny/prog/imbraw2dng/github/test


###############################################

# preparations

testout=${TESTWORK}/outdir

rm -rf ${testout}
mkdir -p ${testout}

echo '{ }' > ${testout}/.imbraw2dng.json

tn=1

################################################

pushd $testout

echo '##########    1    ##########'
echo Test ${tn} convert all
set -x
${TESTEXES}/imbraw2dng.js $( find ${TESTDAT}/IMBACK/*/ -type f -o -type l )
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed RC $rc
	exit 1
fi
if [ $n -ne 22 ]; then
	echo Test ${tn} failed NO $n
	exit 1
fi
tn=$(( $tn + 1 ))

echo '##########    2    ##########'
echo Test ${tn} convert again but do not overwrite expect error
set -x
${TESTEXES}/imbraw2dng.js $( find ${TESTDAT}/IMBACK/*/ -type f -o -type l )
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -eq 0 ]; then
	echo Test ${tn} failed $rc
	exit 2
fi
if [ $n -ne 22 ]; then
	echo Test ${tn} failed NO $n
	exit 2
fi
tn=$(( $tn + 1 ))

echo '##########    3    ##########'
echo Test ${tn} convert again but overwrite
set -x
${TESTEXES}/imbraw2dng.js -f $( find ${TESTDAT}/IMBACK/*/ -type f -o -type l )
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit 3
fi
if [ $n -ne 22 ]; then
	echo Test ${tn} failed NO $n
	exit 3
fi
tn=$(( $tn + 1 ))

echo '##########    4    ##########'
echo Test ${tn} convert again but rename
set -x
${TESTEXES}/imbraw2dng.js -r $( find ${TESTDAT}/IMBACK/*/ -type f -o -type l )
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit 4
fi
if [ $n -ne 44 ]; then
	echo Test ${tn} failed NO $n
	exit 4
fi
tn=$(( $tn + 1 ))

echo '##########    5    ##########'
echo Test ${tn} convert all recursive
set -x
${TESTEXES}/imbraw2dng.js -r ${TESTDAT}/IMBACK/*/*.*
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit 5
fi
if [ $n -ne 66 ]; then
	echo Test ${tn} failed NO $n
	exit 5
fi
tn=$(( $tn + 1 ))

echo '##########    6    ##########'
echo Test ${tn} convert to zip
set -x
${TESTEXES}/imbraw2dng.js -d test1.zip ${TESTDAT}/IMBACK/*/*.*
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit 6
fi
if [ $n -ne 67 ]; then
	echo Test ${tn} failed NO $n
	exit 6
fi
tn=$(( $tn + 1 ))

echo '##########    7    ##########'
echo Test ${tn} convert again but exists
set -x
${TESTEXES}/imbraw2dng.js -d test1.zip ${TESTDAT}/IMBACK/*/*.*
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -eq 0 ]; then
	echo Test ${tn} failed $rc
	exit 7
fi
if [ $n -ne 67 ]; then
	echo Test ${tn} failed NO $n
	exit 7
fi
tn=$(( $tn + 1 ))

echo '##########    8    ##########'
echo Test ${tn} convert again but no thum but copyright and zip
set -x
${TESTEXES}/imbraw2dng.js -np -cr 'testcopyright' -d test2.zip ${TESTDAT}/IMBACK/*/*.*
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit 8
fi
if [ $n -ne 68 ]; then
	echo Test ${tn} failed NO $n
	exit 8
fi
tn=$(( $tn + 1 ))


echo '##########    9    ##########'
echo Test ${tn} convert again but no thum but copyright and rename
set -x
${TESTEXES}/imbraw2dng.js -np -cr 'testcopyright' -r ${TESTDAT}/IMBACK/*/*.*
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit 9
fi
if [ $n -ne 90 ]; then
	echo Test ${tn} failed NO $n
	exit 9
fi
tn=$(( $tn + 1 ))


############ etc.


popd