import type { OrderStatus } from "@prisma/client";

const transitions: Record<OrderStatus, OrderStatus[]> = {
  draft: ["placed", "cancelled"],
  placed: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export function getAllowedTransitions(status: OrderStatus) {
  return transitions[status];
}

export function assertValidStatusTransition(currentStatus: OrderStatus, nextStatus: OrderStatus) {
  if (!getAllowedTransitions(currentStatus).includes(nextStatus)) {
    throw new Error(`No se puede pasar de ${currentStatus} a ${nextStatus}.`);
  }
}
