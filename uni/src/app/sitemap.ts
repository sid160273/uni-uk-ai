import { MetadataRoute } from 'next'
import { getAllUniversities, REGION_SLUGS } from '@/lib/data'

/**
 * Sitemap for uni-uk.ai as a UK university and Clearing site.
 *
 * Deliberately excluded: /blog/*, /blog/category/*, /topic/*, /crypto/* and the
 * sport/tech/business/entertainment hubs. Those are the legacy general-news
 * archive — tens of thousands of URLs that made Google read this as a stale
 * news portal. They stay live and are marked noindex,follow (see src/lib/seo.ts)
 * rather than being deleted, so no inbound link 404s.
 *
 * To bring a section back into the index, remove NOINDEX_FOLLOW from its
 * metadata and add its URLs back here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://uni-uk.ai'
  const now = new Date()

  const universityUrls = getAllUniversities().map((uni) => ({
    url: `${baseUrl}/universities/${uni.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const regionUrls = REGION_SLUGS.map((region) => ({
    url: `${baseUrl}/regions/${region}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Clearing is the priority cluster for this cycle.
  const clearingUrls = [
    '/clearing',
    '/clearing/how-it-works',
    '/clearing/missed-grades',
    '/clearing/better-than-expected',
    '/clearing/key-dates',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: path === '/clearing' ? 0.95 : 0.9,
  }))

  const rankingUrls = [
    '/rankings/academic',
    '/rankings/satisfaction',
    '/rankings/sports',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const trustUrls = ['/about', '/editorial-policy', '/contact', '/privacy'].map(
    (path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    })
  )

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    ...clearingUrls,
    {
      url: `${baseUrl}/universities`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    ...rankingUrls,
    ...regionUrls,
    ...universityUrls,
    ...trustUrls,
  ]
}
