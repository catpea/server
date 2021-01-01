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

# Create images for warrior book
wget -nd -p -P xxx -A jpg http://black:3000/read/westland-warrior/72 ; ll xxx; montage xxx/*.jpg test.jpg


# restore empty poems with folder poetry  (red red rose, if, invictus, etc)
https://github.com/westland-valhalla/poems/tree/master/dist/poems-txt
right now poems start with poetry-0016 so there are 16 empty slots in the beginning

# utility to warn about missing resources
monitor audio images, internal links, 404, etc.

# Notes

warrior origin needs to be responsible for creating images of content,
that may mean YAML parsing.



# add a book of favorite quotes on top of images
just call it quotes, these are printer friendly
