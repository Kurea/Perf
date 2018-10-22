/* global it, describe */
const rewire = require('rewire');
const expect = require('chai').expect;
const funct = rewire('../src/yield.ts');

describe('Yield functions', function() {
  describe('#ponderateFlow()', function() {
    // FP = flow * (nb days in period - nb days before flow)/ nb days in period
    let ponderateFlow = funct.__get__('ponderateFlow');
    let typeTest = [
      [0, new Date('2017-06-01'), 1000, new Date('2017-06-01'), new Date('2017-06-01')],
      [1000, new Date('2017-06-01'), 1000, new Date('2017-06-01'), new Date('2017-07-01')],
      [0, new Date('2017-06-01'), 1000, new Date('2017-06-02'), new Date('2017-06-02')],
      [1000*(31-31)/31, new Date('2017-06-01'), 1000, new Date('2017-05-01'), new Date('2017-06-01')],
      [1000*(61-31)/61, new Date('2017-06-01'), 1000, new Date('2017-05-01'), new Date('2017-07-01')],
    ];

    typeTest.forEach(function(value) {
      it('should return ' + value[0] + ' when flowDate is ' + value[1] + ' and flowCost is ' + value[2] + ' between ' + value[3] + ' and ' + value[4], function() {
        expect(ponderateFlow(value[1], value[2], value[3], value[4])).to.deep.equal(value[0]);
      });

    });
  });

  // TODO: getYield

  
  describe('#convertToAnualizedIRR()', function() {
    // FP = flow * (nb days in period - nb days before flow)/ nb days in period
    let convertToAnualizedIRR = funct.convertToAnualizedIRR;
    let typeTest = [
      [0.1, 0.1, new Date('2017-06-01'), new Date('2018-06-01')],
      [Math.pow(1.10,0.5)-1, 0.10, new Date('2017-06-01'), new Date('2019-06-01')],
    ];

    typeTest.forEach(function(value) {
      it('should return ' + value[0] + ' when globalYield is ' + value[1] + ' between ' + value[2] + ' and ' + value[3], function() {
        expect(convertToAnualizedIRR(value[1], value[2], value[3])).to.be.closeTo(value[0], 0.001);
      });

    });
  });

  describe('#convertToFlow()', function() {
    // FP = flow * (nb days in period - nb days before flow)/ nb days in period
    let convertToFlow = funct.convertToFlow;
    let typeTest = [
      [
        [{
          'date' : new Date('2017-06-14'),
          'cost': -1000
        }],
        [{
          'date' : new Date('2017-06-14'),
          'cost': -1000
        }]
      ],
      [
        [{
          'date' : new Date('2007-10-05'),
          'cost': -150
        },{
          'date' : new Date('2008-01-05'),
          'cost': -150
        }],
        [{
          'recur' : true,
          'start_date' : '2007-10-05',
          'end_date' : '2008-01-05',
          'period' : 'quarterly',
          'cost': -150
        }]
      ],
      [
        [{
          'date' : new Date('2007-10-05'),
          'cost': -150
        },{
          'date' : new Date('2008-01-05'),
          'cost': -150
        },{
          'date' : new Date('2017-06-14'),
          'cost': -1000
        }],
        [{
          'recur' : true,
          'start_date' : '2007-10-05',
          'end_date' : '2008-01-05',
          'period' : 'quarterly',
          'cost': -150
        },{
          'date' : new Date('2017-06-14'),
          'cost': -1000
        }]
      ],
    ];

    typeTest.forEach(function(value) {
      it('should return ' + JSON.stringify(value[0]) + ' when flow is ' + JSON.stringify(value[1]), function() {
        expect(convertToFlow(value[1])).to.deep.equal(value[0]);
      });

    });
  });

  describe('#sortFlows()', function() {
    let sortFlows = funct.__get__('sortFlows');
    let typeTest = [
      [[ {'date': new Date('2017-06-01'), 'cost': 100}, {'date': new Date('2018-06-01'), 'cost': 100} ],
        [ {'date': new Date('2017-06-01'), 'cost': 100}, {'date': new Date('2018-06-01'), 'cost': 100} ]],
      [[ {'date': new Date('2017-06-01'), 'cost': 100}, {'date': new Date('2018-06-01'), 'cost': 100} ],
        [ {'date': new Date('2018-06-01'), 'cost': 100}, {'date': new Date('2017-06-01'), 'cost': 100} ]],
    ];

    typeTest.forEach(function(value) {
      it('should return ' + value[0] + ' when data is ' + JSON.stringify(value[1]), function() {
        expect(sortFlows(value[1])).to.deep.equal(value[0]);
      });

    });
  });

  describe('#totalInvest()', function() {
    let totalInvest = funct.totalInvest;
    let typeTest = [
      [-200, [ {'date': new Date('2017-06-01'), 'cost': -100}, {'date': new Date('2018-06-01'), 'cost': -100} ]],
      [-100, [ {'date': new Date('2017-06-01'), 'cost': -100}, {'date': new Date('2018-06-01'), 'cost': 100} ]],
      [0, [ {'date': new Date('2017-06-01'), 'cost': 100}, {'date': new Date('2018-06-01'), 'cost': 100} ]],
    ];

    typeTest.forEach(function(value) {
      it('should return ' + value[0] + ' when data is ' + JSON.stringify(value[1]), function() {
        expect(totalInvest(value[1])).to.deep.equal(value[0]);
      });

    });
  });

  describe('#recur2Flow()', function() {
    // FP = flow * (nb days in period - nb days before flow)/ nb days in period
    let recur2Flow = funct.__get__('recur2Flow');
    let typeTest = [
      [
        [{
          'date' : new Date('2007-10-05'),
          'cost': -150
        },{
          'date' : new Date('2008-01-05'),
          'cost': -150
        }],
        {
          'recur' : true,
          'start_date' : '2007-10-05',
          'end_date' : '2008-01-05',
          'period' : 'quarterly',
          'cost': -150
        }
      ],
      [
        [{
          'date' : new Date('2007-10-05'),
          'cost': -150
        },{
          'date' : new Date('2007-11-05'),
          'cost': -150
        },{
          'date' : new Date('2007-12-05'),
          'cost': -150
        }],
        {
          'recur' : true,
          'start_date' : '2007-10-05',
          'end_date' : '2007-12-05',
          'period' : 'monthly',
          'cost': -150
        }
      ],
      [
        [{
          'date' : new Date('2007-10-05'),
          'cost': -150
        },{
          'date' : new Date('2008-10-05'),
          'cost': -150
        }],
        {
          'recur' : true,
          'start_date' : '2007-10-05',
          'end_date' : '2008-12-05',
          'period' : 'yearly',
          'cost': -150
        }
      ]
    ];

    typeTest.forEach(function(value) {
      it('should return ' + JSON.stringify(value[0]) + ' when flow is ' + JSON.stringify(value[1]), function() {
        expect(recur2Flow(value[1])).to.deep.equal(value[0]);
      });

    });
  });

});
