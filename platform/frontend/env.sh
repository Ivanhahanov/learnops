#!/bin/sh
for i in $(env | grep OIDC_)
do
    key=$(echo $i | cut -d '=' -f 1)
    value=$(echo $i | cut -d '=' -f 2-)
    echo $key=$value

    # sed JS and CSS only
    find /usr/share/nginx/html -type f -name '*.js' -exec sed -i "s|${key}|${value}|g" '{}' +
done
echo 'done'