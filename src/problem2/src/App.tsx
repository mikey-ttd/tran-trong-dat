import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

import { TokenAmountPanel } from "./components/TokenAmountPanel";
import { DEFAULT_FROM_TOKEN, DEFAULT_TO_TOKEN } from "./config/constants";
import { DEMO_BALANCES, getBalance } from "./data/balances";
import { FALLBACK_PRICES } from "./data/fallbackPrices";
import { fetchTokenPrices, normalizePrices } from "./services/priceService";
import type { Token } from "./types";
import {
  amountFormatter,
  floorForInput,
  formatAmount,
  formatBalance,
  formatUsdValue,
  parseAmount,
} from "./utils/formatters";
import { quoteFromReceiveAmount, quoteFromSendAmount } from "./utils/quote";

type ActiveSide = "from" | "to";

function getDefaultCurrency(tokens: Token[], preferredCurrency: string, fallbackIndex: number) {
  return (
    tokens.find((token) => token.currency === preferredCurrency)?.currency ??
    tokens[fallbackIndex]?.currency ??
    ""
  );
}

export default function App() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [amountText, setAmountText] = useState("");
  const [activeSide, setActiveSide] = useState<ActiveSide>("from");
  const [balances, setBalances] = useState<Record<string, number>>(DEMO_BALANCES);
  const [isRateFlipped, setIsRateFlipped] = useState(false);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [isUsingFallbackPrices, setIsUsingFallbackPrices] = useState(false);
  const [priceError, setPriceError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadPrices() {
      try {
        setIsLoadingPrices(true);
        setPriceError("");

        const loadedTokens = await fetchTokenPrices(controller.signal);

        setTokens(loadedTokens);
        setIsUsingFallbackPrices(false);
        setFromCurrency(getDefaultCurrency(loadedTokens, DEFAULT_FROM_TOKEN, 0));
        setToCurrency(getDefaultCurrency(loadedTokens, DEFAULT_TO_TOKEN, 1));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;

        const fallbackTokens = normalizePrices(FALLBACK_PRICES);

        setTokens(fallbackTokens);
        setIsUsingFallbackPrices(true);
        setPriceError(
          error instanceof Error ? error.message : "Unable to load token prices.",
        );
        setFromCurrency(getDefaultCurrency(fallbackTokens, DEFAULT_FROM_TOKEN, 0));
        setToCurrency(getDefaultCurrency(fallbackTokens, DEFAULT_TO_TOKEN, 1));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingPrices(false);
        }
      }
    }

    void loadPrices();

    return () => controller.abort();
  }, []);

  const tokenByCurrency = useMemo(() => {
    return new Map(tokens.map((token) => [token.currency, token]));
  }, [tokens]);

  const fromToken = tokenByCurrency.get(fromCurrency);
  const toToken = tokenByCurrency.get(toCurrency);
  const numericAmount = parseAmount(amountText);

  const quote = useMemo(() => {
    return activeSide === "from"
      ? quoteFromSendAmount(numericAmount, fromToken, toToken)
      : quoteFromReceiveAmount(numericAmount, fromToken, toToken);
  }, [activeSide, numericAmount, fromToken, toToken]);

  const isInsufficientBalance =
    quote.sendAmount > 0 && quote.sendAmount > getBalance(balances, fromCurrency);

  const swapBlockedReason = useMemo(() => {
    if (isLoadingPrices) return "Loading prices...";
    if (!fromToken || !toToken) return "Select a token";
    if (fromCurrency === toCurrency) return "Select different tokens";
    if (!amountText.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return "Enter an amount";
    }
    if (isInsufficientBalance) return "Insufficient " + fromCurrency + " balance";

    return "";
  }, [
    isLoadingPrices,
    fromToken,
    toToken,
    fromCurrency,
    toCurrency,
    amountText,
    numericAmount,
    isInsufficientBalance,
  ]);

  const canSubmit = !isSubmitting && !swapBlockedReason;

  function clearFeedback() {
    setSuccessMessage("");
  }

  function handleSendAmountChange(nextAmount: string) {
    setAmountText(nextAmount);
    setActiveSide("from");
    clearFeedback();
  }

  function handleReceiveAmountChange(nextAmount: string) {
    setAmountText(nextAmount);
    setActiveSide("to");
    clearFeedback();
  }

  function handleFromTokenChange(nextCurrency: string) {
    setFromCurrency(nextCurrency);
    clearFeedback();
  }

  function handleToTokenChange(nextCurrency: string) {
    setToCurrency(nextCurrency);
    clearFeedback();
  }

  function handleSwitchTokens() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    clearFeedback();
  }

  function handleMax() {
    setAmountText(String(floorForInput(getBalance(balances, fromCurrency))));
    setActiveSide("from");
    clearFeedback();
  }

  function handleReset() {
    setAmountText("");
    setActiveSide("from");
    setFromCurrency(getDefaultCurrency(tokens, DEFAULT_FROM_TOKEN, 0));
    setToCurrency(getDefaultCurrency(tokens, DEFAULT_TO_TOKEN, 1));
    setBalances(DEMO_BALANCES);
    setIsRateFlipped(false);
    clearFeedback();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || !fromToken || !toToken) return;

    const { sendAmount, receiveAmount } = quote;

    setIsSubmitting(true);
    setSuccessMessage("");

    await new Promise((resolve) => {
      window.setTimeout(resolve, 900);
    });

    setBalances((previousBalances) => ({
      ...previousBalances,
      [fromCurrency]: getBalance(previousBalances, fromCurrency) - sendAmount,
      [toCurrency]: getBalance(previousBalances, toCurrency) + receiveAmount,
    }));
    setIsSubmitting(false);
    setAmountText("");
    setSuccessMessage(
      "Swap confirmed: " +
        amountFormatter.format(sendAmount) +
        " " +
        fromCurrency +
        " to " +
        amountFormatter.format(receiveAmount) +
        " " +
        toCurrency +
        ".",
    );
  }

  const priceStatus = isLoadingPrices
    ? "Loading market prices..."
    : isUsingFallbackPrices
      ? "Using fallback prices because the live feed is unavailable"
      : "Live prices loaded for " + tokens.length + " assets";

  const priceStatusClassName =
    "status-dot" +
    (isUsingFallbackPrices ? " is-error" : isLoadingPrices ? "" : " is-live");

  const sendDisplay = activeSide === "from" ? amountText : formatAmount(quote.sendAmount);
  const receiveDisplay = activeSide === "to" ? amountText : formatAmount(quote.receiveAmount);

  const rateDisplay = !quote.rate
    ? "--"
    : isRateFlipped
      ? "1 " + toCurrency + " = " + amountFormatter.format(1 / quote.rate) + " " + fromCurrency
      : "1 " + fromCurrency + " = " + amountFormatter.format(quote.rate) + " " + toCurrency;

  return (
    <main className="page-shell">
      <section className="market-panel" aria-label="Market overview">
        <p className="eyebrow">99Tech Code Challenge</p>
        <h1>Currency Swap</h1>
        <p className="intro">
          Swap between quoted assets with live prices, balance checks, and a
          simulated confirmation flow.
        </p>

        <div className="market-strip" aria-live="polite">
          <span className={priceStatusClassName} aria-hidden="true"></span>
          <span>{priceStatus}</span>
        </div>

        {priceError && <p className="feed-note">Live feed error: {priceError}</p>}
      </section>

      <form className="swap-form" noValidate onSubmit={handleSubmit}>
        <div className="form-header">
          <div>
            <p className="eyebrow">Trade ticket</p>
            <h2>Swap assets</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Reset form"
            title="Reset form"
            disabled={isSubmitting}
            onClick={handleReset}
          >
            ↺
          </button>
        </div>

        <fieldset className="swap-fields" disabled={isSubmitting}>
        <TokenAmountPanel
          id="input-amount"
          label="Sell"
            balanceLabel={"Balance: " + formatBalance(balances, fromCurrency)}
            amount={sendDisplay}
            placeholder="0.00"
            tokens={tokens}
            selectedCurrency={fromCurrency}
            blockedCurrency={toCurrency}
            usdValueLabel={fromToken ? formatUsdValue(quote.sendAmount * fromToken.price) : ""}
            isInsufficient={isInsufficientBalance}
            onAmountChange={handleSendAmountChange}
            onTokenChange={handleFromTokenChange}
            onMax={handleMax}
          />

          <button
            className="switch-button"
            type="button"
            aria-label="Switch currencies"
            title="Switch currencies"
            onClick={handleSwitchTokens}
          >
            ↓
          </button>

          <TokenAmountPanel
            id="output-amount"
            label="Buy"
            balanceLabel={"Balance: " + formatBalance(balances, toCurrency)}
            amount={receiveDisplay}
            placeholder="0.00"
            tokens={tokens}
            selectedCurrency={toCurrency}
            blockedCurrency={fromCurrency}
            usdValueLabel={toToken ? formatUsdValue(quote.receiveAmount * toToken.price) : ""}
            onAmountChange={handleReceiveAmountChange}
            onTokenChange={handleToTokenChange}
          />
        </fieldset>

        <dl className="quote-summary" aria-label="Quote summary">
          <div>
            <dt>Rate</dt>
            <dd>
              {rateDisplay}
              {Boolean(quote.rate) && (
                <button
                  type="button"
                  className="rate-flip-button"
                  aria-label="Flip rate direction"
                  onClick={() => setIsRateFlipped((flipped) => !flipped)}
                >
                  ⇄
                </button>
              )}
            </dd>
          </div>
          <div>
            <dt>Swap fee</dt>
            <dd>
              {quote.feeAmount
                ? amountFormatter.format(quote.feeAmount) + " " + toCurrency + " (0.30%)"
                : "--"}
            </dd>
          </div>
          <div>
            <dt>Minimum received</dt>
            <dd>
              {quote.minimumReceived
                ? amountFormatter.format(quote.minimumReceived) + " " + toCurrency
                : "--"}
            </dd>
          </div>
        </dl>

        <button className="submit-button" type="submit" disabled={!canSubmit}>
          {isSubmitting ? (
            <>
              <span className="button-spinner" aria-hidden="true"></span>
              Confirming...
            </>
          ) : (
            <span aria-live="polite">{swapBlockedReason || "Confirm swap"}</span>
          )}
        </button>

        <p className="success-message" role="status">
          {successMessage}
        </p>
      </form>
    </main>
  );
}
