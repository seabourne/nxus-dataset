//fieldConstants.js
'use strict';

export const INTEGER_TYPE = 'integer'
export const STRING_TYPE = 'string'
export const DECIMAL_TYPE = 'decimal'
export const PERCENT_TYPE = 'percent'
export const FIELD_TYPES = [INTEGER_TYPE,STRING_TYPE,DECIMAL_TYPE,PERCENT_TYPE]
export const FIELD_DEFAULTS = {"name":"", "id":"", "isPrimaryKey":false, "isVisible":false, "label":"", "type":DECIMAL_TYPE}