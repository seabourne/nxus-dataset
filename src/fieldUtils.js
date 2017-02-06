'use strict';

import _ from 'underscore'
import nodeUUID from 'node-uuid'
import morph from 'morph'

export const INTEGER_TYPE = 'integer'
export const STRING_TYPE = 'string'
export const DECIMAL_TYPE = 'decimal'
export const PERCENT_TYPE = 'percent'
export const FIELD_TYPES = [INTEGER_TYPE,STRING_TYPE,DECIMAL_TYPE,PERCENT_TYPE]
export const FIELD_DEFAULTS = { 
  "name":"", "id":"", 
  "isPrimaryKey":false, 
  "isVisible":true, 
  "label":"", 
  "type":DECIMAL_TYPE
}
/**
 * Class to encapsulate some 
 * rules about how DataSet fields are 
 * structured and typed.
 */
export class FieldBuilder {

  /**
   * @private
   * best guess typing for supplied value.
   * @param  {js primative} val  sample value
   * @param  {String} name column header or hint as to type.
   * @return {one of FIELD_TYPES}      
   */
  guessType(val, name='') {
    let type = STRING_TYPE
    if (typeof(val) == 'string') {
      if (val.endsWith('%')) {
        type = PERCENT_TYPE
      } else if (! isNaN(parseFloat(val))) {
        if (-1 < val.indexOf('.')) {
          type = DECIMAL_TYPE
        } else {
          type = INTEGER_TYPE
        }
        
      }
    }
    if ( type != PERCENT_TYPE && 
      ((-1 < name.toLowerCase().indexOf('percent')) || (-1 < name.indexOf('%'))) ) {
      type = PERCENT_TYPE
    }
    return type
  }

  /**
   * @private
   * Based on supplied data row, build array of field info objects
   * which include a unique field-id for each property on the row.
   * @param  {datarow} sample representative row of data
   * @return { array of object}        intial properties for each field
   */
  buildFieldInfo(sample) {
    let fields = new Array()
    _.each(_.keys(sample), (key,index) => {
      let type = this.guessType(sample[key], key)
      if (! _.contains(["id", "dataset", "createdAt", "updatedAt"], key)) {
        let fieldObj = _.clone(FIELD_DEFAULTS)
        fieldObj.name = key
        fieldObj.id = this._generateUniqueId()
        fieldObj.label = morph.toTitle(key)
        fieldObj.type = type
        fields.push(fieldObj)
      }
    })
    return fields
  }


  _generateUniqueId() {
    return nodeUUID.v1();
  }
}
