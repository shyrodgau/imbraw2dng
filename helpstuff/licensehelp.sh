#!/bin/bash

mypath="/home/hegny/prog/imbraw2dng/github/"

lxh=$( sed  -e 's/^  /\&nbsp;\&nbsp;/g' -e 's/"/\&quot;/g' "$mypath"/LICENSE.txt| while read l; do echo  -n "$l<br>"; done )

echo '<html><head><meta http-equiv="content-type" content="text/html;charset=UTF-8"></head><body style="font-size:7px;">' > "$mypath"/LICENSE.html
echo "$lxh" >> "$mypath"/LICENSE.html
echo '</body></html>' >> "$mypath"/LICENSE.html

lxx=$( echo -n "$lxh" | sed -e 's/&/\\\&/g' )

#echo "$lxh"
#echo "$lxx"

sed -i -e  's%<!--@@LICENSESTART@@ -->.*<!-- @@LICENSEEND@@ -->%<!--@@LICENSESTART@@ -->'"$lxx"'<!-- @@LICENSEEND@@ -->%g' "$mypath"/imbapp.htm


