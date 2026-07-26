const terminalFailureStatuses = new Set(["cancelled", "canceled", "failed", "abandoned"]);

export function isPaymentReference(value: string) {
  return /^nc_[a-z0-9_]+$/i.test(value);
}

export function isTransactionIdentifier(value: string) {
  return /^[a-z0-9_-]+$/i.test(value);
}

export function shouldVerifyPaymentCallback(status: string | undefined, transactionId: string) {
  if (!isTransactionIdentifier(transactionId)) return false;
  return !terminalFailureStatuses.has(status?.trim().toLowerCase() ?? "");
}
