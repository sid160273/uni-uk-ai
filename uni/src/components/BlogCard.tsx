"use client";

import Link from "next/link";
import { useState } from "react";
import { BlogPost } from "@/data/blog-posts";

function PostImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);

  if (!src || !src.startsWith("http") || error) {
    return (
      <div className={`bg-muted ${className || ""}`} />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className || ""}`}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

export function BlogCard({ post, featured = false }: { post: BlogPost; featured?: boolean }) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="group block border-b border-border pb-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative aspect-video overflow-hidden">
            <PostImage src={post.imageUrl} alt={post.title} className="absolute inset-0 w-full h-full group-hover:scale-[1.02] transition-transform duration-500" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[11px] font-bold uppercase tracking-editorial text-destructive mb-2">
              {post.category}
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3 leading-tight group-hover:underline decoration-1 underline-offset-4 line-clamp-2">
              {post.title}
            </h2>
            <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{formattedDate}</span>
              <span>&middot;</span>
              <span>{post.readingTime} min read</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-video overflow-hidden mb-3">
        <PostImage src={post.imageUrl} alt={post.title} className="absolute inset-0 w-full h-full group-hover:scale-[1.02] transition-transform duration-500" />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-editorial text-muted-foreground">
        {post.category}
      </span>
      <h3 className="font-display text-lg font-bold mt-1 mb-2 leading-snug group-hover:underline decoration-1 underline-offset-2 line-clamp-2">
        {post.title}
      </h3>
      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{post.excerpt}</p>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{formattedDate}</span>
        <span>&middot;</span>
        <span>{post.readingTime} min</span>
      </div>
    </Link>
  );
}

interface BlogCardListProps {
  posts: BlogPost[];
  showFeatured?: boolean;
}

export function BlogCardList({ posts, showFeatured = true }: BlogCardListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts found.</p>
      </div>
    );
  }

  const [featuredPost, ...otherPosts] = posts;

  return (
    <div className="space-y-8">
      {showFeatured && featuredPost && (
        <BlogCard post={featuredPost} featured />
      )}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {(showFeatured ? otherPosts : posts).map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
