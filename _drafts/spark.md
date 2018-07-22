---
layout: post
title: "The Spark of the Apache Tribe"
categories: article data
excerpt: An Introduction to Apache Spark
---

## Installation
- Download Spark `spark-VERSION-bin-hadoopVER.tgz` from [link](http://spark.apache.org/downloads.html)
- `tar xvfz spark-VERSION-bin-hadoopVER.tgz`
- `cd spark-VERSION-bin-hadoopVER`

Now you can execute one of the following to execute a console:
- `./bin/pyspark` Python console
- `./bin/spark-shell` Scala console
- `./bin/spark-sql` SQL console

In the Scala or Python console type `spark` and it shows the `SparkSession` of the application. 


## Basics
- Parallel data processing on computer clusters
  - A unified computing engine
    - Wide range of data analytics tasks (e.g. data loading and SQL queries, machine learning, streaming, ...) over same engine
    - Wide range of data storage support
    - Data is expensive to move so Spark focuses on performing computations over the data, no matter where it resides!
  - A set of libraries
    - Spark SQL for SQL and structured data processing
    - MLlib for machine learning
    - GraphX for graph processing
    - Spark Streaming
    - Third parties ([link](https://spark-packages.org))
- Supports following programming languages
  - Scala
  - Java
  - Python
  - R
- Started at UC Berkeley in 2009 as the Spark research project
  - Promising cluster computing
  - Inefficient MapReduce for large applications
  - Interactive data science and ad hoc queries
  - Embedding Scala to Spark providing highly usable interactive system for running queries on hundreds of machines
  - _DataBricks_ company is founded
- Spark itself is written in Scala

## Architecture
![ca](/assets/images/spark/cluster.png)
- A _driver_ process
  - a node in the cluster
  - runs your `main()` function
  - 3 jobs
    1. maintain information about the Spark Application
    2. responding to a user’s program or input
    3. analyzing, distributing, and scheduling work across the executors
- Set of _executors_ processes
  - each has 2 jobs
    1. executing code assigned to it by the driver
    2. reporting the state of the computation on itself to the driver
- Cluster manager can be one of the followings
  - Standalone - a simple cluster manager included with Spark that makes it easy to set up a cluster.
  - Apache Mesos - a general cluster manager that can also run Hadoop MapReduce and service applications.
  - Hadoop YARN - the resource manager in Hadoop 2.

**Note:** Spark has a local mode (unlike cluster) in which all the nodes become some processes/threads in the local machine

### DataFrame
The following code in Scala console
```scala
val myRange = spark.range(1000).toDF("number")
val divisBy2 = myRange.where("number % 2 = 0")
``` 
or Python console
```python
myRange = spark.range(1000).toDF("number")
divisBy2 = myRange.where("number % 2 = 0")
```
Line 1 creates a _DataFrame_ with one column containing 1,000 rows with values from 0 to 999:
- immutable
- distributed collection
- most common Structured API
- a table of data with rows and columns
- with multiple _partitions_
  - each one is a collection of rows that is processed by a worker node in the cluster

Line 2 applies a _Transformations_ on the DataFrame. Two groups
  - **narrow** - row in a source partition may be transformed at most to row of **a** destination partition (e.g. above `where`)
    - pipeline  
  - **wide** - row in a source partition can be transformed to rows of multiple destination partitions.
    - shuffle

### Misc
- Publish Spark as a SQL DataSource ([link](https://spark.apache.org/docs/latest/sql-programming-guide.html#running-the-thrift-jdbcodbc-server)) 
