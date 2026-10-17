'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 py-12 lg:py-20">
      {/* System of Boxes: Hero Content Container */}
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left Column: Text Content */}
          <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
            {/* Badge - Layer 2 (elevated accent) */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-green-300/80 to-green-500/80 rounded-full shadow-subtle text-white text-sm font-medium backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Free & Privacy-First</span>
            </div>

            {/* Main Headline - Following hierarchy with gradient text */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight">
                <span className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-700 bg-clip-text text-transparent drop-shadow-sm">
                  Generate Perfect
                </span>
                <br />
                <span className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent drop-shadow-sm">
                  Secret Santa Pairs
                </span>
                <br />
                <span className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-700 bg-clip-text text-transparent drop-shadow-sm">
                  in Seconds
                </span>
              </h1>

              {/* Decorative divider with dual shadows */}
              <div className="flex items-center justify-center lg:justify-start gap-3 py-2">
                <div className="h-[2px] w-12 bg-gradient-to-r from-red-500 to-green-500 shadow-subtle" />
                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-standard" />
                <div className="h-[2px] w-12 bg-gradient-to-r from-green-500 to-red-500 shadow-subtle" />
              </div>
            </div>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl lg:text-2xl text-neutral-700 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Our smart algorithm ensures <span className="font-semibold text-neutral-900">fairness and simplicity</span> for your holiday gift exchanges. No spreadsheets, no hassle.
            </p>

            {/* Trust Indicators - Layer 2 (elevated feature list) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 justify-center lg:justify-start">
              {[
                'No signup required',
                'Emails never stored',
                'Instant results'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-neutral-700">
                  <div className="w-5 h-5 bg-gradient-to-br from-green-300 to-green-500 rounded-full flex items-center justify-center shadow-subtle">
                    <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-sm lg:text-base font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons - Layer 3 (most elevated interactive elements) */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
              {/* Primary CTA - Lightest red shade (most elevated) */}
              <Link href="/">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white shadow-button hover:shadow-button-hover active:shadow-button-active transition-all duration-300 text-base lg:text-lg px-8 py-6 group"
                >
                  Try It Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Link>

              {/* Secondary CTA */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="w-full sm:w-auto border-2 border-neutral-300 bg-card hover:bg-neutral-100 text-neutral-900 shadow-subtle hover:shadow-standard transition-all duration-300 text-base lg:text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Right Column: Yeti Mascot - Layer 3 (most elevated visual element) */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Outer glow effect - creates depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 via-green-500/30 to-red-500/30 blur-3xl rounded-full scale-125 animate-pulse-success" />

              {/* Mascot container - elevated with dual shadow */}
              <div className="relative bg-gradient-to-br from-cream-200/70 to-white/90 p-8 lg:p-12 rounded-3xl shadow-prominent hover:shadow-elevated transition-all duration-500 backdrop-blur-sm animate-bounce-gift">
                {/* Inner highlight for polished look */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent rounded-3xl pointer-events-none" />

                <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80">
                  <Image
                    src="/yeti-santa.png"
                    alt="Friendly Yeti mascot wearing Santa hat"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>

              {/* Decorative elements - floating particles */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-red-300 to-red-500 rounded-full shadow-standard animate-bounce-gift opacity-80" style={{ animationDelay: '0.3s' }} />
              <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-gradient-to-br from-green-300 to-green-500 rounded-full shadow-standard animate-bounce-gift opacity-80" style={{ animationDelay: '0.6s' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
