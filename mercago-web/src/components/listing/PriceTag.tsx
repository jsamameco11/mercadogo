export function PriceTag({ priceLabel, currency, className = "" }: { priceLabel: string; currency?: string; className?: string }) {
  const symbol = currency === "USD" ? "$" : currency === "PEN" ? "S/ " : "";
  const looksNumeric = /^[0-9.,]+$/.test(priceLabel.trim());
  return (
    <span className={`font-display font-semibold ${className}`}>
      {looksNumeric ? `${symbol}${priceLabel}` : priceLabel || "Consultar"}
    </span>
  );
}
