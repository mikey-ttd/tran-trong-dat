import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { Token } from "../types";
import { formatUsdValue } from "../utils/formatters";
import { getFallbackIcon, getIconUrl } from "../utils/tokenImages";

type TokenSelectProps = {
  label: string;
  tokens: Token[];
  selectedCurrency: string;
  excludedCurrency: string;
  onChange: (currency: string) => void;
};

function TokenIcon({ currency }: { currency: string }) {
  return (
    <img
      src={getIconUrl(currency)}
      alt=""
      onError={(event) => {
        event.currentTarget.src = getFallbackIcon(currency);
      }}
    />
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M13 13L17.5 17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M5 5L15 15M15 5L5 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M4 10.5L8 14.5L16 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TokenSelect({
  label,
  tokens,
  selectedCurrency,
  excludedCurrency,
  onChange,
}: TokenSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredTokens = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return tokens;

    return tokens.filter((token) => token.currency.toLowerCase().includes(normalizedQuery));
  }, [tokens, query]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closePicker();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function openPicker() {
    setQuery("");
    setIsOpen(true);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }

  function closePicker() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function selectToken(currency: string) {
    onChange(currency);
    closePicker();
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      const firstMatch = filteredTokens.find((token) => token.currency !== excludedCurrency);
      if (firstMatch) selectToken(firstMatch.currency);
    }
  }

  return (
    <div className="token-select">
      <button
        ref={triggerRef}
        type="button"
        className="token-select-trigger"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={label + " token"}
        onClick={openPicker}
      >
        {selectedCurrency ? (
          <TokenIcon currency={selectedCurrency} />
        ) : (
          <span className="token-icon-placeholder" aria-hidden="true" />
        )}
        <span className="token-select-symbol">{selectedCurrency || "Select"}</span>
        <span className="token-select-chevron">
          <ChevronIcon />
        </span>
      </button>

      {isOpen &&
        createPortal(
          <div
            className="token-modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closePicker();
            }}
          >
            <div
              className="token-modal"
              role="dialog"
              aria-modal="true"
              aria-label={"Select token for " + label}
            >
              <div className="token-modal-header">
                <h3>Select a token</h3>
                <button
                  type="button"
                  className="token-modal-close"
                  aria-label="Close"
                  onClick={closePicker}
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="token-modal-search-wrap">
                <span className="token-modal-search-icon">
                  <SearchIcon />
                </span>
                <input
                  ref={searchInputRef}
                  className="token-modal-search"
                  type="text"
                  placeholder="Search token"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>

              <p className="token-modal-section">
                {query.trim()
                  ? filteredTokens.length + " of " + tokens.length + " tokens"
                  : tokens.length + " tokens"}
              </p>

              <ul
                className="token-modal-list"
                role="listbox"
                aria-label={label + " token options"}
              >
                {filteredTokens.map((token) => {
                  const isExcluded = token.currency === excludedCurrency;
                  const isSelected = token.currency === selectedCurrency;

                  return (
                    <li key={token.currency}>
                      <button
                        type="button"
                        className={"token-modal-option" + (isSelected ? " is-selected" : "")}
                        role="option"
                        aria-selected={isSelected}
                        disabled={isExcluded}
                        onClick={() => selectToken(token.currency)}
                      >
                        <TokenIcon currency={token.currency} />
                        <span className="token-modal-option-text">
                          <span className="token-modal-symbol">{token.currency}</span>
                          <span className="token-modal-price">
                            {formatUsdValue(token.price)}
                          </span>
                        </span>
                        {isExcluded && <span className="token-modal-hint">In use</span>}
                        {isSelected && !isExcluded && (
                          <span className="token-modal-check">
                            <CheckIcon />
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}

                {filteredTokens.length === 0 && (
                  <li className="token-modal-empty">No tokens match "{query}"</li>
                )}
              </ul>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
