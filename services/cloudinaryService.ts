import { ref } from 'vue'
import { useNuxtApp } from '#app'

export const useCloudinaryService = () => {
    const { $cloudinaryConfig } = useNuxtApp()
    const isUploading = ref(false)
    const uploadProgress = ref(0)
    const uploadError = ref<string | null>(null)

    const uploadImage = async (file: File, folder = 'parking-spots') => {
        if (!$cloudinaryConfig.cloudName) {
            throw new Error('Cloudinary configuration is missing')
        }

        console.log('Cloudinary Config:', $cloudinaryConfig)
        console.log('File:', file)
        if (!file || !(file instanceof File)) {
            throw new Error('Invalid file provided for upload')
        }
        console.log('Folder:', folder)

        isUploading.value = true
        uploadProgress.value = 0
        uploadError.value = null

        try {
            // Step 1: Get the signature from the server
            const timestamp = Math.floor(Date.now() / 1000) // Current timestamp in seconds
            const signatureResponse = await fetch(`/api/cloudinary-signature?folder=${folder}&timestamp=${timestamp}`)
            const { signature, apiKey, cloudName } = await signatureResponse.json()

            if (!signature) {
                throw new Error('Failed to get signature from server')
            }

            // Step 2: Prepare the form data
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', folder)
            formData.append('api_key', apiKey)
            formData.append('timestamp', timestamp.toString())
            formData.append('signature', signature)

            // Step 3: Upload the file to Cloudinary
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('Response Error:', errorText)
                throw new Error(`Upload failed with status ${response.status}`)
            }

            const uploadResult = await response.json()
            isUploading.value = false
            return uploadResult
        } catch (error) {
            uploadError.value = (error as Error).message
            isUploading.value = false
            throw error
        }
    }

    // Helper function to get optimized Cloudinary URL
    const getOptimizedUrl = (publicId: string, options: Record<string, any> = {}) => {
        const defaultOptions = {
            width: 300,
            height: 200,
            crop: 'fill',
            quality: 'auto',
            fetch_format: 'auto'
        }

        const opts = { ...defaultOptions, ...options }

        return `https://res.cloudinary.com/${$cloudinaryConfig.cloudName}/image/upload/${Object.entries(opts)
            .map(([key, value]) => `${key}_${value}`)
            .join(',')}/${publicId}`
    }

    return {
        isUploading,
        uploadProgress,
        uploadError,
        uploadImage,
        getOptimizedUrl
    }
}