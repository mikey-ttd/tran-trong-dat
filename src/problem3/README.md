# Problem 3: Messy React

## Issues found

- `WalletBalance` does not define `blockchain`, but the code reads `balance.blockchain`.
- `getPriority(blockchain: any)` uses `any`, which hides useful TypeScript checks.
- `lhsPriority` is not defined. The code probably meant to use `balancePriority`.
- The filter keeps `balance.amount <= 0`, so positive balances are removed. A wallet list should normally keep `amount > 0`.
- `prices` is included in the `useMemo` dependency list for `sortedBalances`, but sorting/filtering does not use prices.
- `getPriority` is declared inside the component even though it does not use props or state.
- `getPriority` is called repeatedly during sorting. Each balance priority can be calculated once before sorting.
- The sort comparator does not return `0` when both priorities are equal.
- `formattedBalances` is calculated but never used.
- `rows` maps over `sortedBalances`, but treats each item as `FormattedWalletBalance`, so `balance.formatted` is missing.
- `amount.toFixed()` rounds to a whole number by default, which is not suitable for token balances.
- `prices[balance.currency] * balance.amount` can return `NaN` if a price is missing.
- `key={index}` is unstable for a list that is filtered and sorted.
- `children` is taken out of `props`, but never rendered.
- `interface Props extends BoxProps {}` does not add anything.
- If `BoxProps` contains design-system props, spreading `rest` into a plain `div` may pass invalid DOM attributes.

## Refactored version

```tsx
import { useMemo } from 'react';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

type Props = React.PropsWithChildren<BoxProps>;

const PRIORITIES: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const UNKNOWN_PRIORITY = -99;

const getPriority = (blockchain: string): number => {
  return PRIORITIES[blockchain] ?? UNKNOWN_PRIORITY;
};

const amountFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 6,
});

function WalletPage({ children, ...rest }: Props) {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .reduce<Array<WalletBalance & { priority: number }>>((result, balance) => {
        const priority = getPriority(balance.blockchain);

        if (priority > UNKNOWN_PRIORITY && balance.amount > 0) {
          result.push({ ...balance, priority });
        }

        return result;
      }, [])
      .sort((left, right) => right.priority - left.priority);
  }, [balances]);

  const rows = useMemo(() => {
    return sortedBalances.map((balance) => {
      const usdValue = (prices[balance.currency] ?? 0) * balance.amount;

      return (
        <WalletRow
          className={classes.row}
          key={`${balance.blockchain}-${balance.currency}`}
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={amountFormatter.format(balance.amount)}
        />
      );
    });
  }, [sortedBalances, prices]);

  return (
    <div {...rest}>
      {rows}
      {children}
    </div>
  );
}
```

Notes:

- If `BoxProps` is from a UI library, I would render that library's `Box` component instead of a raw `div`.
- If children are not expected here, I would remove `children` from the props instead of rendering it.

## Original

```tsx
interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {

}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

	const getPriority = (blockchain: any): number => {
	  switch (blockchain) {
	    case 'Osmosis':
	      return 100
	    case 'Ethereum':
	      return 50
	    case 'Arbitrum':
	      return 30
	    case 'Zilliqa':
	      return 20
	    case 'Neo':
	      return 20
	    default:
	      return -99
	  }
	}

  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
		  const balancePriority = getPriority(balance.blockchain);
		  if (lhsPriority > -99) {
		     if (balance.amount <= 0) {
		       return true;
		     }
		  }
		  return false
		}).sort((lhs: WalletBalance, rhs: WalletBalance) => {
			const leftPriority = getPriority(lhs.blockchain);
		  const rightPriority = getPriority(rhs.blockchain);
		  if (leftPriority > rightPriority) {
		    return -1;
		  } else if (rightPriority > leftPriority) {
		    return 1;
		  }
    });
  }, [balances, prices]);

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  })

  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        className={classes.row}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}
```
