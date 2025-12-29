#!/usr/bin/bash 
#
# /*/
sa=$( grep -n '^/[*] [*][*][*][*][*][*]*[*] app only [*][*][*][*]' imbapp.htm |cut -d: -f1 )
sb=$( grep -n '^/[*] [*][*][*][*][*][*]*[*] main class E N D [*][*][*][*]' imbapp.htm |cut -d: -f1 )
# /*/
sc=$( grep -n '^/[*] [*][*][*][*][*][*]*[*] Top class for App [*][*][*][*]' imbapp.htm |cut -d: -f1 )
sd=$( grep -n '^/[*] [*][*][*][*][*][*]*[*] Browser specifics, E N D [*][*][*][*]' imbapp.htm |cut -d: -f1 )
# /*/
sx=$( wc -l imbapp.htm | awk '{print $1}' )

#echo $sa $sb $sc $sd
ta=$( grep -n '^/[*] [*][*][*][*][*][*]*[*] app only [*][*][*][*]' cordova/imbapp/imbapp.html |cut -d: -f1 )
# /*/
tb=$( grep -n '^/[*] [*][*][*][*][*][*]*[*] main class E N D [*][*][*][*]' cordova/imbapp/imbapp.html |cut -d: -f1 )
tc=$( grep -n '^/[*] [*][*][*][*][*][*]*[*] Top class for App [*][*][*][*]' cordova/imbapp/imbapp.html |cut -d: -f1 )
# /*/
td=$( grep -n '^/[*] [*][*][*][*][*][*]*[*] Browser specifics, E N D [*][*][*][*]' cordova/imbapp/imbapp.html |cut -d: -f1 )

echo $sa $sb $sc $sd $ta $tb $tc $td

#echo $sa $sb $sc $sd
#

head -n$(( $sa - 1 )) imbapp.htm > imbappzzza.htm
sca=$( stat -c %s imbappzzza.htm )
printf 'I%07d' $sca > imbappzzz.htm
cat imbappzzza.htm >> imbappzzz.htm

head -n $(( $ta - 1 )) cordova/imbapp/imbapp.html > imbappzzzb.htm
sca=$( stat -c %s imbappzzzb.htm )
head -$tb cordova/imbapp/imbapp.html|tail -n+$ta > imbappzzzc.htm
scb=$( stat -c %s imbappzzzc.htm )
printf 'C%07d%07d' $sca $scb >> imbappzzz.htm

head -n$(( $sc )) imbapp.htm | tail -n+$(( $sb + 1 )) > imbappzzzd.htm
sca=$( stat -c %s imbappzzzd.htm )
printf 'I%07d' $sca >> imbappzzz.htm
cat imbappzzzd.htm >> imbappzzz.htm

head -n $tc cordova/imbapp/imbapp.html > imbappzzze.htm
sca=$( stat -c %s imbappzzze.htm )
head -n$td cordova/imbapp/imbapp.html |tail -n+$(( $tc + 1 )) > imbappzzzf.htm
scb=$( stat -c %s imbappzzzf.htm )
printf 'C%07d%07d' $sca $scb >> imbappzzz.htm

tail -n +$(( $sd + 1 )) imbapp.htm > imbappzzzg.htm
sca=$( stat -c %s imbappzzzg.htm )
printf 'I%07d' $sca >> imbappzzz.htm
cat imbappzzzg.htm >> imbappzzz.htm


exit

echo '/** ** ** '$ta' ' $(( $tb - $ta ))' ** ** **/' >> imbappzzz.htm
head -n$(( $sc )) imbapp.htm | tail -n $(( $sc - $sb + 1 )) >> imbappzzz.htm
echo '/** ** ** '$tc' ' $(( $td - $tc ))' ** ** **/' >> imbappzzz.htm
tail -n$(( $sx - $sd )) imbapp.htm >> imbappzzz.htm

