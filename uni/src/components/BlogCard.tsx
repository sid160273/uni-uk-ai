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
            <span className="text-[11px] font-bold uppercase tracking-editorial text-destructive mb-3">
              {post.category}
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-black leading-[1.15] mb-3 group-hover:underline decoration-1 underline-offset-4 line-clamp-3">
              {post.title}
            </h2>
            <p className="font-body-serif text-base text-muted-foreground leading-relaxed mb-4 line-clamp-3">
              {post.excerpt}
            </p>
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {post.author || "uni-uk.ai Newsroom"}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <div className="relative aspect-video overflow-hidden mb-4">
        <PostImage src={post.imageUrl} alt={post.title} className="absolute inset-0 w-full h-full group-hover:scale-[1.02] transition-transform duration-500" />
      </div>
      <h3 className="font-display text-lg font-extrabold leading-[1.2] mb-2.5 group-hover:underline decoration-1 underline-offset-2 line-clamp-3">
        {post.title}
      </h3>
      <p className="font-body-serif text-[15px] text-muted-foreground leading-relaxed mb-3 line-clamp-3">
        {post.excerpt}
      </p>
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        {post.author || "uni-uk.ai Newsroom"}
      </span>
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
    <div className="space-y-10">
      {showFeatured && featuredPost && (
        <BlogCard post={featuredPost} featured />
      )}
      <div className="grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
        {(showFeatured ? otherPosts : posts).map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
