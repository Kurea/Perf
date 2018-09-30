// ask user for wanted value
// 1. from origin --> todays valuation
// 2. YTD : Year to date --> 1/1 valuation, todays valuation
// 3. PYTD : previous year to date --> 1/1/N-1 valuation, same date last year valuation
// 4. YOY : Year over Year (same date) --> same date last year valuation, todays valuation
// 5. Last Year --> 1/1/N-1 and 31/12/N-1 valuations
// 6. QTD : Month to date --> 1/M valuation, todays valuation
// 7. PQTD : Previous month to date --> 1/M-1 and same day last month valuation
// 8. QOQ : Month over Month --> same day last month valuation and todays valuation
// 9. Last Quarter --> 1/M-1 and last day M-1 valuation

// list of valuations needed
//  - today
//  - 1/M
//  - last day of M-1
//  - same day M-1
//  - 1/M-1
//  - 1/1/N
//  - 31/12/N-1
//  - same date N-1
//  - 1/1/N-1

const pf = require('../pf');
const yCalc = require('./yield');

// display value as percent
const displayAsPercent = (value) => {
  return parseFloat(value*100).toFixed(2)+' %';
};

const calcAndDisplay = (name, navs, flows, startDate, endDate = 'last') => {
  if(navs[endDate] && navs[startDate]) {
    var end = (endDate == 'last') ? new Date(): new Date(endDate);
    name = (name.length < 10) ? name+'\t':name;
    console.log(name + '\t: \t' + displayAsPercent(yCalc.getYield(flows, navs[endDate], navs[startDate],end,new Date(startDate))));
  }
};

var tv, flows, y;

pf.pf.forEach(function(data){
  console.log('Results for '+ data.name);
  console.log('----------------------------------');
  flows = yCalc.convertToFlow(data.flows);
  console.log('from origin\t: \t' + displayAsPercent(yCalc.getYield(flows, data.nav['last'])));
  calcAndDisplay('YTD', data.nav, flows, '2017-12-31');
  calcAndDisplay('prev. year', data.nav, flows, '2016-12-31', '2017-12-31');
  calcAndDisplay('QTD', data.nav, flows, '2018-06-30');
  calcAndDisplay('prev. quarter', data.nav, flows, '2018-03-31', '2018-06-30');
  calcAndDisplay('prev. semester', data.nav, flows, '2017-12-31', '2018-06-30');
  console.log('');
});
