#! /bin/bash

for file in ./scripts/images/*.dockerfile
do
    prefix="bosta"
    language=$(basename $file | cut -d'.' -f1)
    name="$prefix/$language"
    echo "> Building - $name"
    docker build -t $name -f $file .

    echo ""
done
