# nxus-dataset

## 

[src/index.js:30-30](https://github.com/seabourne/nxus-dataset/blob/afd6bf2488d4c5277c0935ed2f7bae643c450820/src/index.js#L30-L30 "Source code on GitHub")

## Usage

* * *

An abstraction of "Spreadsheet-like" data for use in nxus applications,
along with a way to create a named collection of said spreadsheet columns for use in various visualizations on a website.

Uses nxus-storage and nxus-loader as interfaces to load and store data from a _DataSet_ model, which in turn holds zero or more _DataRow_ objects.
A _DataRow_ is essentially schema-less, with a structure defined by the data which is loaded in.
A _DataPresentation_ is a collection of fields from _DataSets_ that have been created and have had _DataRows_ uploaded.

This module provides _DataSet_ and _DataPresentation_ links on the default Admin screen for managing these data types.

## API

* * *

Applications have access via nxus-storage to the models, by refrerencing their identities:
   'dataset'
   'datarow'
   'datapresentation'

The _DataPresentation_ model has a static method
extractUsingFieldIds()
which can be used to take a collection of DataSets and DataRows and filter just the data which applies to a supplied DataPresentation instance.
The instance method 
extractFieldData() on _DataPresentation_ provides the same function for the current instance.

## \_processLoaderDataRow

[src/index.js:98-110](https://github.com/seabourne/nxus-dataset/blob/afd6bf2488d4c5277c0935ed2f7bae643c450820/src/index.js#L98-L110 "Source code on GitHub")

Handler for data rows to clean up records; attached to loader's 'model.datarow'.

**Parameters**

-   `object`  row is the row of data from CSV column-header keys
-   `row`  

## \_prepareDataRowInDataSet

[src/index.js:144-161](https://github.com/seabourne/nxus-dataset/blob/afd6bf2488d4c5277c0935ed2f7bae643c450820/src/index.js#L144-L161 "Source code on GitHub")

Transform the datarow after storage,
associating with the given dataset ID.

**Parameters**

-   `row` **\[datarow]** DataRow instance to put under given DataSet ID
-   `dataSetId` **\[[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)]** Parent DataSet ID

Returns **Any** the original row passed in, with modifications.

## \_buildFieldInfo

[src/index.js:169-191](https://github.com/seabourne/nxus-dataset/blob/afd6bf2488d4c5277c0935ed2f7bae643c450820/src/index.js#L169-L191 "Source code on GitHub")

Based on supplied data row, build array of field info objects
which include a unique field-id for each property on the row.

**Parameters**

-   `sample` **\[datarow]** [representative row of data]

## saveDataUpload

[src/index.js:200-246](https://github.com/seabourne/nxus-dataset/blob/afd6bf2488d4c5277c0935ed2f7bae643c450820/src/index.js#L200-L246 "Source code on GitHub")

Save datarows uploaded from CSV,
associating each datarow with the parent dataset
and gathering summary field information about the collection of rows
to store in the parent.

**Parameters**

-   `req`  
-   `res`  

## removeDataRowsForSet

[src/index.js:252-271](https://github.com/seabourne/nxus-dataset/blob/afd6bf2488d4c5277c0935ed2f7bae643c450820/src/index.js#L252-L271 "Source code on GitHub")

Action when a dataset is removed -
removes the dataset and all child datarows.

**Parameters**

-   `req`  
-   `res`  

## saveDataSet

[src/index.js:277-324](https://github.com/seabourne/nxus-dataset/blob/afd6bf2488d4c5277c0935ed2f7bae643c450820/src/index.js#L277-L324 "Source code on GitHub")

handle POST response for edit existing 
or create new dataset

**Parameters**

-   `req`  
-   `res`  

## editDataPresentation

[src/index.js:334-352](https://github.com/seabourne/nxus-dataset/blob/afd6bf2488d4c5277c0935ed2f7bae643c450820/src/index.js#L334-L352 "Source code on GitHub")

replace the admin handler for editing, 
or creating, a DataPresentation.
Adding additional objects to make the association
with DataSet.fields easier to manage.

**Parameters**

-   `req` **\[type]** [description]
-   `res`  

Returns **\[type]** [description]

## saveDataPresentation

[src/index.js:361-390](https://github.com/seabourne/nxus-dataset/blob/afd6bf2488d4c5277c0935ed2f7bae643c450820/src/index.js#L361-L390 "Source code on GitHub")

Save changed (not new) DataPresentation.
Handles the POST from custom admin-datapresentation-form

**Parameters**

-   `req` **\[type]** [description]
-   `res` **\[type]** [description]

Returns **\[type]** [description]

## extractUsingFieldIds

[src/models/DataPresentation.js:36-70](https://github.com/seabourne/nxus-dataset/blob/afd6bf2488d4c5277c0935ed2f7bae643c450820/src/models/DataPresentation.js#L36-L70 "Source code on GitHub")

Extract data relevant to the DataPresentation from collections of DataSet's and DataRow's.
Creates a filtered view object, with summary data about the presentation and all matching DataRows trimmed to just the fields needed.

**Parameters**

-   `presentation` **\[DataPresentation]** 
-   `datasets`  
-   `datarows`  

Returns **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** with properties:
  name - name of the presentation;
  id - ID of the presentation;
  label - label of the presentation;
  fields - array of matching fields extracted from DataSet(s);
  data - array of DataRow records, holding just the identified fields and any primary key fields.
