// plugins/cloudinary.client.ts
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    // This will be used for client-side uploads
    const cloudinaryConfig = {
        cloudName: config.public.CLOUDINARY_CLOUD_NAME,  // Replace with your Cloudinary cloud name
        apiKey: config.public.CLOUDINARY_API_KEY,        // Replace with your API key (for signed uploads)
        apiSecret: config.public.CLOUDINARY_API_SECRET,  // Replace with your API secret (for signed uploads)
        uploadPreset: config.public.CLOUDINARY_UPLOAD_PRESET    // For unsigned uploads (create this in your Cloudinary dashboard)

    }

    return {
        provide: {
            cloudinaryConfig
        }
    }
})