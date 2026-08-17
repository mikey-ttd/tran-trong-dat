export type PriceRecord = {
  currency: string;
  date: string;
  price: number;
};

export type Token = {
  currency: string;
  price: number;
  date: string;
};

export type Quote = {
  sendAmount: number;
  receiveAmount: number;
  feeAmount: number;
  minimumReceived: number;
  rate: number;
};

