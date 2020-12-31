# server
Static site generation friendly koa based webserver.


# Todo

## Feeds need to have paths fixed, replace src=\"image/ with src=\"/image/

## Copy files and images
cp /home/meow/Universe/Development/poetry/docs/image/* static/image/
cp /home/meow/Universe/Development/warrior/docs/images/* static/image/


##Find broken links
wget --spider -r -nd -nv -o run1.log black:3000
clear; grep -B1 'broken link!' run1.log
