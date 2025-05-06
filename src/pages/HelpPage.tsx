
import React, { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    question: "What is emotional intelligence coaching?",
    answer: "Emotional intelligence coaching is a personalized process that helps you identify, understand, and manage your emotions more effectively. Our AI coach provides guidance, exercises, and feedback to help you develop your emotional awareness, regulation, empathy, and social skills."
  },
  {
    question: "How accurate is the emotional intelligence assessment?",
    answer: "Our assessment is based on validated psychological frameworks and principles. While no self-assessment tool is perfect, we've designed ours to provide meaningful insights that can serve as a starting point for your emotional growth journey. The more honest you are in your responses, the more accurate and useful your results will be."
  },
  {
    question: "How often should I use the coaching feature?",
    answer: "For optimal results, we recommend engaging with your AI coach at least 2-3 times per week. Regular practice helps reinforce new emotional skills and habits. However, you're welcome to use the service as often as you find helpful, whether that's daily or a few times per month."
  },
  {
    question: "Is my information private and confidential?",
    answer: "Yes, we take privacy very seriously. Your conversations with the AI coach and assessment results are encrypted and confidential. We do not share your personal information with third parties. You can review our complete privacy policy for more details on how we protect your data."
  },
  {
    question: "Can I change my emotional intelligence archetype?",
    answer: "You can retake your assessment at any time from your profile page. Your emotional intelligence archetype may change over time as you develop new skills and awareness. Many users find it valuable to reassess every few months to track their growth and identify new areas for development."
  },
  {
    question: "What's the difference between the free and premium plans?",
    answer: "The free plan gives you access to a basic assessment and limited coaching sessions. Premium plans offer additional features such as unlimited coaching, specialized development tracks, progress tracking tools, and priority access to new features. Visit our pricing page for a detailed comparison of plan options."
  }
];

const HELP_CATEGORIES = [
  { id: "account", label: "Account & Settings" },
  { id: "assessment", label: "Assessment & Results" },
  { id: "coaching", label: "AI Coaching" },
  { id: "subscription", label: "Subscription & Billing" },
  { id: "technical", label: "Technical Issues" }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-3">Help Center</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            Find answers to common questions and learn how to get the most out of HumanlyAI.
          </p>
          
          <div className="relative max-w-2xl mx-auto">
            <Input
              type="text"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-24 h-12 rounded-full border-humanly-teal/20 shadow-sm"
            />
            <Button 
              className="absolute right-1 top-1 rounded-full bg-gradient-to-r from-humanly-teal to-humanly-teal-light hover:shadow-md transition-all"
              size="sm"
            >
              Search
            </Button>
          </div>
        </div>

        <Tabs defaultValue="faq" className="mb-10">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">Frequently Asked Questions</TabsTrigger>
            <TabsTrigger value="guides">Getting Started Guides</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="faq" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <div className="sticky top-20 space-y-2">
                  <h3 className="font-medium mb-3 text-sm text-muted-foreground">CATEGORIES</h3>
                  {HELP_CATEGORIES.map((category) => (
                    <Button 
                      key={category.id} 
                      variant="ghost" 
                      className="justify-start w-full"
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>
                      Browse our most common questions and answers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {FAQ_ITEMS.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger className="text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent>
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="guides" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">Getting Started</CardTitle>
                  <CardDescription>Welcome to HumanlyAI</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Learn how to set up your account, take your first assessment, and start your emotional intelligence journey.
                  </p>
                  <Button variant="outline" className="w-full">Read Guide</Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">Understanding Your Results</CardTitle>
                  <CardDescription>Interpret your EQ profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Learn what your archetype means and how to use your assessment results to focus your personal development.
                  </p>
                  <Button variant="outline" className="w-full">Read Guide</Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-xl">Effective Coaching Sessions</CardTitle>
                  <CardDescription>Get the most from your AI coach</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Discover how to structure your coaching sessions, ask effective questions, and implement the advice you receive.
                  </p>
                  <Button variant="outline" className="w-full">Read Guide</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="contact" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Our support team is here to help.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Name</label>
                    <Input placeholder="Your name" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input placeholder="Your email address" type="email" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject</label>
                  <Input placeholder="What can we help you with?" />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <textarea 
                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Please describe your issue in detail..."
                  />
                </div>
                
                <Button className="w-full bg-gradient-to-r from-humanly-teal to-humanly-teal-light hover:shadow-md transition-all">
                  Submit Request
                </Button>
                
                <p className="text-center text-sm text-muted-foreground">
                  Typical response time: within 24 hours
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
