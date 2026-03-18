// Organization Schema for uni-uk.ai brand
export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://uni-uk.ai/#organization",
    name: "uni-uk.ai",
    url: "https://uni-uk.ai",
    logo: {
      "@type": "ImageObject",
      url: "https://uni-uk.ai/logo.png",
      width: 512,
      height: 512,
    },
    description:
      "AI-powered platform for UK university discovery, rankings, and trending education news. Helping students find the perfect university with comprehensive data and insights.",
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      url: "https://uni-uk.ai/#about",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// WebSite Schema with SearchAction for sitelinks search box
export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://uni-uk.ai/#website",
    name: "uni-uk.ai",
    url: "https://uni-uk.ai",
    description:
      "AI-powered UK university discovery platform with rankings, trending education news, and comprehensive university data.",
    publisher: {
      "@id": "https://uni-uk.ai/#organization",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://uni-uk.ai/?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// EducationalOrganization Schema for university pages
interface EducationalOrganizationSchemaProps {
  name: string;
  url: string;
  description: string;
  location: string;
  imageUrl: string;
  rankings?: {
    guardian?: number;
    the?: number;
    nss?: number;
  };
}

export function EducationalOrganizationSchema({
  name,
  url,
  description,
  location,
  imageUrl,
  rankings,
}: EducationalOrganizationSchemaProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": url,
    name: name,
    url: url,
    description: description,
    image: imageUrl,
    address: {
      "@type": "PostalAddress",
      addressLocality: location,
      addressCountry: "United Kingdom",
    },
  };

  // Add aggregate rating if NSS score available
  if (rankings?.nss) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rankings.nss / 20, // Convert percentage to 5-star scale
      bestRating: 5,
      worstRating: 1,
      ratingCount: 1000, // Approximate NSS response count
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// BreadcrumbList Schema for navigation hierarchy
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// FAQPage Schema for FAQ sections
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Article Schema for blog posts
interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
}

export function ArticleSchema({
  title,
  description,
  url,
  imageUrl,
  datePublished,
  dateModified,
  authorName,
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: title,
    description: description,
    url: url,
    image: imageUrl,
    datePublished: datePublished,
    dateModified: dateModified,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "uni-uk.ai",
      logo: {
        "@type": "ImageObject",
        url: "https://uni-uk.ai/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ItemList Schema for rankings pages
interface RankingItem {
  name: string;
  url: string;
  position: number;
}

interface ItemListSchemaProps {
  name: string;
  description: string;
  items: RankingItem[];
}

export function ItemListSchema({ name, description, items }: ItemListSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: name,
    description: description,
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      url: item.url,
      name: item.name,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
