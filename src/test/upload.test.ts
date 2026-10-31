import { describe, it, expect } from "vitest";
import { uploadImageToCDN, uploadPaymentScreenshot } from "@/lib/upload";

describe("Upload CDN utilities", () => {
  it("exports uploadPaymentScreenshot server function and uploadImageToCDN helper", () => {
    expect(typeof uploadPaymentScreenshot).toBe("function");
    expect(typeof uploadImageToCDN).toBe("function");
  });

  it("uploads base64 image to Cloudinary successfully", async () => {
    // 1x1 transparent png
    const b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const res = await uploadImageToCDN(b64, "vitest-payment-proof");

    expect(res).toBeDefined();
    expect(typeof res.url).toBe("string");
    expect(res.url.startsWith("http")).toBe(true);
    expect(res.provider).toBe("cloudinary");
    expect(res.url).toContain("res.cloudinary.com");
  }, 15000);

  it("handles empty or invalid image data gracefully", async () => {
    await expect(uploadImageToCDN("")).rejects.toThrow("Invalid image data provided");
  });
});
