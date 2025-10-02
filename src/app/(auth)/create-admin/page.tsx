"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "../../../../zenith/src/components/ui/button";
import { Input } from "../../../../zenith/src/components/ui/input";
import { Label } from "../../../../zenith/src/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../zenith/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../zenith/src/components/ui/select";
import { showToastSuccess, showToastError } from "@/components/toasts";
import { Shield, UserPlus, ArrowLeft } from "lucide-react";
import { createAdmin } from "@/actions/admin/createAdmin";

const honorifics = [
  "Mr.", "Mrs.", "Ms.", "Dr.", "Prof.", "Rev.", "Sir", "Dame"
];

const roles = [
  { value: "admin", label: "Admin" },
  { value: "super_admin", label: "Super Admin" }
];

export default function CreateAdmin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    honorific: "",
    firstName: "",
    lastName: "",
    email: "",
    role: "admin"
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.role) newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const result = await createAdmin(formData);

      if (result.success) {
        showToastSuccess({
          headerText: "Admin Created Successfully",
          paragraphText: result.message || "Admin has been created successfully.",
          direction: "right"
        });

        // Reset form
        setFormData({
          honorific: "",
          firstName: "",
          lastName: "",
          email: "",
          role: "admin"
        });
      } else {
        showToastError({
          headerText: "Failed to Create Admin",
          paragraphText: result.error || "An unexpected error occurred.",
          direction: "right"
        });
      }

    } catch (error) {
      console.error('Error creating admin:', error);
      showToastError({
        headerText: "Failed to Create Admin",
        paragraphText: "An unexpected error occurred.",
        direction: "right"
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Create New Admin</h1>
          </div>
          <p className="text-gray-600">
            Add a new administrator to the system. They will receive login credentials via email.
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Admin Information
            </CardTitle>
            <CardDescription>
              Fill in the details for the new administrator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honorific and Role */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="honorific">Honorific</Label>
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
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: string) => handleInputChange('role', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-600">{errors.role}</p>
                  )}
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
                <p className="text-sm text-gray-500">
                  The admin will receive login credentials at this email address.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Admin'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
