import * as moment from "moment";
let millisecondsPerDay: number = 24 * 60 * 60 * 1000;

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

// calculate ponderated flows
// FP = flow * (nb days in period - nb days before flow)/ nb days in period
const ponderateFlow = (flowDate: Date, flowCost: number, startDate: Date, endDate: Date = new Date()): number => {
  let nbDays: number = moment(endDate).diff(startDate, 'days');
  let nbDaysBefore:number = moment(flowDate).diff(startDate, 'days');
  return (nbDays == 0)? 0 : flowCost * (nbDays - nbDaysBefore) / nbDays;
};

// calculate profitability of flows
// R = (Vf - Vi - F)/(Vi - sum of FP)
export const getYield = (flows: Flow[], lastValuation: number, initialValuation: number = 0, endDate: Date = new Date(), startDate?: Date): number => {
  let flowsSum:number = -initialValuation;
  let ponderatedFlows:number = -initialValuation;
  let flowDate: Date;
  let flowCost: number;
  if(!startDate) startDate = new Date(flows[0]['date'].valueOf());
  for (let i:number =0; i< flows.length; i++) {
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
  let nbYears: number = moment(endDate).diff(startDate, 'years', true);
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
    let adate: number = a['date'].valueOf();
    let bdate: number = b['date'].valueOf();
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
  let period: number = periodicity[data.period] || 0;
  let startDate: Date = new Date(data.start_date);
  let endDate: Date = data.end_date ? new Date(data.end_date) : new Date();
  for(let curDate: Date = startDate; curDate <= endDate; curDate = new Date(Date.UTC(curDate.getUTCFullYear(), curDate.getUTCMonth() + period, curDate.getUTCDate()))) {
    flows.push(<Flow>{
      'date': new Date(curDate.valueOf()),
      'cost': data.cost
    });
  }
  return flows;
};
