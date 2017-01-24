# nxus-dataset

## 

[src/DataPresentationUtil.js:10-192](https://github.com/seabourne/nxus-dataset/blob/56ac703f229fe13a2c9e7c1d8296e626f458218f/src/DataPresentationUtil.js#L10-L192 "Source code on GitHub")

## extractDataForPresentation

[src/DataPresentationUtil.js:31-40](https://github.com/seabourne/nxus-dataset/blob/56ac703f229fe13a2c9e7c1d8296e626f458218f/src/DataPresentationUtil.js#L31-L40 "Source code on GitHub")

Extract data relevant to the DataPresentation from collections of DataSet's and DataRow's.
Creates a normalized DataPresentation data-object, with header info from the presentation and all matching DataRows trimmed to just the fields needed.

**Parameters**

-   `presentation` **DataPresentation** 
-   `datasets`  
-   `datarows`  

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** with properties:-   `name` - name of the presentation;
-   `id` - ID of the presentation;
-   `label` - label of the presentation;
-   `fields` - object with properties the DataPresentation field-ids including referenced DataSet primary key fields;
    values are the field data from DataSet. See createFieldsIndexedById.
-   `data` - array of DataRow records, transformed to use the unique field-id's as property names. 
    Records hold only values that are selected in the presentation, plus any defined primary-key fields. See createDataRowsForFields.

## createDataRowsForFields

[src/DataPresentationUtil.js:51-76](https://github.com/seabourne/nxus-dataset/blob/56ac703f229fe13a2c9e7c1d8296e626f458218f/src/DataPresentationUtil.js#L51-L76 "Source code on GitHub")

Create list of data objects, with properties set to the field-id's to prevent naming conflicts.
The returned data will include just these field values, along with any fields marked isPrimaryKey=true

**Parameters**

-   `fieldIdList` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** the field-id values to filter from supplied datasets & datarows
-   `datasets` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** DataSet objects, containing a 'fields' property which holds field object
-   `datarows` **\[type]** DataRow objects to filter

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** Transformed DataRow objects, with properties set to the field-id's.

## createFieldsIndexedById

[src/DataPresentationUtil.js:86-101](https://github.com/seabourne/nxus-dataset/blob/56ac703f229fe13a2c9e7c1d8296e626f458218f/src/DataPresentationUtil.js#L86-L101 "Source code on GitHub")

Pull field info for fields matching the field-id's in the supplied fieldIdList,
and reformat into an object indexed by those field-id's.

**Parameters**

-   `fieldIdList` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** the field-id's to select
-   `datasets` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** array of DataSet objects holding fields, with name, id, etc.
-   `datarows` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** field information from DataSet, indexed by field-id.

## formatPresentationDataByFieldLabel

[src/DataPresentationUtil.js:110-116](https://github.com/seabourne/nxus-dataset/blob/56ac703f229fe13a2c9e7c1d8296e626f458218f/src/DataPresentationUtil.js#L110-L116 "Source code on GitHub")

reformat array of presentationData objects

**Parameters**

-   `presentationData` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** objects per extractDataForPresentation()

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** array of (new) presentationData objects where
 the normalized rows in each presentationData.data
 have properties set to the field label. See formatDataWithFieldLabel()

## formatDataWithFieldLabel

[src/DataPresentationUtil.js:124-144](https://github.com/seabourne/nxus-dataset/blob/56ac703f229fe13a2c9e7c1d8296e626f458218f/src/DataPresentationUtil.js#L124-L144 "Source code on GitHub")

reformat presentationData.data

**Parameters**

-   `presentationData` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** [description]

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** a new copy of presentationData with 'data' 
  transformed into rows with property keys set to the field label.

## indexPresentationDataByPrimaryKeyValue

[src/DataPresentationUtil.js:151-157](https://github.com/seabourne/nxus-dataset/blob/56ac703f229fe13a2c9e7c1d8296e626f458218f/src/DataPresentationUtil.js#L151-L157 "Source code on GitHub")

reformat array of presntation data using indexDataIntoObjectByPrimaryKeyValue()

**Parameters**

-   `presentationData` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** objects per extractDataForPresentation()

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

## indexDataIntoObjectByPrimaryKeyValue

[src/DataPresentationUtil.js:166-191](https://github.com/seabourne/nxus-dataset/blob/56ac703f229fe13a2c9e7c1d8296e626f458218f/src/DataPresentationUtil.js#L166-L191 "Source code on GitHub")

reformat the 'data' rows in the supplied presentation data into a single
object with properties set to the value of primary key field in each row.

**Parameters**

-   `presentationData` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** per extractDataForPresentation()

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** presentationData with data property transformed into a single object,
 with keys of each distinct primary key value, grouping all data for that primary key.

## DataSets

[src/index.js:35-129](https://github.com/seabourne/nxus-dataset/blob/56ac703f229fe13a2c9e7c1d8296e626f458218f/src/index.js#L35-L129 "Source code on GitHub")

**Extends MVCModule**

## Nxus Dataset

Module that provides spreadsheet-like data handling for nxus websites.
Nxus Dataset installs admin menus with various workflows for creating new DataSets, uploading rows to a DataSet, 
and gathering columns from Datasets into  Data Presentations for use in UX visualizations.

### Installation

     > npm install nxus-dataset --save

### Data Models

Models provided here have minimal attributes for flexibility of use. 
The `DataSet` model holds meta-data about a collection of `DataRow` records, 
without explicit association in the model so that other child models for a `DataRow` might be switched in.
`DataRow` defines only a link to it's parent `DataSet`.
`DataPresentation` defines additional meta-data and stores a reference to a collection of DataRow columns (fields).

### Formats

### Examples

### Options

   `dataSetModel` replace the default `datasets-dataset` model with your own
   `dataRowModel` replace the default `datasets-datarow` model with your own

### loadPresentations

[src/index.js:51-72](https://github.com/seabourne/nxus-dataset/blob/56ac703f229fe13a2c9e7c1d8296e626f458218f/src/index.js#L51-L72 "Source code on GitHub")

Gather DataPresentation objects returned by the given query,
returning normalized data for each in an arry

**Parameters**

-   `query` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** WaterLine query on DataPresentation model
-   `rowKeyValues`  
-   `queryOptions` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Waterline query options, such as `sort`, `limit`, `skip`, etc.

Returns **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** each object in the array is the full data for one of the queried presentations, 
returned in the format provided by <module:./DataPresentationUtil#extractDataForPresentation>

### loadPresentationByName

[src/index.js:80-82](https://github.com/seabourne/nxus-dataset/blob/56ac703f229fe13a2c9e7c1d8296e626f458218f/src/index.js#L80-L82 "Source code on GitHub")

Convenience method to load a presentation by name.

**Parameters**

-   `name` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** name of a data presentation, for exact match.
-   `queryOptions` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Waterline query options, such as `sort`, `limit`, etc.

### loadFields

[src/index.js:90-106](https://github.com/seabourne/nxus-dataset/blob/56ac703f229fe13a2c9e7c1d8296e626f458218f/src/index.js#L90-L106 "Source code on GitHub")

Load data for the supplied list of fields. If 'rowKeyValues' is supplied then limit returned data to 
primary key rows with that value or values.

**Parameters**

-   `fields`  
-   `rowKeyValues`  
-   `queryOptions`  

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Has just the 'data' and 'fields' properties per `loadPresentations()`

## guessType

[src/fieldUtils.js:27-46](https://github.com/seabourne/nxus-dataset/blob/56ac703f229fe13a2c9e7c1d8296e626f458218f/src/fieldUtils.js#L27-L46 "Source code on GitHub")

best guess typing for supplied value.

**Parameters**

-   `val`  
-   `name` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)](default '')** column header or hint as to type.

## buildFieldInfo

[src/fieldUtils.js:53-67](https://github.com/seabourne/nxus-dataset/blob/56ac703f229fe13a2c9e7c1d8296e626f458218f/src/fieldUtils.js#L53-L67 "Source code on GitHub")

Based on supplied data row, build array of field info objects
which include a unique field-id for each property on the row.

**Parameters**

-   `sample` **datarow** representative row of data
