---
layout: post
title: "Driving Scala - 01"
categories: article scala
excerpt: A Summary for Scala Language, Part 01
---

## ToC
- [Installation](#installation)
- [Basics](#basics)
- [Control Structures](#control-structures)
- [Function & Procedures](#function-&-procedure)
- [Arrays](#arrays)
- [Collections](#collections)


## Installation
1. Section `Other ways to install Scala`, download for Linux ([link](https://www.scala-lang.org/download/))
2. Define `SCALA_HOME` based on [link](https://www.scala-lang.org/download/install.html)
3. Add `$SCALA_HOME/bin` to `$PATH`

Now, create file `HelloWorld.scala`:
```scala
object HelloWorld {
  def main(args: Array[String]): Unit = {
    val language = "Scala"
    println(s"Hello World, My Lang is ${language}")
  }
}
```

To Compile & Run:
```sh
scalac HelloWorld.scala
scala -cp . HelloWorld
java -cp .:$SCALA_HOME/lib/* HelloWorld
```
- Line 2, use `scala` command to execute the class
- Since `scalac` generates bytecode, line 3 executes class by `java` command with extra classpath 

The `HelloWorld` class can be rewritten as
```scala
object HelloWorld extends App {
  val language = "Scala"
  println(s"Hello World, My Lang is $language")
}
```

## Basics
- No semicolon to terminate lines, unless multiple expressions on the same line
- In spite of Java, Scala file names do not need to be the same as class names
- Operator precedence is just as you’d expect in Java
- The `Unit` in Scala is like Java's `void`, however `Unit` has a single value which is `()`
- Avoid using `return` in a function
- Scala has no checked exceptions
- Scala has no equivalent of try-with-resource in Java

- Using `object` keyword to create Singleton objects in Scala
- Adding methods to these objects is like static methods in Java, and they are accessible by object name
- So no `static` in Scala!

Define Constant:
>`val` ID[:TYPE] = VALUE

Define Variable:
> `var` ID[:TYPE] = VALUE

```scala
// Sets xmax and ymax to 100
val xmax, ymax = 100

// assign two different constants with a tuple in a single line
val (sum, count) = (1.0, 1)

// greeting and message are both strings, initialized with null
var greeting, message: String = null
```
**Note**: In Scala, use `val` unless you really need to change the contents! (Scala loves immutability)

- Support Java classes:

```scala
import java.util.{Date, Locale}
import java.text.DateFormat._

object FrenchDate {
  def main(args: Array[String]) {
    val now = new Date
    val df = getDateInstance(LONG, Locale.FRANCE)
    println(df format now)
  }
}
```

**TODO: look `lazy` val**

## Control Structures
- In Java these two has differences:
  - _expression_, such as `3 + 4`, has a value
  - _statement_, such as `if(...) ...`, carries out an action
- In Scala, almost all constructs have values
  - An `if` expression has a value
  - A block has a value - the value of its last expression
- Scala dose not have `?:` operator! Use `if else` instead

```scala
val x: Double = Math.random()

val b: Boolean = if (x > .5) true else false
val a: Any = if (x > .5) true else "Oops!"
val u: Any = if (x > .5) true // or if (x > .5) true else ()
val distance = {val dx = x-x0; val dy = y-y0; sqrt(dx * dx + dy * dy)}

val q: Double = if (x >= 0) Math.sqrt(x) else 
  throw new IllegalArgumentException("No Negative")
```
- Line 3, has a definite `Boolean` return type
- Line 4, each branch has a different type, so the variable is of type `Any` (it is the common supertype), however the returning object is `Boolean` or `String`
- Line 5, like line 4, but the returning object is `Boolean` or `Unit`. `Unit` type has one value which is `()`
- Line 6, the value of `sqrt()` is assigned to `distance` (a good practice to initialize a `val`)
- Line 8, the type of `if` is `Double` and the type of `else` is **`Nothing`** which is ignored!

### Loops
- `while` is the same as Java

```scala
var (r, n) = (1.0, 10) // multiple variables by tuple, r:Double, n:Int
while (n > 0) {
  r = r * n
  n -= 1
}
println(s"r = $r")
```
- Scala has no loop of `for (initialize; test; update)` as Java. Instead the syntax of for is

```scala
for (i <- 1 to 10) {
  val x: Double = Math.random()
  val u: Any = if (x > .5) true
  println(f"i = $i%02d, u = $u")
}
```

```scala
val s = "Hello"
var sum = 0
for (i <- 0 until s.length) // or for (i <- 0 to s.length - 1) 
  sum += s(i)
```
or
```scala
var sum = 0
for (ch <- "Hello") sum += ch
```

#### Advanced `for`

```scala
// multiple generators:  variable <- expression
for (i <- 1 to 3; j <- 1 to 3) print(f"${10 * i + j}%3d") // 11 12 13 21 22 23 31 32 33

// second generator with a 'guard' starting with an 'if'
for (i <- 1 to 3; j <- 1 to 3 if i != j) print(f"${10 * i + j}%3d") // 12 13 21 23 31 32

// using one or more definitions, the 'from' var
for (i <- 1 to 3; from = 4 - i; j <- from to 3) print(f"${10 * i + j}%3d") // 13 22 23 31 32 33
//or
for {i <- 1 to 3
     from = 4 - i
     j <- from to 3}
  print(f"${10 * i + j}%3d")
```

> **for comprehension** , a `for` loop with `yield` 


```scala
val v = for (i <- 1 to 10) yield i % 3 // v is Vector(1, 2, 0, 1, 2, 0, 1, 2, 0, 1)
v.foreach(println)

val str: String = for (c <- "Hello"; i <- 0 to 1) yield (c + i).toChar // HIeflmlmop
val vc = for (i <- 0 to 1; c <- "Hello") yield (c + i).toChar // Vector(H, e, l, l, o, I, f, m, m, p)
```
**Note**: Lines 4 & 5 look similar, but the results are different. So the generated collection is compatible with the first generator.

## Function & Procedure
- Scala functions are like static methods in Java (C++ also has functions)
- As long as the function is not recursive, no need to specify the return type

```scala
def abs(x: Double) = if (x >= 0) x else -x

def fac(n : Int) = {
  var r = 1
  for (i <- 1 to n) r = r * i
  r // no need to use return keyword
}

// recursive factorial must declare Int as return
def fac(n: Int): Int = if (n <= 0) 1 else n * fac(n - 1)
```

- Possible to define default value for parameters! To set a specific parameter, use named arguments!

```scala
def decorate(str: String, left: String = "[", right: String = "]") = left + str + right

println(decorate("Hello")) // [Hello]
println(decorate("Hello", "(")) // (Hello]
println(decorate("Hello", right = ")")) // [Hello)
```

- A procedure is just a named block with 0-to-many parameter(s), but without any return vale. So in its syntax no `=`.

```scala
def box(s : String) {
  val border = "-" * (s.length + 2)
  print(f"$border%n|$s|%n$border%n")
}
```
- Scala has another way for varargs in Java
  - The type of `args` is `Seq`
  - Like Java, these type of parameters must be defined as last ones
  - **Note**: Not possible to set default value for other parameters when such parameter is declared

```scala
def sum(args: Int*) = {
  var result = 0
  for (arg <- args) result += arg
  result
}

// to call:
println(sum(1, 3, 66))   // ok
println(sum(1 to 5))     // error
println(sum(1 to 5: _*)) // consider 1 to 5 as an argument sequence
```

## Arrays

## Collections
Use `List()`, `Set()`, and `Map()`
```scala
val list = List(1, 2, 3)
list.foreach(value => println(value))
list.foreach(println)

val map = Map((1, "A"), (20, "b"), 300 -> "C")
map.foreach((entry: (Int, String)) => 
  println(f"K=${entry._1}%03d, V=${entry._2}")) // formatted string
map.foreach(println)
```
- Line 6,
  - the `entry` is a _tuple_ of `(Int, String)`
  - the `f` makes the string formatted and acts like `printf` in Java. The `%03d` pads the `${entry._1}` with max two leading zeros