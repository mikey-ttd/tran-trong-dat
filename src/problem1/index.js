var sum_to_n_a = function(n) {
  if (n === 0) return 0;

  if (n > 0) {
    return (n * (n + 1)) / 2;
  }

  return (n * (1 - n)) / 2;
};

var sum_to_n_b = function(n) {
  let sum = 0;
  const step = n >= 0 ? 1 : -1;
  const limit = Math.abs(n);

  for (let count = 1, value = step; count <= limit; count += 1, value += step) {
    sum += value;
  }

  return sum;
};

var sum_to_n_c = function(n) {
  const direction = n >= 0 ? 1 : -1;

  return Array.from({ length: Math.abs(n) }, function(_, index) {
    return direction * (index + 1);
  }).reduce(function(sum, value) {
    return sum + value;
  }, 0);
};

if (typeof module !== "undefined") {
  module.exports = {
    sum_to_n_a,
    sum_to_n_b,
    sum_to_n_c,
  };
}

if (typeof require !== "undefined" && require.main === module) {
  const testCases = [
    { input: -5, expected: -15 },
    { input: -3, expected: -6 },
    { input: -1, expected: -1 },
    { input: 0, expected: 0 },
    { input: 1, expected: 1 },
    { input: 5, expected: 15 },
    { input: 10, expected: 55 },
  ];

  testCases.forEach(function(testCase) {
    const results = [
      sum_to_n_a(testCase.input),
      sum_to_n_b(testCase.input),
      sum_to_n_c(testCase.input),
    ];
    const passed = results.every(function(result) {
      return result === testCase.expected;
    });

    console.log(
      (passed ? "PASS" : "FAIL") +
        " n = " +
        testCase.input +
        ": [" +
        results.join(", ") +
        "], expected = " +
        testCase.expected
    );
  });
}
