var Finance = require('financejs');
var pf = require('../pf');
var millisecondsPerDay = 24 * 60 * 60 * 1000;

const daysBetween = (startDate, endDate) => {
  var sd = startDate;
  var ed = endDate;
  if (startDate > endDate) {
    sd = endDate;
    ed = startDate;
  }
  return Math.round((ed - sd) / millisecondsPerDay);
};

const getArraysOfZeros = (startDate, endDate) => {
  // count nb days between actuel and next
  var nbDays = daysBetween(startDate, endDate);
  // add Trailing 0
  return Array(nbDays).fill(0);
};

/*// add to a real flows list, neutral flow to have a flow per day
// flows must be ordered by date
const getAllFlows = (flows, startDate = new Date('1990-1-1'), endDate = new Date() - millisecondsPerDay ) => {
  var allFlows = [];
  var actual = startDate;
  var next, value;
  // go to the first date after startDate and before end Date
  for (var i=0; i< flows.length; i++) {
    next = new Date(flows[i]['date']);
    value = flows[i]['cost'];
    // if we are at the end, next value is the end Date
    if (next >= actual) {
      if (next > endDate) {
        next = endDate;
        value = 0;
        i = flows.length;
      }
      allFlows = allFlows.concat(getArraysOfZeros(actual, next));
      // get Amount of flow i
      allFlows.push(value);
      // the new actual is the old next
      actual = next;
    }
  }
  if(actual < endDate) {
    allFlows = allFlows.concat(getArraysOfZeros(actual, endDate));
  }
  return allFlows;
};*/

// add to a real flows list, neutral flow to have a flow per day
// flows must be ordered by date
const getAllFlowsFromOrigin = (flows) => {
  var allFlows = [];
  var actual = new Date(flows[0]['date']);
  var next, value;
  // go to the first date after startDate and before end Date
  for (var i=0; i< flows.length; i++) {
    next = new Date(flows[i]['date']);
    value = flows[i]['cost'];
    // if we are at the end, next value is the end Date
    allFlows = allFlows.concat(getArraysOfZeros(actual, next));
    // get Amount of flow i
    allFlows.push(value);
    // the new actual is the old next
    actual = next;
  }
  return allFlows;
};

const truncateFlows = (originalFlows, allFlows, startDate, endDate = new Date() - millisecondsPerDay) => {
  var flowsStartDate = new Date(originalFlows[0]['date']);
  var flowsEndDate = new Date(originalFlows[originalFlows.length - 1]['date']);
  if(!startDate) startDate = flowsStartDate;
  var nbDaysBefore = daysBetween(startDate, flowsStartDate);
  var nbDaysAfter = daysBetween(endDate, flowsEndDate);

  // if allFlows starts before the wanted date
  if (flowsStartDate <= startDate) {
    // truncate - remove nbDaysBefore values
    allFlows.splice(0, nbDaysBefore);
  } else {
    // add zeros before
    allFlows.splice(0, 0, Array(nbDaysBefore).fill(0));
  }

  // if allFlows ends after the wanted date
  if (flowsEndDate >= endDate) {
    // truncate - remove nbDaysAfter values
    allFlows.splice(allFlows.length - nbDaysAfter, nbDaysAfter);
  } else {
    // add zeros after
    allFlows = allFlows.concat(Array(nbDaysAfter).fill(0));
  }
  return allFlows;
};

var allFlows;
allFlows = getAllFlowsFromOrigin(pf.pf.asset2.flows);

// ask user for wanted value
// 1. from origin --> todays valuation
// 2. YTD : Year to date --> 1/1 valuation, todays valuation
// 3. PYTD : previous year to date --> 1/1/N-1 valuation, same date last year valuation
// 4. YOY : Year over Year (same date) --> same date last year valuation, todays valuation
// 5. Last Year --> 1/1/N-1 and 31/12/N-1 valuations
// 6. MTD : Month to date --> 1/M valuation, todays valuation
// 7. PMTD : Previous month to date --> 1/M-1 and same day last month valuation
// 8. MOM : Month over Month --> same day last month valuation and todays valuation
// 9. Last Month --> 1/M-1 and last day M-1 valudation
allFlows = truncateFlows(pf.pf.asset2.flows, allFlows, new Date('2018-04-02'), new Date('2018-06-29'));
allFlows.splice(0,0,-995.66);
// get latest value
allFlows.push(1019.02);

var finance = new Finance();
// calculate daily IRR
var r = finance.IRR(...allFlows);
console.log(r);

// calculate period IRR --> (1+r)^n - 1 where r is daily IRR and n is nbr of day in period
console.log(allFlows.length);
var t = Math.pow(1+r/100,allFlows.length) - 1;
console.log(t);
