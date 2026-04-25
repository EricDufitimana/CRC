"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Users } from "lucide-react";
import Image from "next/image";
import { useTRPC } from "@/trpc/client";
import { getCalApi } from "@calcom/embed-react";
import { useSuspenseQuery } from "@tanstack/react-query";

const sessionDurations = [
  { value: "20_min", label: "20 min", description: "Quick review" },
  { value: "40_min", label: "40 min", description: "Standard session" },
  { value: "60_min", label: "60 min", description: "Comprehensive review" }
];

function angle(cx: number, cy: number, ex: number, ey: number) {
  const dy = ey - cy;
  const dx = ex - cx;
  const rad = Math.atan2(dy, dx);
  return (rad * 180) / Math.PI;
}

export function RequestSessionDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const trpc = useTRPC();
  const [step, setStep] = useState<'select-admin' | 'select-time' | 'booking'>('select-admin');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<{ 
    id: string, 
    name: string, 
    specialization: string,
    profile_picture?: string | null,
    cal_link?: string | null,
    cal_sessions_namespace?: {
      quick_review: string,
      standard_session: string,
      comprehensive_review: string
    } | null
  } | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const { data: fellows } = useSuspenseQuery(trpc.studentDashboard.getFellows.queryOptions());

  const resetForm = () => {
    setStep('select-admin');
    setSelectedAdmin(null);
    setSelectedTime("");
    setBookingError(null);
  };

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  // Eye effect logic
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const eyesRef = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!anchorRef.current || eyesRef.current.length === 0) return;
      const rekt = anchorRef.current.getBoundingClientRect();
      const anchorX = rekt.left + rekt.width / 2;
      const anchorY = rekt.top + rekt.height / 2;
      const angleDeg = angle(e.clientX, e.clientY, anchorX, anchorY);
      eyesRef.current.forEach((eye) => {
        if (eye) {
          eye.style.transform = `rotate(${90 + angleDeg}deg)`;
        }
      });
    };
    if (open) {
      document.addEventListener("mousemove", handleMouseMove);
    }
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [open]);

  const handleBook = async () => {
    if (!selectedAdmin || !selectedTime) return;

    // Map selectedTime (20_min, 40_min, 60_min) to the corresponding namespace key
    const namespaceKeyMap: Record<string, string> = {
      "20_min": "quick_review",
      "40_min": "standard_session",
      "60_min": "comprehensive_review"
    };

    const key = namespaceKeyMap[selectedTime];
    const eventSlug = selectedAdmin.cal_sessions_namespace?.[key as keyof typeof selectedAdmin.cal_sessions_namespace] || "";
    const calUserLink = selectedAdmin.cal_link || "";

    if (!calUserLink || !eventSlug) {
      console.error("Missing cal_link or event slug for admin:", selectedAdmin.name);
      setBookingError("This fellow hasn't configured their booking calendar yet. Please try again later or contact support.");
      return;
    }

    setIsBooking(true);
    setBookingError(null);
    
    try {
      const cal = await getCalApi({ namespace: eventSlug });
      cal('modal', { calLink: `${calUserLink}/${eventSlug}`, config: {
        theme: 'light'
      }});
      // Reset loading state and close the dialog
      setIsBooking(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error initiating Cal.com booking:', error);
      setBookingError('Failed to open booking calendar. Please try again.');
      setIsBooking(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-visible bg-white rounded-2xl shadow-2xl border-0 [&>button]:!hidden flex flex-col">
        <div className="relative overflow-visible">
          <div ref={anchorRef} className="absolute top-0 right-0 w-4 h-4"></div>
          
          <Image 
            src="/images/popup/popup-illustration-008.png" 
            alt="Popup Illustration" 
            width={2000}
            height={2000}
            className="absolute -top-[110px] right-[220px] w-32 pointer-events-none z-0"
          />
          
          {/* Left eye */}
          <Image 
            ref={(el) => { eyesRef.current[0] = el; }}
            src="/images/popup/eye.png" 
            alt="Popup Eye" 
            width={30} 
            height={30}
            className="absolute z-10 top-[-62px] right-[285px]"
          />
          
          {/* Right eye */}
          <Image 
            ref={(el) => { eyesRef.current[1] = el; }}
            src="/images/popup/eye.png" 
            alt="Popup Eye" 
            width={30} 
            height={30}
            className="absolute z-10 top-[-62px] right-[255px]"
          />
        </div>

        <DialogHeader className="pb-6">
          <DialogTitle className="text-xl pb-4 font-bold text-gray-900 text-center">
            {step === 'select-admin' && 'Choose your CRC Fellow'}
            {step === 'select-time' && 'Select your session time'}
            {step === 'booking' && 'Confirm your booking'}
          </DialogTitle>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className={`flex items-center ${step === 'select-admin' ? '' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 'select-admin' ? 'bg-statColors-2 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <span className="ml-2 text-sm font-medium">Fellow</span>
            </div>
            <div className={`w-6 h-px ${step === 'select-time' || step === 'booking' ? 'bg-statColors-2' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step === 'select-time' ? '' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 'select-time' ? 'bg-statColors-2 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <span className="ml-2 text-sm font-medium">Time</span>
            </div>
            <div className={`w-6 h-px ${step === 'booking' ? 'bg-statColors-2' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center ${step === 'booking' ? '' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 'booking' ? 'bg-statColors-2 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
              <span className="ml-2 text-sm font-medium">Confirm</span>
            </div>
          </div>
        </DialogHeader>

        {step === 'select-admin' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fellows?.map((fellow) => (
                <div key={fellow.id} onClick={() => { setSelectedAdmin(fellow); setBookingError(null); }} className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedAdmin?.id === fellow.id ? 'border-statColors-2/60 bg-statColors-2/10 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-slate-300 shadow-sm">
                      {fellow.profile_picture ? (
                        <Image 
                          src={fellow.profile_picture} 
                          alt={fellow.name} 
                          width={48} 
                          height={48} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{fellow.name}</h3>
                      <p className="text-sm text-gray-500">{fellow.specialization}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" className="rounded-xl px-8 text-sm" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={() => setStep('select-time')} disabled={!selectedAdmin} className="bg-statColors-2 hover:bg-statColors-2/80 rounded-xl px-8 text-sm text-white">Continue</Button>
            </div>
          </div>
        )}

        {step === 'select-time' && (
          <div className="space-y-8">
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-2">With <span className="font-semibold text-gray-900">{selectedAdmin?.name}</span></p>
              <p className="text-gray-500 text-sm">Choose your session duration</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {sessionDurations.map((duration) => (
                <div key={duration.value} onClick={() => setSelectedTime(duration.value)} className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedTime === duration.value ? 'border-statColors-2/60 bg-statColors-2/10 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}>
                  <div className="text-center">
                    <div className={`text-lg font-semibold mb-1 ${selectedTime === duration.value ? 'text-statColors-2' : 'text-gray-900'}`}>{duration.label}</div>
                    <div className={`text-xs ${selectedTime === duration.value ? 'text-statColors-2' : 'text-gray-500'}`}>{duration.description}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('select-admin')} className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl px-8">Back</Button>
              <Button onClick={() => setStep('booking')} disabled={!selectedTime} className="bg-statColors-2 hover:bg-statColors-2/80 px-8 py-2 rounded-xl text-white font-medium">Continue</Button>
            </div>
          </div>
        )}

        {step === 'booking' && (
          <div className="space-y-6">
            {bookingError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 text-center">{bookingError}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-slate-300 shadow-sm">
                  {selectedAdmin?.profile_picture ? (
                    <Image 
                      src={selectedAdmin.profile_picture} 
                      alt={selectedAdmin.name} 
                      width={40} 
                      height={40} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Session Summary</h3>
                  <p className="text-sm text-gray-500">Review your booking details</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 ">
                  <span className="text-sm text-gray-600">Fellow</span>
                  <span className="text-sm font-medium text-gray-900">{selectedAdmin?.name}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center py-2 "><span className="text-sm text-gray-600">Duration</span><span className="text-sm font-medium text-gray-900">{sessionDurations.find(d => d.value === selectedTime)?.label}</span></div>
              </div>
            </div>
            <div className="text-center">
              <Button 
                onClick={handleBook} 
                disabled={isBooking} 
                className="w-full bg-statColors-2 hover:bg-statColors-2/80 text-white py-4 px-8 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                    Opening calendar...
                  </>
                ) : (
                  'Book Your Session'
                )}
              </Button>
              <p className="text-xs text-gray-500 mt-3">You&apos;ll be redirected to Cal.com to select your preferred time</p>
            </div>
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => setStep('select-time')} className="border-gray-300 text-gray-700 hover:bg-gray-50">Back</Button>
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
