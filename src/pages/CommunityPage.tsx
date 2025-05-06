
import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Marketing Director",
    image: null,
    content: "HumanlyAI has completely transformed my approach to difficult conversations at work. I used to dread confrontation, but now I have tools to navigate these situations with confidence and empathy.",
    archetype: "The Empathic Connector"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Software Engineer",
    image: null,
    content: "As someone who always struggled with understanding emotional cues, the personalized coaching has helped me build stronger relationships with my team. I've seen noticeable improvements in how I communicate.",
    archetype: "The Analytical Thinker"
  },
  {
    id: 3,
    name: "Aisha Patel",
    role: "Healthcare Professional",
    image: null,
    content: "The daily practice suggestions are what made the difference for me. Small, consistent actions have helped me become more mindful of my emotional responses in high-stress situations.",
    archetype: "The Composed Mediator"
  }
];

const DISCUSSION_TOPICS = [
  {
    id: 1,
    title: "How do you practice self-compassion during setbacks?",
    replies: 28,
    lastActive: "2 hours ago",
    tags: ["self-awareness", "resilience"]
  },
  {
    id: 2,
    title: "Techniques for staying calm during difficult conversations",
    replies: 42,
    lastActive: "5 hours ago",
    tags: ["communication", "emotional-regulation"]
  },
  {
    id: 3,
    title: "Share your biggest EQ growth moment",
    replies: 36,
    lastActive: "1 day ago",
    tags: ["success-stories", "personal-growth"]
  },
  {
    id: 4,
    title: "How to recognize emotional triggers before they affect you",
    replies: 19,
    lastActive: "2 days ago",
    tags: ["self-awareness", "emotional-regulation"]
  }
];

export default function CommunityPage() {
  return (
    <PageLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-3">HumanlyAI Community</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Connect with others on their emotional intelligence journey, share experiences, and learn together.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button className="bg-gradient-to-r from-humanly-teal to-humanly-teal-light hover:shadow-md transition-all">
              Join Community
            </Button>
            <Button variant="outline" className="border-humanly-teal/20 hover:bg-humanly-teal/5">
              Learn More
            </Button>
          </div>
        </div>

        <Tabs defaultValue="discussions" className="mb-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="discussions">Discussions</TabsTrigger>
            <TabsTrigger value="stories">Success Stories</TabsTrigger>
            <TabsTrigger value="events">Events & Workshops</TabsTrigger>
          </TabsList>
          
          <TabsContent value="discussions" className="mt-6">
            <div className="bg-gradient-to-r from-humanly-pastel-blue/30 to-humanly-pastel-mint/30 p-6 rounded-lg mb-6">
              <h2 className="text-xl font-medium mb-2">Join the Conversation</h2>
              <p className="text-muted-foreground mb-4">
                Share your experiences, ask questions, and connect with others who are also working on their emotional intelligence.
              </p>
              <div className="flex gap-4">
                <Button className="bg-white text-humanly-teal hover:bg-white/90">Start New Topic</Button>
                <Button variant="outline" className="bg-white/50 border-white">Browse All Topics</Button>
              </div>
            </div>
            
            <h3 className="text-xl font-medium mb-4">Popular Discussions</h3>
            <div className="space-y-4">
              {DISCUSSION_TOPICS.map((topic) => (
                <Card key={topic.id} className="hover:shadow-sm transition-shadow duration-300">
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg font-medium">{topic.title}</CardTitle>
                  </CardHeader>
                  <CardFooter className="py-3 border-t flex flex-wrap items-center justify-between gap-2">
                    <div className="flex gap-1 flex-wrap">
                      {topic.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-humanly-pastel-mint/20 border-humanly-teal/20 text-gray-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-4">{topic.replies} replies</span>
                      <span>Active {topic.lastActive}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="outline">View All Discussions</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="stories" className="mt-6">
            <h3 className="text-xl font-medium mb-4">Community Success Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((testimonial) => (
                <Card key={testimonial.id} className="hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-4 mb-2">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={testimonial.image || ""} alt={testimonial.name} />
                        <AvatarFallback className="bg-humanly-pastel-mint text-humanly-teal">
                          {testimonial.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{testimonial.name}</CardTitle>
                        <CardDescription>{testimonial.role}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground italic">{testimonial.content}</p>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Badge className="bg-humanly-pastel-peach/40 text-humanly-teal border-0">
                      {testimonial.archetype}
                    </Badge>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="mt-8 bg-humanly-pastel-blue/20 p-6 rounded-lg">
              <h3 className="text-xl font-medium mb-3">Share Your Story</h3>
              <p className="text-muted-foreground mb-4">
                Has HumanlyAI made a difference in your personal or professional life? We'd love to hear about your experience.
              </p>
              <Button className="bg-white text-humanly-teal hover:bg-white/90">Submit Your Story</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="events" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <div className="bg-humanly-pastel-mint/30 inline-block px-2 py-1 rounded text-xs font-medium text-humanly-teal mb-2">UPCOMING WEBINAR</div>
                  <CardTitle className="text-xl">Emotional Intelligence in Leadership</CardTitle>
                  <CardDescription>May 15, 2025 • 1:00 PM EST</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Join leadership expert Dr. Maya Williams for a discussion on how emotional intelligence separates good managers from exceptional leaders.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-humanly-teal"></div>
                      <span>Online</span>
                    </div>
                    <div>45 minutes</div>
                    <div>Free</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Register Now</Button>
                </CardFooter>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <div className="bg-humanly-pastel-peach/30 inline-block px-2 py-1 rounded text-xs font-medium text-humanly-teal mb-2">WORKSHOP SERIES</div>
                  <CardTitle className="text-xl">Building Resilience Through Emotional Awareness</CardTitle>
                  <CardDescription>Starting May 22, 2025 • 4 weekly sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    A 4-week interactive workshop series focused on developing emotional awareness as a foundation for personal resilience.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-humanly-teal"></div>
                      <span>Online</span>
                    </div>
                    <div>60 min/session</div>
                    <div>Premium Members</div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">View Details</Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="mt-8 text-center">
              <Button variant="outline" size="lg" className="border-humanly-teal/20 hover:bg-humanly-teal/5">
                View All Events
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
