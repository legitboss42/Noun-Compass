"use client";

export function PrintReceiptButton() {
  return <button className="button receipt-print-button" type="button" onClick={() => window.print()}>Print or save receipt</button>;
}
