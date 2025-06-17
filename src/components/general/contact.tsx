"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Twitter,
  Instagram,
  Facebook,
  MessageSquare,
  Users,
  BookOpen,
  ExternalLink,
  Heart,
  Sparkles,
} from "lucide-react";

const socialLinks = [
  {
    name: "Twitter",
    icon: Twitter,
    url: "https://twitter.com/unmatchedlines",
    description: "Follow us for daily poetry updates and literary discussions",
    color: "hover:text-blue-500",
    bgColor: "hover:bg-blue-500/10",
  },
  {
    name: "Instagram",
    icon: Instagram,
    url: "https://instagram.com/unmatchedlines",
    description: "Visual poetry and behind-the-scenes content",
    color: "hover:text-pink-500",
    bgColor: "hover:bg-pink-500/10",
  },
  {
    name: "Facebook",
    icon: Facebook,
    url: "https://facebook.com/unmatchedlines",
    description: "Join our poetry community and discussions",
    color: "hover:text-blue-600",
    bgColor: "hover:bg-blue-600/10",
  },
  {
    name: "Quora",
    icon: MessageSquare,
    url: "https://quora.com/profile/unmatchedlines",
    description: "Ask questions about poetry and literature",
    color: "hover:text-red-500",
    bgColor: "hover:bg-red-500/10",
  },
  {
    name: "Reddit",
    icon: Users,
    url: "https://reddit.com/u/unmatchedlines",
    description: "Participate in poetry discussions and AMAs",
    color: "hover:text-orange-500",
    bgColor: "hover:bg-orange-500/10",
  },
  {
    name: "Medium",
    icon: BookOpen,
    url: "https://medium.com/@unmatchedlines",
    description: "Read our in-depth articles on poetry and literature",
    color: "hover:text-green-500",
    bgColor: "hover:bg-green-500/10",
  },
];

export default function Contact() {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleEmailClick = () => {
    window.location.href =
      "mailto:unmatchedlines@gmail.com?subject=Hello from Unmatched Lines";
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("unmatchedlines@gmail.com");
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch (err) {
      console.error("Failed to copy email:", err);
    }
  };

  const handleSocialClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <Badge variant="secondary" className="text-xs">
              Connect With Us
            </Badge>
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Connect with us and join our vibrant poetry community. We would love to
            hear from fellow poetry enthusiasts, writers, and readers.
          </p>
        </div>

        {/* Email Section */}
        <Card className="mb-12 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 ring-2 ring-primary/20">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Email Us</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Have a question, suggestion, or want to collaborate? Drop us an
                email and we will get back to you soon.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button
                  onClick={handleEmailClick}
                  size="lg"
                  className="px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Send Email
                </Button>
                <Button
                  onClick={handleCopyEmail}
                  variant="outline"
                  size="lg"
                  className="px-6 py-3 rounded-full transition-all duration-300"
                >
                  {copiedEmail ? "Copied!" : "Copy Email"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4 font-mono">
                unmatchedlines@gmail.com
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Section */}
        <div className="grid grid-cols-1 gap-6">
          {socialLinks.map((social) => {
            const IconComponent = social.icon;
            return (
              <Card
                key={social.name}
                className={`bg-card/50 backdrop-blur-sm transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg ${social.bgColor} group border hover:border-primary/20`}
                onClick={() => handleSocialClick(social.url)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${social.color}`}
                    >
                      <IconComponent className="h-6 w-6 text-muted-foreground group-hover:text-current transition-colors duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        {social.name}
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                        {social.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Community Section */}
        <Card className="bg-gradient-to-r from-card/80 to-card/40 backdrop-blur-sm mb-8 border">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-red-500" />
                <h2 className="text-2xl font-bold">Join Our Community</h2>
                <Heart className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
                Unmatched Lines is more than just a poetry platform—it is a
                community of passionate writers, readers, and poetry lovers.
                Whether you are sharing your own work, discovering new voices, or
                engaging in literary discussions, there is a place for you here.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge
                  variant="secondary"
                  className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 px-3 py-1"
                >
                  Poetry Sharing
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30 px-3 py-1"
                >
                  Literary Discussions
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 px-3 py-1"
                >
                  Writer Community
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30 px-3 py-1"
                >
                  Cultural Exchange
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30 px-3 py-1"
                >
                  Multilingual Poetry
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Time Info */}
        <Card className="bg-card/30 backdrop-blur-sm border">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Response Times
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center gap-2 text-muted-foreground p-3 rounded-lg bg-muted/20">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span>Email: 24-48 hours</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground p-3 rounded-lg bg-muted/20">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <span>Social Media: Same day</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground p-3 rounded-lg bg-muted/20">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span>Community: Always active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-muted-foreground text-sm mb-2">
            Thank you for being part of the Unmatched Lines community
          </p>
          <p className="text-muted-foreground/70 text-xs">
            For urgent matters, feel free to reach out on our social media
            channels for faster responses.
          </p>
        </div>
      </div>
    </div>
  );
}
