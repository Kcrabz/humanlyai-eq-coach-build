
import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const BLOG_POSTS = [
  {
    id: 1,
    title: "Understanding Your Emotional Intelligence",
    description: "Learn how to identify and leverage your unique emotional strengths",
    date: "May 3, 2025",
    category: "Self-Awareness",
    excerpt: "Emotional intelligence begins with recognizing your own emotional patterns and understanding how they influence your decisions and relationships."
  },
  {
    id: 2,
    title: "Five Daily Practices to Improve Your EQ",
    description: "Simple exercises that can transform your emotional responses",
    date: "April 28, 2025",
    category: "Personal Growth",
    excerpt: "Consistent small actions create significant change. These five daily practices take just minutes but can reshape how you process emotions."
  },
  {
    id: 3,
    title: "Communication Strategies for Emotionally Charged Situations",
    description: "Techniques to stay grounded when emotions run high",
    date: "April 21, 2025",
    category: "Communication",
    excerpt: "When tensions rise, these proven communication methods can help maintain clarity and connection instead of escalating conflict."
  },
  {
    id: 4,
    title: "The Science Behind Emotional Regulation",
    description: "Current research on how our brains process emotional information",
    date: "April 15, 2025",
    category: "Science",
    excerpt: "New neuroscience findings reveal how our brains create, process, and regulate emotions, offering insights for better emotional management."
  }
];

export default function BlogPage() {
  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">HumanlyAI Blog</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Insights, research, and practical advice on emotional intelligence, personal growth, and building better relationships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="md:col-span-2">
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="text-sm font-medium text-humanly-teal mb-2">FEATURED POST</div>
                <CardTitle className="text-2xl">The Connection Between Emotional Intelligence and Leadership</CardTitle>
                <CardDescription>How developing your EQ can transform your leadership abilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-humanly-pastel-blue to-humanly-pastel-mint rounded-md mb-4"></div>
                <p className="text-muted-foreground">
                  Research consistently shows that leaders with high emotional intelligence create more engaged teams, make better decisions under pressure, and foster more innovative environments. This in-depth article explores the key ways that emotional intelligence manifests in exceptional leadership.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">May 6, 2025</div>
                <Button variant="outline">Read Article</Button>
              </CardFooter>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="bg-humanly-pastel-peach/30 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Popular Categories</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="bg-white/50">Self-Awareness</Button>
                <Button variant="outline" size="sm" className="bg-white/50">Relationships</Button>
                <Button variant="outline" size="sm" className="bg-white/50">Leadership</Button>
                <Button variant="outline" size="sm" className="bg-white/50">Communication</Button>
                <Button variant="outline" size="sm" className="bg-white/50">Mindfulness</Button>
                <Button variant="outline" size="sm" className="bg-white/50">Research</Button>
              </div>
            </div>
            <div className="bg-humanly-pastel-mint/30 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Subscribe to Updates</h3>
              <p className="text-sm text-muted-foreground mb-4">Get the latest articles and insights delivered directly to your inbox.</p>
              <Button className="w-full bg-gradient-to-r from-humanly-teal to-humanly-teal-light hover:shadow-md transition-all">Subscribe</Button>
            </div>
          </div>
        </div>

        <Separator className="my-10" />

        <h2 className="text-2xl font-bold mb-6">Recent Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BLOG_POSTS.map((post) => (
            <Card key={post.id} className="shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <div className="text-xs font-medium text-humanly-teal mb-2">{post.category.toUpperCase()}</div>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <CardDescription>{post.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{post.excerpt}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">{post.date}</div>
                <Button variant="ghost" className="text-humanly-teal hover:text-humanly-teal/80">Continue Reading →</Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" size="lg" className="border-humanly-teal/20 hover:bg-humanly-teal/5">
            View All Articles
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
