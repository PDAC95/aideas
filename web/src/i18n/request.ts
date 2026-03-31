import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'

export default getRequestConfig(async () => {
  // Read locale from cookie first, fall back to Accept-Language header
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value

  let locale = 'en'

  if (cookieLocale === 'es' || cookieLocale === 'en') {
    locale = cookieLocale
  } else {
    // Detect from Accept-Language header
    const headersList = await headers()
    const acceptLanguage = headersList.get('accept-language') ?? ''
    if (acceptLanguage.toLowerCase().startsWith('es')) {
      locale = 'es'
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
