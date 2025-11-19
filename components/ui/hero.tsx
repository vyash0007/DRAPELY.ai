'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Model images - Replace these URLs with your actual model images
const modelImages = [
  'https://res.cloudinary.com/dnkrqpuqk/image/upload/v1763284235/fashion_xlkonj.jpg', // Model 1 - Shopping bags
  'https://res.cloudinary.com/dnkrqpuqk/image/upload/v1763284236/image_29_nwr2th.jpg', // Model 2 - Fashion pose
  'https://res.cloudinary.com/dnkrqpuqk/image/upload/v1763284236/image_30_an95n9.jpg', // Model 3 - Casual outfit
  'https://res.cloudinary.com/dnkrqpuqk/image/upload/v1763284237/image_31_phmsgx.jpg',
  'https://res.cloudinary.com/dnkrqpuqk/image/upload/v1763306341/image_32_vhfkvu.jpg',
  'https://res.cloudinary.com/dnkrqpuqk/image/upload/v1763306341/image_33_ktt11g.jpg',
   // Model 4 - Elegant style
]

const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % modelImages.length)
    }, 1000) // Change image every 4 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-blue-50 pt-0">
      {/* Decorative Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top left rounded rectangle */}
        <div className="absolute top-4 left-1/4 w-48 h-32 bg-pink-200/30 rounded-3xl transform -rotate-12" />

        {/* Geometric frames */}
        <div className="absolute top-1/4 right-12 w-64 h-96 border-4 border-white/60 rounded-[3rem] transform rotate-6" />
        <div className="absolute bottom-12 left-12 w-48 h-48 border-4 border-teal-200/40 rounded-3xl transform -rotate-12" />

        {/* Abstract lines */}
        <svg className="absolute top-1/2 left-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,50 Q25,40 50,50 T100,50" stroke="url(#gradient)" strokeWidth="0.5" fill="none" />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-16">
          {/* Left Content Section */}
          <div className="space-y-8 z-10">
            <div className="space-y-4">
              <p className="text-md font-medium italic tracking-wider uppercase text-pink-600">
                // Futuristic
              </p>

              <h1 className="text-6xl lg:text-7xl font-md italic leading-tight">
                <span className="font-serif text-navy-900 block">Where AI</span>
                <span className="font-serif text-navy-900 block">Meets Style.</span>
              </h1>

              <div className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2 rounded-full">
                <p className="text-lg font-semibold">Up to 50% Off All Items</p>
              </div>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed max-w-lg">
              Fashion that learns you. Our AI engine adapts to your style preferences to curate a personalized shopping experience like never before.
            </p>

            <div className="flex gap-4 pt-1">
              <Link href="/tryonyou">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-10 py-6 text-base rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 font-bold uppercase tracking-wide"
                >
                  Try On You
                </Button>
              </Link>

              {/* <Button
                size="lg"
                variant="outline"
                className="border-2 border-pink-500 text-pink-600 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white px-10 py-6 text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 font-bold uppercase tracking-wide"
              >
                Learn More
              </Button> */}
            </div>
          </div>

          {/* Right Image Section - Model Carousel */}
          <div className="relative z-10">
            <div className="relative">
              {/* Main Image Frame with decorative border */}
              <div className="relative rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl aspect-[3/4] max-w-lg mx-auto">
                {/* Image Carousel */}
                <div className="relative w-full h-full">
                  {modelImages.map((image, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  ))}
                </div>

                {/* Vertical "LOREM IPSUM" text overlay */}
                <div className="absolute top-0 left-0 h-full flex items-center">
                  <div className="bg-teal-400/90 px-4 py-8 h-2/3 flex items-center justify-center">
                    <p className="text-white text-lg font-medium tracking-widest vertical-text transform -rotate-180"
                       style={{ writingMode: 'vertical-rl' }}>
                      Luxury
                    </p>
                  </div>
                </div>

                {/* Bottom "50% Off" Badge */}
                <div className="absolute bottom-0 right-0 w-full">
                  <div className="bg-teal-400/95 text-white py-6 px-8 text-center">
                    <p className="text-4xl font-light">FASHIONISTA</p>
                  </div>
                </div>

                {/* Side vertical text (LOREM IPSUM) */}
                <div className="absolute top-0 right-0 h-full flex items-end">
                  <div className="bg-pink-400/20 px-3 py-8 h-1/2 flex items-center justify-center">
                    <p className="text-gray-600 font-medium tracking-wider vertical-text transform rotate-0"
                       style={{ writingMode: 'vertical-rl' }}>
                      Elegant
                    </p>
                  </div>
                </div>
              </div>

              {/* Carousel Indicators removed as requested */}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .vertical-text {
          text-orientation: mixed;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .navy-900 {
          background-color: #0a0e27;
        }

        .hover\:bg-navy-800:hover {
          background-color: #1a1f3a;
        }

        .border-navy-900 {
          border-color: #0a0e27;
        }

        .text-navy-900 {
          color: #0a0e27;
        }
      `}</style>
    </section>
  )
}

export default Hero