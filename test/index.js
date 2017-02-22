/*
 * tests for nxus-dataset
 */
'use strict';

import assert from 'assert'
import _ from 'underscore'

import DataPresentationUtil from '../src/DataPresentationUtil'

describe( "Util Methods ", () => {
  var utilsUnderTest;
  beforeEach( () => {
    utilsUnderTest = new DataPresentationUtil()
  })

  describe("DataPresentation", () => {
    it("extractDataForPresentation data check; dataset and datarow without PK", (done) => {
      
      let checkData = utilsUnderTest.extractDataForPresentation(NO_PRIMARY_KEY_TEST_DATA.testPresentation, 
        NO_PRIMARY_KEY_TEST_DATA.testSets, 
        NO_PRIMARY_KEY_TEST_DATA.testRows)
      // console.log( "no PK check: <<---\n", checkData, "\n--->>")
      assert.equal(checkData.data.length, NO_PRIMARY_KEY_EXPECT_DATA.length)
      NO_PRIMARY_KEY_EXPECT_DATA.forEach( (expectedObj, index) => {
        assert.ok(_.findWhere(checkData.data, expectedObj), 'data contains expected obj at index ' + index )
        let commonFieldIds = _.intersection(_.keys(checkData.fields), _.keys(expectedObj))
        assert.ok(commonFieldIds, 'found matches for ' + _.keys(expectedObj))
        assert.equal(commonFieldIds.length, _.keys(expectedObj).length, ' all keys matched OK ' + index)
      })
      done()
    })
    it("extractDataForPresentation data check; with PK field", (done) => {
      let checkData = utilsUnderTest.extractDataForPresentation(TEST_DATA_WITH_PRIMARY_KEY.testPresentation, 
        TEST_DATA_WITH_PRIMARY_KEY.testSets, 
        TEST_DATA_WITH_PRIMARY_KEY.testRows)
      //console.log( "PK check: <<---\n", checkData, "\n--->>")
      assert.equal(checkData.data.length, PRIMARY_KEY_EXPECT_DATA.length, 'got expected PK data length OK')
      PRIMARY_KEY_EXPECT_DATA.forEach( (expectedObj, index) => {
        assert.ok(_.findWhere(checkData.data, expectedObj), 'pk data contains expected obj at index ' + index )
      })
      done()
    })
    it("data-presentation index by single PK field", (done) => {
      let presentData = utilsUnderTest.extractDataForPresentation(TEST_DATA_WITH_PRIMARY_KEY.testPresentation, 
        TEST_DATA_WITH_PRIMARY_KEY.testSets, 
        TEST_DATA_WITH_PRIMARY_KEY.testRows)
      let indexedTestData = utilsUnderTest.indexDataIntoObjectByPrimaryKeyValue(presentData)
      //console.log( "indexed data with 1 PK: ", indexedTestData)
      assert.equal(_.keys(indexedTestData.data).length, _.keys(INDEXED_PRIMARY_KEY_EXPECT_DATA_SCATTERED).length)
      _.keys(INDEXED_PRIMARY_KEY_EXPECT_DATA_SCATTERED).forEach( (key, index) => {
        assert.ok(indexedTestData.data[key], 'found indexed data for pk value ' + key )
        assert.ok(_.isEqual(indexedTestData.data[key], INDEXED_PRIMARY_KEY_EXPECT_DATA_SCATTERED[key]), 'expected indexed data for pk value ' + key)
      })
      done()
    })
    it("data-presentation formatted by field label, single PK field", (done) => {
      let presentData = utilsUnderTest.extractDataForPresentation(TEST_DATA_WITH_PRIMARY_KEY.testPresentation, 
        TEST_DATA_WITH_PRIMARY_KEY.testSets, 
        TEST_DATA_WITH_PRIMARY_KEY.testRows)
      let formattedData = utilsUnderTest.formatDataWithFieldLabel(presentData)
      //console.log( "formatted by name data with 1 PK: <<---\n", formattedData, "\n--->>")
      assert.equal(formattedData.data.length, FIELD_LABELS_PRIMARY_KEY_EXPECT_DATA.length)
      FIELD_LABELS_PRIMARY_KEY_EXPECT_DATA.forEach( (expectedObj, index) => {
        assert.ok(_.findWhere(formattedData.data, expectedObj), 'formatted data contains expected obj at index ' + index )
      })
      done()
    })
  })
})



