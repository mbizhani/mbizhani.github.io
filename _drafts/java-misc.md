---
layout: post
title: "Java Misc"
categories: article tech
excerpt: API Tips for Java
---

## File

### `Files` + `Path`
- `Files.readAllBytes(path)`
- `Files.copy(in, path, StandardCopyOption.REPLACE_EXISTING)`
- `List<String> lines = Files.readAllLines(path, charset)`
- `try(Stream<String> lines = Files.lines(path)) { ... } `
- `PrintWriter out = new PrintWriter(Files.newBufferedWriter(path, charset))`
- `Files.write()`
- `Files.walk()`

### `Path`
- `path.resolve(path2)`, returns path2 based on path
- `path.relativise(path2)`, returns path2 address relative to path
- `path.normalize()`, remove `./`, `/../` and other redundancies
- `for (Path p : path) { ... }`, iterate over components


## RegEx
- `(...)` group with index
- `(?<grpname>...)` group with name `grpname` (no space!)
  > `(?<H>[0-2]\d):(?<M>[0-5]\d):(?<S>[0-5]\d)`, H=hour, M=minute, S=second
  >
  > `String alert = "12:23".replaceAll("(?<H>[0-2]\\d):(?<M>[0-5]\\d)", "it happened at hour=${H} & minute=${M}");`


## Concurrency
- **Visibility Problem**: a variable is cached in CPU's cache and its change is not _visible_ to other thread(s) running by other cores
  - Results in _instruction reordering_!
  - Solutions
    - Use `volatile` modifier ([Jenkov](http://tutorials.jenkov.com/java-concurrency/volatile.html))
    - Use `Atomic*` type for primitive types (they have `volatile` variables inside!)
    - Variables in `synchronized` blocks or methods 
- **Race Condition**: updating shared variable by concurrent threads. Solutions
  - _Confinement_: Don't share
  - _Immutability_: Immutable data structures
  - _Locking_: Block other tasks to alter shared variables
 