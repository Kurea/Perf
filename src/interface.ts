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

import pf = require('../pf');
import yCalc = require('./yield');

// display value as percent
const displayAsPercent = (value: number): string => {
  let val = parseFloat((value*100).toString()).toFixed(2);
  return val.toString()+' %';
};

const calcYield = (navs: yCalc.Navs, flows: yCalc.Flow[], startDate: string, endDate: string = 'last'): number => {
  if(navs[endDate] && navs[startDate]) {
    let end = (endDate == 'last') ? new Date(): new Date(endDate);
    return yCalc.getYield(flows, navs[endDate], navs[startDate],end,new Date(startDate));
  }
};



let flows: yCalc.Flow[];
let results = <any>[];

pf.pf.forEach((data: yCalc.PFDesc): any => {
  let result = <any>{};
  result.name = data.name;
  flows = yCalc.convertToFlow(data.flows);
  result.totalInvest = yCalc.totalInvest(flows);
  result.open = flows[0]['date'];
  result.origin = yCalc.getYield(flows, data.nav['last']);
  result.annual = yCalc.convertToAnualizedIRR(result.origin, result.open, new Date());
  result.ytd = calcYield(data.nav, flows, '2017-12-31');
  result.prevy = calcYield(data.nav, flows, '2016-12-31', '2017-12-31');
  result.qtd = calcYield(data.nav, flows, '2018-06-30');
  result.prevq = calcYield(data.nav, flows, '2018-03-31', '2018-06-30');
  result.prevs = calcYield(data.nav, flows, '2017-12-31', '2018-06-30');
  results.push(result);
});

results.forEach((data: any): void => {
  console.log('Results for '+ data.name);
  console.log('----------------------------------');
  if (data.open) console.log('open on\t\t: \t' + data.open.toDateString());
  if (data.totalInvest) console.log('invest from origin: \t' + data.totalInvest);
  if (data.origin) console.log('from origin\t: \t' + displayAsPercent(data.origin));
  if (data.annual) console.log('IRR annual.\t: \t' + displayAsPercent(data.annual));
  if (data.ytd) console.log('YTD\t\t: \t' + displayAsPercent(data.ytd));
  if (data.prevy) console.log('prev. year\t: \t' + displayAsPercent(data.prevy));
  if (data.qtd) console.log('QTD\t\t: \t' + displayAsPercent(data.qtd));
  if (data.prevq) console.log('prev. quarter\t: \t' + displayAsPercent(data.prevq));
  if (data.prevs) console.log('prev. semester\t: \t' + displayAsPercent(data.prevs));
  console.log('');
});
