---
layout: slide
caption: Java Interview Questions
description: Java Interview Questions
theme: blood
extra: highlight
---

<section data-markdown data-separator="===" data-separator-vertical="^---$">
  <textarea data-template>

## Java Interview Questions

===
### Variables

#### `var`
- `var` is only used for local variable type inference
- `var` is not a reserved word and allowed to be used as an identifier
  - It is a `reserved type` name which means it cannot be used to define a type, such as a `class`, `interface`, or `enum`

---
#### Example 1

```java
int i1, i2 = 1;

//var a=1,b=3; ERR:'var' is not allowed in compound declaration

var arr = new ArrayList<>();
arr.add("A");
arr.add(1.1);

var st = new HashSet<String>();
//st.add(1); ERR: incompatible types

final var name = "John";
var num = 1/0;

//var text = null; ERR: can't infer type
```

---
#### Example 2
- Following code compiles successfully!

```java
package var;

public class Var {
    public void var() {
        var var = "var";
    }

	public void Var() {
        Var var = new Var();
    }
}
```
===
### Numbers

#### Literals Format (1/2)
- Octal - starts with `0`: `017`, `0654`
- Hexadecimal - starts with `0x` or `0X`: `0xaaaaaa`, `0Xdff`
- Binary - starts with `0b` or `0B`: `0b10`, `0b11`
- Literals and the Underscore Character
  - valid: `1_000_000`, `1_______2` (12), `1__1.1__1` (11.11), `.1_1`
  - invalid: `_1000`, `1_`, `1_000._`, `0._1`
    - At beginning, at end, just before or after decimal point

---
#### Literals Format (2/2)
- Long - ends with `l` or `L` (default is `int`)
- Float - ends with `f` or `F` (default is `double`)

---
#### Numeric Promotion Rules
1. Two values have different data types => promote one of the values to the larger of the two data types.
2. One is integral and the other is floating-point => promote the integral value to the floating-point value’s data type.
3. Data types `byte`, `short`, and `char` => first promoted to `int` in **binary** arithmetic operations.
4. After all promotion, the resulting value will have the same data type as its promoted operands.

---
#### Numeric Promotion Rules - Samples

```java
byte a = 2 + 100;
short b = 100 * 10;
byte c = 2 * 200;  // COMPILE ERROR - int result

long l = 10;
a += b + l;
a = a + b;  // COMPILE ERROR (int promotion)

short s = a + b;  // COMPILE ERROR (int promotion)
int i = a + b;
int j = a + b + 1l;  // COMPILE ERROR (long promotion)
 
float d = a + 1.0;  // COMPILE ERROR (double promotion)
float f = a + 1.0f;

byte a1 = ++a;
```

---
#### Integer Cache

```java
Integer num1 = 128, num2 = 128;
System.out.println(num1 == num2); // false

Integer num3 = 127, num4 = 127;
System.out.println(num3 == num4); // true

Integer num5 = -128, num6 = -128;
System.out.println(num5 == num6); // true

Integer num7 = -129, num8 = -129;
System.out.println(num7 == num8); // false
```

---
#### Double

```java
final Double d = 1.0 / 0.0;
System.out.println("1.0/0.0 = " + d + " - " + d.isInfinite());
// 1.0/0.0 = Infinity - true

System.out.println(Math.min(Double.MIN_VALUE, 0.0d));
// 0.0
System.out.println("Double.MIN_VALUE = " + Double.MIN_VALUE);
// Double.MIN_VALUE = 4.9E-324

System.out.println("Integer.MIN_VALUE = " + Integer.MIN_VALUE);
// Integer.MIN_VALUE = -2147483648
```

===
### Operators

#### Precedence

![OperatorPrecedence](/assets/images/slides/jiq/operators-precedence.png)

---
#### Misc

```java
boolean healthy = false;
if(healthy = true)   // ASSIGNMENT!
  System.out.print("Good!");

System.out.print(null == null); // true
System.out.print(null instanceof null); // COMPILE ERROR

int stripes = 7;
System.out.print((stripes > 5) ? 21 : "Zebra");
int animal = (stripes < 9) ? 3 : "Horse"; // COMPILE ERROR

int sheep = 1, zzz = 1;
int s1 = zzz < 10 ? sheep++ : zzz++;    // sheep=2,zzz=1
int s2 = sheep >= 10 ? sheep++ : zzz++; // sheep=2,zzz=2
```

===
### String

#### String Pool

- Using the `new` operator for `String`, ensures that it is created in the heap (not into the string pool). 
- Using literal `String` ensures that the string is created in the string pool. 
  - String pool exists as part of the perm area in the heap.

---
#### Text Block

- A line break after the opening `"""` is required
- `\` at the end prevent new line (like shell script)
- Imagine a vertical line on the leftmost non-whitespace character
  - The left is `incidental whitespace` 
  - The right is `essential whitespace`

![text-block](/assets/images/slides/jiq/java-text-block.png)

===
### Class

#### Order of Initialization

- Fields and instance initializer blocks are run in the order in which they appear in the file.
- The constructor runs after all fields and instance initializer blocks have run.

---
#### Example 1

```java
public class Test {
  private String f1 = "a";
  private String f2;
  private String f3;

  public Test() {
    f3 = "c";
    System.out.printf("C: f1=%s, f2=%s, f3=%s\n", f1, f2, f3);
  }

  { // `Instance Initializer` Block
    f2 = "b";
    System.out.printf("I: f1=%s, f2=%s, f3=%s\n", f1, f2, f3);
  }

  public static void main(String[] args) {
    Test t = new Test();
    // OUTPUT
    // I: f1=a, f2=b, f3=null
    // C: f1=a, f2=b, f3=c
  }
}
```

---
#### Example 2

```java
public class Test {
  private final String f1 = "a";
  private final String f2;
  private final String f3;

  public Test() {
    f3 = "c";
    System.out.printf("C: f1=%s, f2=%s, f3=%s\n", f1, f2, f3);
  }

  {
    f2 = "b";
    System.out.printf("I: f1=%s, f2=%s\n", f1, f2);
    // System.out.printf("I: f1=%s, f2=%s, f3=%s\n", f1, f2, f3);
    // COMPILE ERROR for f3: not initialized
  }

  public static void main(String[] args) {
    Test t = new Test();
    // OUTPUT
    // I: f1=a, f2=b
    // C: f1=a, f2=b, f3=c
  }
}
```

===
### Package
- If you explicitly import a class name, it takes precedence over any wildcards present

```java
import java.util.*;
import java.sql.*;

Date dt = ...; 
// COMPILE ERROR - `java.util.Date` or `java.sql.Date`
```

```java
import java.util.*;
import java.sql.Date;

Date dt = ...;  
// It is `java.sql.Date`

java.util.Date dt2 = ...;
// explicit fqdn for defining `java.util.Date`  
```

===
### References
- Oracle Certified Professional Java SE 17 Developer Study Guide Exam 1Z0-829, Scott Selikoff, Jeanne Boyarsky
- [Java Interview Questions for 5 years Experience](https://www.interviewbit.com/java-interview-questions-for-5-years-experience/)


  </textarea>
</section>