### Using a Data Presentation that combines multi-row datasets with a primary key

Consider the following 2 DataSets, created with data uploaded using the admin interface provided by [nxus-admin](https://github.com/nxus/admin "Admin")

<figure>
  <figcaption><b>DataSet <i>fruitcolors</i> ID: 1 </b></figcaption>
  <table>
    <tr>
      <th>fruit name</th>
      <th>usual color</th>
    </tr>
    <tr>
      <td>apple</td>
      <td>red</td>
    </tr>
    <tr>
      <td>orange</td>
      <td>orange</td>
    </tr>
    <tr>
      <td>lemon</td>
      <td>yellow</td>
    </tr>
  </table>
</figure>

<figure>
  <figcaption><b>DataSet <i>fruitweights</i> ID: 2 </b></figcaption>
  <table>
    <tr>
      <th>fruit name</th>
      <th>count per 100#</th>
    </tr>
    <tr>
      <td>apple</td>
      <td>370</td>
    </tr>
    <tr>
      <td>orange</td>
      <td>290</td>
    </tr>
  </table>
</figure>

As part of the upload process, these 2 DataSets will be annotated with (editable) meta-data about each field. Assume that the 2 `fruit_name` fields (the field names come from data column headings) are designated as primary key fields.

A DataPresentation can be created which includes the 2 non-primary key fields `count_per_100#` from the <i>fruitweights</i> DataSet, and `usual_color` from the <i>fruitcolors</i> DataSet.
Code such as the following:

     import {datasets} from 'nxus-dataset'
     ...
     datasets.loadPresentations({name: 'Fruit Info'}).then( (presentationArr) => {
        return { data: presentationArr }
     })

if the presentation is named *Fruit Info* this would return `data` with a value such as:

<pre>
[
   {
      "name":"Fruit Info",
      "id":"588a4ec5daa0310a38852c0d",
      "label":"Fruit Facts",
      "fields":{
         "993d47e0":{
            "name":"fruit_name",
            "id":"993d47e0",
            "isPrimaryKey":true,
            "isVisible":true,
            "label":"Fruit Name",
            "type":"string",
            "dataset":"1"
         },
         "993d6ef0":{
            "name":"usual_color",
            "id":"993d6ef0",
            "isPrimaryKey":false,
            "isVisible":true,
            "label":"Usual Color",
            "type":"string",
            "dataset":"1"
         },
         "dfe6ba50":{
            "name":"fruit_name",
            "id":"dfe6ba50",
            "isPrimaryKey":true,
            "isVisible":true,
            "label":"Fruit Name",
            "type":"string",
            "dataset":"2"
         },
         "dfe6ba51":{
            "name":"count_per_100#",
            "id":"dfe6ba51",
            "isPrimaryKey":false,
            "isVisible":true,
            "label":"Count Per 100#",
            "type":"integer",
            "dataset":"2"
         }
      },
      "data":[
         {
            "993d6ef0":"red",
            "993d47e0":"apple"
         },
         {
            "993d6ef0":"orange",
            "993d47e0":"orange"
         },
         {
            "993d6ef0":"yellow",
            "993d47e0":"lemon"
         },
         {
            "dfe6ba51":"370",
            "dfe6ba50":"apple"
         },
         {
            "dfe6ba51":"290",
            "dfe6ba50":"orange"
         }
      ]
   }
]
</pre>

applying the utilty *formatPresentationDataByFieldLabel* will transform the `data` property of this presentation object:

<pre>
{
  "data": [{
    "Usual Color": "red",
    "Fruit Name": "apple"
  }, {
    "Usual Color": "orange",
    "Fruit Name": "orange"
  }, {
    "Usual Color": "yellow",
    "Fruit Name": "lemon"
  }, {
    "Count Per 100#": "370",
    "Fruit Name": "apple"
  }, {
    "Count Per 100#": "290",
    "Fruit Name": "orange"
  }]
}
</pre>

while the utility *indexPresentationDataByPrimaryKeyValue* will transform the `data` property:

<pre>
{

  "data": {
    "apple": {
      "993d6ef0": "red",
      "993d47e0": "apple",
      "dfe6ba51": "370",
      "dfe6ba50": "apple"
    },
    "orange": {
      "993d6ef0": "orange",
      "993d47e0": "orange",
      "dfe6ba51": "290",
      "dfe6ba50": "orange"
    },
    "lemon": {
      "993d6ef0": "yellow",
      "993d47e0": "lemon"
    }
  }
}
</pre>