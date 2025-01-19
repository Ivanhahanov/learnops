FROM zephinzer/cloudshell as cloudshell
FROM ubuntu
COPY --from=cloudshell /app/cloudshell /usr/bin/cloudshell
ENV TERM=xterm
RUN apt-get update \
 && apt-get install -y sudo
RUN useradd -rm -d /home/user -s /bin/bash -g root -G sudo -u 1001 user
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers



COPY resize.sh /tmp/resize.sh
RUN cat /tmp/resize.sh >> /home/user/.bashrc && rm /tmp/resize.sh

RUN echo 'export PS1="${debian_chroot:+($debian_chroot)}\[\033[01;34m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ "' >> /home/user/.bashrc

USER user
WORKDIR /home/user

ENTRYPOINT ["/usr/bin/cloudshell"]
