import { MetadataRoute } from 'next'
import { getAllUniversities } from '@/lib/data'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://uni-uk.ai'

  // Get all universities
  const universities = getAllUniversities()

  // Generate university page URLs
  const universityUrls = universities.map((uni) => ({
    url: `${baseUrl}/universities/${uni.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/universities`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...universityUrls,
  ]
}
