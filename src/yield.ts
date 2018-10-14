let millisecondsPerDay = 24 * 60 * 60 * 1000;

export interface Flow {
  date: Date;
  cost: number;
}

interface FlowDesc {
  recur?: boolean;
  date?: string;
  start_date?: string;
  end_date?: string;
  period?: string;
  cost: number;
  volume?: number;
  symbol?: string;
}

export interface Navs {
  last: number;
  [propName: string]: number;
}

export interface PFDesc {
  name: string;
  nav: Navs;
  flows: FlowDesc[];
}

// number of month in different periodicities
const periodicity = <any>{
  'monthly': 1,
  'quarterly': 3,
  'yearly': 12,
};

//return the number of days between 2 dates
const daysBetween = (startDate: Date, endDate: Date): number => {
  return Math.round((endDate.valueOf() - startDate.valueOf()) / millisecondsPerDay);
};


// calculate ponderated flows
// FP = flow * (nb days in period - nb days before flow)/ nb days in period
const ponderateFlow = (flowDate: Date, flowCost: number, startDate: Date, endDate: Date = new Date()): number => {
  let nbDays = daysBetween(startDate, endDate);
  let nbDaysBefore = daysBetween(startDate, flowDate);
  return (nbDays == 0)? 0 : flowCost * (nbDays - nbDaysBefore) / nbDays;
};

// calculate profitability of flows
// R = (Vf - Vi - F)/(Vi - sum of FP)
export const getYield = (flows: Flow[], lastValuation: number, initialValuation: number = 0, endDate: Date = new Date(), startDate?: Date): number => {
  let flowsSum = -initialValuation;
  let ponderatedFlows = -initialValuation;
  let flowDate;
  let flowCost;
  if(!startDate) startDate = new Date(flows[0]['date'].valueOf());
  for (let i=0; i< flows.length; i++) {
    flowDate = new Date(flows[i]['date'].valueOf());
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
export const convertToAnualizedIRR = (globalYield: number, startDate: Date, endDate: Date): number => {
  // get nb years between end and startDate
  let nbDays = daysBetween(startDate, endDate);
  let nbYears = nbDays / 365.25;
  // convert yield to annual
  return Math.pow(1+globalYield, 1/nbYears)-1;
};

// convert pf data to flow
export const convertToFlow = (data: FlowDesc[]): Flow[] => {
  let flows: Flow[] = [];
  for (let i=0; i< data.length; i++) {
    if (data[i]['recur']) {
      flows = flows.concat(recur2Flow(data[i]));
    } else {
      flows.push(<Flow>{
        'date': new Date(data[i].date),
        'cost': data[i].cost
      });
    }
  }
  return sortFlows(flows);
};

// sort flows by date
const sortFlows = (flows: Flow[]): Flow[] => {
  return flows.sort((a: Flow, b: Flow): number => {
    // Compare two dates (could be of any type supported by the convert
    // function above) and returns:
    //  -1 : if a < b
    //   0 : if a = b
    //   1 : if a > b
    // NaN : if a or b is an illegal date
    //return isFinite(adate) && isFinite(bdate) ?
    //(adate > bdate) - (adate < bdate) :
    //NaN;
    let adate = a['date'].valueOf();
    let bdate = b['date'].valueOf();
    if (!isFinite(adate) || !isFinite(bdate)) return NaN;
    if (adate > bdate) return 1;
    if (adate < bdate) return -1;
    return 0;
  });
};

// sum the investments flows
export const totalInvest = (flows: Flow[]): number => {
  // we need to multiply by 1000 in order to avoid floating number errors in js
  return flows.map((item: any) => item.cost).reduce((prev: number, item: number) => item<0 ? prev + 1000*item : prev, 0)/1000;
};

// convert recurring flows to unitary flows
const recur2Flow = (data: FlowDesc): Flow[] => {
  let flows: Flow[] = [];
  let period = periodicity[data.period] || 0;
  let startDate = new Date(data.start_date);
  let endDate = data.end_date ? new Date(data.end_date) : new Date();
  for(let curDate = startDate; curDate <= endDate; curDate = new Date(Date.UTC(curDate.getUTCFullYear(), curDate.getUTCMonth() + period, curDate.getUTCDate()))) {
    flows.push(<Flow>{
      'date': new Date(curDate.valueOf()),
      'cost': data.cost
    });
  }
  return flows;
};
