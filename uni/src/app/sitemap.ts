import { MetadataRoute } from 'next'
import { getAllUniversities } from '@/lib/data'
import { getAllBlogPosts } from '@/data/blog-posts'

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

  // Get all blog posts
  const blogPosts = getAllBlogPosts()

  const blogUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
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
  ]
}
