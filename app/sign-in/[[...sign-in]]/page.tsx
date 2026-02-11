"use client";

import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirect_url") || "/";

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Brand Context (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#F5F0EB] items-center justify-center p-12 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#87A582 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                </div>

                <div className="relative z-10 max-w-lg text-center">
                    <Link href="/" className="inline-block mb-12 transform hover:scale-105 transition-transform">
                        <div className="flex flex-col items-center gap-4">
                            <Image
                                src="/logo2.2k.png"
                                alt="DRAPELY.ai Logo"
                                width={180}
                                height={180}
                                className="drop-shadow-2xl"
                                priority
                            />
                            <h1 className="text-4xl font-light tracking-widest text-gray-900 mt-4">DRAPELY.ai</h1>
                        </div>
                    </Link>

                    <div className="space-y-6">
                        <h2 className="text-5xl font-serif italic text-gray-800 leading-tight">
                            Where AI meets individual style.
                        </h2>
                        <div className="h-1 w-24 bg-[#87A582] mx-auto rounded-full"></div>
                        <p className="text-xl text-gray-600 font-light leading-relaxed">
                            Experience the future of fashion with our AI-powered virtual try-on technology. Personal, inspiring, and made just for you.
                        </p>
                    </div>

                    <div className="mt-16 grid grid-cols-2 gap-8">
                        <div className="p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm">
                            <p className="text-3xl font-bold text-[#87A582] mb-1">AI</p>
                            <p className="text-sm text-gray-500 uppercase tracking-wider">Virtual Try-On</p>
                        </div>
                        <div className="p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm">
                            <p className="text-3xl font-bold text-[#87A582] mb-1">∞</p>
                            <p className="text-sm text-gray-500 uppercase tracking-wider">Style Options</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth UI */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center bg-[#F5F0EB] lg:bg-white p-6 sm:p-12 relative">
                {/* Mobile Logo */}
                <div className="lg:hidden w-full px-6 mb-8 mt-8">
                    <Link href="/" className="flex flex-col items-center gap-2">
                        <Image
                            src="/logo2.2k.png"
                            alt="DRAPELY.ai Logo"
                            width={80}
                            height={80}
                            priority
                        />
                        <h1 className="text-2xl font-light tracking-widest text-gray-900 mt-2">DRAPELY.ai</h1>
                    </Link>
                </div>

                <div className="w-full max-w-md animate-fade-in-up">
                    <SignIn
                        appearance={{
                            elements: {
                                formButtonPrimary:
                                    "bg-[#87A582] hover:bg-[#7A9475] text-sm normal-case shadow-lg h-12 transition-all duration-300 rounded-xl",
                                card: "shadow-2xl p-8 sm:p-10 bg-white border border-gray-100/50 rounded-3xl",
                                headerTitle: "text-3xl font-light text-gray-900 tracking-tight",
                                headerSubtitle: "text-gray-500 text-base font-light mt-2",
                                socialButtonsBlockButton: "border-gray-100 hover:bg-gray-50 h-12 transition-all duration-300 rounded-xl shadow-sm",
                                socialButtonsBlockButtonText: "text-gray-600 font-medium",
                                formFieldInput: "h-12 border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#87A582] transition-all duration-300 rounded-xl px-4",
                                formFieldLabel: "text-gray-700 font-medium mb-1.5",
                                internal_securedByClerk: "!hidden", // Internal element targeting
                            },
                            layout: {
                                socialButtonsPlacement: "bottom",
                                helpPageUrl: "/help",
                                privacyPageUrl: "/privacy",
                                termsPageUrl: "/terms",
                                shimmer: true,
                            }
                        }}
                        afterSignInUrl={redirectUrl}
                        signUpUrl="/sign-up"
                        routing="path"
                        path="/sign-in"
                    />
                </div>
            </div>
        </div>
    );
}
