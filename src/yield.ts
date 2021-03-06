import * as moment from 'moment';
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

export interface Period {
  [propName: string]: number;
}

// number of month in different periodicities
const periodicity: Period = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

// calculate ponderated flows
// FP = flow * (nb days in period - nb days before flow)/ nb days in period
const ponderateFlow = (flowDate: Date, flowCost: number, startDate: Date, endDate: Date = new Date()): number => {
  const nbDays: number = moment(endDate).diff(startDate, 'days');
  const nbDaysBefore: number = moment(flowDate).diff(startDate, 'days');
  return (nbDays === 0) ? 0 : flowCost * (nbDays - nbDaysBefore) / nbDays;
};

// calculate profitability of flows
// R = (Vf - Vi - F)/(Vi - sum of FP)
export const getYield = (flows: Flow[], lastValuation: number, initialValuation: number = 0, endDate: Date = new Date(), startDate?: Date): number => {
  let flowsSum: number = -initialValuation;
  let ponderatedFlows:number = -initialValuation;
  let flowDate: Date;
  let flowCost: number;
  if(!startDate) startDate = new Date(flows[0].date.valueOf());
  for (const flow of flows) {
    flowDate = new Date(flow.date.valueOf());
    flowCost = flow.cost;
    if (flowDate >= startDate && flowDate < endDate) {
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
  const nbYears: number = moment(endDate).diff(startDate, 'years', true);
  // convert yield to annual
  return Math.pow(1 + globalYield, 1 / nbYears) - 1;
};

// convert pf data to flow
export const convertToFlow = (data: FlowDesc[]): Flow[] => {
  let flows: Flow[] = [];
  let flow: Flow;
  for (const i of data) {
    if (i.recur) {
      flows = flows.concat(recur2Flow(i));
    } else {
      flow = {
        date: new Date(i.date),
        cost: i.cost
      };
      flows.push(flow);
    }
  }
  return sortFlows(flows);
};

// sort flows by date
const sortFlows = (flows: Flow[]): Flow[] => {
  return flows.sort((a: Flow, b: Flow): number => {
    const adate: number = a.date.valueOf();
    const bdate: number = b.date.valueOf();
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
  const flows: Flow[] = [];
  let flow: Flow;
  const period: number = periodicity[data.period] || 0;
  const startDate: Date = new Date(data.start_date);
  const endDate: Date = data.end_date ? new Date(data.end_date) : new Date();
  for(let curDate: Date = startDate; curDate <= endDate; curDate = new Date(Date.UTC(curDate.getUTCFullYear(), curDate.getUTCMonth() + period, curDate.getUTCDate()))) {
    flow = {
      date: new Date(curDate.valueOf()),
      cost: data.cost
    };
    flows.push(flow);
  }
  return flows;
};
