var rewire = require('rewire');
var assert = require('assert');
var funct = rewire('../src/alpha_api.js');

describe('Main functions', function() {
  describe('#daysBetween()', function() {
    var daysBetween = funct.__get__('daysBetween');
    var typeTest = [
      [13, new Date('2017-06-01'), new Date('2017-06-14')],
      [16, new Date('2017-06-14'), new Date('2017-06-30')],
      [29, new Date('2017-06-01'), new Date('2017-06-30')],
      [0, new Date('2017-06-14'), new Date('2017-06-14')],
      [12, new Date('2017-06-1'), new Date('2017-06-13')],
    ];

    typeTest.forEach(function(value) {
      it('should return ' + value[0] + ' when startDate is ' + value[1] + ' and endDate is ' + value[2], function() {
        assert.deepEqual( value[0], daysBetween(value[1], value[2]));
      });

    });
  });

  describe('#getAllFlows()', function() {
    var getAllFlows = funct.__get__('getAllFlows');
    var typeTest = [
      [[0,0,0,0,0,0,0,0,0,0,0,0,0,-1000], new Date('2017-06-01'), new Date('2017-06-14')],
      [[-1000,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], new Date('2017-06-14'), new Date('2017-06-30')],
      [[0,0,0,0,0,0,0,0,0,0,0,0,0,-1000,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], new Date('2017-06-01'), new Date('2017-06-30')],
      [[-1000], new Date('2017-06-14'), new Date('2017-06-14')],
      [[0], new Date('2017-06-1'), new Date('2017-06-1')],
      [[0,0,0,0,0,0,0,0,0,0,0,0,0], new Date('2017-06-1'), new Date('2017-06-13')],
    ];

    var flows = [{
      'date' : '2017-06-14',
      'cost': -1000
    }];

    typeTest.forEach(function(value) {
      it('should return ' + value[0] + ' when startDate is ' + value[1] + ' and endDate is ' + value[2], function() {
        assert.deepEqual( value[0], getAllFlows(flows, value[1], value[2]));
      });

    });
  });
});
