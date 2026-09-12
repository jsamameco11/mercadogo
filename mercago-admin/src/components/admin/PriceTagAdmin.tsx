export function PriceTagAdmin({ priceLabel, currency }: { priceLabel: string; currency?: string }) {
  const symbol = currency === "USD" ? "$" : currency === "PEN" ? "S/ " : "";
  const looksNumeric = /^[0-9.,]+$/.test((priceLabel || "").trim());
  return <span>{looksNumeric ? `${symbol}${priceLabel}` : priceLabel || "Consultar"}</span>;
}
