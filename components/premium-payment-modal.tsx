"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Check, X, Sparkles, Lock } from "lucide-react";

interface PremiumPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userId: string;
}

export default function PremiumPaymentModal({
  isOpen,
  onClose,
  userEmail,
  userId,
}: PremiumPaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/payment/premium-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail,
          userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error("Error creating checkout session:", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[95vw] max-h-[90vh] overflow-hidden border-none p-0 bg-transparent rounded-md">
        {/* Card Container with soft beige background and rounded corners */}
        <div className="relative bg-[#F5F0EB] rounded-md p-6 sm:p-8 pt-10 sm:pt-12 pb-8 sm:pb-10 border-[3px] border-[#E5DDD4]/40 shadow-xl overflow-y-auto max-h-[90vh]">

          {/* Plan Name */}
          <div className="text-center mb-6 sm:mb-8">
            <DialogTitle className="text-[26px] sm:text-[32px] font-normal text-gray-900 tracking-tight">
              DRAPELY Premium
            </DialogTitle>
          </div>

          {/* Pricing */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-[56px] sm:text-[72px] font-normal text-gray-900 leading-none">$50</span>
            </div>
            <p className="text-gray-500 text-base sm:text-lg mt-2">One-time payment</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Lifetime access included</p>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300/50 mb-6 sm:mb-8"></div>

          {/* Features List */}
          <div className="space-y-3.5 sm:space-y-5 mb-6 sm:mb-10">
            {/* Feature with checkmark */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="mt-0.5 bg-[#7FA67F] rounded-full p-1 flex-shrink-0">
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white stroke-[3]" />
              </div>
              <span className="text-gray-700 text-[13px] sm:text-[15px] leading-relaxed">
                Try-on with all products in any category
              </span>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="mt-0.5 bg-[#7FA67F] rounded-full p-1 flex-shrink-0">
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white stroke-[3]" />
              </div>
              <span className="text-gray-700 text-[13px] sm:text-[15px] leading-relaxed">
                Access to latest fashion collections
              </span>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="mt-0.5 bg-[#7FA67F] rounded-full p-1 flex-shrink-0">
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white stroke-[3]" />
              </div>
              <span className="text-gray-700 text-[13px] sm:text-[15px] leading-relaxed">
                Priority processing for virtual try-ons
              </span>
            </div>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="mt-0.5 bg-[#7FA67F] rounded-full p-1 flex-shrink-0">
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white stroke-[3]" />
              </div>
              <span className="text-gray-700 text-[13px] sm:text-[15px] leading-relaxed">
                Lifetime access - pay once, use forever
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-md text-red-700 text-sm mb-6">
              <p className="font-semibold mb-1">Payment Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isProcessing}
              className="w-full sm:flex-1 bg-white border-none text-gray-700 hover:bg-gray-50 hover:text-[#121827] py-5 sm:py-6 text-sm sm:text-base font-medium rounded-md transition-all shadow-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full sm:flex-1 bg-[#121827] hover:bg-[#1a2332] text-white py-5 sm:py-6 text-sm sm:text-base font-semibold rounded-md shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-none"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Purchase Premium
                </>
              )}
            </Button>
          </div>

          {/* Secure Payment Notice */}
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-500 pt-4 sm:pt-6">
            <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Secure payment powered by Stripe</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
