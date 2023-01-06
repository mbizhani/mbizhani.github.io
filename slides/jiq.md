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
### Numbers

#### Format
- Octal - starts with `0`: `017`, `0654`
- Hexadecimal - starts with `0x` or `0X`: `0xaaaaaa`, `0Xdff`
- Binary - starts with `0b` or `0B`: `0b10`, `0b11`
- Literals and the Underscore Character
  - valid: `1_000_000`, `1_______2` (12), `1__1.1__1` (11.11), `.1_1`
  - invalid: `_1000`, `1_`, `1_000._`, `0._1`
    - At beginning, at end, just before or after decimal point

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
  private final String f1 = "a";
  private final String f2;
  private final String f3;

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
// COMPILE ERROR - java.util.Date or java.sql.Date
```

```java
import java.util.*;
import java.sql.Date;

Date dt = ...;  
// It is java.sql.Date

java.util.Date dt2 = ...;
// explicit fqdn for defining java.util.Date  
```

===
### References
- [Java Interview Questions for 5 years Experience](https://www.interviewbit.com/java-interview-questions-for-5-years-experience/)


  </textarea>
</section>