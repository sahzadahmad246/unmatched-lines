import Link from "next/link"
import { type LucideIcon, Mail, Clock } from "lucide-react"

interface PolicySection {
  title: string
  content: string | string[]
}

interface PolicyPageProps {
  title: string
  icon: LucideIcon
  lastUpdated: string
  description: string
  sections: PolicySection[]
  contactEmail: string
  footerText: string
  additionalFooterButton?: {
    text: string
    href: string
  }
}

export default function PolicyPage({
  title,
  icon: Icon,
  lastUpdated,
  description,
  sections,
  contactEmail,
  footerText,
  additionalFooterButton,
}: PolicyPageProps) {
  const renderContent = (content: string | string[]) => {
    if (Array.isArray(content)) {
      return (
        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
          {content.map((item, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
      )
    }
    return <p dangerouslySetInnerHTML={{ __html: content }} />
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="h-16 w-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Content */}
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-xl text-muted-foreground leading-7 mb-8">{description}</p>

          {sections.map((section, index) => (
            <section key={index} className="my-8">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="inline-block h-6 w-1 bg-primary rounded-full"></span>
                {section.title}
              </h2>
              {renderContent(section.content)}
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="bg-muted/50 dark:bg-muted/30 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">{footerText}</span>
            </div>
            <div className="flex gap-3">
              {additionalFooterButton && (
                <Link
                  href={additionalFooterButton.href}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  {additionalFooterButton.text}
                </Link>
              )}
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
