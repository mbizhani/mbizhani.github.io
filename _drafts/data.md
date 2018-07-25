---
layout: post
title: "Data 01"
categories: article data
excerpt: Basics of Data
math: true
---

## Basics
- Similarity / Dissimilarity application:
  - clustering
  - outlier detection
  - nearest-neighbor classification
- 2 Ways for **Proximity** of Two Objects
  - function of the **distance** between their attribute values
  - calculated based on **probabilities**
- **Data objects** can also be referred to as 
  - samples
  - examples
  - instances
  - data points
  - data tuples (in database context)
  - objects
- **Attribute** (data mining) = **Dimension** (OLAP) = **Feature** (machine learning) = **Variable** (statistics) 
- **Attribute Vector** (or Feature Vector) - A set of attributes used to describe a given object
  - _Univariate_   - the distribution of data involving one attribute (or variable)
  - _Bivariate_    - distribution involves two attributes
  - _Multivariate_ - distribution involves more attributes

## Type/Scale of Variables/Features/Dimensions/Attributes

Types       | Example                            | Graphs                   | Categorization | Mode (most frequent) | Median / Order / Sort | Add / Subtract | Ratio of Diff | Multiply / Divide | True Zero | Mean
------------|------------------------------------|--------------------------|----------------|----------------------|-----------------------|----------------|---------------|-------------------|-----------|-----
**Nominal** | Enums (color)                      | Bar, Pie                 | X              | X
**Ordinal** | Sorted Enum (priority,rank)        | Bar, Pie                 | X              | X                    | X
**Interval**| Date, Map Coordinates              | Histogram, Box & Whisker | X              | X                    | X                     | X              | X
**Ratio**   | Weight, Temperature in Kelvin, Age | Histogram, Box & Whisker | X              | X                    | X                     | X              | X             | X                 | X         | X

## Central Tendency
- Weighted Arithmetic Mean $\bar{x} = \frac{\sum_{i=1}^{n} w_{i} x_{i}} {\sum_{i=1}^{n} w_{i}}$ (for all $w_{i} = 1$ it is $\bar{x} = \frac{\sum_{i=1}^{n} x_{i}} {n}$)
  - $\mu = \frac{\sum_{i=1}^{N} x_{i}} {N}$ if $N$ is the population
  - Arithmetic mean is so sensitivity to extreme (e.g., outlier) values
  - Use **trimmed mean** by chopping off values at the high and low extremes before calculation (e.g. 2% of top and bottom)
- **Median** is a better measure of the center of data for _skewed (asymmetric) data_
  - expensive to compute for a large number of observations
  - following example tries to estimate

<table>
<tr>
	<td>
		<table>
			<tr>
				<th nowrap>Age Range</th> <th>Frequency</th> <th>Cumulative Frequency</th> <th>Cum ٪</th>
			</tr>
			
			<tr>
				<td>1 - 5</td> <td>200</td> <td>200</td> <td>06.26</td> 
			</tr>
			<tr>
				<td>6 - 15</td> <td>450</td> <td>650</td> <td>20.35</td>
			</tr>
			<tr>
				<td>16 - 20</td> <td>300</td> <td>950</td> <td>29.74</td>
			</tr>
			<tr style="background-color:yellow">
				<td>21 - 50</td> <td>1500</td> <td>2450</td> <td>76.71</td>
			</tr>
			<tr>
				<td>51 - 80</td> <td>700</td> <td>3150</td> <td>98.62</td>
			</tr>
			<tr>
				<td>81 - 110</td> <td>44</td> <td>3194</td> <td>100.00</td>
			</tr>
		</table>
	</td>
	<td>
		$$median = L_{MG} + (\frac{N/2 - (\sum freq)_l}{freq_{MG}})*width_{MG}$$
		
		$median_{freq} = \frac{3194 + 1}{2} = 1597.5$
		$950 \leq 1597.5 < 2450 \implies [21, 50]$ MG (Median Group)
		
		$$median = 21 + \frac{3194/2 - 950}{1500} * 30 = 33.94$$
	</td>
</tr>
<tr>
	<td colspan="2">
		<ol>
			<li>Median must be in the median interval</li>
			<li>From half down of frequency, total previous intervals are subtracted. This diff is in the median interval</li>
			<li>The percent of the previous calculated diff over interval frequncey is mapped to the range and added to the lower boundary of the range</li>
		</ol>
	</td>
</tr>
</table>

- **Mode** is the value that occurs most frequently in the set
  - unimodal - one mode in data set
  - bimodal - two modes in data set
  - multimodal - multiple modes in data set
- **Midrange** can also be used to assess the central tendency of a numeric data set: $midrange = \frac{x_{min} + x_{max}}{2}$

### Distributions

Distribution          | Image | Description
----------------------|-------|------------
**Normal**            | ![n](/assets/images/data/dist/normal.png)     | - Symmetrical & Unimodal (Bell Shape).<br/>- The `mean` value can represent the distribution.<br/>- Range between -1SD and -1SD is 68% percent of distribution.<br/>- Example: IQ <br/>- $mean = median = mode$
**Positively Skewed** | ![s](/assets/images/data/dist/pos-skewed.png) | - Asymmetric<br/>- Very common in social sciences<br/>- Example: Income <br/>- $mean > median > mode$
**Negatively Skewed** | ![s](/assets/images/data/dist/neg-skewed.png) | - Asymmetric<br/>- Example: Cholesterol level<br/>- $mean < median < mode$
**Bimodal**           | ![b](/assets/images/data/dist/bimodal.png)    | - Distribution with two modes<br/>- The `mean` value can **not** represent the distribution!<br/>- Example: Love/Hate Product
**Uniform**           | ![u](/assets/images/data/dist/uniform.png)    | - All values are equally likely.<br/>- Example: ID

## Dispersion
Suppose sorted data set $X = \\{x_1, x_2, ..., x_N\\}, x_{i} < x_{i+1}$

- **Quantiles** are _points_ taken at regular intervals of a data distribution, dividing it into essentially equal size consecutive subsets
  - 2-quantile is median point - divides $X$ into two halves
  - 4-quantile are three points - median of $\\{x_1, ..., x_{median-1}\\}$, median of $X$, and median of $\\{x_{median+1}, ..., x_N\\}$
    - In this case, each subset is called a **quartile** ![quartiles](/assets/images/data/quartiles.png)
    - **InterQuartile Range** - $IQR = Q_3 - Q_1$
- **Boxplot & Whisker** is a popular way of visualizing a distribution

![bw](/assets/images/data/chart/box-whisker.png)
