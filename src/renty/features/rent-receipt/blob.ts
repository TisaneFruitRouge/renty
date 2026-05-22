import { deleteConvexFileByUrl, uploadToConvexStorage } from '@/lib/convex-storage';

export async function saveReceiptToBlob(pdfBuffer: Buffer): Promise<string | null> {
    try {
        return await uploadToConvexStorage({
            data: new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' }),
            bucket: 'rentReceipt',
            name: `${new Date().toISOString().replace(/:/g, "-")}-${crypto.randomUUID()}.pdf`,
            contentType: 'application/pdf',
            size: pdfBuffer.byteLength,
        });
    } catch (error) {
        console.error('Error saving receipt to Convex storage:', error);
        return null;
    }
}

export async function deleteReceiptFromBlob(url: string): Promise<void> {
    try {
        await deleteConvexFileByUrl(url);
    } catch (error) {
        console.error('Error deleting receipt from storage:', error);
    }
}