describe( "Util Methods with scattered data", () => {
  var utilsUnderTestScatterData;
  beforeEach( () => {
    utilsUnderTestScatterData = new DataPresentationUtil({scatterRowData: true,})
  })

  describe("DataPresentation", () => {
    it("data-presentation extract; dataset and datarow without PK", (done) => {
      
      let checkData = utilsUnderTestScatterData.extractDataForPresentation(NO_PRIMARY_KEY_TEST_DATA.testPresentation, 
        NO_PRIMARY_KEY_TEST_DATA.testSets, 
        NO_PRIMARY_KEY_TEST_DATA.testRows)
      // console.log( "no PK check: <<---\n", checkData, "\n--->>")
      //expect 'data' to be  NO_PRIMARY_KEY_EXPECT_DATA_SCATTERED
      assert.equal(checkData.data.length, NO_PRIMARY_KEY_EXPECT_DATA_SCATTERED.length)
      NO_PRIMARY_KEY_EXPECT_DATA_SCATTERED.forEach( (expectedObj, index) => {
        assert.ok(_.findWhere(checkData.data, expectedObj), 'data contains expected obj at index ' + index )
        let commonFieldIds = _.intersection(_.keys(checkData.fields), _.keys(expectedObj))
        assert.ok(commonFieldIds, 'found matches for ' + _.keys(expectedObj))
        assert.equal(commonFieldIds.length, _.keys(expectedObj).length, ' all keys matched OK ' + index)
      })
      done()
    })
    it("data-presentation extract with PK field", (done) => {
      let checkData = utilsUnderTestScatterData.extractDataForPresentation(TEST_DATA_WITH_PRIMARY_KEY.testPresentation, 
        TEST_DATA_WITH_PRIMARY_KEY.testSets, 
        TEST_DATA_WITH_PRIMARY_KEY.testRows)
      //console.log( "PK check: <<---\n", checkData, "\n--->>")
      assert.equal(checkData.data.length, PRIMARY_KEY_EXPECT_DATA_SCATTERED.length, 'got expected PK data length OK')
      PRIMARY_KEY_EXPECT_DATA_SCATTERED.forEach( (expectedObj, index) => {
        assert.ok(_.findWhere(checkData.data, expectedObj), 'data contains expected obj at index ' + index )
      })
      done()
    })
    it("data-presentation index by single PK field", (done) => {
      let presentData = utilsUnderTestScatterData.extractDataForPresentation(TEST_DATA_WITH_PRIMARY_KEY.testPresentation, 
        TEST_DATA_WITH_PRIMARY_KEY.testSets, 
        TEST_DATA_WITH_PRIMARY_KEY.testRows)
      let indexedTestData = utilsUnderTestScatterData.indexDataIntoObjectByPrimaryKeyValue(presentData)
      //console.log( "indexed data with 1 PK: ", indexedTestData)
      assert.equal(_.keys(indexedTestData.data).length, _.keys(INDEXED_PRIMARY_KEY_EXPECT_DATA_SCATTERED).length)
      _.keys(INDEXED_PRIMARY_KEY_EXPECT_DATA_SCATTERED).forEach( (key, index) => {
        assert.ok(indexedTestData.data[key], 'found indexed data for pk value ' + key )
        assert.ok(_.isEqual(indexedTestData.data[key], INDEXED_PRIMARY_KEY_EXPECT_DATA_SCATTERED[key]), 'expected indexed data for pk value ' + key)
      })
      done()
    })
    it("data-presentation formatted by field label, single PK field", (done) => {
      let presentData = utilsUnderTestScatterData.extractDataForPresentation(TEST_DATA_WITH_PRIMARY_KEY.testPresentation, 
        TEST_DATA_WITH_PRIMARY_KEY.testSets, 
        TEST_DATA_WITH_PRIMARY_KEY.testRows)
      let formattedData = utilsUnderTestScatterData.formatDataWithFieldLabel(presentData)
      //console.log( "formatted by name data with 1 PK: <<---\n", formattedData, "\n--->>")
      assert.equal(formattedData.data.length, FIELD_LABELS_PRIMARY_KEY_EXPECT_DATA_SCATTERED.length)
      FIELD_LABELS_PRIMARY_KEY_EXPECT_DATA_SCATTERED.forEach( (expectedObj, index) => {
        assert.ok(_.findWhere(formattedData.data, expectedObj), 'formatted data contains expected obj at index ' + index )
      })
      done()
    })
  })
});

