import { Binary, Shield, Mail, Zap, Settings, Heart } from 'lucide-react'
import { FeatureCard } from './feature-card'

export function FeaturesGrid() {
  const features = [
    {
      icon: Binary,
      title: 'Smart Algorithm',
      description: 'Uses graph theory to guarantee fair pairings. Everyone gives exactly one gift and receives exactly one gift—no exceptions.'
    },
    {
      icon: Settings,
      title: 'Advanced Constraints',
      description: 'Handle complex scenarios with exclusion rules (people who can\'t be paired) and forced pairings for predetermined matches.'
    },
    {
      icon: Mail,
      title: 'Instant Email Delivery',
      description: 'Automatically send personalized Secret Santa assignments to all participants. Or generate pairs and share them manually.'
    },
    {
      icon: Shield,
      title: 'Privacy Protected',
      description: 'Your data never leaves your browser unless you choose to send emails. No accounts, no tracking, no data storage.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Generate perfect pairings in milliseconds, even for large groups. No waiting, no complex setup—just instant results.'
    },
    {
      icon: Heart,
      title: 'Free Forever',
      description: 'Built with love for the community. No hidden fees, no premium tiers, no limitations. Always free, always will be.'
    }
  ]

  return (
    <section id="features" className="py-16 lg:py-24 px-4">
      {/* Container - Layer 1 (base container) */}
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16 space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-neutral-100 to-neutral-200/80 rounded-full shadow-subtle text-neutral-900 text-sm font-medium">
            <span>✨</span>
            <span>Features That Make Us Different</span>
          </div>

          {/* Heading - Color layering for emphasis */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-700 bg-clip-text text-transparent drop-shadow-sm">
              Why Choose Our Generator?
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg lg:text-xl text-neutral-700 max-w-3xl mx-auto leading-relaxed">
            Combining sophisticated algorithms with intuitive design to make your Secret Santa experience effortless.
          </p>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-red-500/40 to-green-500/40 shadow-subtle" />
            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-red-500 to-green-500 shadow-standard" />
            <div className="h-[2px] w-20 bg-gradient-to-r from-green-500/40 via-red-500/40 to-transparent shadow-subtle" />
          </div>
        </div>

        {/* Features Grid - Responsive box rearrangement */}
        {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>

        {/* Bottom accent - Layer 2 (slightly elevated decorative element) */}
        <div className="mt-12 lg:mt-16 flex justify-center">
          <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-cream-200/60 to-cream-300/60 rounded-full shadow-subtle backdrop-blur-sm">
            <span className="text-sm lg:text-base text-neutral-700 font-medium">
              All features included, no hidden costs
            </span>
            <span className="text-lg">🎁</span>
          </div>
        </div>
      </div>
    </section>
  )
}
