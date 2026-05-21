const bsFormatter = new Intl.NumberFormat('es-VE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBs(amount: number): string {
  return `Bs. ${bsFormatter.format(amount)}`;
}
