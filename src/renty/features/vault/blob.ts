import { deleteConvexFileByUrl, uploadToConvexStorage } from '@/lib/convex-storage';

export async function uploadDocumentToBlob(file: File): Promise<{ url: string; size: number }> {
    try {
        const url = await uploadToConvexStorage({
            data: file,
            bucket: 'document',
            name: file.name,
            contentType: file.type,
            size: file.size,
        });

        return {
            url,
            size: file.size
        };
    } catch (error) {
        console.error('Error uploading document to Convex storage:', error);
        throw error;
    }
}

export async function deleteDocumentFromBlob(url: string): Promise<void> {
    try {
        await deleteConvexFileByUrl(url);
    } catch (error) {
        console.error('Error deleting document from storage:', error);
        throw error;
    }
}
