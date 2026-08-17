# Problem 2: Fancy Form

Currency swap form built with React, TypeScript, and Vite.

## Requirements covered

- Swap form for exchanging one priced asset into another.
- Token picker using Switcheo token icons.
- Price fetching from the provided Switcheo endpoint.
- Exchange-rate calculation from token USD prices.
- Editable sell and buy amount fields.
- Balance, USD value, fee, rate, and minimum received display.
- Input validation and disabled submit states.
- Simulated submit flow with loading and confirmation states.
- Responsive layout for desktop and mobile.

## Tech stack

- React
- TypeScript
- Vite
- CSS

## Data sources

Prices are fetched from:

```text
https://interview.switcheo.com/prices.json
```

The app removes invalid or unpriced rows and keeps the latest price for each token.

Token icons use:

```text
https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/{TOKEN}.svg
```

If the live price request fails, the app uses local fallback prices from
`src/data/fallbackPrices.ts`.

## Swap calculation

The quote is calculated from USD prices:

```text
rate = fromToken.price / toToken.price
grossReceive = sendAmount * rate
feeAmount = grossReceive * 0.003
receiveAmount = grossReceive - feeAmount
minimumReceived = receiveAmount * 0.995
```

When the user edits the buy amount, the app calculates the required sell amount
using the inverse of the same formula.

## Validation

The form blocks submit when:

- Prices are still loading.
- Either token is missing.
- Both sides use the same token.
- The entered amount is empty, zero, or invalid.
- The sell amount is greater than the available mock balance.

## Known limitations

- Swaps are simulated and do not call a backend.
- Balances are mock values stored in memory.
- Refreshing the page resets balances.
- Fallback prices are fixed sample values.

## Project structure

```text
src/problem2
├── index.html
├── package.json
├── vite.config.ts
├── eslint.config.js
├── tsconfig.json
├── src
│   ├── components
│   │   ├── TokenAmountPanel.tsx
│   │   └── TokenSelect.tsx
│   ├── config
│   │   └── constants.ts
│   ├── data
│   │   ├── balances.ts
│   │   └── fallbackPrices.ts
│   ├── services
│   │   └── priceService.ts
│   ├── utils
│   │   ├── formatters.ts
│   │   ├── quote.ts
│   │   └── tokenImages.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── style.css
│   ├── types.ts
│   └── vite-env.d.ts
└── README.md
```

## Run

Install dependencies once:

```bash
cd src/problem2
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

Then open the local URL printed in the terminal.

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```
