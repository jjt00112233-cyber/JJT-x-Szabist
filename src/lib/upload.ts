import { createServerFn } from "@tanstack/react-start";

export interface UploadResult {
  url: string;
  provider: "cloudinary" | "imgbb" | "data-uri";
  publicId?: string;
}

async function sha1Hex(str: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const enc = new TextEncoder().encode(str);
    const hashBuf = await crypto.subtle.digest("SHA-1", enc);
    return Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  const { createHash } = await import("node:crypto");
  return createHash("sha1").update(str).digest("hex");
}

/**
 * Core image uploader supporting Cloudinary with ImgBB fallback
 */
export async function uploadImageToCDN(
  fileBase64: string,
  fileName = "payment-receipt"
): Promise<UploadResult> {
  if (!fileBase64 || typeof fileBase64 !== "string") {
    throw new Error("Invalid image data provided");
  }

  // 1. Check Cloudinary credentials
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

  if (cloudName && apiKey && apiSecret) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const folder = "jjt_payments";
      const strToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = await sha1Hex(strToSign);

      const formData = new FormData();
      formData.append("file", fileBase64);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("folder", folder);
      formData.append("signature", signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.secure_url) {
          return {
            url: json.secure_url,
            provider: "cloudinary",
            publicId: json.public_id,
          };
        }
      } else {
        const errText = await res.text();
        console.warn("Cloudinary upload non-OK:", res.status, errText);
      }
    } catch (err) {
      console.warn("Cloudinary upload failed, checking fallback:", err);
    }
  }

  // 2. Fallback to ImgBB if configured
  const imgbbKey = (process.env.IMGBB_API_KEY || "").trim();
  if (imgbbKey) {
    try {
      const cleanBase64 = fileBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      const formData = new FormData();
      formData.append("image", cleanBase64);
      formData.append("name", fileName);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.url) {
          return {
            url: json.data.url,
            provider: "imgbb",
          };
        }
      }
    } catch (err) {
      console.warn("ImgBB upload failed:", err);
    }
  }

  // 3. Fallback: Return raw data-uri if external CDNs are unavailable
  const dataUrl = fileBase64.startsWith("data:")
    ? fileBase64
    : `data:image/jpeg;base64,${fileBase64}`;

  return {
    url: dataUrl,
    provider: "data-uri",
  };
}

/**
 * Server function exposed to client components for uploading payment screenshots
 */
export const uploadPaymentScreenshot = createServerFn({ method: "POST" })
  .validator((data: { fileBase64: string; fileName?: string }) => {
    if (!data.fileBase64 || typeof data.fileBase64 !== "string") {
      throw new Error("Invalid image data provided");
    }
    return data;
  })
  .handler(async ({ data }): Promise<UploadResult> => {
    return uploadImageToCDN(data.fileBase64, data.fileName);
  });
