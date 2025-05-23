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

sumnum=0
rawcnt=15

################################################

pushd $testout

echo '##########    1    ##########'
echo Test ${tn} convert all
set -x
${TESTEXES}/imbraw2dng.js $( find ${TESTDAT}/IMBACK/*/ \( -type f -o -type l \) ! -name index.html )
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed RC $rc
	exit 1
fi
sumnum=$(( $sumnum + $rawcnt ))
if [ $n -ne $sumnum ]; then
	echo Test ${tn} failed NO $n
	exit 1
fi
echo Test ${tn} okay
tn=$(( $tn + 1 ))

echo '##########    2    ##########'
echo Test ${tn} convert again but do not overwrite expect error
set -x
${TESTEXES}/imbraw2dng.js $( find ${TESTDAT}/IMBACK/*/ \( -type f -o -type l  \) ! -name index.html )
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -eq 0 ]; then
	echo Test ${tn} failed $rc
	exit 2
fi
if [ $n -ne $sumnum ]; then
	echo Test ${tn} failed NO $n
	exit 2
fi
echo Test ${tn} okay
tn=$(( $tn + 1 ))

echo '##########    3    ##########'
echo Test ${tn} convert again but overwrite
set -x
${TESTEXES}/imbraw2dng.js -f $( find ${TESTDAT}/IMBACK/*/ \( -type f -o -type l \) ! -name index.html )
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit 3
fi
if [ $n -ne $sumnum ]; then
	echo Test ${tn} failed NO $n
	exit 3
fi
echo Test ${tn} okay
tn=$(( $tn + 1 ))

echo '##########    4    ##########'
echo Test ${tn} convert again but rename
set -x
${TESTEXES}/imbraw2dng.js -r $( find ${TESTDAT}/IMBACK/*/ \( -type f -o -type l  \) ! -name index.html )
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit 4
fi
sumnum=$(( $sumnum + $rawcnt ))
if [ $n -ne $sumnum ]; then
	echo Test ${tn} failed NO $n
	exit 4
fi
echo Test ${tn} okay
tn=$(( $tn + 1 ))

echo '##########    5    ##########'
echo Test ${tn} convert all recursive
set -x
${TESTEXES}/imbraw2dng.js -r -R -J -O ${TESTDAT}/IMBACK/*/
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit 5
fi
sumnum=$(( $sumnum + $rawcnt + 2 ))
if [ $n -ne $sumnum ]; then
	echo Test ${tn} failed NO $n
	exit 5
fi
echo Test ${tn} okay
tn=$(( $tn + 1 ))

echo '##########    6    ##########'
echo Test ${tn} convert to zip
set -x
${TESTEXES}/imbraw2dng.js -d test1.zip ${TESTDAT}/IMBACK/*/*.[rRmMjJ]*
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit 6
fi
sumnum=$(( $sumnum + 1 ))
if [ $n -ne $sumnum ]; then
	echo Test ${tn} failed NO $n
	exit 6
fi
echo Test ${tn} okay
tn=$(( $tn + 1 ))

echo '##########    7    ##########'
echo Test ${tn} convert again but exists
set -x
${TESTEXES}/imbraw2dng.js -d test1.zip ${TESTDAT}/IMBACK/*/*.[rRmMjJ]*
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -eq 0 ]; then
	echo Test ${tn} failed $rc
	exit 7
fi
if [ $n -ne $sumnum ]; then
	echo Test ${tn} failed NO $n
	exit 7
fi
echo Test ${tn} okay
tn=$(( $tn + 1 ))

echo '##########    8    ##########'
echo Test ${tn} convert again but no thum but copyright and zip
set -x
${TESTEXES}/imbraw2dng.js -np -cr 'testcopyright debugging' -d test2.zip ${TESTDAT}/IMBACK/*/*.[rRmMjJ]*
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit 8
fi
sumnum=$(( $sumnum + 1 ))
if [ $n -ne $sumnum ]; then
	echo Test ${tn} failed NO $n
	exit 8
fi
echo Test ${tn} okay
tn=$(( $tn + 1 ))


