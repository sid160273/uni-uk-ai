"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock, Calendar } from "lucide-react";
import { BlogPost } from "@/data/blog-posts";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

function PostImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);

  if (!src || !src.startsWith("http") || error) {
    return (
      <div className={`bg-gradient-to-br from-primary/20 to-violet-600/20 ${className || ""}`} />
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

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (featured) {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group block bg-card border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all"
      >
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative h-64 md:h-full min-h-[250px] overflow-hidden">
            <PostImage
              src={post.imageUrl}
              alt={post.title}
              className="absolute inset-0 w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-violet-600/20 opacity-30" />
          </div>
          <div className="p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                {post.category}
              </span>
              <span className="text-xs text-muted-foreground">Featured</span>
            </div>
            <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h2>
            <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{post.readingTime} min read</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-card border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all"
    >
      <div className="relative h-48 overflow-hidden">
        <PostImage
          src={post.imageUrl}
          alt={post.title}
          className="absolute inset-0 w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-violet-600/10 opacity-30" />
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-background/90 backdrop-blur-sm text-xs font-medium rounded-full">
            {post.category}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readingTime} min</span>
          </div>
        </div>
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(showFeatured ? otherPosts : posts).map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
