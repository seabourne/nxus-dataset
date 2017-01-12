# nxus-dataset

## extractDataForPresentation

Extract data relevant to the DataPresentation from collections of DataSet's and DataRow's.
Creates a normalized DataPresentation data-object, with header info from the presentation and all matching DataRows trimmed to just the fields needed.

**Parameters**

-   `presentation` **DataPresentation** 
-   `datasets`  
-   `datarows`  

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** with properties:
  name - name of the presentation;
  id - ID of the presentation;
  label - label of the presentation;
  fields - object with properties the DataPresentation field-ids including referenced DataSet primary key fields;
   values are the field data from DataSet. See createFieldsIndexedById.
  data - array of DataRow records, transformed to use the unique field-id's as property names. 
  Records hold only values that are selected in the presentation, plus any defined primary-key fields. See createDataRowsForFields.

## createDataRowsForFields

Create list of data objects, with properties set to the field-id's to prevent naming conflicts.
The returned data will include just these field values, along with any fields marked isPrimaryKey=true

**Parameters**

-   `fieldIdList` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** the field-id values to filter from supplied datasets & datarows
-   `datasets` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** DataSet objects, containing a 'fields' property which holds field object
-   `datarows` **\[type]** DataRow objects to filter

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** Transformed DataRow objects, with properties set to the field-id's.

## createFieldsIndexedById

Pull field info for fields matching the field-id's in the supplied fieldIdList,
and reformat into an object indexed by those field-id's.

**Parameters**

-   `fieldIdList` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** the field-id's to select
-   `datasets` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** array of DataSet objects holding fields, with name, id, etc.
-   `datarows` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** field information from DataSet, indexed by field-id.

## formatPresentationDataByFieldLabel

reformat array of presentationData objects

**Parameters**

-   `presentationData` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** objects per extractDataForPresentation()

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** array of (new) presentationData objects where
 the normalized rows in each presentationData.data
 have properties set to the field label. See formatDataWithFieldLabel()

## formatDataWithFieldLabel

reformat presentationData.data

**Parameters**

-   `presentationData` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** [description]

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** a new copy of presentationData with 'data' 
  transformed into rows with property keys set to the field label.

## indexPresentationDataByPrimaryKeyValue

reformat array of presntation data using indexDataIntoObjectByPrimaryKeyValue()

**Parameters**

-   `presentationData` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** objects per extractDataForPresentation()

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** 

## indexDataIntoObjectByPrimaryKeyValue

reformat the 'data' rows in the supplied presentation data into a single
object with properties set to the value of primary key field in each row.

**Parameters**

-   `presentationData` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** per extractDataForPresentation()

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** new data object where the presentationData.data
is transformed with properties set to primary key value(s) for each record in the source data array.

## guessType

best guess typing for supplied value.

**Parameters**

-   `val`  
-   `name` **\[[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)](default '')** column header or hint as to type.

## buildFieldInfo

Based on supplied data row, build array of field info objects
which include a unique field-id for each property on the row.

**Parameters**

-   `sample` **datarow** representative row of data

## loadPresentations

Gather DataPresentation objects returned by the given query,
returning normalized data for each in an arry

**Parameters**

-   `query` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** WaterLine query on DataPresentation model
-   `rowKeyValues`  

## loadFields

Load data for the supplied list of fields. If 'rowKeyValues' is supplied then limit returned data to 
primary key rows with that value or values.

**Parameters**

-   `fields`  
-   `rowKeyValues`  

Returns **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** Has just the 'data' and 'fields' properties per `loadPresentations()`
