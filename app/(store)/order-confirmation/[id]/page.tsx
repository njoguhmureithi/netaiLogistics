export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import OrderConfirmationClient from "./_components/order-confirmation-client";

export default async function OrderConfirmationPage({ params }: { params: { id: string } }) {
  let order: any = null;
  try {
    order = await prisma.order.findUnique({ where: { id: params.id }, include: { items: true } });
    if (!order) return notFound();
  } catch { return notFound(); }
  return <OrderConfirmationClient order={JSON.parse(JSON.stringify(order))} />;
}
