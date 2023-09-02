#!/bin/bash

# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем зависимости
sudo apt install -y wget build-essential git subversion linux-headers-$(uname -r) libxml2-dev libncurses5-dev uuid-dev sqlite3 libsqlite3-dev pkg-config libjansson-dev libxml2-dev sqlite autoconf automake libtool libedit-dev libssl-dev libcurl4-openssl-dev libncurses5-dev libnewt-dev libusb-dev libspandsp-dev libmyodbc odbc-postgresql unixodbc unixodbc-dev libsrtp2-dev libogg-dev libvorbis-dev libicu-dev libiksemel-dev libpq-dev libneon27-dev libbluetooth-dev libspeex-dev libspeexdsp-dev libmysqlclient-dev libradiusclient-ng-dev libsnmp-dev libxslt1-dev liburiparser-dev liblua5.1-0-dev libedit-dev libeditline-dev liblua50-dev liblua50 lua50 liblua5.2-dev liblua5.2 lua5.2 liblua5.3-dev liblua5.3 lua5.3 liblua5.4-dev liblua5.4 lua5.4 -y

# Устанавливаем Asterisk
cd /usr/src/
sudo wget http://downloads.asterisk.org/pub/telephony/asterisk/asterisk-18-current.tar.gz
sudo tar xvfz asterisk-18-current.tar.gz
cd asterisk-18*/
sudo contrib/scripts/get_mp3_source.sh
sudo contrib/scripts/install_prereq install
sudo ./configure --libdir=/usr/lib64 --with-jansson-bundled
sudo make
sudo make install
sudo make samples
sudo make config

# Устанавливаем FreePBX
cd /usr/src/
sudo wget http://mirror.freepbx.org/modules/packages/freepbx/freepbx-15.0-latest.tgz
sudo tar xfz freepbx-15.0-latest.tgz
cd freepbx
sudo ./start_asterisk start
sudo ./install -n

# Запускаем Asterisk и FreePBX
sudo systemctl enable asterisk
sudo systemctl start asterisk
sudo fwconsole start

# Завершение установки
sudo fwconsole chown
sudo fwconsole reload

echo "Установка Asterisk и FreePBX завершена."