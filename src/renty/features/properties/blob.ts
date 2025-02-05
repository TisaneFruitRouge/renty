import { put, del } from '@vercel/blob';

export async function uploadImageToBlob(file: File): Promise<string> {
    try {
        const blobName = `properties/pictures/${new Date().toISOString().replace(/:/g, "-")}-${file.name}`;
        
        const { url } = await put(blobName, file, {
            access: 'public',
            contentType: file.type,
        });

        return url;
    } catch (error) {
        console.error('Error uploading image to blob storage:', error);
        throw error;
    }
}

export async function deleteImageFromBlob(url: string): Promise<void> {
    try {
        await del(url);
    } catch (error) {
        console.error('Error deleting image from blob storage:', error);
        throw error;
    }
}