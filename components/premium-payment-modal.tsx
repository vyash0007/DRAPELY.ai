"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Check, Sparkles } from "lucide-react";

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
      <DialogContent className="sm:max-w-[500px] border-2 border-pink-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light tracking-wide text-black flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-pink-500" />
            Upgrade to Premium
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Unlock unlimited try-on experiences with all products
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pricing */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-pink-200">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-bold text-black">$50</span>
              </div>
              <p className="text-gray-600">One-time payment</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Premium includes:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 bg-pink-500 rounded-full p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-700">
                  Try-on with all products in any category
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 bg-pink-500 rounded-full p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-700">
                  Access to latest fashion collections
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 bg-pink-500 rounded-full p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-700">
                  Priority processing for virtual try-ons
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 bg-pink-500 rounded-full p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm text-gray-700">
                  Lifetime access - pay once, use forever
                </span>
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">
              <p className="font-semibold mb-1">Payment Error</p>
              <p>{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isProcessing}
              className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 py-6 text-base font-semibold rounded-xl transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-6 text-base font-bold rounded-xl shadow-lg hover:shadow-pink-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-5 w-5" />
                  Purchase Premium
                </>
              )}
            </Button>
          </div>

          {/* Secure Payment Notice */}
          <p className="text-xs text-center text-gray-500">
            🔒 Secure payment powered by Stripe
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