echo '##########    9    ##########'
echo Test ${tn} convert again but no thum but copyright and rename
set -x
${TESTEXES}/imbraw2dng.js -np -cr 'testcopyright debugging' -r ${TESTDAT}/IMBACK/*/*.[rRmMjJ]*
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit 9
fi
sumnum=$(( $sumnum + $rawcnt ))
if [ $n -ne $sumnum ]; then
	echo Test ${tn} failed NO $n
	exit 9
fi
echo Test ${tn} okay
tn=$(( $tn + 1 ))

echo '##########    10    ##########'
echo Test ${tn} convert from imback
set -x
${TESTEXES}/imbraw2dng.js -ef 3 -np -at 'test creator debugging' -r -R -O -n 2023 -d fromback.zip
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit $tn
fi
sumnum=$(( $sumnum + 1 ))
if [ $n -ne $sumnum ]; then
	echo Test ${tn} failed NO $n
	exit $tn
fi
echo Test ${tn} okay
tn=$(( $tn + 1 ))

echo '##########    11    ##########'
echo Test ${tn} embed exif
set -x
${TESTEXES}/imbraw2dng.js -d withexif1.zip -cr 'testcopyright debugging'  -at 'test creator debugging' ${TESTDAT}/IMBACK/PHOTO/2024_0217_121754_002.JPG ${TESTDAT}/IMBACK/PHOTO/2024_0217_121752_001.RAW
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit $tn
fi
sumnum=$(( $sumnum + 1 ))
if [ $n -ne $sumnum ]; then
	echo Test ${tn} failed NO $n
	exit $tn
fi
echo Test ${tn} okay
tn=$(( $tn + 1 ))


echo '##########    12    ##########'
echo Test ${tn} without date
set -x
${TESTEXES}/imbraw2dng.js  ${TESTDAT}/../*.raw
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit $tn
fi
sumnum=$(( $sumnum + 17 ))
if [ $n -ne $sumnum ]; then
	echo Test ${tn} failed NO $n
	exit $tn
fi
echo Test ${tn} okay
tn=$(( $tn + 1 ))


echo '##########    13    ##########'
echo Test ${tn} old-style
set -x
${TESTEXES}/imbraw2dng.js -ndcp -owb -r ${TESTDAT}/../*.raw
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit $tn
fi
sumnum=$(( $sumnum + 17 ))
if [ $n -ne $sumnum ]; then
	echo Test ${tn} failed NO $n
	exit $tn
fi
echo Test ${tn} okay
tn=$(( $tn + 1 ))


echo '##########    14    ##########'
echo Test ${tn} backward
set -x
${TESTEXES}/imbdng2raw.js  2023_0314_231116_004.dng 2029_0707_120426_021.dng 2023_0311_120252_002.dng 
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit $tn
fi
sumnum=$(( $sumnum + 3 ))
if [ $n -ne $sumnum ]; then
	echo Test ${tn} failed NO $n
	exit $tn
fi
echo Test ${tn} okay
tn=$(( $tn + 1 ))


echo '##########    15    ##########'
echo Test ${tn} stacking DNG
set -x
${TESTEXES}/imbraw2dng.js -fla 2029_0710_010203_001.dng 2029_0707_120426_021.dng 2023_0311_120252_002.dng 
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit $tn
fi
sumnum=$(( $sumnum + 1 ))
if [ $n -ne $sumnum ]; then
	echo Test ${tn} failed NO $n
	exit $tn
fi
echo Test ${tn} okay
tn=$(( $tn + 1 ))

echo '##########    15    ##########'
echo Test ${tn} stacking RAW
set -x
${TESTEXES}/imbraw2dng.js -flx -d stackraw.zip ${TESTDAT}/IMBACK/*/*.[rR]* 
rc=$?
n=$( ls .|wc -l )
set +x
if [ $rc -ne 0 ]; then
	echo Test ${tn} failed $rc
	exit $tn
fi
sumnum=$(( $sumnum + 1 ))
if [ $n -ne $sumnum ]; then
	echo Test ${tn} failed NO $n
	exit $tn
fi
echo Test ${tn} okay
tn=$(( $tn + 1 ))


############ etc.

echo
echo 'NODE TESTS FINISHED'
echo

popd
