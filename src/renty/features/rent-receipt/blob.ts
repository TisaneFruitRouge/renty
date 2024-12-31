import { put, del } from '@vercel/blob';

export async function saveReceiptToBlob(pdfBuffer: Buffer): Promise<string | null> {
    try {
        const blobName = new Date().toISOString().replace(/:/g, "-") + ".pdf";
        
        const { url } = await put(blobName, pdfBuffer, {
            access: 'public',
            contentType: 'application/pdf',
        });

        return url;
    } catch (error) {
        console.error('Error saving receipt to blob storage:', error);
        return null;
    }
}

export async function deleteReceiptFromBlob(url: string): Promise<void> {
    try {
        await del(url);
    } catch (error) {
        console.error('Error deleting receipt from blob storage:', error);
    }
}