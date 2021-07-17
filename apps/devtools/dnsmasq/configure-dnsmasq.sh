echo "address=/form.io.test/127.0.0.1" >> /usr/local/etc/dnsmasq.conf
echo "address=/form.io.localhost/127.0.0.1" >> /usr/local/etc/dnsmasq.conf

sudo launchctl stop homebrew.mxcl.dnsmasq
sudo launchctl start homebrew.mxcl.dnsmasq

sudo mkdir -p /etc/resolver

echo 'nameserver 127.0.0.1' | sudo tee /etc/resolver/form.io.test
echo 'nameserver 127.0.0.1' | sudo tee /etc/resolver/form.io.localhost
