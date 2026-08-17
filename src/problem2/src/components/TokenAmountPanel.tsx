import type { ChangeEvent, FocusEvent } from "react";

import type { Token } from "../types";
import { sanitizeAmountInput } from "../utils/formatters";
import { TokenSelect } from "./TokenSelect";

type TokenAmountPanelProps = {
  id: string;
  label: string;
  balanceLabel: string;
  amount: string;
  placeholder: string;
  tokens: Token[];
  selectedCurrency: string;
  blockedCurrency: string;
  usdValueLabel: string;
  isInsufficient?: boolean;
  onAmountChange: (value: string) => void;
  onTokenChange: (currency: string) => void;
  onMax?: () => void;
};

export function TokenAmountPanel({
  id,
  label,
  balanceLabel,
  amount,
  placeholder,
  tokens,
  selectedCurrency,
  blockedCurrency,
  usdValueLabel,
  isInsufficient = false,
  onAmountChange,
  onTokenChange,
  onMax,
}: TokenAmountPanelProps) {
  function handleAmountChange(event: ChangeEvent<HTMLInputElement>) {
    const sanitized = sanitizeAmountInput(event.target.value);
    if (sanitized !== null) onAmountChange(sanitized);
  }

  function handleAmountFocus(event: FocusEvent<HTMLInputElement>) {
    event.target.select();
  }

  return (
    <div className={"asset-row" + (isInsufficient ? " is-insufficient" : "")}>
      <div className="row-heading">
        <label htmlFor={id}>{label}</label>
        <span className={"balance-value" + (isInsufficient ? " is-insufficient" : "")}>
          {balanceLabel}
          {onMax && (
            <button type="button" className="max-button" onClick={onMax}>
              MAX
            </button>
          )}
        </span>
      </div>

      <div className="amount-grid">
        <input
          id={id}
          name={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder={placeholder}
          value={amount}
          onChange={handleAmountChange}
          onFocus={handleAmountFocus}
        />

        <TokenSelect
          label={label}
          tokens={tokens}
          selectedCurrency={selectedCurrency}
          excludedCurrency={blockedCurrency}
          onChange={onTokenChange}
        />
      </div>

      <p className="token-usd-value">{usdValueLabel || " "}</p>
    </div>
  );
}
