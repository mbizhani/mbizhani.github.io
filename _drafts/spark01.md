---
layout: post
title: "The Spark of the Apache Tribe - Ep 1"
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
- **Note:** So current directory is `SPARK_INSTALL_DIR/spark-VERSION-bin-hadoopVER/`, used for relative addressing in console.

In the Scala or Python console type `spark` and it shows the `SparkSession` of the application.

Another way of working with Spark is executing an application (submit a written code) via calling `./bin/spark-submit`:
```sh
./bin/spark-submit \
  --class org.apache.spark.examples.SparkPi \
  --master local \
  ./examples/jars/spark-examples_2.11-2.3.1.jar 10
```
or
```sh
./bin/spark-submit \
  --master local \
  ./examples/src/main/python/pi.py 10
```


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
  - A node in the cluster
  - Runs your `main()` function
  - 3 Jobs
    1. Maintain information about the Spark Application
    2. Responding to a user’s program or input
    3. Analyzing, distributing, and scheduling work across the executors
- Set of _executors_ processes
  - Each has 2 jobs
    1. Executing code assigned to it by the driver
    2. Reporting the state of the computation on itself to the driver
- Cluster manager can be one of the followings
  - Standalone - a simple cluster manager included with Spark that makes it easy to set up a cluster.
  - Apache Mesos - a general cluster manager that can also run Hadoop MapReduce and service applications.
  - Hadoop YARN - the resource manager in Hadoop 2.

**Note:** Spark has a local mode (unlike cluster) in which all the nodes become some processes/threads in the local machine

## DataFrame
The following code in Scala console
```scala
val myRange = spark.range(1000).toDF("number")
val divisBy2 = myRange.where("number % 2 = 0")
divisBy2.count()
``` 
or Python console
```python
myRange = spark.range(1000).toDF("number")
divisBy2 = myRange.where("number % 2 = 0")
divisBy2.count()
```
Line 1 creates a _DataFrame_ with one column containing 1,000 rows with values from 0 to 999:
- Immutable
- Distributed collection of objects of type `Row` holding various types of tabular data
- Most common Structured API
- A table of data with rows and columns
- With multiple _partitions_
  - Each one is a collection of rows that is processed by a worker node in the cluster

Line 2 applies a _Transformation_ on the DataFrame. They are 2 groups
  - **Narrow** - row in a source partition may be transformed at most to row of **a** destination partition (e.g. above `where`)
    - pipeline  
  - **Wide** - row in a source partition can be transformed to rows of multiple destination partitions.
    - Shuffle

Line 3 does an aggregation transformation (wide) and at last collecting of results from processed partitions which is an _Action_. They are 3 groups
  - View data in the console
  - Collect data to native objects in the respective language
  - Write to output data sources

**Note:** Spark can run the same transformations, regardless of the language, in the exact same way.

#### A N &nbsp;&nbsp;&nbsp; E X A M P L E

Download [file](/assets/data/flight-summary.csv) (256 records) to `SPARK_INSTALL_DIR/spark-VERSION-bin-hadoopVER/data/csv/` (you may need to create `data/csv/` directory). 
Some content of it is

DEST_COUNTRY_NAME | ORIGIN_COUNTRY_NAME | count
------------------|---------------------|------
United States | Romania | 15
United States | Croatia | 1
United States | Ireland | 344
...|...|...

Now,

<table>
	<tr>
		<th>Scala</th>
		<th>Python</th>
	</tr>

	<tr>
		<td colspan="2">
			Load data in Spark
		</td>
	</tr>
	<tr>
		<td>
{% highlight scala %}
val flightCSV = spark
  .read
  .option("inferSchema", "true")
  .option("header", "true")
  .csv("data/csv/flight-summary.csv")
{% endhighlight %}
		</td>
		<td>
{% highlight python %}
{% endhighlight %}
		</td>
	</tr>

	<tr>
		<td colspan="2">
			<code>flightCSV</code> shows <code>org.apache.spark.sql.DataFrame = [DEST_COUNTRY_NAME: string, ORIGIN_COUNTRY_NAME: string ... 1 more field]</code>
		</td>
	</tr>
	<tr>
		<td colspan="2">
			<code>flightCSV.take(3)</code> returns an Array of 3 objects of <code>org.apache.spark.sql.Row</code> type
		</td>
	</tr>
	<tr>
		<td colspan="2">
			<code>flightCSV.show()</code> shows a text-based-table of 20 first records of data 
		</td>
	</tr>
	
	<tr>
		<td colspan="2"><code>flightCSV.createOrReplaceTempView("tv_flight")</code> converts a DataFrame into a view</td>
	</tr>

	<tr>
		<td>
{% highlight scala linenos %}
spark.sql("""
  SELECT DEST_COUNTRY_NAME, count(1)
  FROM tv_flight
  GROUP BY DEST_COUNTRY_NAME
  """)
  .show()

flightCSV
  .groupBy("DEST_COUNTRY_NAME")
  .count()
  .show()

// ---

spark.sql("SELECT max(count) from tv_flight").show

import org.apache.spark.sql.functions.max
flightCSV.select(max("count")).show()

//---

val sumBySql = spark.sql("""
  SELECT DEST_COUNTRY_NAME, sum(count) as destination_total
  FROM tv_flight
  GROUP BY DEST_COUNTRY_NAME
  ORDER BY sum(count) DESC
  LIMIT 5
  """)

sumBySql.explain
sumBySql.show

import org.apache.spark.sql.functions.desc
val sumByCall = flightCSV
  .groupBy("DEST_COUNTRY_NAME")
  .sum("count")
  .withColumnRenamed("sum(count)", "destination_total")
  .sort(desc("destination_total"))
  .limit(5)

sumByCall.explain
sumByCall.show
{% endhighlight %}
		</td>
	</tr>
	
	<tr>
		<td>
		Both outputs of the above explain is the same as follow
{% highlight sh linenos %}
TakeOrderedAndProject(limit=5, orderBy=[aggOrder#230L DESC NULLS LAST], output=[DEST_COUNTRY_NAME#10,destination_total#204L])
+- *(2) HashAggregate(keys=[DEST_COUNTRY_NAME#10], functions=[sum(cast(count#12 as bigint))])
   +- Exchange hashpartitioning(DEST_COUNTRY_NAME#10, 200)
      +- *(1) HashAggregate(keys=[DEST_COUNTRY_NAME#10], functions=[partial_sum(cast(count#12 as bigint))])
         +- *(1) FileScan csv [DEST_COUNTRY_NAME#10,count#12] Batched: false, Format: CSV, Location: InMemoryFileIndex[file:...]
{% endhighlight %}
			So according to the plan, following steps are executed (similar to <code>sumByCall</code>):
			<ol>
				<li>Line 5: Load csv file</li>
				<li>Line 4-2: Group data by <code>DEST_COUNTRY_NAME</code> and execute function <code>sum</code> per group</li>
				<li>Line 1: Rename column, then sort, an finally limit the output</li>
			</ol> 
		</td>
	</tr>

	<tr>
		<td colspan="2">
			Note: the chaining calls from line 35 to 39 must conform to the mentioned order. The order also shows the execution
			plan of query and is the same as SQL query from line 23 to 27.  
		</td>
	</tr>
</table>