export type PaymentProvider = {
  createIntent(orderId: string): Promise<{ reference: string }>;
};

class MercadoPagoPlaceholderProvider implements PaymentProvider {
  async createIntent(orderId: string) {
    return { reference: `mp-link-pending-${orderId}` };
  }
}

export function getPaymentProvider() {
  return new MercadoPagoPlaceholderProvider();
}
