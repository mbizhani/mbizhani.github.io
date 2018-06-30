---
layout: post
title: "Data 01"
categories: article data
excerpt: Basics of Data
---

## Basics
- Population & Sampling: Strategies
  - Stratified: sampling based on the key characteristics to represents the population
  - Random
- Designing Research
  - Experimental: 
  - Non-experimental 
- Variables R = F(X)
  - R, Dependents/Targets/Outcomes (e.g. cholesterol level)
  - X, Independents/Predictors (e.g. features of the drugs)


## Types/Scale of Variables/Measurements/Features

Types       | Example                     | Graphs                   | Categorization | Mode (most frequent) | Order / Sort | Median | Add / Subtract | Ratio of Diff | Multiply / Divide | True Zero | Mean
------------|-----------------------------|--------------------------|----------------|----------------------|--------------|--------|----------------|---------------|-------------------|-----------|-----
**Nominal** | Enums (color)               | Bar, Pie                 | X              | X
**Ordinal** | Sorted Enum (priority,rank) | Bar, Pie                 | X              | X                    | X            | X
**Interval**| Date, Map Coordinates       | Histogram, Box & Whisker | X              | X                    | X            | X      | X              | X
**Ratio**   | Size, Weight, Length        | Histogram, Box & Whisker | X              | X                    | X            | X      | X              | X             | X                 | X         | X

## Variable & Statistical Tests

|                  | Nominal Indep | Oridinal Indep | Continuous Indep
-------------------|---------------|----------------|-----------------
**Nominal Dep**    | Chi-square Test of Independence | Chi-square Test of Independence | Logistic Regression, Discriminant Analysis   
**Ordinal Dep**    | Nonparametric Tests | Nonparametric Correlation | Ordinal Regression  
**Continuous Dep** | T-Test, ANOVA | Nonparametric Correlation | Correlation, Linear Regression

## Distributions

Distribution          | Image | Description
----------------------|-------|------------
**Normal**            | ![n](/assets/images/data/dist/normal.png)     | - Symmetrical & Unimodal (Bell Shape).<br/>- The `mean` value can represent the distribution.<br/>- Range between -1SD and -1SD is 68% percent of distribution.<br/>- Example: IQ
**Uniform**           | ![u](/assets/images/data/dist/uniform.png)    | - All values are equally likely.<br/>- Example: ID
**Positively Skewed** | ![s](/assets/images/data/dist/pos-skewed.png) | - Asymmetric<br/>- Very common in social sciences<br/>- Example: Income
**Negatively Skewed** | ![s](/assets/images/data/dist/neg-skewed.png) | - Asymmetric<br/>- Example: Cholesterol level
**Bimodal**           | ![b](/assets/images/data/dist/bimodal.png)    | - Distribution with two modes<br/>- The `mean` value can **not** represent the distribution!<br/>- Example: Love/Hate Product

## Visualization

### Box & Whisker
![bw](/assets/images/data/chart/box-whisker.png)

## Tests

### Chi-square Test of Independence
- Studies the relationship between two or more categorical variables
- Determines if one category of a variable is more likely to be associated with a category of another variable
- Hypothesises
  - **Null**: Variables are not related to each other (variables are independent)
  - **Alternative**: Variables are related to each other (variables are associated)