import { describe, expect, it } from "vitest";
import { assertValidStatusTransition, getAllowedTransitions } from "@/lib/orders/status-machine";

describe("status machine", () => {
  it("allows only the next manual transitions", () => {
    expect(getAllowedTransitions("placed")).toEqual(["confirmed", "cancelled"]);
  });

  it("throws on invalid transitions", () => {
    expect(() => assertValidStatusTransition("ready", "confirmed")).toThrow(/No se puede/);
  });
});
