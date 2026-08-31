/**
 * JSON-LD structured data generators for SEO.
 * Returns script tag content for provider pages, breadcrumbs, FAQs.
 */

interface ProviderForJsonLd {
  name: string
  type: string
  slug: string
  tagline?: string | null
  description?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  address?: string | null
  city?: string | null
  area?: string | null
  pincode?: string | null
  latitude?: number | null
  longitude?: number | null
  rating: number
  reviewCount: number
  verified: boolean
  bookingEnabled?: boolean
  doctorProfile?: {
    specialty?: string | null
    qualifications?: string | null
    consultationFee?: number
  } | null
}

const SCHEMA_ORG = 'https://schema.org'

function getProviderSchemaType(type: string): string {
  switch (type) {
    case 'DOCTOR': return 'Physician'
    case 'MEDICAL_SHOP': return 'Pharmacy'
    case 'CLINIC_LAB': return 'MedicalClinic'
    default: return 'LocalBusiness'
  }
}

export function providerJsonLd(provider: ProviderForJsonLd, baseUrl: string) {
  const schema: any = {
    '@context': SCHEMA_ORG,
    '@type': getProviderSchemaType(provider.type),
    '@id': `${baseUrl}/#provider/${provider.slug}`,
    name: provider.name,
    url: `${baseUrl}/#provider/${provider.slug}`,
    description: provider.description || provider.tagline || undefined,
    telephone: provider.phone || undefined,
    email: provider.email || undefined,
    image: provider.website ? `${baseUrl}/logo.png` : undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: provider.address || provider.area || undefined,
      addressLocality: provider.city || undefined,
      postalCode: provider.pincode || undefined,
      addressCountry: 'IN',
    },
    geo:
      provider.latitude && provider.longitude
        ? {
            '@type': 'GeoCoordinates',
            latitude: provider.latitude,
            longitude: provider.longitude,
          }
        : undefined,
    aggregateRating:
      provider.reviewCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: provider.rating,
            reviewCount: provider.reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  }

  // Add medicalSpecialty for doctors
  if (provider.type === 'DOCTOR' && provider.doctorProfile?.specialty) {
    schema.medicalSpecialty = provider.doctorProfile.specialty
    schema.description =
      provider.description ||
      `${provider.name} is a ${provider.doctorProfile.specialty} ${provider.city ? `in ${provider.city}` : ''}. Book an appointment on MediFind.`
    if (provider.doctorProfile.qualifications) {
      schema.qualifications = provider.doctorProfile.qualifications
    }
    if (provider.doctorProfile.consultationFee) {
      schema.priceRange = `₹${provider.doctorProfile.consultationFee}`
    }
  }

  // Clean up undefined values
  Object.keys(schema).forEach((key) => {
    if (schema[key] === undefined || schema[key] === null) {
      delete schema[key]
    } else if (typeof schema[key] === 'object' && !Array.isArray(schema[key])) {
      Object.keys(schema[key]).forEach((subKey) => {
        if (schema[key][subKey] === undefined || schema[key][subKey] === null) {
          delete schema[key][subKey]
        }
      })
      if (Object.keys(schema[key]).length === 0) delete schema[key]
    }
  })

  return schema
}

export function breadcrumbJsonLd(items: { name: string; url: string }[], baseUrl: string) {
  return {
    '@context': SCHEMA_ORG,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': SCHEMA_ORG,
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/** Generate FAQs based on provider type and data. */
export function generateProviderFaqs(provider: ProviderForJsonLd): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = []

  if (provider.type === 'DOCTOR' && provider.doctorProfile?.specialty) {
    faqs.push({
      question: `How do I book an appointment with ${provider.name}?`,
      answer: provider.bookingEnabled === false
        ? `${provider.name} currently requires phone booking. Call ${provider.phone} to schedule an appointment.`
        : `You can book an appointment with ${provider.name} online through MediFind. Visit their profile, select a chamber, choose a date and time slot, and enter your details. No account required.`,
    })

    if (provider.doctorProfile.consultationFee) {
      faqs.push({
        question: `What is the consultation fee for ${provider.name}?`,
        answer: `The consultation fee for ${provider.name} is ₹${provider.doctorProfile.consultationFee}. Payment is typically made directly at the clinic.`,
      })
    }

    faqs.push({
      question: `Where is ${provider.name} located?`,
      answer: `${provider.name} is located in ${[provider.area, provider.city].filter(Boolean).join(', ')}${provider.pincode ? ` (PIN: ${provider.pincode})` : ''}. You can find the exact address and directions on their MediFind profile.`,
    })

    if (provider.rating > 0) {
      faqs.push({
        question: `What is the rating of ${provider.name}?`,
        answer: `${provider.name} has a rating of ${provider.rating.toFixed(1)} out of 5 based on ${provider.reviewCount} patient reviews on MediFind.`,
      })
    }
  } else if (provider.type === 'MEDICAL_SHOP') {
    faqs.push({
      question: `What services does ${provider.name} offer?`,
      answer: `${provider.name} is a medical shop${provider.city ? ` in ${provider.city}` : ''} offering prescription medicines, OTC products, and healthcare supplies. Visit their MediFind profile for a full list of services.`,
    })
  } else if (provider.type === 'CLINIC_LAB') {
    faqs.push({
      question: `What lab tests are available at ${provider.name}?`,
      answer: `${provider.name} offers a wide range of diagnostic tests including blood tests, urine tests, and health packages. Visit their MediFind profile to see test prices and details.`,
    })

    faqs.push({
      question: `Where is ${provider.name} located?`,
      answer: `${provider.name} is located in ${[provider.area, provider.city].filter(Boolean).join(', ')}. You can find the exact address on their MediFind profile.`,
    })
  }

  return faqs
}
