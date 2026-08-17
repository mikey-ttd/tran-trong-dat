import { MINIMUM_RECEIVED_RATE, SWAP_FEE_RATE } from "../config/constants";
import type { Quote, Token } from "../types";

const EMPTY_QUOTE: Quote = {
  sendAmount: 0,
  receiveAmount: 0,
  feeAmount: 0,
  minimumReceived: 0,
  rate: 0,
};

function isSwappable(fromToken: Token | undefined, toToken: Token | undefined) {
  return Boolean(fromToken && toToken && fromToken.currency !== toToken.currency);
}

export function quoteFromSendAmount(
  sendAmount: number,
  fromToken: Token | undefined,
  toToken: Token | undefined,
): Quote {
  if (!sendAmount || !isSwappable(fromToken, toToken) || !fromToken || !toToken) {
    return EMPTY_QUOTE;
  }

  const rate = fromToken.price / toToken.price;
  const grossReceive = sendAmount * rate;
  const feeAmount = grossReceive * SWAP_FEE_RATE;
  const receiveAmount = grossReceive - feeAmount;

  return {
    sendAmount,
    receiveAmount,
    feeAmount,
    minimumReceived: receiveAmount * MINIMUM_RECEIVED_RATE,
    rate,
  };
}

export function quoteFromReceiveAmount(
  receiveAmount: number,
  fromToken: Token | undefined,
  toToken: Token | undefined,
): Quote {
  if (!receiveAmount || !isSwappable(fromToken, toToken) || !fromToken || !toToken) {
    return EMPTY_QUOTE;
  }

  const rate = fromToken.price / toToken.price;
  const grossReceive = receiveAmount / (1 - SWAP_FEE_RATE);
  const feeAmount = grossReceive - receiveAmount;
  const sendAmount = grossReceive / rate;

  return {
    sendAmount,
    receiveAmount,
    feeAmount,
    minimumReceived: receiveAmount * MINIMUM_RECEIVED_RATE,
    rate,
  };
}
