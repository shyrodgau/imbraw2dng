#!/usr/bin/bash


rm README_de.md README_MiMi_de.md README.md README_MiMi.md

IFS=''
c=1; m=1; n=1; 
cat README_base_de.md | while read x; do 
	if [[ "$x" =~ ' NOT MIMI' ]]; then 
		m=$(( 1 - $m )); echo $c M > /dev/stderr; 
	elif [[ "$x" =~ ' ONLY MIMI' ]]; then 
		n=$(( 1 - $n )); echo $c N > /dev/stderr; 
	else if [ $n -eq 1 ]; then 
			echo "$x" >> README_de.md; fi; 
		if [ $m  -eq 1 ]; then 
			echo "$x" >> README_MiMi_de.md; fi; 
	fi; c=$(( $c + 1 )); 
done

c=1; m=1; n=1; 
cat README_base.md | while read x; do 
	if [[ "$x" =~ ' NOT MIMI' ]]; then 
		m=$(( 1 - $m )); echo $c M > /dev/stderr; 
	elif [[ "$x" =~ ' ONLY MIMI' ]]; then 
		n=$(( 1 - $n )); echo $c N > /dev/stderr; 
	else if [ $n -eq 1 ]; then 
			echo "$x" >> README.md; fi; 
		if [ $m  -eq 1 ]; then 
			echo "$x" >> README_MiMi.md; fi; 
	fi; c=$(( $c + 1 )); 
done

