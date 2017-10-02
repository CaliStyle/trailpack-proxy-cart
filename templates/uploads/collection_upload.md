# Collection CSV file format
The first line of your collection CSV has to include the field headers described below with each separated by a comma. Subsequent lines in the file should contain data for your customer using those same fields in that exact same order. Here's a description of each field:

## Handle
The unique handle of the collection.

## Title
The title of your collection. Example: Women's Snowboards

## Excerpt (Markdown or HTML)
The small description of the collection in Markdown or HTML format. This can also be plain text without any formatting which defaults to Markdown. This creates the field `excerpt_html`.

## Body (Markdown or HTML)
The description of the collection in Markdown or HTML format. This can also be plain text without any formatting which defaults to Markdown. This creates the field `body_html`.

## Primary Purpose
The Primary Purpose of the Collection. Valid Values are:
* navigation
* group
* discount
* shipping
* taxes

## Sort Order
The Order in which the collection sorts products in it (if any). Valid Values are:
* alpha-asc // Alphabetically, in ascending order (A - Z).
* alpha-desc // Alphabetically, in descending order (Z - A).
* best-selling // By best-selling products.
* created // By date created, in ascending order (oldest - newest).
* created-desc // By date created, in descending order (newest - oldest).
* manual // Order created by the shop owner.
* price-asc // By price, in ascending order (lowest - highest).
* price-desc // By price, in descending order (highest - lowest).

## Published
States whether or not a collection is published on your storefront. Valid values are TRUE if the collection is published on your storefront, or FALSE if the product is hidden from your storefront. Leaving the field blank will leave the collection unpublished.


## Tax Type (can be left blank)

## Tax Rate (can be left blank)

## Tax Percentage (can be left blank)

## Tax Name (can be left blank)

## Discount Scope (can be left blank)
`global` or `individual`

## Discount Type (can be left blank)
`fixed` or `percentage`

## Discount Rate (can be left blank)
A whole number to discount product prices by

## Discount Percentage (can be left blank)
A percentage to discount product prices by

## Discount Product Include (can be left blank)

## Discount Product Exclude (can be left blank)
A comma separated list of Product Types to exclude from a discount
