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

Types       | Example                     | Categorization | Mode (most frequent) | Order / Sort | Median | Add / Subtract | Ratio of Diff | Multiply / Divide | True Zero | Mean
------------|-----------------------------|----------------|----------------------|--------------|--------|----------------|---------------|-------------------|-----------|-----
**Nominal** | Enums (color)               | X              | X
**Ordinal** | Sorted Enum (priority,rank) | X              | X                    | X            | X
**Interval**| Date, Map Coordinates       | X              | X                    | X            | X      | X              | X
**Ratio**   | Size, Weight, Length        | X              | X                    | X            | X      | X              | X             | X                 | X         | X

## Variable & Statistical Tests

|                  | Nominal Indep | Oridinal Indep | Continuous Indep
-------------------|---------------|----------------|-----------------
**Nominal Dep**    | Chi-square Test of Independence | Chi-square Test of Independence | Logistic Regression, Discriminant Analysis   
**Ordinal Dep**    | Nonparametric Tests | Nonparametric Correlation | Ordinal Regression  
**Continuous Dep** | T-test, ANOVA | Nonparametric Correlation | Correlation, Linear Regression