// 4.0.1 migration script
// usage:
//   mongo server:port/database mongo_data_4.0.1.js
db['datasets-datapresentation'].find().toArray().forEach(
  function(obj) {
    print( "found: ", obj.name);
    obj.fields = [];
    if (obj.fieldIds) {
      obj.fieldIds.forEach( function(f) {
        var fObj = { id: f, label: ''};
        obj.fields.push(fObj);
      })
      delete obj.fieldIds;
      db['datasets-datapresentation'].update({_id: obj._id}, obj);
    }
  }
);