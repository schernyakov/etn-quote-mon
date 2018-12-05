; (function () {
    const dbconfig = { name: "quoteMonitoring", version: 1, quoteStoreName: "Quotes" };
    const quoteProvider = window.QuoteProvider;
    const secCache = window.SecurityCache;

    function createDbSchema(storeName ,db) {
        if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        }
    }

    function writeDb(quote, db) {
        var tx = db.transaction(dbconfig.quoteStoreName, 'readwrite');
        var st = tx.objectStore(dbconfig.quoteStoreName);
        st.add(quote);
    }

    function createSubscription(quote, predicate, db) {
        quote[predicate.Field].subscribe((newValue) => {
            if (predicate.Condition(newValue))
                writeDb(quote.peek(), db);
        });
        console.log(quote.Symbol.Symbol + " subscribed on " + predicate.Field);
    }

    class QuoteWriter {
        constructor(symbol, predicates) {
            this.symbol = symbol;
            this.predicates = predicates;
        }

        start() {
            var dbpromise = indexedDB.open(dbconfig.name, dbconfig.version);
            dbpromise.onupgradeneeded = () => {
                var db = event.target.result;
                createDbSchema(dbconfig.quoteStoreName, db);
            }
            dbpromise.onsuccess = () => {
                const db = dbpromise.result;
                secCache.getSecurityBySymbol([this.symbol]).then((security) => {
                    const quote = quoteProvider.subscribeQuote(security[0].Id, security[0]);
                    this.predicates.forEach(predicate => {
                        createSubscription(quote, predicate, db)
                    });
                });
            }
        }
    }

    window.QuoteWriter = QuoteWriter;
})();
