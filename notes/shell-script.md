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
`[ "$VAR1" = "$VAR2" ]` | Equal string - case-sensitive
`[ "${VAR1,,}" = "${VAR2,,}" ]` | Equal string - case-insensitive
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

### Shell Parameter Expansion
- [[REF](https://www.gnu.org/software/bash/manual/html_node/Shell-Parameter-Expansion.html)]

`${VAR:-DEFAULT}` | If `VAR` is unset or null, `DEFAULT` is returned
`${VAR:=DEFAULT}` | If `VAR` is unset or null, `DEFAULT` is returned and set to `VAR` itself
`${VAR:IDX[:LEN]}` | `VAR.substr(IDX [,LEN])`
`${VAR,,}` | `VAR.toLowercase`      
`${VAR^^}` | `VAR.toUppercase`      
`${VAR/PAT/STR}` | `VAR.replaceFirst(PAT, STR)`
`${VAR//PAT/STR}` | `VAR.replaceAll(PAT, STR)`
`${!VAR}` | consider it as `${${VAR}}`

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


## Loop

### `for`
```sh
## Iterate over CMD output using $() 
for i in $(seq 1 1 10); do
  echo "i = $i"
done

## Iterate on words: 'Hi!', 'Visit', 'https://devocative.org', and '!'
STR="Hi! Visit https://devocative.org !"
for w in ${STR}; do
  echo "w = $w"
done

## Iterate over lines
LINES=$(cat << 'EOF'   # EOF must be enclosed in single quote
export LS_OPTIONS='--color=auto'
eval "`dircolors`"
alias ll='ls $LS_OPTIONS -l'
EOF
) # closed parenthesis must be in the next line

IFS=$'\n'
for l in ${LINES}; do
  echo "LINE = $l"
done

## Iterate over files
for f in /usr/lib*; do
  echo "f = $f"
done

## Iterate over input parameters
for var in "${@}"; do
  EXP="${var//[\/:]/_}.tar"
  echo "Exporting: ${var} to ${EXP}"
  docker save ${var} -o ${EXP}
done
```


## Function
- Good [[Ref](https://linuxize.com/post/bash-functions/)]
- **Note**: `function` keyword not valid for POSIX sh. For `bash` is also optional. 

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

    echo $((PARAM1 + PARAM2))  # No need to use $ for variables inside '(())'! 
}

echo "3 + 6 = $(add "3" "6")"
```

## Samples

### Inline Code Block in Background (*)
```sh
{
  for i in $(seq 1 1 5); do
    echo "block = $i"
    sleep 1
  done
} &

for i in $(seq 1 1 5); do
  echo "main = $i"
  sleep 2
done

##
## example from following REF! Note using 'wait' command!
{
    echo "sleeping for 5 seconds"
    sleep 5
    echo "woke up"
} &
echo "waiting"
wait
echo "proceed"
```
[[REF](https://stackoverflow.com/questions/4511704/shell-script-run-a-block-of-code-in-the-background-without-defining-a-new-funct)]

### Assert Env Var
- For `bash`
  ```bash
  E2=b

  ENV_VARS="
  E1
  E2
  E3
  "
  
  function assertEnvVars() {
      VARS="$1"
      for VAR in ${VARS}; do              # ITERATE OVER WORDS IN STRING
        echo "${VAR}"
        if [[ ! "${!VAR}" ]]; then        # USING ${!} STRING EXPANSION
          echo "Var Not Defined: ${VAR}"
        fi
      done
  }
  
  assertEnvVars "${ENV_VARS}"  # DOUBLE-QUOTE REQUIRED
  ```

- For POSIX `sh`
  ```sh
  E2=b
  
  ENV_VARS="
  E1
  E2
  E3
  "
  
  assertEnvVars() {                    # No 'function' Keyword!
    VARS="$1"
    for VAR in ${VARS}; do
      echo "${VAR}"
      eval VAR_VAL="\$${VAR}"          # USE 'eval' instead of '${!}'
      if [ ! "${VAR_VAL}" ]; then      # No '[[]]' Support!
        echo "Var Not Defined: ${VAR}"
      fi
    done
  }
  
  assertEnvVars "${ENV_VARS}"  # DOUBLE-QUOTE REQUIRED
  ```

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

### My `tmux`
Usage: `mytmux.sh CMD...`
- For a multi-word command, surround it with single or double quote
- Example: `mytmux.sh 'tail -f file1' 'tail -f file2'`
<div>
<script src="/assets/embed.js?target=https://github.com/mbizhani/Dockage/blob/master/Script/mytmux.sh"></script>
</div>

### Pars Parametric Text File
[[REF](https://stackoverflow.com/questions/415677/how-to-replace-placeholders-in-a-text-file)]
```sh
# Create a simple text file
#  > means create, >> means create/append
#  it should be double <<
#  EOF means parametric string, while 'EOF' means pure string
#  CR should be after first EOF and before second one
cat > myfile.txt << 'EOF'
Hello "${MSG}"!
'${MSG}' has "$(printf '${MSG}' | wc -m)" chars :-)
EOF

MSG="World"

printf "*** Using 'eval & cat':\n"
eval "cat <<EOF
$(<myfile.txt)
EOF" | cat

printf "\n*** Using 'eval & echo':\n"
eval "echo \"$(<myfile.txt)\"" | cat

printf "\n*** Using 'envsubst':\n"
export MSG
envsubst < myfile.txt | cat

rm -f myfile.txt
```
**Note:** `| cat` in all above is just for simulation of another action on the processed file, so it is rudimentary.

Output is
```text
*** Using 'eval & cat':
Hello "World"!
'World' has "6" chars :-)

*** Using 'eval & echo':
Hello World!
'World' has 6 chars :-)

*** Using 'envsubst':
Hello "World"!
'World' has "$(printf 'World' | wc -m)" chars :-)
```