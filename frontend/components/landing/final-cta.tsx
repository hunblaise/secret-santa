'use client'

import Link from 'next/link'
import { ArrowRight, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FinalCTA() {
  return (
    <section className="py-16 lg:py-24 px-4">
      {/* Container - Layer 1 */}
      <div className="max-w-5xl mx-auto">

        {/* CTA Card - Layer 2 (elevated surface) */}
        <div className="relative bg-gradient-to-br from-red-700 via-red-600 to-red-800 rounded-3xl p-8 lg:p-16 shadow-prominent overflow-hidden">

          {/* Background pattern - Layer 0 (deepest decorative) */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }} />
          </div>

          {/* Top highlight for polish - Light from above */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-3xl pointer-events-none" />

          {/* Floating decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-green-300/30 to-green-500/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-cream-300/30 to-cream-500/30 rounded-full blur-3xl" />

          {/* Content - Layer 3 (most elevated) */}
          <div className="relative z-10 text-center space-y-6 lg:space-y-8">

            {/* Gift icon with animation */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/20 blur-2xl rounded-full scale-150" />

                {/* Icon container */}
                <div className="relative bg-gradient-to-br from-white/30 to-white/20 backdrop-blur-sm p-6 rounded-2xl shadow-prominent animate-bounce-gift">
                  <Gift className="w-12 h-12 lg:w-16 lg:h-16 text-white drop-shadow-lg" strokeWidth={2} />
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white tracking-tight leading-tight drop-shadow-lg">
                Ready to Make Your
                <br />
                Gift Exchange Magical?
              </h2>

              {/* Decorative divider */}
              <div className="flex items-center justify-center gap-3">
                <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-white/60 to-white/60 shadow-subtle" />
                <div className="w-2 h-2 rounded-full bg-white shadow-standard" />
                <div className="h-[2px] w-16 bg-gradient-to-r from-white/60 via-white/60 to-transparent shadow-subtle" />
              </div>
            </div>

            {/* Description */}
            <p className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
              Join thousands of happy organizers who trust our generator for fair, effortless Secret Santa exchanges.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              {/* Primary CTA - White button (highest contrast = most elevated) */}
              <Link href="/">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white hover:bg-neutral-100 text-red-700 shadow-button hover:shadow-button-hover active:shadow-button-active transition-all duration-300 text-base lg:text-lg px-10 py-6 group font-semibold"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>

              {/* Secondary CTA */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className="w-full sm:w-auto border-2 border-white/40 bg-white/10 hover:bg-white/20 text-white shadow-subtle hover:shadow-standard backdrop-blur-sm transition-all duration-300 text-base lg:text-lg px-10 py-6"
              >
                Back to Top
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-6 pt-6">
              {[
                'No credit card',
                'No signup',
                'No hidden fees'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-white/90">
                  <div className="w-5 h-5 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-subtle">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-sm lg:text-base font-medium drop-shadow">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="text-center mt-8 text-neutral-700">
          <p className="text-sm lg:text-base drop-shadow-sm">
            Built with ❤️ for making gift exchanges magical
          </p>
        </div>
      </div>
    </section>
  )
}
