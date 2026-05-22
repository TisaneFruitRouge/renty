import { deleteConvexFileByUrl, uploadToConvexStorage } from '@/lib/convex-storage';

export async function uploadImageToBlob(file: File): Promise<string> {
    try {
        return await uploadToConvexStorage({
            data: file,
            bucket: 'propertyImage',
            name: file.name,
            contentType: file.type,
            size: file.size,
        });
    } catch (error) {
        console.error('Error uploading image to Convex storage:', error);
        throw error;
    }
}

export async function deleteImageFromBlob(url: string): Promise<void> {
    try {
        await deleteConvexFileByUrl(url);
    } catch (error) {
        console.error('Error deleting image from storage:', error);
        throw error;
    }
}
