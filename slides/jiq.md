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
### String Pool

- Using the `new` operator for `String`, ensures that it is created in the heap (not into the string pool). 
- Using literal `String` ensures that the string is created in the string pool. 
  - String pool exists as part of the perm area in the heap.
  


===
### References
- [Java Interview Questions for 5 years Experience](https://www.interviewbit.com/java-interview-questions-for-5-years-experience/)


  </textarea>
</section>