const TEST_DATA_WITH_PRIMARY_KEY = {
  testSets: [ 
    {name: "test1", id: 123,
     fields: [ {name: 'pk1', label: 'pk1', id: '1001', isPrimaryKey: true}, 
     {name: 'that', label: 'thatsit', id: '104'}, 
     {name: 'miss', label: 'miss', id: '103'}]
    },
    {name: "test2", id: 124,
     fields: [ {name: 'pk1', label: 'pk2', id: '1002', isPrimaryKey: true},
      {name: 'another', label: 'another', id: '105'},
      {name: 'yetanother', label: 'yet-another', id: '106'} 
       ]
    }
  ],
  testRows: [
    {pk1: 999, that: 3.2, id:1, dataset: 123},
    {pk1: 998, that: 2.6, id:2, dataset: 123},
    {pk1: 997, another: 1.7, yetanother: 1.8, id: 3, dataset: 124},
  ],
  testPresentation: {
    name: 'test2', id: '888', label: 'testing2', 
    fieldIds:[ '104', '105', '106']
  }
}
const PRIMARY_KEY_EXPECT_DATA_SCATTERED = [ { '104': 3.2, '1001': 999 }, { '104': 2.6, '1001': 998 }, { '105': 1.7, '1002': 997 }, { '106': 1.8, '1002': 997 } ] 
const PRIMARY_KEY_EXPECT_DATA = [ { '104': 3.2, '1001': 999 }, { '104': 2.6, '1001': 998 }, { '105': 1.7, '106': 1.8, '1002': 997 } ] 
 
const INDEXED_PRIMARY_KEY_EXPECT_DATA = { '999': {'104': 3.2, '1001': 999}, '998': {'104': 2.6, '1001': 998}, '997': { '105': 1.7, '106': 1.8, '1002': 997 } }
const INDEXED_PRIMARY_KEY_EXPECT_DATA_SCATTERED = INDEXED_PRIMARY_KEY_EXPECT_DATA
const FIELD_LABELS_PRIMARY_KEY_EXPECT_DATA = [ { 'thatsit': 3.2, 'pk1': 999 }, { 'thatsit': 2.6, 'pk1': 998 }, { 'another': 1.7, 'yet-another': 1.8, 'pk2': 997 } ] 
const FIELD_LABELS_PRIMARY_KEY_EXPECT_DATA_SCATTERED = [ { 'thatsit': 3.2, 'pk1': 999 }, { 'thatsit': 2.6, 'pk1': 998 }, { 'another': 1.7, 'pk2': 997 }, { 'yet-another': 1.8, 'pk2': 997 } ] 

const NO_PRIMARY_KEY_TEST_DATA = {
  testSets: [ 
    {name: "test1", id: 123, fields: [ {name: 'hit', id: '103'}, {name: 'miss', id: '104'}, {name: 'alt', id: '107'} ]},
    {name: "test2", id: 456, fields: [ {name: 'nada', id: '106'}, {name: 'hit', id: '105'} ]}
  ],
  testRows: [
    {hit: 3.1, miss: 3.2, alt: 3.3, id:1, dataset: 123},
    {hit: 3.5, nada: 2.6, id:2, dataset: 456},
    {flack1: 0.7, flack2: 0.6, id: 3, dataset: 123},
  ],
  testPresentation: {
    name: 'test', id: '888', label: 'testing', 
    fieldIds:['103', '105', '107']
  }
}
const NO_PRIMARY_KEY_EXPECT_DATA_SCATTERED = [ { '103': 3.1 }, { '107': 3.3 }, { '105': 3.5 } ]
const NO_PRIMARY_KEY_EXPECT_DATA = [ { '103': 3.1, '107': 3.3 }, { '105': 3.5 } ]