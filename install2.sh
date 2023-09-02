#!/bin/bash

apt-get update -y
apt-get install unzip git sox gnupg2 curl libncurses5-dev subversion libsqlite3-dev build-essential libjansson-dev libxml2-dev uuid-dev -y

wget http://downloads.asterisk.org/pub/telephony/asterisk/asterisk-19-current.tar.gz
tar -xvzf asterisk-19-current.tar.gz
cd asterisk-19.7.0
contrib/scripts/get_mp3_source.sh
contrib/scripts/install_prereq install

./configure
make menuselect.makeopts
make -j$(nproc)
make install
make samples
make config
ldconfig

groupadd asterisk
useradd -r -d /var/lib/asterisk -g asterisk asterisk
usermod -aG audio,dialout asterisk

chown -R asterisk.asterisk /etc/asterisk
chown -R asterisk.asterisk /var/{lib,log,spool}/asterisk
chown -R asterisk.asterisk /usr/lib/asterisk

echo 'AST_USER="asterisk"' > /etc/default/asterisk
echo 'AST_GROUP="asterisk"' >> /etc/default/asterisk

echo '[Unit]
Description=Asterisk PBX and telephony daemon
After=network.target
Documentation=man:asterisk(8)
Wants=network-online.target
Wants=systemd-networkd-wait-online.service

[Service]
Type=forking
ExecStart=/usr/sbin/asterisk -g -f -U asterisk -G asterisk
ExecStop=/usr/sbin/asterisk -rx "core stop now"
ExecReload=/usr/sbin/asterisk -rx "core reload"
Restart=always
RestartSec=5
User=asterisk
Group=asterisk

[Install]
WantedBy=multi-user.target' > /etc/systemd/system/asterisk.service

systemctl daemon-reload
systemctl start asterisk
systemctl enable asterisk
systemctl status asterisk

sed -i 's/;[radius]/[radius]/g' /etc/asterisk/cdr.conf
sed -i 's#;radiuscfg => /usr/local/etc/radiusclient-ng/radiusclient.conf#radiuscfg => /etc/radcli/radiusclient.conf#g' /etc/asterisk/cdr.conf
sed -i 's#;radiuscfg => /usr/local/etc/radiusclient-ng/radiusclient.conf#radiuscfg => /etc/radcli/radiusclient.conf#g' /etc/asterisk/cel.conf

apt-get install -y apache2 mariadb-server libapache2-mod-php php php-pear php-cgi php-common php-curl php-mbstring php-gd php-mysql php-bcmath php-zip php-xml php-imap php-json php-snmp

wget http://mirror.freepbx.org/modules/packages/freepbx/freepbx-16.0-latest.tgz
tar -xvzf freepbx-16.0-latest.tgz
cd freepbx
apt-get install -y nodejs npm

./install -n

fwconsole ma install pm2

sed -i 's/^\(User\|Group\).*/\1 asterisk/' /etc/apache2/apache2.conf
sed -i 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

sed -i 's/^\(upload_max_filesize = \).*/\120M/' /etc/php/7.4/apache2/php.ini
sed -i 's/^\(upload_max_filesize = \).*/\120M/' /etc/php/7.4/cli/php.ini

a2enmod rewrite
systemctl restart apache2
