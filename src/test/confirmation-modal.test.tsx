import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { ConfirmationModal } from "@/components/ConfirmationModal";

describe("ConfirmationModal component", () => {
  it("exports ConfirmationModal component function", () => {
    expect(typeof ConfirmationModal).toBe("function");
  });

  it("renders when open is false without throwing", () => {
    const html = renderToString(
      <ConfirmationModal
        open={false}
        onOpenChange={() => {}}
        title="Delete Item"
        description="Are you sure?"
        onConfirm={() => {}}
      />
    );
    expect(typeof html).toBe("string");
  });
});
