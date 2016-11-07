/*
 * tests for nxus-dataset
 */
'use strict';

import assert from 'assert'
import _ from 'underscore'

import DataPresentationUtil from '../src/DataPresentationUtil'

describe( "Data Methods", () => {
  var utilsUnderTest;
  beforeEach( () => {
    utilsUnderTest = new DataPresentationUtil()
  })

  describe("DataPresentation", () => {
    it("data-presentation extract; dataset and datarow without PK", (done) => {
      
      let checkData = utilsUnderTest.extractDataForPresentation(NO_PRIMARY_KEY_TEST_DATA.testPresentation, 
        NO_PRIMARY_KEY_TEST_DATA.testSets, 
        NO_PRIMARY_KEY_TEST_DATA.testRows)
      //console.log( "check: ", checkData)
      //expect 2 rows back: 103:3.1 and 105:2.6
      assert.equal(checkData.data.length, 2)
      //nb in future order may not be same as input datarows order?
      assert.equal(checkData.data[0]['103'], 3.1)
      assert.equal(checkData.data[1]['105'], 2.6)
      assert.ok(checkData.fields['103'], 'Expected 103 indexed field found OK')
      assert.ok(checkData.fields['105'], 'Expected 105 indexed field found OK')
      done()
    })
    it("data-presentation extract with PK field", (done) => {
      let checkData = utilsUnderTest.extractDataForPresentation(TEST_DATA_WITH_PRIMARY_KEY.testPresentation, 
        TEST_DATA_WITH_PRIMARY_KEY.testSets, 
        TEST_DATA_WITH_PRIMARY_KEY.testRows)
      //console.log( "check2: ", checkData)
      assert.ok(checkData.fields['1001'], 'PK field info is added to result fields')
      //expect 2 rows back
      assert.equal(checkData.data.length, 2)
      assert.equal(checkData.data[0]['1001'], 999, 'PK field is passed into result 0')
      assert.equal(checkData.data[0]['104'], 3.2, 'Got expected field value in result 0')
      assert.equal(checkData.data[1]['1001'], 998, 'PK field is passed into result 1')
      assert.equal(checkData.data[1]['104'], 2.6, 'Got expected field value in result 1')
      done()
    })
    it("data-presentation index by single PK field", (done) => {
      let presentData = utilsUnderTest.extractDataForPresentation(TEST_DATA_WITH_PRIMARY_KEY.testPresentation, 
        TEST_DATA_WITH_PRIMARY_KEY.testSets, 
        TEST_DATA_WITH_PRIMARY_KEY.testRows)
      let indexedTestData = utilsUnderTest.indexDataIntoObjectByPrimaryKeyValue(presentData)
      //console.log( "indexed data with 1 PK: ", indexedTestData)
      assert.equal(_.keys(indexedTestData.data).length, 2)
      assert.ok(indexedTestData.data['999'], 'found expected index in data for PK=999')
      assert.ok(indexedTestData.data['998'], 'found expected index in data for PK=998')
      assert.ok(! indexedTestData.data['997'], 'did NOT find index in data for PK=997')
      assert.equal(indexedTestData.data['999']['104'], 3.2, 'found expected inner value for PK 999')
      assert.equal(indexedTestData.data['998']['104'], 2.6, 'found expected inner value for PK 998')
      done()
    })
  })
});

const TEST_DATA_WITH_PRIMARY_KEY = {
  testSets: [ 
    {name: "test1", id: 123, fields: [ {name: 'pk1', id: '1001', isPrimaryKey: true}, {name: 'that', id: '104'}, {name: 'miss', id: '103'}]},
    {name: "test2", id: 124, fields: [ {name: 'pk2', id: '1002', isPrimaryKey: true}, {name: 'another', id: '105'} ]}
  ],
  testRows: [
    {pk1: 999, that: 3.2, id:1, dataset: 123},
    {pk1: 998, that: 2.6, id:2, dataset: 123},
    {pk2: 997, another: 1.7, id: 3, dataset: 124},
  ],
  testPresentation: {
    name: 'test2', id: '888', label: 'testing2', 
    fieldIds:[ '104']
  }
}

const NO_PRIMARY_KEY_TEST_DATA = {
  testSets: [ 
    {name: "test1", id: 123, fields: [ {name: 'hit', id: '103'}, {name: 'miss', id: '104'} ]},
    {name: "test2", id: 456, fields: [ {name: 'hit', id: '106'}, {name: 'miss', id: '105'} ]}
  ],
  testRows: [
    {hit: 3.1, miss: 3.2, id:1, dataset: 123},
    {hit: 3.5, miss: 2.6, id:2, dataset: 456},
    {flack1: 0.7, flack2: 0.6, id: 3, dataset: 123},
  ],
  testPresentation: {
    name: 'test', id: '888', label: 'testing', 
    fieldIds:['103', '105']
  }
}