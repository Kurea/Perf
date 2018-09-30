/* global it, describe */
var rewire = require('rewire');
var assert = require('assert');
var funct = rewire('../src/yield.js');

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
        assert.deepStrictEqual( value[0], daysBetween(value[1], value[2]));
      });

    });
  });

  describe('#ponderateFlow()', function() {
    // FP = flow * (nb days in period - nb days before flow)/ nb days in period
    var ponderateFlow = funct.__get__('ponderateFlow');
    var typeTest = [
      [0, new Date('2017-06-01'), 1000, new Date('2017-06-01'), new Date('2017-06-01')],
      [1000, new Date('2017-06-01'), 1000, new Date('2017-06-01'), new Date('2017-07-01')],
      [0, new Date('2017-06-01'), 1000, new Date('2017-06-02'), new Date('2017-06-02')],
      [1000*(31-31)/31, new Date('2017-06-01'), 1000, new Date('2017-05-01'), new Date('2017-06-01')],
      [1000*(61-31)/61, new Date('2017-06-01'), 1000, new Date('2017-05-01'), new Date('2017-07-01')],
    ];

    typeTest.forEach(function(value) {
      it('should return ' + value[0] + ' when flowDate is ' + value[1] + ' and flowCost is ' + value[2] + ' between ' + value[3] + ' and ' + value[4], function() {
        assert.deepStrictEqual( value[0], ponderateFlow(value[1], value[2], value[3], value[4]));
      });

    });
  });
});
