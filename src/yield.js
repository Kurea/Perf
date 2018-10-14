var millisecondsPerDay = 24 * 60 * 60 * 1000;

// number of month in different periodicities
const periodicity = {
  'monthly': 1,
  'quarterly': 3,
  'yearly': 12,
};

//return the number of days between 2 dates
const daysBetween = (startDate, endDate) => {
  return Math.round((endDate - startDate) / millisecondsPerDay);
};


// calculate ponderated flows
// FP = flow * (nb days in period - nb days before flow)/ nb days in period
const ponderateFlow = (flowDate, flowCost, startDate, endDate = new Date()) => {
  var nbDays = daysBetween(startDate, endDate);
  var nbDaysBefore = daysBetween(startDate, flowDate);
  return (nbDays == 0)? 0 : flowCost * (nbDays - nbDaysBefore) / nbDays;
};

// calculate profitability of flows
// R = (Vf - Vi - F)/(Vi - sum of FP)
module.exports.getYield = (flows, lastValuation, initialValuation = 0, endDate = new Date(), startDate) => {
  var flowsSum = -initialValuation;
  var ponderatedFlows = -initialValuation;
  var flowDate;
  var flowCost;
  if(!startDate) startDate = new Date(flows[0]['date']);
  for (var i=0; i< flows.length; i++) {
    flowDate = new Date(flows[i]['date']);
    flowCost = flows[i]['cost'];
    if (flowDate >= startDate && flowDate < endDate ) {
      flowsSum += flowCost;
      ponderatedFlows += ponderateFlow(flowDate, flowCost, startDate, endDate);
    }
  }
  flowsSum += lastValuation;
  return flowsSum / - ponderatedFlows;
};

// convert a rate from a period to an annual rate
module.exports.convertToAnualizedIRR = (globalYield, startDate, endDate) => {
  // get nb years between end and startDate
  var nbDays = daysBetween(startDate, endDate);
  var nbYears = nbDays / 365.25;
  // convert yield to annual
  return Math.pow(1+globalYield, 1/nbYears)-1;
};

// convert pf data to flow
const convertToFlow = (data) => {
  var flows = [];
  for (var i=0; i< data.length; i++) {
    if (data[i]['recur']) {
      flows = flows.concat(recur2Flow(data[i]));
    } else {
      flows.push({
        'date': new Date(data[i]['date']),
        'cost': data[i]['cost']
      });
    }
  }
  return sortFlows(flows);
};
module.exports.convertToFlow = convertToFlow;

// sort flows by date
const sortFlows = (flows) => {
  return flows.sort((a, b) => {
    // Compare two dates (could be of any type supported by the convert
    // function above) and returns:
    //  -1 : if a < b
    //   0 : if a = b
    //   1 : if a > b
    // NaN : if a or b is an illegal date
    // NOTE: The code inside isFinite does an assignment (=).
    return isFinite(a['date']) && isFinite(b['date']) ? (a['date']>b['date'])-(a['date']<b['date']) : NaN;
  });
};

// sum the investments flows
const totalInvest = (flows) => {
  // we need to multiply by 1000 in order to avoid floating number errors in js
  return flows.map(item => item.cost).reduce((prev, item) => item<0 ? prev + 1000*item : prev, 0)/1000;
};
module.exports.totalInvest = totalInvest;

// convert recurring flows to unitary flows
const recur2Flow = (data) => {
  var flows = [];
  var period = periodicity[data['period']] || 0;
  var startDate = new Date(data['start_date']);
  var endDate = data['end_date'] ? new Date(data['end_date']) : new Date();
  for(var curDate = startDate; curDate <= endDate; curDate = new Date(Date.UTC(curDate.getUTCFullYear(), curDate.getUTCMonth() + period, curDate.getUTCDate()))) {
    flows.push({
      'date': new Date(curDate),
      'cost': data['cost']
    });
  }
  return flows;
};
