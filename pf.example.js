module.exports.pf = [
  {
    'name': 'Name of container 1',
    'nav': {
      'last': 100.00, // last net asset value
      // previous nav at end of quarter, semester or year
      '2018-06-30': 100.00,
      '2018-03-31': 100.00,
      '2017-12-31': 100.00,
      '2017-09-30': 100.00,
      '2017-06-30': 100.00,
      '2017-03-31': 100.00,
      '2016-12-31': 100.00,
    },
    'flows': [
      {
        // example of one shot flow
        'date' : '2013-03-29',
        'cost': -1 // negative flow is an investment
      },{
        // example of one shot flow
        'date' : '2014-03-29',
        'cost': 1 // positive flow is a withdrowal
      },{
        // example of recuring flow
        'recur' : true,
        'start_date' : '2007-10-05',
        'end_date' : '2008-01-05',
        'period' : 'quarterly', // or yearly or monthly
        'cost': -150
      }
    ]
  },
  {
    'name': 'Name of container 2',
    'nav': {
      'last': 1000,
      '2018-06-30': 1019.02,
      '2018-03-31': 995.66
    },
    'flows': [
      {
        'date' : '2017-06-14',
        'cost': -1000
      }
    ]
  }
];
