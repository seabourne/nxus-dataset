# nxus-dataset release notes

### Release 4.0.1
   * adds custom labels for fields to a `datasets-datapresentation`, which override the labels imported from `datasets-dataset` 
   * adds a sub-heading field to `datasets-datapresentation` for use in visualizations

#### Migrating from earlier versions

This changes the data held in a `datasets-datapresentation`. Previous revision stored just an array of field-id's from the datasets; now we store an array of field-objects under a new property, `fields`. This requires a transform of existing mongo data in the `datasets-datapresentation` collection. See the *migrations/mongo_data_4.0.1* javascript for a script which will accomplish this.