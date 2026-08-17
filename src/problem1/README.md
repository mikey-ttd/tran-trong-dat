# Problem 1: Three ways to sum to n

## Assumptions

- `n` is an integer.
- The result is guaranteed to be less than `Number.MAX_SAFE_INTEGER`.
- For `n > 0`, the result is `1 + 2 + ... + n`.
- For `n < 0`, the result is `-1 + -2 + ... + n`.
- For `n = 0`, the result is `0`.

## Implementations

- `sum_to_n_a`: uses the arithmetic series formula. Time `O(1)`, space `O(1)`.
- `sum_to_n_b`: uses an iterative loop. Time `O(|n|)`, space `O(1)`.
- `sum_to_n_c`: uses `Array.from` and `reduce`. Time `O(|n|)`, space `O(|n|)`.

## Run

```bash
node src/problem1
```
