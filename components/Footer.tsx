'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle newsletter subscription
        console.log('Subscribing email:', email);
        setEmail('');
    };

    return (
        <footer className="bg-[#FCF2F4] text-gray-800">
            {/* Main Footer Content */}
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-4">
                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center mb-2">
                            <Image
                                src="/logo2.2k.png"
                                alt="Logo"
                                width={80}
                                height={80}
                                className="h-20 w-20 flex-shrink-0"
                            />
                            <h2 className="text-2xl sm:text-3xl font-light tracking-wide text-gray-900">
                                DRAPELY.ai
                            </h2>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-8">
                            From everyday essentials to standout trends, Drapely.ai uses AI to tailor fashion to your taste. Style made simple, personal, and inspiring.
                        </p>
                        {/* Social Media Icons */}
                        <div className="flex gap-3">
                            <a
                                href="#"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="h-5 w-5 text-gray-700" />
                            </a>
                            <a
                                href="#"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="h-5 w-5 text-gray-700" />
                            </a>
                            <a
                                href="#"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="h-5 w-5 text-gray-700" />
                            </a>
                            <a
                                href="#"
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white hover:bg-gray-100 transition-colors"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="h-5 w-5 text-gray-700" />
                            </a>
                        </div>
                    </div>

                    {/* Company Links */}
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Company</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/about" className="text-gray-700 hover:text-gray-900 transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/leadership" className="text-gray-700 hover:text-gray-900 transition-colors">
                                    Leadership
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="text-gray-700 hover:text-gray-900 transition-colors">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link href="/news" className="text-gray-700 hover:text-gray-900 transition-colors">
                                    Article & News
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal" className="text-gray-700 hover:text-gray-900 transition-colors">
                                    Legal Notice
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Support</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/help" className="text-gray-700 hover:text-gray-900 transition-colors">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/support" className="text-gray-700 hover:text-gray-900 transition-colors">
                                    Ticket Support
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-gray-700 hover:text-gray-900 transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-700 hover:text-gray-900 transition-colors">
                                    Contact us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter Section */}
                    <div className="lg:col-span-4">
                        <div className="relative max-w-md mx-auto lg:max-w-none">
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg z-10">
                                <Mail className="h-8 w-8 text-[#f5a5a5]" />
                            </div>
                            <div className="rounded-2xl border-2 border-[#f5a5a5] bg-[#fce8e8] p-10 pt-14">
                                <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                                    Newsletter
                                </h3>
                                <p className="text-sm text-gray-700 text-center mb-8 leading-relaxed px-4">
                                    Signup our newsletter to get update information, news, insight or
                                    promotions.
                                </p>
                                <form onSubmit={handleSubscribe} className="space-y-4 max-w-md mx-auto">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email"
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f5a5a5]"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="w-full rounded-lg bg-[#f5a5a5] px-6 py-3 text-white font-semibold hover:bg-[#f38d8d] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Mail className="h-5 w-5" />
                                        Sign up
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-[#f5a5a5] bg-[#f5d7d7]">
                <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-sm text-gray-700">
                            Copyright © 2025 DRAPELY.ai. All rights reserved.
                        </p>
                        <div className="flex gap-6">
                            <Link
                                href="/terms"
                                className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                Term of use
                            </Link>
                            <Link
                                href="/privacy"
                                className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/cookies"
                                className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;