import { MetadataRoute } from 'next'
import { getAllUniversities } from '@/lib/data'
import { getAllBlogPostsCombined, getAllCategoriesCombined } from '@/lib/blog-data'
import { getCryptoPosts } from '@/lib/crypto-data'
import { getAllTopics } from '@/lib/topic-utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // Regional pages
  const regions = [
    'scotland',
    'wales',
    'northern-ireland',
    'london',
    'north-england',
    'midlands',
    'south-west-england',
    'south-east-england',
    'east-england',
  ]

  const regionUrls = regions.map((region) => ({
    url: `${baseUrl}/regions/${region}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Get all blog posts (static + dynamic from Google Sheets)
  const blogPosts = await getAllBlogPostsCombined()

  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Get blog categories for category pages
  const categories = await getAllCategoriesCombined()

  const categoryUrls = categories.map((category) => ({
    url: `${baseUrl}/blog/category/${category.toLowerCase().replace(/\s+/g, '-')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Get all topics for topic hub pages
  const topics = await getAllTopics()

  const topicUrls = topics.map((topic) => ({
    url: `${baseUrl}/topic/${topic}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  // Section hub pages
  const sectionHubUrls = [
    { slug: 'sport', priority: 0.95 },
    { slug: 'tech', priority: 0.95 },
    { slug: 'entertainment', priority: 0.95 },
    { slug: 'business', priority: 0.95 },
  ].map(({ slug, priority }) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...sectionHubUrls,
    {
      url: `${baseUrl}/universities`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rankings/academic`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rankings/sports`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rankings/satisfaction`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...regionUrls,
    ...universityUrls,
    ...blogUrls,
    ...categoryUrls,
    ...topicUrls,
    {
      url: `${baseUrl}/crypto`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/crypto/news`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
  ]
}
