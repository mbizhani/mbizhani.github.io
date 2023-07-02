---
layout: slide
caption: Java Interview Notes
description: Java Interview Notes
theme: blood
extra: highlight
---

<section data-markdown data-separator="===" data-separator-vertical="^---$">
  <textarea data-template>

## Java Interview Notes

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
#### Numeric Promotion Rules - Samples (1/2)

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
#### Numeric Promotion Rules - Samples (2/2)

```java
int big = 1234567890;

float f = big;
System.out.println(big - (int)f);   // -46

long l = big;
System.out.println(big - (int)l);   // 0

double d = big;
System.out.println(big - (int)d);   // 0
```


---
#### Boxing

- Autoboxing can't work with numeric promotion

```java
Integer a = 10;  // Autoboxing
long b = a;      // Unboxing, then implicit casting 

Long d = 8;      // COMPILE ERROR
Long w = 10L;    // Autoboxing

// Both methods are valid - overloading
public class Kiwi {
	public void fly(int numMiles) {}
	public void fly(Integer numMiles) {}
}
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

#### Concatenation (+)

- `1 + 2 + "c"` => `3c`
- `"c" + 1 + 2` => `c12`
- If both operands are numeric, `+` means numeric addition.
- If either operand is a `String`, `+` means concatenation.
- **The expression is evaluated left to right.**
- The `+` operator is evaluated at compile time.

---
#### String Pool (1/2)

- Using the `new` operator for `String`, ensures that it is created in the heap (not into the string pool). 
- Using literal `String` ensures that the string is created in the string pool. 
  - String pool exists as part of the perm area in the heap.

---
#### String Pool (2/2)

```java
String s1 = "hello" + "world";
String s2 = "helloworld";
System.out.println(s1 == s2); // true

String s3 = "hello" + "world";
String s4 = "hello".concat("world");
System.out.println(s3 == s4); // false

