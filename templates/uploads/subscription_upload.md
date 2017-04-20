# Subscription CSV file format

The first line of your product CSV has to include the field headers described below with each separated by a comma character `,`. Subsequent lines in the file should contain data for your product using those same fields in that exact same order. Here's a description of each field:

## Customer
The email address of the customer

## Unit
The enum unit for the subscription eg. `w`, `m`, `y`

## Interval
The number foreach unit to occur eg. `1`, `2`, etc..

## Products
The comma separated list of product handles

## Active
True or false, defaults to True
