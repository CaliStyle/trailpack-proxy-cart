# Customer CSV file format
The first line of your customer CSV has to include the field headers described below with each separated by a comma. Subsequent lines in the file should contain data for your customer using those same fields in that exact same order. Here's a description of each field:

## Email (can be left blank)
Customer Email address

## First Name
Customer First Name

## Last Name
Customer Last Name

## Phone
Customer Phone Number

## Billing Address 1

## Billing Address 2

## Billing Address 3

## Billing Company

## Billing City

## Billing Province

## Billing Postal Code

## Billing Country Code

## Shipping Address 1

## Shipping Address 2

## Shipping Address 3

## Shipping Company

## Shipping City

## Shipping Province

## Shipping Postal Code

## Shipping Country Code

## Tags (can be left blank)
Comma-separated list of tags used to tag the customer. For example, `tag1, tag2, tag3`.

## Collections (can be left blank)
Enter the name of the collection handles separated by a comma character `,` you want to add this customer to. If the collection(s) does not already exist, one will be created for you. For example, `colleciton-one, collection-two, collection-three` 

## Accounts(can be left blank)
Comma-separated list of accounts for the customer on 3rd Party services. For example, `stripe:cust_xxxxxxx, stripe:cust_xxxxxxx, stripe:cust_xxxxxxx`.
Otherwise, a default account is created for the customer with the default payment provider.

## Users(can be left blank)
Comma-separated list of user emails for the customer. For example, `example@example.com, example1@example.com, example2@example.com`. If the user with the associated email does not exist, one will be created.
