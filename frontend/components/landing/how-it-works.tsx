import { Users, ListChecks, Sparkles } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: Users,
      title: 'Enter Participants',
      description: 'Add email addresses for everyone joining the Secret Santa. Minimum 3 participants required for a valid exchange.',
      color: 'from-red-300 to-red-500'
    },
    {
      number: 2,
      icon: ListChecks,
      title: 'Add Optional Rules',
      description: 'Set exclusions (who can\'t be paired together) or forced pairings. Perfect for couples, families, or special preferences.',
      color: 'from-green-300 to-green-500'
    },
    {
      number: 3,
      icon: Sparkles,
      title: 'Generate & Send',
      description: 'Click generate and our algorithm creates fair pairings instantly. Choose to send emails automatically or share results manually.',
      color: 'from-cream-500 to-cream-700'
    }
  ]

  return (
    <section className="py-16 lg:py-24 px-4 relative">
      {/* Background accent - Layer 0 (deepest decorative layer) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cream-100/30 to-transparent pointer-events-none" />

      {/* Container - Layer 1 */}
      <div className="max-w-6xl mx-auto relative z-10">

        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16 space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-neutral-100 to-neutral-200/80 rounded-full shadow-subtle text-neutral-900 text-sm font-medium">
            <span>🎯</span>
            <span>Simple 3-Step Process</span>
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-700 bg-clip-text text-transparent drop-shadow-sm">
              How It Works
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg lg:text-xl text-neutral-700 max-w-2xl mx-auto leading-relaxed">
            Get your Secret Santa exchange up and running in less than 2 minutes.
          </p>
        </div>

        {/* Steps Container - Responsive rearrangement */}
        <div className="space-y-8 lg:space-y-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col lg:flex-row items-center gap-6 lg:gap-8 ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Step Number & Icon - Layer 3 (most elevated) */}
              <div className="flex-shrink-0">
                <div className="relative">
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} blur-2xl opacity-30 rounded-full scale-150`} />

                  {/* Step circle container */}
                  <div className={`relative bg-gradient-to-br ${step.color} rounded-3xl p-8 lg:p-10 shadow-prominent hover:shadow-elevated transition-all duration-300 group`}>
                    {/* Inner highlight */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-3xl pointer-events-none" />

                    {/* Icon */}
                    <div className="relative z-10">
                      <step.icon className="w-12 h-12 lg:w-16 lg:h-16 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
                    </div>

                    {/* Step number badge */}
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-neutral-900 to-neutral-700 rounded-full flex items-center justify-center shadow-standard">
                      <span className="text-white font-bold text-lg">{step.number}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step Content - Layer 2 (elevated content) */}
              <div className="flex-1 text-center lg:text-left">
                <div className="bg-gradient-to-br from-card to-neutral-50 rounded-2xl p-6 lg:p-8 shadow-standard hover:shadow-prominent transition-all duration-300">
                  {/* Inner highlight for polish */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-2xl pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10 space-y-3">
                    <h3 className="text-2xl lg:text-3xl font-bold text-neutral-900 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-base lg:text-lg text-neutral-700 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Connecting Line - Hidden on mobile, visible on desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-gradient-to-b from-neutral-300 to-transparent mt-32" />
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA accent */}
        <div className="mt-12 lg:mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-green-300/20 to-green-500/20 rounded-full shadow-subtle backdrop-blur-sm border border-green-500/30">
            <Sparkles className="w-5 h-5 text-green-700" />
            <span className="text-sm lg:text-base text-neutral-900 font-medium">
              Ready in under 2 minutes
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