String s5 = "hello" + "world";
String s6 = "hello".concat("world").intern();
System.out.println(s5 == s6); // true
```

---
#### Text Block

- A line break after the opening `"""` is required
- `\` at the end prevent new line (like shell script)
- Imagine a vertical line on the leftmost non-whitespace character
  - The left is `incidental whitespace` 
  - The right is `essential whitespace`

![text-block](/assets/images/slides/jiq/java-text-block.png)

---
#### String Methods

- Removing Whitespace
  - `strip()` - the same as `trime()` + Unicode support
  - `stripLeading()` & `stripTrailing()`
- Indentation
  - `indent(+/-int)` & `stripIndent()`

===
### Array

- **Anonymous Array**
  - `int[] nums = {42, 55, 99}`
- `ArrayStoreException` (runtime error)
  ```java
  Object x[] = new String[3];
  x[0] = new Integer(0);
  ```
- ```java
  int[] ids, types;  // both array
  int ids[], types;  // only 'ids' is array
  int[] a[], b[][];  // 'a' is 2D, 'b' is 3D array
  ```

===
### Collections

- `Collection` extends `Iterable`
  - `List`
  - `Set`
    - `SortedSet`
  - `Queue`
    - `Deque` (Double ended queue)
    - `BlockingQueue`
- `Map`
  - `SortedMap`
  - `ConcurrentMap`

---
### Thread-Safe (1/2)

- Followings are without **external synchronization**
- `ConcurrentLinkedQueue`
  - lock-free algorithm, all operations are atomic
- `CopyOnWriteArrayList`
  - updates to the list through a copy-on-write mechanism, then used for subsequent reads
- `EnumSet`
  - a bit vector to store its elements, all operations are atomic

---
### Thread-Safe (2/2)

- `EnumMap`
  - optimized for use with enum keys
  - uses an array of entries, each cell associated with a unique enum constant
- `ConcurrentHashMap`
  - lock striping technique
  - the map is divided into segments, and each segment is locked independently

===
### Pattern Matching

#### instanceof
- The `final` keyword prevents `pattern variable` reassignment!

```java
Object o = "Hello ";

if(o instanceof final String str && !str.isEmpty()) {
    System.out.printf("[%s]\n", str.trim());
}
```

- The pattern variable must be a **subtype** of the variable.

```java
Integer value = 123;
if(value instanceof Integer) {}
if(value instanceof Integer data) {} // COMPILE ERROR
```

---
#### Flow Scoping (1/2)
- The variable is only in scope when the compiler can definitively determine its type

```java
Number number = 10;

// COMPILE ERROR in both following lines
//   Can't resolve symbole `data`
if(number instanceof Integer data || data.compareTo(5) > 0)
    System.out.println(data);
```

---
#### Flow Scoping (2/2)
- It is determined by the compiler based on the branching and flow of the program
  - It is not strictly hierarchical like instance, class, or local scoping

```java
void printIntegerTwice(Number number) {
    if (number instanceof Integer data)
        System.out.print(data.intValue());
    System.out.println(data.intValue()); // COMPILE ERROR
}

// However, following is OK!!!
void printOnlyIntegers(Number number) {
    if (!(number instanceof Integer data))
        return;
    System.out.println(data.intValue());
}
```

---
#### switch statement
- In `switch` statement, the `break` statements are optional, but without them the code will execute every branch following a matching 
  `case` statement, including any `default` statements it finds.

```java
// cases without 'break'!
switch(a) {
  // Since Java 14, case values can be combined.
  case 1, 2: System.out.println("Lion");  // if a=1,2
  case 3: System.out.println("Tiger");    // if a=1,2,3
  case null: System.out.println("ERR");   // if a=1,2,3,null
  default: System.out.println("N/A");     // always printed!
}
```

---
#### switch expression (1/2)

- If the switch expression returns a value:
  - All branches without throwing an exception must return a consistent data type.
  - Block branches must `yield` a value.
  - `default` branch is required unless all cases are covered (e.g. `enum`).
- Define `default` branch in every switch expression, even those that involve `enum` values.

---
#### switch expression (2/2)

```java
// Using pattern matching no need for 'break'
var result = switch(a) {
  case 1, 2 -> "Lion"; // if a=1,2
  case 3 -> "Tiger";   // if a=3
  case null -> {       // if a=null
    System.err.println("NULL");
    yield "ERR";
  } 
  default -> "N/A";    // if a not above
};

System.out.println("result = " + result);
```

===
### Date & Time

- `java.time.*`

<img style="background-color:white;" src="/assets/images/java/java-date-time.png"/>

---
#### Methods

![date.time.methods](/assets/images/slides/jiq/date.time.methods.png)

---
#### Duration vs Period

- `Duration` units: [_nanos_, ..., _days_]
  - suitable for _time_
- `Period` units: [_days_, ..., _years_]
  - suitable for _date_

![duration.vs.period](/assets/images/slides/jiq/duration.vs.period.png)

===
### Class

#### Order of Initialization

- Fields and instance initializer blocks are run in the order in which they appear in the file.
- The constructor runs after all fields and instance initializer blocks have run.

---
##### Example 1

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
##### Example 2

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

---
#### Access Modifiers (1/2)

- `private` - can be accessed only from within the same class
- Package Access (no keyword) - can be accessed only from a class in the same package
- `protected` - can be accessed only from
  - **a class in the same package**
  - **a subclass**
- `public` - can be accessed from anywhere


---
#### Access Modifiers (2/2)

A method in ______ can access a ______ member.

![Access Modifiers](/assets/images/slides/jiq/access-modifiers.png)


---
#### Methods

- While _access modifiers_ and _optional specifiers_ can appear **in any order**, they must all appear **before the return type**.
- Method Signature = `method name` + `parameter list`
  - `parameter list` - types of parameters and their order
  - uniquely determines a method in a class

---
#### Specifier - `static`

- You can access a `static` member via a reference variable, even a `null` one.

```java
public class C1 {
    public static int STA = 1;
}

public class Main {
    public static void main(String[] args) {

        C1 c1 = null;
        System.out.println(c1.STA);

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
### Singleton DP

- Lazy Init Singleton

```java
public final class ThreadSafeSingleton {
	private static volatile ThreadSafeSingleton INSTANCE = null;

	public static ThreadSafeSingleton getInstance() {
		if (INSTANCE == null) {
			synchronized (ThreadSafeSingleton.class) {
				if (INSTANCE == null) {
					INSTANCE = new ThreadSafeSingleton();
				}
			}
		}
		return instance;
	}
	// private constructor & other methods ...
}
```

---
#### Initialization on Demand (*)

```java
public class LazyInitSingleton {

	private static class InstanceHolder {
		private static final LazyInitSingleton INSTANCE =
          new LazyInitSingleton();
	}

	public static LazyInitSingleton getInstance() {
		return InstanceHolder.INSTANCE;
	}

	// private constructor & other methods ...
}
```

---
#### Enum Singleton

```java
public enum EnumSingleton {
	INSTANCE;

	// other methods...
}
```

---
#### Early Initialization

```java
public class EarlyInitSingleton {
	private static final EarlyInitSingleton INSTANCE =
		new EarlyInitSingleton();

	public static EarlyInitSingleton getInstance() {
		return INSTANCE;
	}

	// private constructor & other methods ...
}
```

===
### References
- Oracle Certified Professional Java SE 17 Developer Study Guide Exam 1Z0-829, Scott Selikoff, Jeanne Boyarsky
- [Java Interview Questions for 5 years Experience](https://www.interviewbit.com/java-interview-questions-for-5-years-experience/)
- [Double-Checked Locking with Singleton](https://www.baeldung.com/java-singleton-double-checked-locking)


  </textarea>
</section>