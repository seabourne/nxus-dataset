### Using a Data Presentation that combines multi-row datasets with a primary key

Consider the following 2 DataSets, created with data uploaded using the admin interface provided by [nxus-admin](https://github.com/nxus/admin "Admin")

<figure>
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
<figcaption><b>DataSet <i>fruitcolors</i> ID: 1 </b></figcaption>
</figure>

<figure>
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
<figcaption><b>DataSet <i>fruitweights</i> ID: 2 </b></figcaption>
</figure>

As part of the upload process, these 2 DataSets will be annotated with (editable) meta-data about each field. Assume that the 2 `fruit_name` fields (from data column headings) are designated as primary key fields.

A DataPresentation can be created with non-primary key fields `count_per_100#` from the <i>fruitweights</i> DataSet, and `usual_color` from the <i>fruitcolors</i> DataSet.
A call to {@link @module:DataSets#loadPresentations} will return an array of objects; the object for this example would be:

<pre>

</pre>

