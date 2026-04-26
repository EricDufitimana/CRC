"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../zenith/src/components/ui/select";
import { Input } from "../../../../zenith/src/components/ui/input";
import { showToastSuccess, showToastError } from "@/components/toasts";
import { handleApiError } from "@/utils/errorHandler";
import { Shield, ChevronLeft, AlertCircle, Loader2 } from "lucide-react";
import Label from "@/components/form/Label";
import { useTRPC } from "@/trpc/client";
import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';


const honorifics = [
  "Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Rev.", "Sir", "Dame"
];

const roles = [
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" }
];

export default function CreateAdmin() {
  console.log('🛡️ [Create Admin] Component mounted');
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  console.log('🛡️ [Create Admin] Token from URL:', token ? `${token.substring(0, 8)}...` : 'none');
  const trpc = useTRPC();
  
  const [isGoogleSignUpLoading, setIsGoogleSignUpLoading] = useState(false);
  const [formData, setFormData] = useState({
    honorific: "",
    firstName: "",
    lastName: "",
    role: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const { data: tokenValidation, isLoading: isValidatingToken, error: tokenError } = useQuery({
    ...trpc.adminInvites.validateToken.queryOptions({ token: token || '' }),
    enabled: !!token,
  });

  useEffect(() => {
    if (tokenValidation) {
      console.log('✅ [Create Admin] Token validation successful:', tokenValidation);
    }
  }, [tokenValidation]);

  useEffect(() => {
    if (tokenError) {
      console.error('❌ [Create Admin] Token validation error:', tokenError);
      console.error('❌ [Create Admin] Error details:', {
        message: tokenError.message,
        shape: tokenError.shape,
        data: tokenError.data,
      });
      const { headerText, paragraphText } = handleApiError(tokenError, {
        defaultMessage: "Failed to validate invite token"
      });
      showToastError({ headerText, paragraphText });
    }
  }, [tokenError]);

  const isValidToken = tokenValidation?.valid ?? false;
  const inviteEmail = tokenValidation?.email ?? null;
  const invalidReason = tokenValidation?.reason ?? null;
  console.log('🛡️ [Create Admin] Validation state:', { isValidToken, inviteEmail, invalidReason, isLoading: isValidatingToken });

  const handleInputChange = (field: string, value: string) => {
    console.log('🛡️ [Create Admin] Form input changed:', { field, value });
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    console.log('🛡️ [Create Admin] Validating form:', formData);
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.role) newErrors.role = "Role is required";

    console.log('🛡️ [Create Admin] Form validation result:', Object.keys(newErrors).length === 0 ? 'valid' : 'invalid', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const oauthMutation = useMutation({
    ...trpc.auth.getOAuthUrl.mutationOptions(),
    onSuccess: (result) => {
      console.log('✅ [Create Admin] OAuth URL generated successfully');
      if (result.url) {
        // Store admin data and token in localStorage for the callback to access
        const pendingData = {
          ...formData,
          token,
        };
        console.log('🛡️ [Create Admin] Storing data in localStorage:', pendingData);
        localStorage.setItem('pendingAdminData', JSON.stringify(pendingData));
        console.log('🛡️ [Create Admin] Redirecting to Google OAuth');
        window.location.href = result.url;
      } else {
        throw new Error("No OAuth URL returned");
      }
    },
    onError: (error) => {
      console.error('❌ [Create Admin] OAuth URL generation error:', error);
      const { headerText, paragraphText } = handleApiError(error, {
        defaultMessage: "Failed to initiate Google sign-in"
      });
      showToastError({ headerText, paragraphText });
      setIsGoogleSignUpLoading(false);
    },
  });

  const handleGoogleSignUp = async () => {
    console.log('🛡️ [Create Admin] Google signup button clicked');
    if (!validateForm()) {
      console.log('❌ [Create Admin] Form validation failed');
      return;
    }
    if (!token) {
      console.log('❌ [Create Admin] No token found');
      showToastError({
        headerText: "Invalid Invite",
        paragraphText: "No invite token found"
      });
      return;
    }
    
    try {
      setIsGoogleSignUpLoading(true);
      console.log('🛡️ [Create Admin] Initiating Google OAuth for admin creation');
      console.log('🛡️ [Create Admin] Form data:', formData);
      console.log('🛡️ [Create Admin] Token:', `${token.substring(0, 8)}...`);
      
      // Use tRPC mutation to get OAuth URL (same pattern as student registration)
      await oauthMutation.mutateAsync({
        provider: "google",
        redirectTo: "/auth/callback",
        role: "admin",
        origin: typeof window !== 'undefined' ? window.location.origin : undefined,
      });
    } catch (error) {
      console.error('❌ [Create Admin] Google OAuth failed (unexpected error):', error);
      console.error('❌ [Create Admin] Error stack:', error instanceof Error ? error.stack : 'No stack');
      showToastError({
        headerText: "Google OAuth Failed",
        paragraphText: error instanceof Error ? error.message : "An unexpected error occurred"
      });
      setIsGoogleSignUpLoading(false);
    }
  };


  // Show loading state while validating token
  if (isValidatingToken && token) {
    return (
      <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar py-4">
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-gray-400" />
            <h2 className="mt-4 font-semibold text-gray-800 text-little-md dark:text-white/90 sm:text-title-md">
              Validating Invite...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!isValidToken) {
    return (
      <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar py-4">
        <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <ChevronLeft className="size-5" />
            Back to Landing Page
          </Link>
        </div>
        <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white/90">
              Invalid Invite
            </h1>
            <p className="mb-6 text-gray-500 dark:text-gray-400">
              {invalidReason === "Token already used" ? "This link has already been used" :
               tokenError?.message || (!token ? "No invite token provided" : "This invite link is not valid.")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar py-4">
      <div className="w-full max-w-md mx-auto mb-5 sm:pt-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeft className="size-5" />
          Back to Landing Page
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-little-sm dark:text-white/90 sm:text-title-md">
              Create New Admin
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fill in the admin details and sign up with Google
            </p>
            {inviteEmail && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Invite sent to: <span className="font-medium">{inviteEmail}</span>
              </p>
            )}
          </div>
          
          <div className="space-y-5">
            {/* Honorific and Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Honorific (optional)</Label>


                <Select
                  value={formData.honorific}
                  onValueChange={(value: string) => handleInputChange('honorific', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select honorific" />
                  </SelectTrigger>
                  <SelectContent>
                    {honorifics.map((honorific) => (
                      <SelectItem key={honorific} value={honorific}>
                        {honorific}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Role *</Label>
                <Input
                  type="text"
                  value={formData.role}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('role', e.target.value)}
                  placeholder="Enter role (e.g., CRC Fellow)"
                  className={errors.role ? 'border-red-500' : ''}
                />
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role}</p>
                )}
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('firstName', e.target.value)}
                  placeholder="Enter first name"
                  className={`w-full px-3 py-2 border rounded-md  ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lastName', e.target.value)}
                  placeholder="Enter last name"
                  className={`w-full px-3 py-2 border rounded-md  ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Google Signup Button */}
            <div className="pt-2">
              <button 
                onClick={handleGoogleSignUp}
                disabled={isGoogleSignUpLoading}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm font-normal text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-gray-800 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGoogleSignUpLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                    <span>Creating admin with Google...</span>
                  </>
                ) : (
                  <>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                        fill="#4285F4"
                      />
                      <path
                        d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                        fill="#EB4335"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
