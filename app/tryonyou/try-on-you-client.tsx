"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ArrowRight, Upload, X, Info, CheckCircle2, Loader2, AlertTriangle, Lock } from "lucide-react";
import Link from "next/link";
import PremiumPaymentModal from "@/components/premium-payment-modal";
import { useSearchParams, useRouter } from "next/navigation";

type User = {
    id: string;
    clerkId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    aiEnabled: boolean;
    hasPremium: boolean;
    trialUsed: boolean;
    createdAt: Date;
    updatedAt: Date;
};

type Category = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
};

interface TryOnYouClientProps {
    user: User;
    categories: Category[];
}

export default function TryOnYouClient({ user, categories }: TryOnYouClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const hasRefreshed = useRef(false);

    // Debug: Log user premium status
    console.log('🔍 [TRY-ON] User Premium Status:', {
        email: user.email,
        hasPremium: user.hasPremium,
        aiEnabled: user.aiEnabled,
    });

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTerms, setShowTerms] = useState(true);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [userName, setUserName] = useState(user?.firstName || "");
    const [fashionCategory, setFashionCategory] = useState("");
    const [selectedPlan, setSelectedPlan] = useState<"trial" | "premium">("trial");
    const [isUploading, setIsUploading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [processError, setProcessError] = useState<string | null>(null);
    const [processResult, setProcessResult] = useState<any>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<"success" | "cancelled" | null>(null);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [errorDialogMessage, setErrorDialogMessage] = useState<string>("");
    const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

    // Check for payment status in URL params
    useEffect(() => {
        const premium = searchParams?.get("premium");
        if (premium === "success") {
            setPaymentStatus("success");
            setShowTerms(false);

            // Auto-select premium plan if user has premium
            if (user.hasPremium) {
                setSelectedPlan("premium");
                console.log('✅ [PAYMENT] User already has premium, no polling needed');
                // Clear the URL parameter after 10 seconds
                setTimeout(() => {
                    setPaymentStatus(null);
                }, 10000);
                return; // Don't poll if already premium
            }

            // Activate premium immediately and then poll (fallback for webhook not working)
            if (!hasRefreshed.current) {
                hasRefreshed.current = true;

                // First, try to activate premium manually (in case webhook didn't fire)
                console.log('🔧 [PAYMENT] Attempting manual premium activation...');
                fetch('/api/user/activate-premium', {
                    method: 'POST',
                }).then(async (response) => {
                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ [PAYMENT] Manual activation response:', data);
                        if (data.hasPremium) {
                            console.log('✅ [PAYMENT] Premium activated successfully! Reloading page...');
                            // Reload page to get fresh user data
                            window.location.href = '/tryonyou?premium=activated';
                            return;
                        }
                    }
                }).catch((error) => {
                    console.error('❌ [PAYMENT] Manual activation failed:', error);
                });

                // Also poll as backup (in case manual activation fails)
                let attempts = 0;
                const maxAttempts = 15;
                const pollInterval = setInterval(async () => {
                    attempts++;
                    console.log(`🔄 [PAYMENT] Checking premium status (attempt ${attempts}/${maxAttempts})`);

                    try {
                        // Check user status via API
                        const response = await fetch('/api/user/status');
                        if (response.ok) {
                            const data = await response.json();
                            console.log('📊 [PAYMENT] User status:', data);

                            // If premium is confirmed, reload the page to get fresh user data
                            if (data.hasPremium) {
                                console.log('✅ [PAYMENT] Premium status confirmed! Reloading page...');
                                clearInterval(pollInterval);
                                // Force full page reload to ensure user prop is updated
                                window.location.href = '/tryonyou?premium=activated';
                                return;
                            }
                        }
                    } catch (error) {
                        console.error('❌ [PAYMENT] Error checking status:', error);
                    }

                    // Stop polling if we've reached max attempts
                    if (attempts >= maxAttempts) {
                        console.log('⚠️ [PAYMENT] Max polling attempts reached. Refreshing page anyway...');
                        clearInterval(pollInterval);
                        router.refresh();
                    }
                }, 2000);

                // Clean up interval on unmount
                return () => clearInterval(pollInterval);
            }

            // Clear the URL parameter after 10 seconds
            setTimeout(() => {
                setPaymentStatus(null);
            }, 10000);
        } else if (premium === "cancelled") {
            setPaymentStatus("cancelled");
            // Clear the URL parameter after 5 seconds
            setTimeout(() => {
                setPaymentStatus(null);
            }, 5000);
        } else if (premium === "activated") {
            // This is after the reload, just show success message
            setPaymentStatus("success");
            setShowTerms(false);
            if (user.hasPremium) {
                setSelectedPlan("premium");
            }
            // Clear the URL parameter after 10 seconds
            setTimeout(() => {
                setPaymentStatus(null);
            }, 10000);
        }
    }, [searchParams, user.hasPremium, router]);

    const handleAcceptTerms = () => {
        if (termsAccepted) {
            setShowTerms(false)
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setUploadedFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setUploadedImage(reader.result as string)
            }
            reader.readAsDataURL(file)
            // Reset error and success states when new image is uploaded
            setUploadError(null)
            setUploadSuccess(false)
        }
    }

    const handleRemoveImage = () => {
        setUploadedImage(null)
        setUploadedFile(null)
        setUploadError(null)
        setUploadSuccess(false)
    }

    const handleSubmit = async () => {
        if (!uploadedFile || !userName || !fashionCategory || !selectedPlan) {
            return
        }

        setIsUploading(true)
        setUploadError(null)
        setUploadSuccess(false)
        setProcessError(null)
        setProcessResult(null)

        try {
            // Step 1: Upload to Cloudinary
            const formData = new FormData()
            formData.append('file', uploadedFile)
            formData.append('userName', userName)

            const uploadResponse = await fetch('/api/upload/avatar', {
                method: 'POST',
                body: formData,
            })

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json()
                throw new Error(errorData.error || 'Failed to upload image')
            }

            const uploadResult = await uploadResponse.json()
            console.log('Avatar uploaded successfully:', uploadResult)

            setUploadSuccess(true)
            const personImageUrl = uploadResult.url

            // Enable AI for the user based on selected plan
            // Trial plan: Enable AI only
            // Premium plan: AI is enabled via webhook after payment
            if (selectedPlan === 'trial') {
                await fetch('/api/user/enable-ai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ plan: selectedPlan }),
                })
            }

            // Step 2: Fetch trial products (availableForTryOn: true) filtered by selected category
            setIsUploading(false)
            setIsProcessing(true)
            setProcessError(null)

            // Build URL with category and plan query parameters
            const productsUrl = fashionCategory 
                ? `/api/products/trial?category=${encodeURIComponent(fashionCategory)}&plan=${selectedPlan}`
                : `/api/products/trial?plan=${selectedPlan}`
            
            console.log('📦 [TRY-ON PAGE] Fetching products for category:', fashionCategory || 'all', 'Plan:', selectedPlan)
            
            const productsResponse = await fetch(productsUrl)

            if (!productsResponse.ok) {
                throw new Error('Failed to fetch products')
            }

            const productsData = await productsResponse.json()
            const garmentImages = productsData.garment_images || {}

            console.log('📦 [TRY-ON PAGE] Products data received:', productsData)
            console.log('👕 [TRY-ON PAGE] Garment images:', garmentImages)
            console.log('👕 [TRY-ON PAGE] Garment images count:', Object.keys(garmentImages).length)

            // Check if garment_images is empty
            if (!garmentImages || Object.keys(garmentImages).length === 0) {
                const errorMsg = selectedPlan === 'trial' 
                    ? 'No trial products found. Please ensure there are products marked as trial products.'
                    : 'No products found in the selected category.'
                throw new Error(errorMsg)
            }

            // Step 3: Process try-on with the uploaded image and products
            // Make POST request to external API via our API route
            const requestBody = {
                person_image: personImageUrl,
                garment_images: garmentImages,
                collection: fashionCategory || null, // Collection name (category slug)
            }

            // Use /api/try-on/trial for both trial and premium (backend handles subscription type)
            const apiEndpoint = '/api/try-on/trial';

            console.log('📤 [TRY-ON PAGE] Sending request:', {
                endpoint: apiEndpoint,
                plan: selectedPlan,
                category: fashionCategory,
                garmentCount: Object.keys(garmentImages).length,
            })

            let processResponse;
            try {
                processResponse = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                })
            } catch (fetchError) {
                // Network error - backend is unreachable
                console.error('❌ [TRY-ON PAGE] Network error:', fetchError)
                throw new Error('Unable to connect to the try-on service. Please check your internet connection and try again.')
            }

            if (!processResponse.ok) {
                let errorData;
                try {
                    errorData = await processResponse.json()
                } catch (parseError) {
                    // If we can't parse the error response, use the status text
                    console.error('❌ [TRY-ON PAGE] Error parsing response:', parseError)
                    throw new Error(`Server error (${processResponse.status}): ${processResponse.statusText || 'Unknown error'}`)
                }

                // Log detailed error information
                console.error('❌ [TRY-ON PAGE] API error:', {
                    status: processResponse.status,
                    error: errorData.error,
                    details: errorData.details,
                })

                throw new Error(errorData.error || errorData.details || 'Failed to process try-on')
            }

            const processResult = await processResponse.json()
            console.log('Try-on processed successfully:', processResult)
            setProcessResult(processResult)

        } catch (error) {
            console.error('Error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to process try-on. Please try again.'

            if (!uploadSuccess) {
                setUploadError(errorMessage)
            } else {
                setProcessError(errorMessage)
            }

            // Show error dialog for ALL errors (upload and processing)
            setErrorDialogMessage(errorMessage)
            setShowErrorDialog(true)
        } finally {
            setIsUploading(false)
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#F9FAFB' }}>
            <div className="container mx-auto px-4 pt-12 pb-0 max-w-6xl relative z-10">
                {/* Payment Status Banner */}
                {paymentStatus === "success" && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-md animate-fade-in">
                        <div className="flex items-center gap-3">
                            {user.hasPremium ? (
                                <CheckCircle2 className="h-8 w-8 text-green-600 flex-shrink-0" />
                            ) : (
                                <Loader2 className="h-8 w-8 text-green-600 flex-shrink-0 animate-spin" />
                            )}
                            <div>
                                <h3 className="text-xl font-bold text-green-900">
                                    {user.hasPremium ? "Premium Activated! 🎉" : "Activating Premium..."}
                                </h3>
                                <p className="text-green-700">
                                    {user.hasPremium
                                        ? "Welcome to Premium! You now have unlimited access to try-on all products in any category."
                                        : "Please wait while we activate your premium membership. This should only take a few seconds..."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {paymentStatus === "cancelled" && (
                    <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-md animate-fade-in">
                        <div className="flex items-center gap-3">
                            <Info className="h-8 w-8 text-yellow-600 flex-shrink-0" />
                            <div>
                                <h3 className="text-xl font-bold text-yellow-900">Payment Cancelled</h3>
                                <p className="text-yellow-700">
                                    Your payment was cancelled. You can try again anytime by selecting the Premium plan below.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {showTerms ? (
                    <div className="space-y-8">
                        {/* Enhanced Header with Animation */}
                        <div className="text-center space-y-6 animate-fade-in">

                            <div className="space-y-3">
                                <h1 className="text-5xl md:text-6xl font-light tracking-wide text-black">
                                    Virtual Try-On Experience
                                </h1>
                                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                    Step into the future of fashion with AI-powered virtual fitting
                                </p>
                            </div>


                        </div>

                        {/* Enhanced Terms Card */}
                        <Card className=" border-2 border-[#E5DDD4] backdrop-blur-sm bg-white/90 overflow-hidden mb-10">
                            <CardHeader className="bg-[#F5F0EB] border-b border-[#E5DDD4]">
                                <CardTitle className="flex items-center gap-3 text-3xl">

                                    <span className="text-black font-light tracking-wide">
                                        Terms and Conditions
                                    </span>
                                </CardTitle>
                                <CardDescription className="text-base text-gray-600 mt-2">
                                    Please review our terms carefully before using the AI-powered virtual try-on feature
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-8 pb-8">
                                <ScrollArea className="h-[450px] w-full rounded-md border-2 border-[#E5DDD4] p-8 bg-gradient-to-br from-white to-[#F5F0EB]">
                                    <div className="space-y-8 text-sm text-gray-700 pr-4 font-light tracking-wide">
                                        <section className="group hover:bg-[#F5F0EB] p-4 rounded-md transition-all">
                                            <h3 className="text-lg font-light tracking-wide text-gray-900 mb-4">
                                                1. Acceptance of Terms
                                            </h3>
                                            <p className="leading-relaxed text-gray-700">
                                                By using the Virtual Try-On feature, you agree to comply with these Terms and all applicable laws and regulations. If you do not agree with any portion of these Terms, please refrain from using the Service.
                                            </p>
                                        </section>

                                        <section className="group hover:bg-[#E5DDD4]/50 p-4 rounded-md transition-all">
                                            <h3 className="text-lg font-light tracking-wide text-gray-900 mb-4">
                                                2. Photo Upload and Usage
                                            </h3>
                                            <ul className="space-y-3 ml-6 list-disc">
                                                <li className="text-gray-700">
                                                    You represent and warrant that you have the legal right to upload any photo you submit.
                                                </li>
                                                <li className="text-gray-700">
                                                    Photos must depict you personally, or you must have explicit, documented permission from the individual featured.
                                                </li>
                                                <li className="text-gray-700">
                                                    Uploaded photos will be processed using AI technology solely to generate virtual try-on visualizations.
                                                </li>
                                                <li className="text-gray-700">
                                                    DRAPELY.ai reserves the right to refuse, remove, or request resubmission of any content deemed inappropriate or non-compliant with these Terms.
                                                </li>
                                                <li className="text-gray-700">
                                                    Photos may be temporarily stored for processing exclusively and are not retained beyond what is technically required for service delivery.
                                                </li>
                                            </ul>
                                        </section>

                                        <section className="group hover:bg-[#F5F0EB] p-4 rounded-md transition-all">
                                            <h3 className="text-lg font-light tracking-wide text-gray-900 mb-4">
                                                3. Privacy and Data Protection
                                            </h3>
                                            <ul className="space-y-3 ml-6 list-disc">
                                                <li className="text-gray-700">
                                                    Your photos and personal information are processed in accordance with our Privacy Policy.
                                                </li>
                                                <li className="text-gray-700">
                                                    We use industry-standard security measures, including encryption, to protect your data.
                                                </li>
                                                <li className="text-gray-700">
                                                    Photos are processed securely and are not shared with third parties without your explicit consent.
                                                </li>
                                                <li className="text-gray-700">
                                                    You may request deletion of your data at any time by contacting support@drapely.ai.
                                                </li>
                                                <li className="text-gray-700">
                                                    DRAPELY.ai does not use your photos for AI model training unless you grant explicit permission.
                                                </li>
                                            </ul>
                                        </section>

                                        <section className="group hover:bg-[#E5DDD4]/50 p-4 rounded-md transition-all">
                                            <h3 className="text-lg font-light tracking-wide text-gray-900 mb-4">
                                                4. AI Technology Limitations
                                            </h3>
                                            <ul className="space-y-3 ml-6 list-disc">
                                                <li className="text-gray-700">
                                                    The Virtual Try-On output is an AI-generated approximation and should be used for visualization purposes only.
                                                </li>
                                                <li className="text-gray-700">
                                                    Actual product fit, color, texture, and appearance may differ from the generated results.
                                                </li>
                                                <li className="text-gray-700">
                                                    Result accuracy may be influenced by lighting conditions, body posture, camera angle, and photo quality.
                                                </li>
                                                <li className="text-gray-700">
                                                    DRAPELY.ai does not guarantee the precision or reliability of any AI-generated output.
                                                </li>
                                            </ul>
                                        </section>

                                        <section className="group hover:bg-[#E5DDD4]/50 p-4 rounded-md transition-all">
                                            <h3 className="text-lg font-light tracking-wide text-gray-900 mb-4">
                                                5. Prohibited Content
                                            </h3>
                                            <p className="leading-relaxed mb-3 font-medium text-gray-700">You agree not to upload any of the following:</p>
                                            <ul className="space-y-2 ml-6 list-disc">

                                                <li className="text-gray-700">
                                                    Explicit, offensive, defamatory, or otherwise inappropriate content.
                                                </li>
                                                <li className="text-gray-700">
                                                    Photos that infringe upon copyrights, trademarks, or other intellectual property rights.
                                                </li>
                                                <li className="text-gray-700">
                                                    Photos containing individuals other than yourself without their documented consent.
                                                </li>
                                                <li className="text-gray-700">
                                                    Celebrity photos, stock images, or copyrighted visuals not owned by you.
                                                </li>
                                            </ul>
                                        </section>

                                        <section className="group hover:bg-[#F5F0EB] p-4 rounded-md transition-all">
                                            <h3 className="text-lg font-light tracking-wide text-gray-900 mb-4">
                                                6. User Responsibilities
                                            </h3>
                                            <ul className="space-y-2 ml-6 list-disc">
                                                <li className="text-gray-700">
                                                    You are solely responsible for ensuring that uploaded photos are accurate, clear, and meet the required quality standards.
                                                </li>
                                                <li className="text-gray-700">
                                                    You agree to use the Service exclusively for personal, non-commercial purposes.
                                                </li>
                                                <li className="text-gray-700">
                                                    You must not attempt to reverse-engineer, interfere with, or misuse the Service or underlying AI technology.
                                                </li>
                                                <li className="text-gray-700">
                                                    You agree to comply with all applicable laws and regulations related to digital content and data submission.
                                                </li>
                                            </ul>
                                        </section>

                                        <section className="p-4 bg-[#E5DDD4]/40 rounded-md">
                                            <h3 className="text-lg font-light tracking-wide text-gray-900 mb-3">
                                                7. Disclaimer of Warranties
                                            </h3>
                                            <p className="leading-relaxed text-gray-700 mb-3">
                                                The Service is provided &quot;as is&quot; and &quot;as available,&quot; without any warranties—express, implied, or statutory.
                                            </p>
                                            <p className="leading-relaxed text-gray-700 mb-3">
                                                DRAPELY.ai does not warrant that the Service will be uninterrupted, secure, or error-free, nor does it guarantee the accuracy or reliability of any generated output.
                                            </p>
                                            <p className="leading-relaxed text-gray-700">
                                                To the fullest extent permitted by law, DRAPELY.ai disclaims liability for any damages arising from your use or inability to use the Service.
                                            </p>
                                        </section>

                                        <section className="p-4 bg-[#E5DDD4]/40 rounded-md">
                                            <h3 className="text-lg font-light tracking-wide text-gray-900 mb-3">
                                                8. Right to Modify or Terminate
                                            </h3>
                                            <p className="leading-relaxed text-gray-700 mb-3">
                                                DRAPELY.ai reserves the right to modify, suspend, or discontinue the Virtual Try-On Service at any time without prior notice.
                                            </p>
                                            <p className="leading-relaxed text-gray-700">
                                                Updates to these Terms may be made periodically, and continued use of the Service constitutes acceptance of the updated Terms.
                                            </p>
                                        </section>

                                        <section className="p-4 bg-gradient-to-r from-[#F5F0EB] to-[#E5DDD4]/50 rounded-md border border-[#87A582]">
                                            <h3 className="text-lg font-light tracking-wide text-gray-900 mb-3">
                                                9. Contact Information
                                            </h3>
                                            <p className="leading-relaxed text-gray-700 mb-2">
                                                For any questions, concerns, or data-related requests, please contact us at:
                                            </p>
                                            <p className="leading-relaxed text-gray-700">
                                                Email:{' '}
                                                <a href="mailto:support@drapely.ai" className="text-black font-semibold hover:underline">
                                                    support@drapely.ai
                                                </a>
                                            </p>
                                            <p className="leading-relaxed text-gray-700">
                                                Website:{' '}
                                                <a href="https://www.drapely.ai" className="text-black font-semibold hover:underline">
                                                    www.drapely.ai
                                                </a>
                                            </p>
                                        </section>
                                    </div>
                                </ScrollArea>

                                {/* Enhanced Checkbox and Buttons */}
                                <div className="mt-8 space-y-5">
                                    <div className="flex items-start space-x-4 p-5 bg-gradient-to-r from-[#F5F0EB] to-[#E5DDD4]/50 rounded-md border-2 border-[#87A582] hover:border-[#7A9475] transition-colors">
                                        <Checkbox
                                            id="terms"
                                            checked={termsAccepted}
                                            onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                                            className="mt-1 h-5 w-5"
                                        />
                                        <label
                                            htmlFor="terms"
                                            className="text-sm font-medium leading-relaxed cursor-pointer select-none text-gray-800"
                                        >
                                            I have read and agree to the Terms and Conditions for using the DRAPELY.ai
                                            Virtual Try-On feature. I confirm that I have the right to upload the photos
                                            I will be using and understand the limitations of AI-generated results.
                                        </label>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button
                                            onClick={handleAcceptTerms}
                                            disabled={!termsAccepted}
                                            className="flex-1 bg-[#87A582] hover:bg-[#7A9475] text-white py-7 text-lg font-bold rounded-md shadow-2xl hover:shadow-[#87A582]/50 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
                                        >
                                            Accept and Continue
                                            <ArrowRight className="ml-2 h-6 w-6" />
                                        </Button>
                                        <Link href="/" className="flex-shrink-0">
                                            <Button
                                                variant="outline"
                                                className="border-2 border-[#87A582] text-[#87A582] hover:bg-[#F5F0EB] hover:border-[#7A9475] hover:text-black py-7 px-10 text-lg font-semibold rounded-md transition-all"
                                            >
                                                Cancel
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Enhanced Studio Header */}
                        <div className="text-center space-y-3">
                            <div className="space-y-2">
                                <h1 className="text-5xl md:text-6xl font-light tracking-wide text-black">
                                    Virtual Try-On Studio
                                </h1>
                                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                    Transform your shopping experience with AI-powered visualization. See how you look in our latest collections instantly!
                                </p>
                            </div>
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10 lg:items-stretch">
                            {/* Left Side - Photo Uploader */}
                            <Card className="border-2 border-white/50 bg-white/90 overflow-hidden flex flex-col">
                                <CardHeader className="bg-[#F5F0EB] border-b border-[#E5DDD4]">
                                    <CardTitle className="flex items-center gap-3 text-2xl">

                                        <span className="text-black font-light tracking-wide">
                                            Upload Your Photo
                                        </span>
                                    </CardTitle>
                                    <CardDescription className="text-base">
                                        Upload a clear photo for the best virtual try-on experience
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 flex-1 flex flex-col">
                                    <div className="flex-1 flex flex-col">
                                        {!uploadedImage ? (
                                            <div className="relative group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="absolute inset-0 bg-[#E5DDD4] rounded-md  opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                                <div className="relative bg-[#F5F0EB] rounded-md p-16 border-4 border-dashed border-[#E5DDD4] hover:border-[#D5CCC4] transition-all cursor-pointer group-hover:scale-[1.02] duration-300">
                                                    <div className="text-center space-y-6">
                                                        <div className="flex justify-center">
                                                            <div className="relative">
                                                                <div className="absolute inset-0 bg-[#7FA67F] rounded-md opacity-30"></div>
                                                                <div className="relative bg-[#7FA67F] p-6 rounded-md">
                                                                    <Upload className="h-16 w-16 text-white" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                                                Drag and Drop
                                                            </h3>
                                                            <p className="text-gray-600 mb-1">
                                                                or click to browse
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                JPG, PNG, WEBP (Max 10MB)
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative group">
                                                <div className="relative rounded-md overflow-hidden border-4 border-pink-300">
                                                    <img
                                                        src={uploadedImage}
                                                        alt="Uploaded"
                                                        className="w-full h-auto"
                                                    />
                                                    <Button
                                                        onClick={handleRemoveImage}
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-4 right-4 rounded-full bg-red-500 hover:bg-red-600 "
                                                    >
                                                        <X className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Photo Guidelines */}
                                        <div className="bg-[#F5F0EB] rounded-md p-6 border-2 border-[#E5DDD4] mt-4">
                                            <h4 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                                                <Info className="h-5 w-5 text-gray-600" />
                                                Photo Guidelines
                                            </h4>
                                            <ul className="space-y-3">
                                                <li className="flex items-start gap-3">
                                                    <CheckCircle2 className="h-5 w-5 text-[#7FA67F] mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-700">Use a well-lit, clear photo with good resolution</span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <CheckCircle2 className="h-5 w-5 text-[#7FA67F] mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-700">Face forward with neutral expression</span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <CheckCircle2 className="h-5 w-5 text-[#7FA67F] mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-700">Plain background works best for accurate results</span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <CheckCircle2 className="h-5 w-5 text-[#7FA67F] mt-0.5 flex-shrink-0" />
                                                    <span className="text-sm text-gray-700">Full body or upper body shots recommended</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Right Side - Form */}
                            <Card className="border-2 border-white/50 bg-white/90 overflow-hidden flex flex-col">
                                <CardHeader className="bg-[#F5F0EB] border-b border-[#E5DDD4]">
                                    <CardTitle className="flex items-center gap-3 text-2xl">

                                        <span className="text-black font-light tracking-wide">
                                            Your Details
                                        </span>
                                    </CardTitle>
                                    <CardDescription className="text-base">
                                        Tell us about yourself to personalize your experience
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6 flex-1 flex flex-col">
                                    <div className="space-y-6 flex-1 flex flex-col">
                                        {/* Name Input */}
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-base font-semibold text-gray-900">
                                                Your Name
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                placeholder="Enter your name"
                                                value={userName}
                                                onChange={(e) => setUserName(e.target.value)}
                                                className="h-12 text-base border-2 border-gray-200 focus:border-pink-400 rounded-md"
                                            />
                                        </div>

                                        {/* Fashion Category Select */}
                                        <div className="space-y-2">
                                            <Label htmlFor="category" className="text-base font-semibold text-gray-900">
                                                Fashion Category
                                            </Label>
                                            <Select value={fashionCategory} onValueChange={setFashionCategory}>
                                                <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-pink-400 rounded-md">
                                                    <SelectValue placeholder="Select your style preference" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.slug}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Plan Selection */}
                                        <div className="space-y-2">
                                            <Label className="text-base font-semibold text-gray-900">
                                                Select Plan
                                            </Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div
                                                    onClick={() => {
                                                        if (user.trialUsed) {
                                                            setShowUpgradeDialog(true);
                                                        } else {
                                                            setSelectedPlan("trial");
                                                        }
                                                    }}
                                                    className={`p-4 rounded-md border-2 transition-all relative ${
                                                        user.trialUsed
                                                            ? "border-gray-300 bg-gray-50 cursor-not-allowed opacity-60"
                                                            : selectedPlan === "trial"
                                                            ? "border-[#7FA67F] bg-[#F5F0EB] cursor-pointer"
                                                            : "border-gray-200 bg-white hover:border-[#E5DDD4] cursor-pointer"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-semibold text-gray-900">Trial</span>
                                                        {user.trialUsed && (
                                                            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
                                                                <Lock className="h-3 w-3" />
                                                                Used
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        {user.trialUsed
                                                            ? "Trial already used - Upgrade to Premium"
                                                            : "Try-on with trial products only"
                                                        }
                                                    </p>
                                                </div>
                                                <div
                                                    onClick={() => {
                                                        if (!user.hasPremium) {
                                                            setShowPaymentModal(true);
                                                        } else {
                                                            setSelectedPlan("premium");
                                                        }
                                                    }}
                                                    className={`p-4 rounded-md border-2 cursor-pointer transition-all ${
                                                        selectedPlan === "premium"
                                                            ? "border-[#7FA67F] bg-[#F5F0EB]"
                                                            : user.hasPremium
                                                            ? "border-green-500 bg-green-50"
                                                            : "border-gray-200 bg-white hover:border-[#E5DDD4]"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-semibold text-gray-900">Premium</span>
                                                        {user.hasPremium ? (
                                                            <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs bg-[#121827] text-white px-2 py-1 rounded-full">
                                                                $50
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600">
                                                        Try-on with all products in category
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Upload Status Messages */}
                                        {uploadError && (
                                            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-md text-red-700 text-sm">
                                                <p className="font-semibold mb-1">Upload Failed</p>
                                                <p>{uploadError}</p>
                                            </div>
                                        )}

                                        {uploadSuccess && !processError && !processResult && (
                                            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-md text-blue-800">
                                                <div className="flex items-start gap-3">
                                                    <Loader2 className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0 animate-spin" />
                                                    <div className="flex-1">
                                                        <p className="font-bold text-lg mb-2 text-blue-900">We are creating your model!</p>
                                                        <p className="text-base mb-2 text-blue-800">
                                                            You will be informed through email once your virtual try-on model is ready.
                                                        </p>
                                                        <p className="text-sm text-blue-700 font-medium">
                                                            ⏱️ Approximate processing time: 4-5 minutes
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {processError && (
                                            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-md text-red-700 text-sm">
                                                <p className="font-semibold mb-1">Processing Failed</p>
                                                <p>{processError}</p>
                                            </div>
                                        )}

                                        {processResult && (
                                            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-md text-green-800">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="font-bold text-lg mb-2 text-green-900">We are creating your model!</p>
                                                        <p className="text-base mb-2 text-green-800">
                                                            You will be informed through email once your virtual try-on model is ready.
                                                        </p>
                                                        <p className="text-sm text-green-700 font-medium">
                                                            ⏱️ Approximate processing time: 4-5 minutes
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={!uploadedImage || !userName || !fashionCategory || !selectedPlan || isUploading || isProcessing || !!processResult}
                                            className="w-full bg-[#87A582] hover:bg-[#7A9475] text-white py-7 text-lg font-bold rounded-md shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                                    Uploading Image...
                                                </>
                                            ) : isProcessing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                                    Processing Try-On...
                                                </>
                                            ) : (
                                                <>
                                                    Start Virtual Try-On
                                                    <ArrowRight className="ml-2 h-6 w-6" />
                                                </>
                                            )}
                                        </Button>

                                        {/* How It Works - Horizontal Flowchart */}
                                        <div className="mt-auto pt-6 border-t-2 border-gray-200">
                                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <Info className="h-5 w-5 text-gray-600" />
                                                How It Works
                                            </h4>
                                            <div className="flex items-center justify-between gap-2">
                                                {/* Step 1 */}
                                                <div className="flex-1">
                                                    <div className="bg-[#F5F0EB] border-2 border-[#E5DDD4] rounded-md p-3 text-center">
                                                        <p className="text-xs font-bold text-gray-900">Upload</p>
                                                        <p className="text-xs text-gray-600">Photo</p>
                                                    </div>
                                                </div>

                                                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

                                                {/* Step 2 */}
                                                <div className="flex-1">
                                                    <div className="bg-[#F5F0EB] border-2 border-[#E5DDD4] rounded-md p-3 text-center">
                                                        <p className="text-xs font-bold text-gray-900">Fill</p>
                                                        <p className="text-xs text-gray-600">Details</p>
                                                    </div>
                                                </div>

                                                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

                                                {/* Step 3 */}
                                                <div className="flex-1">
                                                    <div className="bg-[#F5F0EB] border-2 border-[#E5DDD4] rounded-md p-3 text-center">
                                                        <p className="text-xs font-bold text-gray-900">AI</p>
                                                        <p className="text-xs text-gray-600">Process</p>
                                                    </div>
                                                </div>

                                                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

                                                {/* Step 4 */}
                                                <div className="flex-1">
                                                    <div className="bg-[#F5F0EB] border-2 border-[#E5DDD4] rounded-md p-3 text-center">
                                                        <p className="text-xs font-bold text-gray-900">Get</p>
                                                        <p className="text-xs text-gray-600">Results</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info note */}
                                            <div className="mt-4 text-center">
                                                <p className="text-xs text-gray-600">⏱️ Results in 4-5 minutes via email</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Payment Modal */}
            <PremiumPaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                userEmail={user.email}
                userId={user.id}
            />

            {/* Error Dialog */}
            <Dialog open={showErrorDialog} onOpenChange={() => {
                // Prevent closing the dialog by clicking outside or pressing escape
                // Only allow closing via the "Try Again" button
            }}>
                <DialogContent className="sm:max-w-[500px] border-none p-0 overflow-hidden [&>button]:hidden" style={{ backgroundColor: '#FFFEFE' }}>
                    <DialogTitle className="sr-only">Processing Error</DialogTitle>
                    {/* Warning Header */}
                    <div className="border-b border-pink-500/30 px-6 py-8 text-center" style={{ backgroundColor: '#FFFEFE' }}>
                        <div className="flex justify-center mb-4">
                            <div className="bg-yellow-500/20 rounded-full p-4">
                                <AlertTriangle className="h-16 w-16 text-yellow-500" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Processing Error</h2>
                    </div>

                    {/* Error Content */}
                    <div className="px-6 py-8 space-y-6" style={{ backgroundColor: '#FFFEFE' }}>
                        <div className="bg-gray-50 rounded-md p-6 border border-gray-200">
                            <p className="text-gray-700 text-base leading-relaxed mb-6">
                                Hello,
                            </p>
                            <p className="text-gray-700 text-base leading-relaxed mb-6">
                                We encountered an error while processing your virtual try-on request. Please try again or contact support if the issue persists.
                            </p>

                            {/* Error Details Box */}
                            <div className="bg-gradient-to-br from-pink-50 to-rose-50 border-l-4 border-pink-500 rounded-md p-4 space-y-2">
                                <div className="flex items-start gap-2">
                                    <span className="text-pink-600 font-semibold text-sm">Plan:</span>
                                    <span className="text-pink-700 text-sm capitalize">{selectedPlan}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-pink-600 font-semibold text-sm">Error:</span>
                                    <span className="text-pink-700 text-sm break-words flex-1">{errorDialogMessage || 'Unknown error occurred'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Try Again Button */}
                        <div className="flex justify-center pt-2">
                            <Button
                                onClick={() => {
                                    setShowErrorDialog(false)
                                    setProcessError(null)
                                    setUploadError(null)
                                    setUploadSuccess(false)
                                    setErrorDialogMessage("")
                                }}
                                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-6 px-12 rounded-md shadow-lg hover:shadow-pink-500/50 transition-all duration-300 text-lg"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Upgrade to Premium Dialog */}
            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                <DialogContent className="sm:max-w-[500px] border-none p-0 overflow-hidden" style={{ backgroundColor: '#FFFEFE' }}>
                    <DialogTitle className="sr-only">Trial Already Used</DialogTitle>
                    {/* Header */}
                    <div className="border-b border-[#E5DDD4] px-6 py-8 text-center" style={{ backgroundColor: '#F5F0EB' }}>
                        <div className="flex justify-center mb-4">
                            <div className="bg-gradient-to-br from-[#87A582] to-[#7A9475] rounded-full p-4">
                                <Lock className="h-16 w-16 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Trial Already Used</h2>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-8 space-y-6" style={{ backgroundColor: '#FFFEFE' }}>
                        <div className="bg-gradient-to-br from-[#F5F0EB] to-[#E5DDD4]/50 rounded-md p-6 border-2 border-[#E5DDD4]">
                            <p className="text-gray-700 text-base leading-relaxed mb-4">
                                You've already used your one-time trial. To continue enjoying virtual try-on with unlimited products across all categories, upgrade to Premium!
                            </p>

                            <div className="bg-white rounded-md p-4 border border-[#87A582] mt-4">
                                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-[#87A582]" />
                                    Premium Benefits:
                                </h3>
                                <ul className="space-y-2 ml-7">
                                    <li className="flex items-start gap-2 text-sm text-gray-700">
                                        <span className="text-[#87A582] font-bold">•</span>
                                        <span>Unlimited virtual try-ons</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-gray-700">
                                        <span className="text-[#87A582] font-bold">•</span>
                                        <span>Access to all products in any category</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-gray-700">
                                        <span className="text-[#87A582] font-bold">•</span>
                                        <span>Priority processing</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm text-gray-700">
                                        <span className="text-[#87A582] font-bold">•</span>
                                        <span>Exclusive early access to new features</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="mt-4 text-center">
                                <p className="text-2xl font-bold text-gray-900">Only $50</p>
                                <p className="text-sm text-gray-600">One-time payment, lifetime access</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <Button
                                onClick={() => {
                                    setShowUpgradeDialog(false);
                                    setShowPaymentModal(true);
                                }}
                                className="flex-1 bg-gradient-to-r from-[#87A582] to-[#7A9475] hover:from-[#7A9475] hover:to-[#6D8768] text-white py-6 text-lg font-bold rounded-md shadow-lg hover:shadow-[#87A582]/50 transition-all duration-300 hover:scale-[1.02] active:scale-95"
                            >
                                Upgrade to Premium
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button
                                onClick={() => setShowUpgradeDialog(false)}
                                variant="outline"
                                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 py-6 px-8 text-lg font-semibold rounded-md transition-all"
                            >
                                Maybe Later
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
