import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, Fragment } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dynamic Currency Converter — React Concepts" },
      { name: "description", content: "Live currency converter built with React components, props, JSX and useEffect." },
      { property: "og:title", content: "Dynamic Currency Converter" },
      { property: "og:description", content: "Live exchange rates with React components, props and useEffect." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

type Rates = Record<string, number>;

/* Reusable component with destructured props */
function CurrencySelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-muted-foreground">
      {label}
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
        {/* Rendering lists with keys */}
        {options.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
    </label>
  );
}

function ResultCard({ amount, from, to, result }: { amount: number; from: string; to: string; result: number }) {
  return (
    <>
      {/* React Fragment: no extra wrapper element */}
      <p className="text-sm text-muted-foreground">{amount} {from} =</p>
      <p className="text-4xl font-bold text-primary">{result.toFixed(4)} {to}</p>
    </>
  );
}

const CONCEPTS = ["Components & Reusability", "Props Destructuring", "JSX & Styling", "Rendering Lists", "Conditional Rendering", "Fragments", "useEffect + Dependency Array", "Async Fetching", "Cleanup with AbortController"];

function Index() {
  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  const [rates, setRates] = useState<Rates>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Runs whenever `from` changes (dependency array). Cleanup aborts stale requests.
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${from}`, { signal: controller.signal });
        const data = await res.json();
        if (data.result !== "success") throw new Error("Could not load rates");
        setRates(data.rates);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError((e as Error).message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [from]);

  const currencies = Object.keys(rates).length ? Object.keys(rates) : [from, to];
  const result = amount * (rates[to] ?? 0);

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-xl">
        <h1 className="text-4xl font-bold text-foreground">Currency Converter</h1>
        <p className="mt-2 text-muted-foreground">Live rates, built with React fundamentals.</p>

        <section className="card mt-8 space-y-5">
          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            Amount
            <input className="field" type="number" min={0} value={amount}
              onChange={(e) => setAmount(Number(e.target.value))} />
          </label>
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <CurrencySelect label="From" value={from} options={currencies} onChange={setFrom} />
            <button className="swap" aria-label="Swap" onClick={() => { setFrom(to); setTo(from); }}>⇄</button>
            <CurrencySelect label="To" value={to} options={currencies} onChange={setTo} />
          </div>
          <div className="rounded-lg bg-muted p-5">
            {/* Conditional rendering */}
            {loading ? <p className="text-muted-foreground">Fetching rates…</p>
              : error ? <p className="text-destructive">{error}</p>
              : <ResultCard amount={amount} from={from} to={to} result={result} />}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">Concepts used</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {CONCEPTS.map((c) => <Fragment key={c}><span className="chip">{c}</span></Fragment>)}
          </div>
        </section>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          Made by Fatiaha Ansari
        </footer>
      </div>
    </main>
  );
}
