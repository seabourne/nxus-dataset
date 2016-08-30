/*
 * tests for nxus-dataset
 */
'use strict';

import TestApp from 'nxus-core/lib/test/support/TestApp';
import DataPresentation from '../src/models/DataPresentation'
import assert from 'assert'

describe( "Data Methods", () => {
  var app;
  beforeEach( () => {
    app = new TestApp();
  })

  describe("DataPresentation", () => {
    it("data-presentation extract; dataset and datarow without PK", (done) => {
      let testSets = [ 
        {name: "test1", id: 123, fields: [ {name: 'hit', id: '103'}, {name: 'miss', id: '104'} ]},
        {name: "test2", id: 456, fields: [ {name: 'hit', id: '106'}, {name: 'miss', id: '105'} ]}
      ];
      let testRows = [
        {hit: 3.1, miss: 3.2, id:1, dataset: 123},
        {hit: 3.5, miss: 2.6, id:2, dataset: 456},
        {flack1: 0.7, flack2: 0.6, id: 3, dataset: 123}
      ];
      let testPresentation = {
        name: 'test', id: '888', label: 'testing', 
        fieldIds:['103', '105']
      }
      let checkData = DataPresentation.extractUsingFieldIds(testPresentation, 
        testSets, 
        testRows)
      console.log( "check: ", checkData)
      //expect 2 rows back: hit:3.1 and miss:2.6
      assert.equal( checkData.data.length, 2)
      assert.equal( checkData.data[0].hit, 3.1)
      assert.equal( checkData.data[0].fieldId, '103')
      assert.equal( checkData.data[1].miss, 2.6)
      done()
    })
  it("data-presentation extract with PK field", (done) => {
      let testSets = [ 
        {name: "test1", id: 123, fields: [ {name: 'pk', id: '1001', primaryKey: true}, {name: 'that', id: '104'} ]},
      ];
      let testRows = [
        {pk: 999, miss: 3.2, id:1, dataset: 123},
        {pk: 998, that: 2.6, id:2, dataset: 123},
        {pk: 997, flack1: 1.7, flack2: 1.6, id: 3, dataset: 123}
      ];
      let testPresentation = {
        name: 'test2', id: '888', label: 'testing2', 
        fieldIds:[ '104']
      }
      let checkData = DataPresentation.extractUsingFieldIds(testPresentation, 
        testSets, 
        testRows)
      console.log( "check2: ", checkData)
      //expect 1 rows back
      assert.equal( checkData.data.length, 1)
      assert.equal( checkData.data[0].pk, 998)
      assert.equal( checkData.data[0].fieldId, '104')
      assert.equal( checkData.data[0].that, 2.6)
      done()
    })
  })
});