var millisecondsPerDay = 24 * 60 * 60 * 1000;

const periodicity = {
  'monthly': 1,
  'quarterly': 3,
  'yearly': 12,
};

const daysBetween = (startDate, endDate) => {
  return Math.round((endDate - startDate) / millisecondsPerDay);
};

// R = (Vf - Vi - F)/(Vi - sum of FP)
// F = Sum of flows
// FP = flow * (nb days in period - nb days before flow)/ nb days in period

// calculate ponderated flows
const ponderateFlow = (flowDate, flowCost, startDate, endDate = new Date()) => {
  var nbDays = daysBetween(startDate, endDate);
  var nbDaysBefore = daysBetween(startDate, flowDate);
  return (nbDays == 0)? 0 : flowCost * (nbDays - nbDaysBefore) / nbDays;
};

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
  return flows;
};
module.exports.convertToFlow = convertToFlow;

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
