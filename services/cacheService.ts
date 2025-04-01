export const setCache = (key: string, value: any, maxAge: number = 86400000) => {
    const data = {
        value,
        expiry: Date.now() + maxAge, // Set expiry time
    }
    console.debug(`[Cache] Setting cache for key: ${key}`, data)
    localStorage.setItem(key, JSON.stringify(data))
}

export const getCache = (key: string) => {
    const cachedData = localStorage.getItem(key)
    if (!cachedData) {
        console.debug(`[Cache] No cache found for key: ${key}`)
        return null
    }

    try {
        const { value, expiry } = JSON.parse(cachedData)
        if (Date.now() > expiry) {
            console.debug(`[Cache] Cache expired for key: ${key}`)
            localStorage.removeItem(key)
            return null
        }
        console.debug(`[Cache] Cache hit for key: ${key}`, value)
        return value
    } catch (error) {
        console.error(`[Cache] Error parsing cache for key: ${key}`, error)
        localStorage.removeItem(key) // Remove corrupted cache
        return null
    }
}

export const clearCache = (key: string) => {
    console.debug(`[Cache] Clearing cache for key: ${key}`)
    localStorage.removeItem(key)
}

export const clearAllCache = () => {
    console.debug(`[Cache] Clearing all cache`)
    localStorage.clear()
}