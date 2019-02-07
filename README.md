# etn-quote-mon

```js
  var cnd = function (newValue) {
    if (!newValue || Number(newValue) === 0.05)
        return true;
  }
  var predicates = [{ Field: "Ask", Condition: cnd }];
  var writer = new QuoteWriter("INPX", predicates);
  writer.start();
```
