import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  index: number
}

export function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
  // Stagger animation delays based on index for cascade effect
  const animationDelay = index * 100

  return (
    <div
      className="group relative"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Feature Card - Following color layering principle */}
      {/* Layer 2: Card container (elevated surface) */}
      <div className="relative h-full bg-gradient-to-br from-card to-neutral-50 rounded-2xl p-6 lg:p-8 shadow-standard hover:shadow-prominent transition-all duration-300">

        {/* Gradient overlay for polished elevated surface */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-2xl pointer-events-none" />

        {/* Content container - Layer 3 (most elevated) */}
        <div className="relative z-10 flex flex-col items-start space-y-4">

          {/* Icon container with dual shadow and gradient */}
          {/* Lighter shade = more elevated per UI/UX principle */}
          <div className="relative">
            {/* Glow effect behind icon */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-green-500/20 blur-xl rounded-full scale-150" />

            {/* Icon box - Layer 3 (lightest shade, most elevated) */}
            <div className="relative bg-gradient-to-br from-red-300 to-red-500 p-4 rounded-xl shadow-button group-hover:shadow-button-hover group-hover:scale-110 transition-all duration-300">
              <Icon className="w-6 h-6 text-white drop-shadow-lg" strokeWidth={2.5} />
            </div>
          </div>

          {/* Text content */}
          <div className="space-y-2">
            <h3 className="text-xl lg:text-2xl font-bold text-neutral-900 tracking-tight">
              {title}
            </h3>
            <p className="text-sm lg:text-base text-neutral-700 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Hover accent line - appears on hover */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-green-500 to-red-500 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-subtle" />
      </div>
    </div>
  )
}
