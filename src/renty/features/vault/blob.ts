import { put, del } from '@vercel/blob';

export async function uploadDocumentToBlob(file: File): Promise<{ url: string; size: number }> {
    try {
        const blobName = `properties/documents/${new Date().toISOString().replace(/:/g, "-")}-${file.name}`;
        
        const { url } = await put(blobName, file, {
            access: 'public',
            contentType: file.type,
        });

        return {
            url,
            size: file.size
        };
    } catch (error) {
        console.error('Error uploading document to blob storage:', error);
        throw error;
    }
}

export async function deleteDocumentFromBlob(url: string): Promise<void> {
    try {
        await del(url);
    } catch (error) {
        console.error('Error deleting document from blob storage:', error);
        throw error;
    }
}
