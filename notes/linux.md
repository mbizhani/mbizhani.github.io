---
layout: page
title: Linux
toc: true
---

## Shell Commands

### General
- `hostnamectl --static set-hostname <HOSTNAME>`
- `watch` - execute a program periodically, showing output fullscreen
  - `watch [-d] [-n] [-t] command`
    - `-d` : Highlight the differences between successive updates
	- `-n` : Specify update interval in seconds
	- `-t` : Turn off the header showing the interval, command, and current time at the top of the display
  - Multiple commands - `watch "CMD1; echo '\n'; CMD2; ..."`
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
- `dmidecode --type 17 | less` - show information about RAM modules
- `hdparm -I /dev/sda | less` - show information about HDD

- **`find`**

| `find DIR -name "SEARCH"` | case sensitive SEARCH in DIR <br/> and subdirectories recursively |
| `find DIR -type d -iname "SEARCH"` | case insensitive SEARCH only folders in DIR<br/> and subdirectories recursively |
| `find DIR -type f -mtime +7 -exec rm -f {} \;` | delete files older than 7 days in DIR <br/> and subdirectories recursively |
| `find DIR -maxdepth 1 -type f -mtime +7 -exec rm -f {} \;` | delete files older than 7 days in DIR |
| `find DIR -maxdepth 1 -type d -exec du -sh {} \; | sort -nr` | list and sort size of DIR's subdirectories <br/> NOTE: `-type d` must comes after `-maxdepth 1` |

**Note**: Multi `exec` sample: ([Link](https://stackoverflow.com/questions/13184700/using-find-and-exec-to-create-directories-and-then-work-with-relative-path-to-th))
```sh
find /path/to/folders/* -type d \
    -exec mv {} {}.mbox \; \
    -exec mkdir {}.mbox/Messages \; \
    -exec sh -c "mv {}.mbox/*.emlx {}.mbox/Messages" \;
```

### Network

- **`ip`**

`ip` vs other net tools [link1](https://p5r.uk/blog/2010/ifconfig-ip-comparison.html) and [cyberciti](https://www.cyberciti.biz/faq/linux-ip-command-examples-usage-syntax)

| Function                                 | New                   | Old                             |
|:-----------------------------------------|:----------------------|:--------------------------------|
| Show IP address                          | `ip a` `ip addr`      | `ifconfig`                      |
| Show routing table                       | `ip r` `ip route`     | `route`                         |
| Show routed eth device for a specific IP | `ip route get IP`     |                                 |
| Show neighbour (ARP)                     | `ip n` `ip neigh`     | `arp -a`                        |
| Show socket statics/info                 | `ss -lntp` `ss -antp` | `netstat -lntp` `netstat -antp` |

### LVM
- Debian [Ref](https://wiki.debian.org/LVM)

- **Note**: Rescan the SCSI bus to add a SCSI device without rebooting the VM ([Ref](https://www.cyberciti.biz/tips/vmware-add-a-new-hard-disk-without-rebooting-guest.html))
  - `find /sys/class/scsi_host/ -name "host*" -exec sh -c "echo '- - -' > {}/scan" \;`
  - `fdisk -l` and find the newly added device

- Components![LVM](/assets/images/linux/lvm.png)

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

- VMWare Workstation
  - On Kernel update, it crashes due to some module problem => ([Solution](https://github.com/mkubecek/vmware-host-modules/)) ([Releases](https://github.com/mkubecek/vmware-host-modules/releases))
```
wget https://github.com/mkubecek/vmware-host-modules/archive/w15.5.0-k5.4.tar.gz
tar xvfz w15.5.0-k5.4.tar.gz
cd vmware-host-modules-w15.5.0-k5.4
make
make install
```

- Utility Apps

| Function         | App                                                                
|------------------|---|
| Media Converter  | `HandBrake` `WinFF`(using ffmpeg library)
| Screen Snapshot  | `Flameshot`
| Screen Recorder  | `obs-studio` `kazam` `vokoscreen` ([Ref](https://itsfoss.com/best-linux-screen-recorders/))
| Code Editor      | `Intellij Idea` `VSCode` `Atom` `Sublime Text`
| Note/Wiki Editor | `Zim`
| PDF Reader       | `Foxit Reader`
| Download Manager | `XDM 2018`
| Photo Editor     | SIMPLE: *`PhotoFlare`, ADVANCED: *`Gimp`, `Inkscape`, `RawTherapee`, `Krita`
| Processes Viewer | `htop`
| Shell Utilities  | `multitail`

