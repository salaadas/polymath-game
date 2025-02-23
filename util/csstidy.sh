#! /usr/bin/env bash


echo "You are about to override ${1}."
read -p "Continue? (y/n) " choice
case "$choice" in 
  y|Y ) echo "Continuing...";;
  n|N ) echo "no"; exit;;
  * ) echo "invalid"; exit;;
esac


./node_modules/.bin/postcss \
    --verbose \
    --no-map \
    --use stylefmt --stylelint.config ".stylelintrc" \
    --use postcss-sorting --postcss-sorting.sort-order "yandex" \
    --use postcss-single-line \
    --replace $1
