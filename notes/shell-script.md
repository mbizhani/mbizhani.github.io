---
layout: page
title: Shell Script
toc: true
---

## Conditional Expression

**Note:** `EXPR && echo true` - on returning`true` expression is true, otherwise false.

### String

`[ "$VAR" ]` | String not empty
`[ -z "$VAR" ]` or `[ ! "$VAR" ]` | String is empty
`[ "$VAR1" = "$VAR2" ]` | Equal string - case sensitive
`[ "${VAR1,,}" = "${VAR2,,}" ]` | Equal string - case insensitive
`[ "$VAR1" != "$VAR2" ]` | Not equal string
`[[ "$VAR" =~ "REGEX" ]]` | String matches `REGEX`

### File

`[ -e "$VAR" ]` | File/directory exists
`[ -d "$VAR" ]` | Directory exists
`[ -f "$VAR" ]` | Regular file exists
`[ -s "$VAR" ]` | Regular file exists and not empty
`[ -r "$VAR" ]` | Regular file exists with read permission
`[ -w "$VAR" ]` | Regular file exists with write permission
`[ -x "$VAR" ]` | Regular file exists with exec permission

## String Operation

### Conversion
- `${VAR,,}` - to lower case
- `${VAR^^}` - to upper case

### Split by Delimiter
1. Set `IFS` variable to delimiter
2. `read -ra ARRAY <<< STRING`
  - `-r` - Backslash does not act as an escape character
  - `-a ARRAY` - The words, separated by `IFS`, are assigned to the sequential index of array `ARRAY` beginning at zero.
3. Access 
  - By Index - `${ARRAY[0]}`, and so on
  - Iteration - `for i in "${ARRAY[@]}"; do ...`

```shell
if [[ "${SCHEMA}" =~ "|" ]]; then
    IFS="|"
    read -ra PARTS <<< "${SCHEMA}"
    SCHEMA_PARAM="schemas=${PARTS[0]} remap_schema=${PARTS[1]}"
else
    SCHEMA_PARAM="schemas=${SCHEMA}"
    if [[ "${SCHEMA}" =~ ":" ]]; then
        SCHEMA_PARAM="remap_schema=${SCHEMA}"
    fi
fi
```

## Function
- Good [Ref](https://linuxize.com/post/bash-functions/)

```sh
# check required param
function rq() {
    VAR="$1"
    MSG="$2"
    
    if [ -z "$VAR" ]; then
        echo "ERROR: ${MSG}"
        exit 1
    fi
}

function func1() {
    rq "$1" "func1 *[PARAM1] *PARAM2 PARAM3"
    rq "$2" "func1 *PARAM1 *[PARAM2] PARAM3"
    
    PARAM1="$1"
    PARAM2="$2"
    PARAM3="$3"
    
    # ...
}

func1 "V1" "V2" 

#
# function with return value
#
function add() {
    rq "$1" "add *[PARAM1] *PARAM2"
    rq "$2" "add *PARAM1 *[PARAM2]"

    PARAM1="$1"
    PARAM2="$2"

    echo $(($PARAM1 + $PARAM2))
}

RESULT=$(add "3" "6")
```

## Samples

### Command with Proxy
A simple script to set `http_proxy` env variable in current shell and then executes passed parameters as commands.

**Note:** replace `HOST` and `PORT` with your configuration.

```sh
#! /bin/bash

export http_proxy="http://HOST:PORT"

eval "$@"
```

### Dynamic Music Player
- In XFCE keyboard layout, for example set `ctrl + alt + p` to call following script with `pop` (play or pause) parameter. 
- The player can be `parole` or `smplayer` or anything you want. 
- Based on priority and running processes, the script decides to send action to selected player.

<div>
<script src="/assets/embed.js?target=https://github.com/mbizhani/Dockage/blob/master/Script/mplayer.sh"></script>
</div>

### Upload to a Docker Registry

<div>
<script src="/assets/embed.js?target=https://github.com/mbizhani/Dockage/blob/master/Script/upload-to-registry.sh"></script>
</div>
