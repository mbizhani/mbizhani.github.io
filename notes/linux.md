---
layout: page
title: Linux
toc: true
---

## Utility Commands
- `watch` - execute a program periodically, showing output fullscreen
  - `watch [-d] [-n] [-t] command`
    - `-d` : Highlight the differences between successive updates
	- `-n` : Specify update interval in seconds
	- `-t` : Turn off the header showing the interval, command, and current time at the top of the display
  - Multiple commands - `watch "CMD1; echo '\n'; CMD2; ..."`

| Command                            | Description                                                                   |
|------------------------------------|-------------------------------------------------------------------------------|
|`echo $(date +'%Y-%m-%d_%H-%M-%S')` | Formatted Date                                                                |
|`timedatectl set-timezone UTC`      | Set timezone to UTC                                                           |
|`seq -f "MSG_ID: %03g" 20`          | String Generator                                                              |
|`w`                                 | Shows brief info of system and current logged in users                        |
|`dpkg -S ABSOLUTE_FILE_NAME`        | Search for a filename from installed packages. (note: can't work on symlinks) |
|`systemctl show SERVICE`            | Show properties of one or more units, jobs, or the manager itself.            |
|`dmidecode --type 17 | less`        | RAM Modules Information                                                       |
|`hdparm -I /dev/sda | less`         | HDD Information                                                               |

- Filesystem Navigation [[REF](https://linuxize.com/post/popd-and-pushd-commands-in-linux/)]
  - `pushd DIR` - push the current directory to stack and change directory to `DIR`
  - `popd` - pop last directory from stack and change to it
  - `dirs -l -v` - list of directories in stack 

### find cmd
  - By default, it searches in subdirectories recursively, unless `-maxdepth` option is set.

Command                   | Description
--------------------------|----------------
`find DIR -name "SEARCH"` | case sensitive SEARCH in DIR
`find DIR -iname "*.rar" -printf "%f\n"` <br/> `find DIR -iname "*.rar" -exec basename {} \;` <br/> `find DIR -iname "*.rar" | awk -F "/" '{print $(NF)}'` | just print filename (without parent dirs)
`find DIR -type d -iname "SEARCH"` | case insensitive SEARCH only folders in DIR
`find DIR -type f -mtime +7 -exec rm -f {} \;` | delete files older than 7 days in DIR
`find DIR -maxdepth 1 -type f -mtime +7 -exec rm -f {} \;` | delete files only in DIR and older than 7 days 
`find DIR -maxdepth 1 -type d -exec du -hs {} \; | sort -hr` | list of size-sorted directories only in DIR <br/> NOTE: `-h` in both commands for human readable output

**Note**: Multi `exec` sample: ([Link](https://stackoverflow.com/questions/13184700/using-find-and-exec-to-create-directories-and-then-work-with-relative-path-to-th))
```sh
find /path/to/folders/* -type d \
    -exec mv {} {}.mbox \; \
    -exec mkdir {}.mbox/Messages \; \
    -exec sh -c "mv {}.mbox/*.emlx {}.mbox/Messages" \;
```

### awk cmd

| Command                                                                                                              | Description                            |
|----------------------------------------------------------------------------------------------------------------------|----------------------------------------|
|`find . -iname "*.rar" -printf "%f\n" | awk -F ".part" '{print $1}' | sort | uniq`                                    | list rar-parted files                  |
|`docker ps -a -f "status=exited" | awk '$3 ~ /runner/ {print "docker rm "$1}' | bash`                                 | remove GitLab Runner exited containers |
|`docker images -q -f "dangling=true" | awk '{print "docker rmi -f "$1}' | bash`                                       | remove dangling Docker images          |
|`docker images | grep rancher | awk '{I=$1; gsub("/", "_", $1); print "docker save -o "$1"_"$2".tar "I":"$2}' | bash` | export images as tar                   |
|`apt list firefox* | grep firefox | awk -F '/' '{print "apt-mark hold "$1}' | bash`                                   | hold all `firefox` packages            |


## User Management

### CRUD

| Command                                  | Description                    |
|------------------------------------------|--------------------------------|
| `adduser USERNAME`                       | add new user                   |
| `usermod -a -G GRP1[,GRP2,...] USERNAME` | append groups to user's groups |
| `usermod -g GRP USERNAME`                | change user’s primary group    |

### Audit

- [Ref](https://www.thegeekdiary.com/5-useful-command-examples-to-monitor-user-activity-under-linux/)

| Command                 | Description                                                                                     |
|-------------------------|-------------------------------------------------------------------------------------------------|
| `who -aH`               | Users currently logged in to the system                                                         |
| `last -a` or `lastb -a` | Listing of last logged in users (`lastb` shows bad login attempts) <br/> file = `/var/log/wtmp` |
| `laslog`                | Most recent login of all users <br/> file = `/var/log/lastlog`                                  |

## Network

### General
- `hostnamectl --static set-hostname HOSTNAME`
- `export http_proxy=http://[USERNAME:PASSWORD@]PROXY_SERVER[:PORT]` ([Ref](https://www.cyberciti.biz/faq/linux-unix-set-proxy-environment-variable/))
  - connect text based session and/or applications via the proxy server
  - apps like `apt`, `lynx`, `wget`, ...
- `/etc/network/interfaces` (in Debian)
```
iface eth0 inet static
    address IP/24
    gateway IP
    dns-nameservers 8.8.8.8 8.8.4.4
```
  - Using `sed` to update
    ```sh
    # update dhcp to static
    sed -i "s|dhcp|static\n\taddress 1.1.1.1\/24\n\tgateway 1.1.1.1\n\tdns-nameservers 8.8.8.8|g" /etc/network/interfaces

    # update address, ...
    sed -i -r "s|address.*|address 2.2.2.2\/24|g" /etc/network/interfaces
    ```

### ip cmd

- `ip` vs other net tools [[REF1](https://p5r.uk/blog/2010/ifconfig-ip-comparison.html)] [[REF2](https://www.cyberciti.biz/faq/linux-ip-command-examples-usage-syntax)]
  - **`-c`** - show color, use before command (i.e. `ip -c a`)

| Function                                 | New                   | Old                             |
|:-----------------------------------------|:----------------------|:--------------------------------|
| Show IP address                          | `ip a` `ip addr`      | `ifconfig`                      |
| Show routing table                       | `ip r` or `ip route`  | `route`                         |
| Show routed eth device for a specific IP | `ip r get IP`         |                                 |
| Show neighbour (ARP)                     | `ip n` or `ip neigh`  | `arp -a`                        |
| Show socket statics/info                 | `ss -lntp` `ss -antp` | `netstat -lntp` `netstat -antp` |

- `ip a | awk '/inet.*brd/{print $NF; exit}'` - find first (main) active network interface name [[REF](https://unix.stackexchange.com/questions/270008/retrieve-name-of-the-active-network-interface-only)]

### ssh cmd
- SSH Keygen
  - `ssh-keygen -t rsa -b 4096 -f ~/.ssh/NAME`
  - `cat ~/.ssh/NAME.pub | ssh USER@HOST "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys"`
  - `ssh -i ~/.ssh/NAME USER@HOST`
- Port Forwarding - [`DEST:PORT`] <- [`MIDDLE:PORT`] <- [`SRC:PORT`]
  - On [`DEST`]
    - `ssh -i ~/.ssh/NAME -N -R [BIND_ADDRESS:]PORT:MIDDLE:MIDDLE_PORT USER@MIDDLE`
  - On [`SRC`]
    - `ssh -i ~/.ssh/NAME -N -L [BIND_ADDRESS:]PORT:MIDDLE:MIDDLE_PORT USER@MIDDLE`
  - Deploy as service - create `/etc/systemd/system/myssh.service` with following content:
    ```
    [Unit]
    Description=MySSH
    Requires=network.target
    After=systemd-user-sessions.service
    
    [Service]
    User=USER_ON_DEST
    ExecStart=ssh -i IDENTITY -N -R [BIND_ADDRESS:]PORT:MIDDLE:MIDDLE_PORT USER@MIDDLE
    Type=simple
    KillMode=mixed
    TimeoutSec=30
    Restart=on-failure
    RestartSec=10
    StartLimitIntervalSec=30
    StartLimitBurst=10
    
    [Install]
    WantedBy=multi-user.target
    ```
    Now, `systemctl enable myssh` and `systemctl start myssh`. Check the service by `systemctl status myssh`. 

### rsync
[[REF1](https://www.digitalocean.com/community/tutorials/how-to-copy-files-with-rsync-over-ssh)]
- Create an SSH key, described in previous section
- `rsync -av -e "ssh -i ~/.ssh/NAME" DIR USER@HOST:DEST_DIR` - on source server

### iptables
- List
  - `iptables [-t table] -L [chain] [--line-numbers] [-n]`
    - _table_ = `filter` \| `nat` \| `mangle` ... 
    - _chain_ = `INPUT` \| `FORWARD` \| `OUTPUT` ...
    - `-n` - avoid long reverse DNS lookups, shows IP instead of DNS names
- Modify Rules 
  - `iptables -A chain rule` - Append rule to _chain_
  - `iptables -I chain num rule` - Insert rule to _chain_ at place _num_
  - `iptables -R chain num rule` - Replace rule of _chain_ at place _num_
  - `iptables -D chain num` - Delete rule from _chain_ at place _num_
- Chains & Rules
  - `INPUT` chain
    - First add specific acceptance rules
      - `iptables -A INPUT -s IP -p tcp --dport 22 -j ACCEPT` - accept incoming traffic from the source (`-s`) _IP_
    - Then, add general prevention rules
      - `iptables -A INPUT -s 0.0.0.0/0 -p tcp --dport 22 -j DROP` - prevent incoming traffic from all IPs 
  - `OUTPUT` chain
    - `iptables -A OUTPUT -d IP -j DROP` - prevent outgoing traffic to the destination (`-d`) _IP_
  - Switches
    - `-j TARGET` - most usable targets are `ACCEPT` or `DROP`
    - `-p PROTOCOL` - define the protocol, such as `tcp` or `udp`
      - `--dport NUM` - port number for `tcp` or `udp` (`-p` is required)

**Note:** Create an executable script in `/etc/network/if-pre-up.d`, and define your rules in cmd format in it 
to automate defining custom rules on system's restart.

REFS
  - [How To List and Delete Iptables Firewall Rules](https://www.digitalocean.com/community/tutorials/how-to-list-and-delete-iptables-firewall-rules)
  - [How do you edit a rule in iptables?](https://stackoverflow.com/questions/33465937/how-do-you-edit-a-rule-in-iptables)

### Samba

#### Client
- `apt install smbclient gvfs-backends`
  - `smbclient` - connect to SMB share via shell
  - `gvfs-backends` - using `smb://` in Thunar
- `smbclient`
  - `smbclient -L SERVER -U USERNAME -W WORKGROUP` - list shares on `SERVER`
  - `smbclient '\\SERVER\SHARENAME' -U USERNAME -W WORKGROUP` - interactive shell by connecting to `SHARENAME` on `SERVER`
    - **Note:** pay attention using single quote character around service   

## Storage

### Common
- `lsblk -f`
- `fdisk -l` or `parted -l`
- **Note**: Rescan the SCSI bus to find SCSI device(s) without rebooting the VM [[REF](https://www.cyberciti.biz/tips/vmware-add-a-new-hard-disk-without-rebooting-guest.html)]
  - `find /sys/class/scsi_host/ -name "host*" -exec sh -c "echo '- - -' > {}/scan" \;`
- Create a partition over a block device
  - `parted /dev/sdb --script -- mklabel msdos`
  - `parted -a optimal /dev/sdb --script -- mkpart primary 0% 100%` - param `-a` is important

### LVM
- Components ([Ref](https://wiki.debian.org/LVM))![LVM](/assets/images/linux/lvm.png)

- **LV - Logical Volumes**
  - `lvs` - display information about logical volumes
```
LV      VG        Attr       LSize  Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
lv-root debian-vg -wi-ao---- <7.45g                                                    
lv-swap debian-vg -wi-ao----  4.00g                                                    
lv-var  debian-vg -wi-ao---- 18.30g
```
  - `lvextend -r -l [+]Number[%]FREE LV` - **_SECOND_: `lvextend -r -l +100%FREE /dev/debian-vg/lv-var`**

- **VG - Volume Groups**
  - `vgs` - display information about volume groups
```
VG        #PV #LV #SN Attr   VSize   VFree
debian-vg   1   3   0 wz--n- <29.76g    0
```
  - `vgextend VG DISK` - **_FIRST_: `vgextend debian-vg /dev/sdb`**

- **PV - Physical Volumes**
  - `pvs` - display information about physical volumes
```
PV         VG        Fmt  Attr PSize   PFree
/dev/sda5  debian-vg lvm2 a--  <29.76g    0
```

**Note:** [[Script](https://www.devocative.org/notes/shell-script#lvm-partition-smart-expand)] proposes a smart code to extend logical volume.  

### NFS
**On Server**
- `apt install nfs-kernel-server`
- Edit `/etc/exports`
```
DIR     192.168.1.0/24(rw,sync,no_root_squash,no_subtree_check)
DIR     172.16.15.124(ro)
```
- **Note:** In case of VMware Workstation VM's NAT, use `insecure`
```
DIR     HOST_IP(rw,sync,no_root_squash,no_subtree_check,insecure)
```

**On Client**
- `apt install nfs-common`
- `showmount -e SERVER`
- `mount -t nfs SERVER:DIR LOCAL_DIR`

### iSCSI
Target (server), Initiator(client) [[REF](https://www.tecmint.com/setup-iscsi-target-and-initiator-on-debian-9/)]

#### Installation
**-- Target --**
- Create a VG & LV
  - `vgcreate vg_iscsi BLOCK_DEV`
  - `lvcreate -l 100%FREE -n lv_iscsi vg_iscsi`
- `apt-get install tgt -y`
- Create a config file in `/etc/tgt/conf.d` (`man 5 targets.conf`)

```shell
cat > /etc/tgt/conf.d/iscsi01.conf << 'EOF'
<target iqn.YYYY-MM.SERVER:LUN>
  backing-store /dev/mapper/vg_iscsi-lv_iscsi
  #initiator-address IP
  incominguser TARGET_USER TARGET_PASSWORD
  outgoinguser INITIATOR_USER INITIATOR_PASSWORD
</target>
EOF
```
- `systemctl restart tgt`
- `tgtadm --mode target --op show` - verify the LUN

**-- Initiator --**
- `apt-get install open-iscsi -y`
- `iscsiadm -m discovery -t st -p TARGET_HOST`
- Update LUN config in the path with pattern `/etc/iscsi/nodes/../default`
  - Add following line (note first line existed with `None` value)
```text
node.session.auth.authmethod = CHAP
node.session.auth.username = TARGET_USER
node.session.auth.password = TARGET_PASSWORD
node.session.auth.username_in = INITIATOR_USER
node.session.auth.password_in = INITIATOR_PASSWORD
```
- Update `node.startup = automatic`
- `systemctl restart open-iscsi`

#### Verification
- `tgtadm --mode conn --op show --tid 1` - TARGET
- `iscsiadm -m session` - INITIATOR

#### Expansion

**-- Target --**
- Update VG & LV
  - `vgextend vg_iscsi BLOCK_DEVICE`
  - `lvextend -l +100%FREE /dev/vg_iscsi/lv_iscsi`
- `systemctl restart tgt`

**-- Initiator --**
- `iscsiadm -m node --targetname LUN_FQDN -R`

## Cryptography

### OpenSSL

- [[REF](https://unix.stackexchange.com/questions/367220/how-to-export-ca-certificate-chain-from-pfx-in-pem-format-without-bag-attributes)] for `sed`
- [[REF](https://www.openssl.org/docs/manmaster/man1/openssl-pkcs12.html)] for `-legacy` option

```shell
# Generate private & certificate
openssl req -x509 -sha256 -days 365 -newkey rsa:2048 -nodes -keyout my-key.pem -out my-cert.pem

# Import private & certificate pem files to PFX file
openssl pkcs12 -export -out my.pfx -inkey my-key.pem -in my-cert.pem -passin pass:"mypass" -passout pass:"mypass" -name "myalias"

# Extract certificate from PFX file in PEM format
# note: '-legacy' is used via OpenSSL 3+
# note: the 'sed' removed the 'Bag Attributes' from beginning of file
openssl pkcs12 -legacy -in ${PFX_FILE} -clcerts -nokeys | sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > ${PFX_FILE}.pem
```

## Config Files
- `/etc/environment`
  - system-wide environment variable settings
  - not a script file
  - consists of assignment expressions, one per line
- `/etc/profile`
  - executed whenever a bash login shell is entered (e.g. when logging in from the console or over ssh), as well as by the DisplayManager when the desktop session loads.
- Bash Command Completion
  - `apt install bash-completion`
  - if not worked, edit `/etc/bash.bashrc` and uncomment the section related to bash-completion
  - Some commands generate its own bash completion script. Append `source <(CMD_TO_BASH_COMPLETION)` in your `$HOME/.bashrc`.
  - If you have the script, like `docker-compose`, put it in `/etc/bash_completion.d/`.
- `~/.vimrc` - VIM editor config for current user, set paste mode as default (prevent indentation on paste)
  ```
  set pastetoggle=<F3>
  set paste
  syntax on
  ```


## Debian
**-- ISO Image Addresses --**
- [Stable](https://cdimage.debian.org/debian-cd/current/amd64/iso-dvd/)
- [Testing/Weekly-Builds](https://cdimage.debian.org/cdimage/weekly-builds/amd64/iso-dvd/)
- [Testing/Weekly-Builds + Non-free](https://cdimage.debian.org/cdimage/unofficial/non-free/cd-including-firmware/weekly-builds/amd64/iso-dvd/)
- [Live](https://cdimage.debian.org/debian-cd/current-live/amd64/iso-hybrid/)

**-- APT Config --**
File - `/etc/apt/sources.list`
```
deb http://deb.debian.org/debian <RELEASE> main contrib non-free

deb http://deb.debian.org/debian <RELEASE>-updates main contrib non-free

deb http://deb.debian.org/debian-security <RELEASE>-security main contrib non-free
```
- For testing - `<RELEASE>:=testing`
- For stable  - `<RELEASE>:=stable|bullseye|buster`

### Hold Packages
- **hold** - `apt-mark hold code`
  - `apt-mark hold "^libreoffice"`
  - `apt-mark hold "^openjdk"`
- **unhold** - `apt-mark unhold code`
- **showhold** - `apt-mark showhold`

## Misc

### X
- `Alt + Mouse Scroll` in XFCE results in zoom in/out
- Create application menu in XFCE
```sh
cat > ~/.local/share/applications/APP.desktop << EOL
[Desktop Entry]
Encoding=UTF-8
Name=APP
Exec=APP_EXEC_FILE
Icon=APP_ICON
Terminal=false
Type=Application
Categories=CATEGORY;
EOL
```

### Multimedia
- `mp3splt` [[REF](https://manpages.debian.org/testing/mp3splt/mp3splt.1.en.html)]
  - `mp3splt -f -a -t MIN.SEC FILE` - Split by Time
  - `mp3splt -f -a -S NUMBERS FILE` - Split by Parts
- `yt-dlp (youtube-dl) URL`
  - `-F` - list all formats
  - `-f 22` - download best format (both audio and video)
  - `--skip-download` - no download, just for subtitle
  - `--list-subs`
  - `--write-auto-sub` - download auto-generated subtitle
  - `--write-sub` - download subtitle
  - `--sub-lang en` - english subtitle
  - `--convert-subs=srt` - convert subtitle format to `srt`

### VMWare
- VM Hardware Hot Add/Detection

  --------|--------|--------
  Storage | `find /sys/class/scsi_host/ -name "host*" -exec sh -c "echo '- - -' > {}/scan" \;` | [[REF](https://www.cyberciti.biz/tips/vmware-add-a-new-hard-disk-without-rebooting-guest.html)]
  RAM     | `grep line /sys/devices/system/memory/*/state |grep offline |awk -F '\/' '{print $6}' |while read xx; do echo online >/sys/devices/system/memory/$xx/state ; done` | [[REF](https://askubuntu.com/questions/764620/how-do-you-hotplug-enable-new-cpu-and-ram-in-a-virtual-machine)]
  CPU     | `grep 0 /sys/devices/system/cpu/cpu*/online | awk -F ':' '{print $1}' | while read xx; do echo 1 > $xx; done` | [[REF](https://askubuntu.com/questions/764620/how-do-you-hotplug-enable-new-cpu-and-ram-in-a-virtual-machine)]

- VM Tools
  - `apt install open-vm-tools` - Open VMware Tools for virtual machines hosted on VMware (CLI)
  - `apt install open-vm-tools-desktop` - Open VMware Tools for virtual machines hosted on VMware (GUI)
  - `systemctl enable open-vm-tools.service`
  - `systemctl start open-vm-tools.service`
  - Update `/etc/vmware-tools/tools.conf`
    ```text
    [guestinfo]
    primary-nics=ens*
    ```
- After Kernel update, Workstation crashes due to some module problem => ([Solution](https://github.com/mkubecek/vmware-host-modules/)) ([Releases](https://github.com/mkubecek/vmware-host-modules/releases))
  The following script automates the patching:
  ```sh
  #!/bin/bash
  
  #This needs to be the actual name of the appropriate branch in mkubecek's GitHub repo for your purposes
  VMWARE_VERSION=workstation-???
  
  TMP_FOLDER=/tmp/patch-vmware
  rm -fdr $TMP_FOLDER
  mkdir -p $TMP_FOLDER
  cd $TMP_FOLDER
  
  git clone https://github.com/mkubecek/vmware-host-modules.git
  # Use `git branch -a` to find all available branches and find the one that's appropriate for you
  
  cd $TMP_FOLDER/vmware-host-modules
  git checkout $VMWARE_VERSION
  git fetch
  make
  make install
  rm /usr/lib/vmware/lib/libz.so.1/libz.so.1
  ln -s /lib/x86_64-linux-gnu/libz.so.1 /usr/lib/vmware/lib/libz.so.1/libz.so.1
  systemctl restart vmware 
  ```

### Utility Apps

| Function          | App                                                                                       |
|-------------------|-------------------------------------------------------------------------------------------|
| Media Converter   | `HandBrake` `WinFF`(using `ffmpeg` library)                                               |
| Screen Snapshot   | **`Flameshot`**                                                                           |
| Screen Recorder   | **`obs-studio`** **`asciinema`**[[player](https://github.com/asciinema/asciinema-player)] |
| Screen Annotate   | `gromit-mpx`                                                                              |
| Code Editor       | **`Intellij Idea`** `VSCode` `Atom` `Sublime Text`                                        |
| Kubernetes Editor | [**`k8slens.dev`**](https://k8slens.dev/)                                                 |
| Diff/Merge Files  | **`meld`** `vimdiff`                                                                      |
| Note/Wiki Editor  | `Zim`                                                                                     |
| PDF               | `Foxit Reader` `unoconv`(doc converter)                                                   |
| Photo Editor      | **`Krita`**, `Inkscape`, `RawTherapee`                                                    |
| Diagram Editor    | [`draw.io`](https://www.draw.io/)                                                         |
| Download Manager  | [**`XDM`**](https://github.com/subhra74/xdm)                                              |
| Remoting Client   | `remmina`                                                                                 |
| Shell Monitoring  | System: `htop` <br/> Network: `iptraf` `tcptrack`                                         |
| Shell Utility     | **`tmux`** `multitail`                                                                    |

