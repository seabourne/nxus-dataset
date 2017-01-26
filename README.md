# nxus-dataset

## DataSets

[src/index.js:43-137](https://github.com/seabourne/nxus-dataset/blob/1d1b1188e30e14c839cbbcae6f847526dfb47b2c/src/index.js#L43-L137 "Source code on GitHub")

**Extends MVCModule**

Module that provides spreadsheet-like data handling for nxus websites.
Nxus Dataset installs admin menus with various workflows for creating new DataSets, uploading rows to a DataSet, 
and gathering columns from Datasets into  Data Presentations for use in UX visualizations.

### Installation

     > npm install nxus-dataset --save

### Data Models

Models provided here have minimal attributes for flexibility of use. 
The `DataSet` model holds meta-data about a collection of `DataRow` records, 
without an explicit parent-side association in the model so that other child models for a `DataRow` might be switched in.
`DataRow` defines only a link to it's parent `DataSet`.
`DataPresentation` defines additional meta-data and stores a reference to a collection of DataRow columns (fields).

### Formats

The `load` methods in `DataSets` return a data object that replaces all user-provided keys from incoming column headers
with generated identifiers to prevent any loss of data. 
The original header info, as well as label and type information, is captured in a `fields` property.
Uploaded DataRows are placed into a `data` propery and normalized into an object array with one data property and any  primary keys
per object.

see [@module:./DataPresentationUtil#extractDataForPresentation](@module:./DataPresentationUtil#extractDataForPresentation) for full description of this format.

### Options

-   `dataSetModel` replace the default `datasets-dataset` model with your own
-   `dataRowModel` replace the default `datasets-datarow` model with your own

### Usage & Examples

-   [Usage](docs/USAGE.md)
-   [Examples](docs/datasets-joined-by-keys.md)

### loadPresentations

[src/index.js:59-80](https://github.com/seabourne/nxus-dataset/blob/1d1b1188e30e14c839cbbcae6f847526dfb47b2c/src/index.js#L59-L80 "Source code on GitHub")

Gather DataPresentation objects returned by the given query,
returning normalized data for each in an arry

**Parameters**

-   `query` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** WaterLine query on DataPresentation model
-   `rowKeyValues`  
-   `queryOptions` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Waterline query options, such as `sort`, `limit`, `skip`, etc.

Returns **[array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** each object in the array is the full data for one of the queried presentations, 
returned in the format provided by [@module:./DataPresentationUtil#extractDataForPresentation](@module:./DataPresentationUtil#extractDataForPresentation)

### loadPresentationByName

[src/index.js:88-90](https://github.com/seabourne/nxus-dataset/blob/1d1b1188e30e14c839cbbcae6f847526dfb47b2c/src/index.js#L88-L90 "Source code on GitHub")

Convenience method to load a presentation by name.

**Parameters**

-   `name` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** name of a data presentation, for exact match.
-   `queryOptions` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Waterline query options, such as `sort`, `limit`, etc.

### loadFields

[src/index.js:98-114](https://github.com/seabourne/nxus-dataset/blob/1d1b1188e30e14c839cbbcae6f847526dfb47b2c/src/index.js#L98-L114 "Source code on GitHub")

Load data for the supplied list of fields. If 'rowKeyValues' is supplied then limit returned data to 
primary key rows with that value or values.

**Parameters**

-   `fields`  
-   `rowKeyValues`  
-   `queryOptions`  

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Has just the 'data' and 'fields' properties per `loadPresentations()`

## examples1

## FieldBuilder

[src/fieldUtils.js:24-81](https://github.com/seabourne/nxus-dataset/blob/1d1b1188e30e14c839cbbcae6f847526dfb47b2c/src/fieldUtils.js#L24-L81 "Source code on GitHub")

Class to encapsulate some 
rules about how DataSet fields are 
structured and typed.

## DataPresentationUtil

[src/DataPresentationUtil.js:9-199](https://github.com/seabourne/nxus-dataset/blob/1d1b1188e30e14c839cbbcae6f847526dfb47b2c/src/DataPresentationUtil.js#L9-L199 "Source code on GitHub")

Utility methods for extracting and formatting data returned by raw queries,
and for converting between various representations of that data.

### extractDataForPresentation

[src/DataPresentationUtil.js:30-39](https://github.com/seabourne/nxus-dataset/blob/1d1b1188e30e14c839cbbcae6f847526dfb47b2c/src/DataPresentationUtil.js#L30-L39 "Source code on GitHub")

Extract data relevant to the DataPresentation from collections of DataSet's and DataRow's.
Creates a normalized DataPresentation data-object, with header info from the presentation and all matching DataRows trimmed to just the fields needed.

**Parameters**

-   `presentation` **DataPresentation** 
-   `datasets`  
-   `datarows`  

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** with properties:-   `name` - name of the presentation;
-   `id` - ID of the presentation;
-   `label` - label of the presentation;
-   `fields` - object indexed by the presentation field-ids, also including any referenced DataSet primary key fields;
    values are the field data from DataSet. See [DataPresentationUtil#createFieldsIndexedById](#datapresentationutilcreatefieldsindexedbyid).
-   `data` - array of DataRow records, transformed to use the unique field-id's as property names. 
    Records hold only values that are selected in the presentation, plus any defined primary-key fields. See createDataRowsForFields.

### createDataRowsForFields

[src/DataPresentationUtil.js:50-75](https://github.com/seabourne/nxus-dataset/blob/1d1b1188e30e14c839cbbcae6f847526dfb47b2c/src/DataPresentationUtil.js#L50-L75 "Source code on GitHub")

Create list of data objects, with properties set to the field-id's to prevent naming conflicts.
The returned data will include just these field values, along with any fields marked isPrimaryKey=true

**Parameters**

-   `fieldIdList` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** the field-id values to filter from supplied datasets & datarows
-   `datasets` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** DataSet objects, containing a 'fields' property which holds field object
-   `datarows` **\[type]** DataRow objects to filter

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** Transformed DataRow objects, with properties set to the field-id's.

### createFieldsIndexedById

[src/DataPresentationUtil.js:93-108](https://github.com/seabourne/nxus-dataset/blob/1d1b1188e30e14c839cbbcae6f847526dfb47b2c/src/DataPresentationUtil.js#L93-L108 "Source code on GitHub")

Pull field info for fields matching the field-id's in the supplied fieldIdList,
and reformat into an object indexed by those field-id's.

**Parameters**

-   `fieldIdList` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** the field-id's to select
-   `datasets` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** array of DataSet objects holding fields, with name, id, etc.
-   `datarows` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** field information from DataSet, indexed by field-id. Each field-id holds
an object with properties:-   `name` the original column name uploaded into the referenced DataSet
-   `id` unique ID for the field
-   `label` readable label for display
-   `type` one of {@module ./fieldUtils#FIELD_TYPES}
-   `isPrimaryKey` boolean `true` if this is designated primary key
-   `isVisible` boolean hint to display pages whether to show this in rendered data listings
-   `dataset` ID of the DataSet for this field

### formatPresentationDataByFieldLabel

[src/DataPresentationUtil.js:117-123](https://github.com/seabourne/nxus-dataset/blob/1d1b1188e30e14c839cbbcae6f847526dfb47b2c/src/DataPresentationUtil.js#L117-L123 "Source code on GitHub")

reformat array of presentationData objects

**Parameters**

-   `presentationData` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** objects per extractDataForPresentation()

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** array of (new) presentationData objects where
 the normalized rows in each presentationData.data
 have properties set to the field label. See [DataPresentationUtil#formatDataWithFieldLabel](#datapresentationutilformatdatawithfieldlabel).

### formatDataWithFieldLabel

[src/DataPresentationUtil.js:131-151](https://github.com/seabourne/nxus-dataset/blob/1d1b1188e30e14c839cbbcae6f847526dfb47b2c/src/DataPresentationUtil.js#L131-L151 "Source code on GitHub")

reformat presentationData.data

**Parameters**

-   `presentationData` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** per [DataPresentationUtil#extractDataForPresentation](#datapresentationutilextractdataforpresentation)

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** a new copy of presentationData with `data` property 
  transformed into rows with property keys set to the field label.

### indexPresentationDataByPrimaryKeyValue

[src/DataPresentationUtil.js:158-164](https://github.com/seabourne/nxus-dataset/blob/1d1b1188e30e14c839cbbcae6f847526dfb47b2c/src/DataPresentationUtil.js#L158-L164 "Source code on GitHub")

reformat array of presentation data using indexDataIntoObjectByPrimaryKeyValue()

**Parameters**

-   `presentationData` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** objects in normalized form per [DataPresentationUtil#extractDataForPresentation](#datapresentationutilextractdataforpresentation)

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** formatted according to [DataPresentationUtil#indexDataIntoObjectByPrimaryKeyValue](#datapresentationutilindexdataintoobjectbyprimarykeyvalue)

### indexDataIntoObjectByPrimaryKeyValue

[src/DataPresentationUtil.js:173-198](https://github.com/seabourne/nxus-dataset/blob/1d1b1188e30e14c839cbbcae6f847526dfb47b2c/src/DataPresentationUtil.js#L173-L198 "Source code on GitHub")

reformat the 'data' rows in the supplied presentation data into a single
object with properties set to the value of primary key field in each row.

**Parameters**

-   `presentationData` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** per [DataPresentationUtil#extractDataForPresentation](#datapresentationutilextractdataforpresentation)

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** presentationData with `data` property transformed into a single object,
 with keys of each distinct primary key value, grouping all data for that primary key value.
