import { v2 as cloudinary } from 'cloudinary'
import { defineEventHandler, getQuery } from 'h3'
import { useRuntimeConfig } from '#imports'

export default defineEventHandler((event) => {
    const query = getQuery(event)
    const { folder, public_id, timestamp } = query

    if (!timestamp) {
        throw new Error('Timestamp is required')
    }

    // Access runtime configuration
    const config = useRuntimeConfig()

    const signature = cloudinary.utils.api_sign_request(
        {
            folder,
            public_id,
            timestamp
        },
        config.CLOUDINARY_API_SECRET // Use the server-side secret from runtime config
    )

    return {
        signature,
        apiKey: config.public.CLOUDINARY_API_KEY,
        cloudName: config.public.CLOUDINARY_CLOUD_NAME
    }
})