import type { property, rentReceipt, tenant, user } from "@/lib/types";

interface RentReceiptPreviewProps {
  receipt: rentReceipt & {
    property: (property & { user?: user | null }) | null;
    tenant: tenant | null;
  };
}

export function RentReceiptPreview({ receipt }: RentReceiptPreviewProps) {
  if (!receipt.blobUrl) {
    return null;
  }

  return (
    <iframe
      src={receipt.blobUrl}
      className="w-full h-[calc(100vh-12rem)] rounded-md border"
      title="Receipt preview"
    />
  );
}
