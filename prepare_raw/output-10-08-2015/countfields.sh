#!/bin/bash
count = 0

while read p
do
	echo $p | sed 's/[^,]//g' | wc -c
done < feature_1439222628488.csv 

