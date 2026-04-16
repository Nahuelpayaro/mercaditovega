import { CheckoutForm } from "@/components/storefront/checkout-form";
import { PageHeader } from "@/components/ui/page-header";

export default async function CheckoutPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Checkout"
        title="Confirmá tu pedido en minutos"
        description="Sin registro ni vueltas raras: dejás tus datos, revisás el resumen y seguimos por WhatsApp."
      />
      <CheckoutForm />
    </div>
  );
}
