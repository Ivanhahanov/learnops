old=$(stty -g)
stty raw -echo min 0 time 5

printf '\0337\033[r\033[999;999H\033[6n\0338' > /dev/tty
IFS='[;R' read -r _ rows cols _ < /dev/tty

stty "$old"
stty cols "$cols" rows "$rows"
