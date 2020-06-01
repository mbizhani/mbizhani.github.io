---
layout: page
title: Linux
toc: true
---

## General
- `watch` - execute a program periodically, showing output fullscreen
  - `watch [-d] [-n] [-t] command`
    - `-d` : Highlight the differences between successive updates
	- `-n` : Specify update interval in seconds
	- `-t` : Turn off the header showing the interval, command, and current time at the top of the display
  - Multiple commands - `watch "CMD1; echo '\n'; CMD2; ..."`

------------------------------------|---
`echo $(date +'%Y-%m-%d_%H-%M-%S')` | Formatted Date 
`seq -f "MSG_ID: %03g" 20`          | String Generator
`w`                                 | Shows brief info of system and current logged in users
`dpkg -S ABSOLUTE_FILE_NAME`        | Search for a filename from installed packages. (note: can't work on symlinks)
`systemctl show SERVICE`            | Show properties of one or more units, jobs, or the manager itself.
`dmidecode --type 17 | less`        | RAM Modules Information 
`hdparm -I /dev/sda | less`         | HDD Information 

### find cmd
  - By default, it searches in subdirectories recursively, unless `-maxdepth` option is set.

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

`find . -iname "*.rar" -printf "%f\n" | awk -F ".part" '{print $1}' | sort | uniq` | list rar-parted files
`docker ps -a -f "status=exited" | awk '$3 ~ /runner/ {print "docker rm "$1}' | bash` | remove GitLab Runner exited containers
`docker images -q -f "dangling=true" | awk '{print "docker rmi -f "$1}' | bash` | remove dangling Docker images

### User

#### CRUD

`adduser USERNAME` | add new user
`usermod -a -G GRP1[,GRP2,...] USERNAME` | append groups to user's groups
`usermod -g GRP USERNAME` | change user’s primary group

#### Audit

- [Ref](https://www.thegeekdiary.com/5-useful-command-examples-to-monitor-user-activity-under-linux/)

`who -aH` | Users currently logged in to the system
`last -a` or `lastb -a` | Listing of last logged in users (`lastb` shows bad login attempts) <br/> file = `/var/log/wtmp`
`laslog` | Most recent login of all users <br/> file = `/var/log/lastlog`

## Config Files
- `/etc/environment`
  - system-wide environment variable settings
  - not a script file
  - consists of assignment expressions, one per line
- `/etc/profile`
  - executed whenever a bash login shell is entered (e.g. when logging in from the console or over ssh), as well as by the DisplayManager when the desktop session loads.
- `/etc/network/interfaces` (in Debian)
```
iface eth0 inet static
    address <IP>/24
    gateway <IP>
    dns-nameservers 8.8.8.8 8.8.4.4
```
- Bash Command Completion
  - `apt install bash-completion`
  - if not worked, edit `/etc/bash.bashrc` and uncomment the section related to bash-completion

## Network
- `hostnamectl --static set-hostname <HOSTNAME>`
- `export http_proxy=http://[USERNAME:PASSWORD@]PROXY_SERVER[:PORT]` ([Ref](https://www.cyberciti.biz/faq/linux-unix-set-proxy-environment-variable/))
  - connect text based session and/or applications via the proxy server
  - apps like `apt`, `lynx`, `wget`, ...

### ip cmd

`ip` vs other net tools [link1](https://p5r.uk/blog/2010/ifconfig-ip-comparison.html) and [cyberciti](https://www.cyberciti.biz/faq/linux-ip-command-examples-usage-syntax)

| Function                                 | New                   | Old                             |
|:-----------------------------------------|:----------------------|:--------------------------------|
| Show IP address                          | `ip a` `ip addr`      | `ifconfig`                      |
| Show routing table                       | `ip r` or `ip route`  | `route`                         |
| Show routed eth device for a specific IP | `ip r get IP`         |                                 |
| Show neighbour (ARP)                     | `ip n` or `ip neigh`  | `arp -a`                        |
| Show socket statics/info                 | `ss -lntp` `ss -antp` | `netstat -lntp` `netstat -antp` |

## LVM
- **Note**: Rescan the SCSI bus to add a SCSI device without rebooting the VM ([Ref](https://www.cyberciti.biz/tips/vmware-add-a-new-hard-disk-without-rebooting-guest.html))
  - `find /sys/class/scsi_host/ -name "host*" -exec sh -c "echo '- - -' > {}/scan" \;`
  - `fdisk -l` and find the newly added device

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

## Misc
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
- `Alt + Mouse Scroll` in XFCE results in zoom in/out

### Debian Images
- [Stable](https://cdimage.debian.org/debian-cd/current/amd64/iso-dvd/)
- [Testing/Weekly-Builds](https://cdimage.debian.org/cdimage/weekly-builds/amd64/iso-dvd/)
- [Testing/Weekly-Builds + Non-free](https://cdimage.debian.org/cdimage/unofficial/non-free/cd-including-firmware/weekly-builds/amd64/iso-dvd/)
- [Live](https://cdimage.debian.org/debian-cd/current-live/amd64/iso-hybrid/)

### VMWare
  - `apt install open-vm-tools` - Open VMware Tools for virtual machines hosted on VMware (CLI)
  - `apt install open-vm-tools-desktop` - Open VMware Tools for virtual machines hosted on VMware (GUI)
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

Function         | App                                                                
-----------------|---
Media Converter  | `HandBrake` `WinFF`(using `ffmpeg` library)
Screen Snapshot  | `Flameshot`
Screen Recorder  | `obs-studio` `kazam` `vokoscreen` - ([Ref](https://itsfoss.com/best-linux-screen-recorders/))
Screen Annotate  | `gromit-mpx`
Code Editor      | `Intellij Idea` `VSCode` `Atom` `Sublime Text`
Diff/Merge Files | `meld`
Note/Wiki Editor | `Zim`
PDF              | `Foxit Reader` `unoconv`(doc converter)
Photo Editor     | SIMPLE: <u><code>PhotoFlare</code></u> ADVANCED: <u><code>Gimp</code></u>, `Inkscape`, `RawTherapee`, `Krita`
Diagram Editor   | `drow.io` [[Desktop](https://github.com/jgraph/drawio-desktop/releases)] [[Web](https://www.draw.io/)]
Download Manager | `XDM`
Remoting Client  | `remmina`
Shell Monitoring | System: `htop` <br/> Network: `iptraf`, `tcptrack`
Shell Utility    | `multitail`

