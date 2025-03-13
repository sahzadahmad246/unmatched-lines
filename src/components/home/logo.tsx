import { Feather } from "lucide-react"
import Link from "next/link"

export function Logo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "gap-1.5",
    default: "gap-2",
    large: "gap-2.5",
  }

  const iconSizes = {
    small: 18,
    default: 24,
    large: 28,
  }

  const textSizes = {
    small: "text-lg",
    default: "text-xl",
    large: "text-2xl",
  }

  return (
    <Link href="/" className={`flex items-center ${sizeClasses[size]}`}>
      <div className="flex items-center justify-center rounded-md bg-primary p-1.5">
        <Feather className="text-primary-foreground" size={iconSizes[size]} />
      </div>
      <span
        className={`font-bold tracking-tight ${textSizes[size]} bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent`}
      >
        Unmatched Lines
      </span>
    </Link>
  )
}

