"use client";

import { useState, useEffect, useRef, useActionState } from "react";
import Image from "next/image";
import { Button } from "../../../zenith/src/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../zenith/src/components/ui/dialog";
import { InputWithRing } from "@/components/ui/input";
import { Textarea } from "../../../zenith/src/components/ui/textarea";
import { Label } from "../../../zenith/src/components/ui/label";
import { Calendar, Users, FileText, Loader2 } from "lucide-react";
import { getCalApi } from "@calcom/embed-react";
import useFollowEyes from "@/components/other/useFollowEyes";
import { submitEssayHandler } from "@/actions/essays/submitEssayHandler";
import { showToastPromise } from "@/components/toasts";

export default function TestingPage() {
  // Initialize the follow eyes effect
  useFollowEyes();
  
  // Refs for eye following effect
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const eyesRef = useRef<(HTMLImageElement | null)[]>([]);

  const [requestSessionOpen, setRequestSessionOpen] = useState(false);
  const [submitEssayOpen, setSubmitEssayOpen] = useState(false);
  const [crcFellows, setCrcFellows] = useState<Array<{id: string, name: string, specialization: string}>>([]);
  const [bookingStep, setBookingStep] = useState<'select-admin' | 'select-time' | 'booking'>('select-admin');
  const [selectedAdmin, setSelectedAdmin] = useState<{id: string, name: string, specialization: string} | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  
  // Submit Essay states
  const [essayStep, setEssayStep] = useState<'select-fellow' | 'details' | 'final'>("select-fellow");
  const [selectedEssayFellow, setSelectedEssayFellow] = useState<{id: string, name: string, specialization: string} | null>(null);
  const [essayTitle, setEssayTitle] = useState("");
  const [essayDescription, setEssayDescription] = useState("");
  const [essayDeadline, setEssayDeadline] = useState("");
  const [essayLink, setEssayLink] = useState("");
  const [essayWordCount, setEssayWordCount] = useState("");
  const [isEssaySubmitting, setIsEssaySubmitting] = useState(false);
  
  const sessionDurations = [
    { value: "20_min", label: "20 min", description: "Quick review" },
    { value: "40_min", label: "40 min", description: "Standard session" },
    { value: "60_min", label: "60 min", description: "Comprehensive review" }
  ];
  
  // Essay handlers
  const handleEssaySubmission = async (prevState: any, formData: FormData) => {
    formData.append('student_id', '1'); // Mock student ID for testing
    return await submitEssayHandler(prevState, formData);
  };

  const handleEssayFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsEssaySubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const essayPromise = submitEssayHandler(essayState, formData);
      
      showToastPromise({
        promise: essayPromise,
        loadingText: 'Submitting essay...',
        successText: 'You can track its status on your assignments page.',
        errorText: 'Failed to submit essay. Please try again.',
        successHeaderText: 'Essay Submitted Successfully',
        errorHeaderText: 'Essay Submission Failed',
        direction: 'right'
      });
      
      await essayPromise;
      resetEssayForm();
    } catch (error) {
      resetEssayForm();
    } finally {
      setIsEssaySubmitting(false);
    }
  };

  const resetEssayForm = () => {
    setSubmitEssayOpen(false);
    setEssayStep('select-fellow');
    setSelectedEssayFellow(null);
    setEssayTitle('');
    setEssayDescription('');
    setEssayDeadline('');
    setEssayLink('');
    setEssayWordCount('');
  };
  
  const [essayState, essayFormAction, isEssayPending] = useActionState(handleEssaySubmission, {
    success: false,
    message: '',
    data: null
  });
  
  useEffect(() => {
    if (essayState.success) {
      resetEssayForm();
    }
  }, [essayState.success]);

  // Fetch fellows
  useEffect(() => {
    const fetchFellows = async () => {
      try {
        const response = await fetch('/api/fellows');
        if (response.ok) {
          const data = await response.json();
          setCrcFellows(data);
        }
      } catch (e) {
        // Silent error handling
      }
    };
    fetchFellows();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-gray-800">Dialog Testing</h1>
        <p className="text-sm text-gray-600">Test the dialogs and buttons</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Request Session Button */}
        <Button 
          variant="outline" 
          className="w-full justify-start h-auto py-4 rounded-xl gap-3 hover:shadow-sm" 
          onClick={() => setRequestSessionOpen(true)}
        >
          <span className="h-10 w-10 rounded-full bg-yearcolors-ey grid place-items-center flex-shrink-0">
            <Calendar className="h-5 w-5 text-neutral-900" />
          </span>
          <span className="text-sm font-medium truncate">Request Session</span>
        </Button>

        {/* Submit Essay Button */}
        <Button 
          variant="outline" 
          className="w-full justify-start h-auto py-4 rounded-xl gap-3 hover:shadow-sm" 
          onClick={() => setSubmitEssayOpen(true)}
        >
          <span className="h-10 w-10 rounded-full bg-yearcolors-s5 grid place-items-center flex-shrink-0">
            <FileText className="h-5 w-5 text-neutral-900" />
          </span>
          <span className="text-sm font-medium truncate">Submit Essay</span>
        </Button>
      </div>

      {/* Multi-step Request Session (Cal.com) */}
      <Dialog open={requestSessionOpen} onOpenChange={(open: boolean) => {
        setRequestSessionOpen(open);
        if (!open) { setBookingStep('select-admin'); setSelectedAdmin(null); setSelectedTime(""); }
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-visible bg-white rounded-2xl shadow-2xl border-0 [&>button]:!hidden">
          <div className="relative overflow-visible">
            {/* This is your reference point for the eyes */}
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

          <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
            <DialogHeader className="pb-6">
            <DialogTitle className="text-xl pb-4 font-bold text-gray-900 text-center">
              {bookingStep === 'select-admin' && 'Choose your CRC Fellow'}
              {bookingStep === 'select-time' && 'Select your session time'}
              {bookingStep === 'booking' && 'Confirm your booking'}
            </DialogTitle>
            <div className="flex items-center justify-center space-x-6 mt-4">
              <div className={`flex items-center ${bookingStep === 'select-admin' ? 'text-statColors-2' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${bookingStep === 'select-admin' ? 'bg-statColors-2 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                <span className="ml-2 text-sm font-medium">Fellow</span>
              </div>
              <div className={`w-6 h-px ${bookingStep === 'select-time' ? 'bg-statColors-2' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${bookingStep === 'select-time' ? 'text-statColors-2' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${bookingStep === 'select-time' ? 'bg-statColors-2 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                <span className="ml-2 text-sm font-medium">Time</span>
              </div>
              <div className={`w-6 h-px bg-gray-200`}></div>
              <div className={`flex items-center ${bookingStep === 'booking' ? 'text-statColors-2' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${bookingStep === 'booking' ? 'bg-statColors-2 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
                <span className="ml-2 text-sm font-medium">Book</span>
              </div>
            </div>
          </DialogHeader>

          {bookingStep === 'select-admin' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {crcFellows.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto mb-3"></div>
                    <p className="text-gray-500 text-sm">Loading fellows...</p>
                  </div>
                ) : (
                  crcFellows.map((fellow) => (
                    <div key={fellow.id} onClick={() => setSelectedAdmin(fellow)} className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedAdmin?.id === fellow.id ? 'border-statColors-2 bg-statColors-2/10 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}>
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-300 shadow-sm">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{fellow.name}</h3>
                          <p className="text-sm text-gray-500">{fellow.specialization}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  className="rounded-xl px-8 text-sm" 
                  onClick={() => setRequestSessionOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setBookingStep('select-time')} disabled={!selectedAdmin} className="bg-statColors-2 hover:bg-statColors-2/80 rounded-xl px-8 text-sm text-white shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(37,99,235,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(37,99,235,0.15)] transition duration-200">Continue</Button>
              </div>
            </div>
          )}

          {bookingStep === 'select-time' && (
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">With <span className="font-semibold text-gray-900">{selectedAdmin?.name}</span></p>
                <p className="text-gray-500 text-sm">Choose your session duration</p> 
              </div>
              <div className="grid grid-cols-3 gap-3">
                {sessionDurations.map((duration) => (
                  <div key={duration.value} onClick={() => setSelectedTime(duration.value)} className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedTime === duration.value ? 'border-statColors-2 bg-statColors-2/10 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}>
                    <div className="text-center">
                      <div className={`text-lg font-semibold mb-1 ${selectedTime === duration.value ? 'text-statColors-2' : 'text-gray-900'}`}>{duration.label}</div>
                      <div className={`text-xs ${selectedTime === duration.value ? 'text-statColors-2' : 'text-gray-500'}`}>{duration.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setBookingStep('select-admin')} className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl px-8">Back</Button>
                <Button onClick={() => setBookingStep('booking')} disabled={!selectedTime} className="bg-statColors-2 hover:bg-statColors-2/80 px-8 py-2 rounded-xl text-white font-medium shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(37,99,235,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(37,99,235,0.15)] transition duration-200">Continue</Button>
              </div>
            </div>
          )}

          {bookingStep === 'booking' && (
            <div className="space-y-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-statColors-2 shadow-sm">
                    <Users className="h-5 w-5 text-white" />
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
                <Button onClick={async () => { const cal = await getCalApi({ namespace: 'quick-review' }); cal('modal', { calLink: 'dufitimana-eric/quick-review' }); }} className="w-full bg-statColors-2 hover:bg-statColors-2/80 text-white py-4 px-8 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(37,99,235,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(37,99,235,0.15)]">Book Your Session</Button>
                <p className="text-xs text-gray-500 mt-3">You&apos;ll be redirected to Cal.com to select your preferred time</p>
              </div>
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={() => setBookingStep('select-time')} className="border-gray-300 text-gray-700 hover:bg-gray-50">Back</Button>
              </div>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Essay - Multi-step */}
      <Dialog open={submitEssayOpen} onOpenChange={(open) => { setSubmitEssayOpen(open); if (!open) { setEssayStep('select-fellow'); setSelectedEssayFellow(null);} }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-visible bg-white rounded-2xl shadow-2xl border-0 [&>button]:!hidden">
        <div className="relative overflow-visible">
            {/* This is your reference point for the eyes */}
            <div ref={anchorRef} className="absolute top-0 right-0 w-4 h-4"></div>
            
            <Image 
              src="/images/popup/popup-illustration-009.png" 
              alt="Popup Illustration" 
              width={2000}
              height={2000}
              className="absolute top-[140px] right-[-132px] w-32 pointer-events-none z-0"
            />
            
            {/* Left eye */}
            <Image 
              ref={(el) => { eyesRef.current[0] = el; }}
              src="/images/popup/eye.png" 
              alt="Popup Eye" 
              width={30} 
              height={30} 
              className="absolute z-10 top-[180px] right-[-72px]"
            />
            
            {/* Right eye */}
            <Image 
              ref={(el) => { eyesRef.current[1] = el; }}
              src="/images/popup/eye.png" 
              alt="Popup Eye" 
              width={30} 
              height={30} 
              className="absolute z-10 top-[193px] right-[-100px]"
            />
          </div>

          
          <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
            <DialogHeader className="pb-6">
              <DialogTitle className="text-xl pb-4 font-bold text-gray-900 text-center">
                {essayStep === 'select-fellow' && 'Choose your CRC Fellow'}
                {essayStep === 'details' && 'Essay details'}
                {essayStep === 'final' && 'Deadline & link'}
              </DialogTitle>
              <div className="flex items-center justify-center space-x-6 mt-4">
                <div className={`flex items-center ${essayStep === 'select-fellow' ? 'text-statColors-1' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${essayStep === 'select-fellow' ? 'bg-statColors-1 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                  <span className="ml-2 text-sm font-medium">Fellow</span>
                </div>
                <div className={`w-6 h-px ${essayStep === 'details' ? 'bg-statColors-1' : 'bg-gray-200'}`}></div>
                <div className={`flex items-center ${essayStep === 'details' ? 'text-statColors-1' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${essayStep === 'details' ? 'bg-statColors-1 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                  <span className="ml-2 text-sm font-medium">Details</span>
                </div>
                <div className={`w-6 h-px bg-gray-200`}></div>
                <div className={`flex items-center ${essayStep === 'final' ? 'text-statColors-1' : 'text-gray-400'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${essayStep === 'final' ? 'bg-statColors-1 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
                  <span className="ml-2 text-sm font-medium">Finish</span>
                </div>
              </div>
            </DialogHeader>

            {essayStep === 'select-fellow' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {crcFellows.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-neutral-400" />
                      <p className="text-gray-500 text-sm">Loading fellows...</p>
                    </div>
                  ) : (
                    crcFellows.map((fellow) => (
                      <div key={fellow.id} onClick={() => setSelectedEssayFellow(fellow)} className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${selectedEssayFellow?.id === fellow.id ? 'border-statColors-1 bg-statColors-1/10 shadow-sm' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'}`}>
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-300 shadow-sm">
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900  text-sm mb-1 truncate">{fellow.name}</h3>
                            <p className="text-sm text-gray-500">{fellow.specialization}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex justify-end pt-2">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="rounded-xl" 
                      onClick={() => setSubmitEssayOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => setEssayStep('details')}
                      disabled={!selectedEssayFellow}
                      className="bg-statColors-1 hover:bg-statColors-1/80 rounded-xl px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {essayStep === 'details' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="essay-title">Essay Title</Label>
                  <InputWithRing id="essay-title" value={essayTitle} onChange={(e) => setEssayTitle(e.target.value)} placeholder="Enter your essay title" className="border  border-neutral-200  transition-colors duration-200 ease-in-out rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="essay-description">Description</Label>
                  <Textarea 
                    id="essay-description" 
                    value={essayDescription} 
                    onChange={(e) => setEssayDescription(e.target.value)} 
                    placeholder="Brief description" 
                    rows={3} 
                    maxLength={200}
                    className="border border-neutral-200 transition-colors duration-200 ease-in-out rounded-xl" 
                  />
                  <div className="text-xs text-neutral-500 mt-1">
                    {200 - essayDescription.length} characters left
                  </div>
                </div>
                <div>
                  <Label htmlFor="essay-word-count">Word Count (Optional)</Label>
                  <InputWithRing id="essay-word-count" name="word_count" type="number" placeholder="Enter word count" value={essayWordCount} onChange={(e) => setEssayWordCount(e.target.value)} className="border border-neutral-200  transition-colors duration-200 ease-in-out rounded-xl" />
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="outline" className="rounded-xl" onClick={() => setEssayStep('select-fellow')}>Back</Button>
                  <Button
                    onClick={() => setEssayStep('final')}
                    className="bg-statColors-1 hover:bg-statColors-1/80 rounded-xl px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {essayStep === 'final' && (
              <form action={essayFormAction} onSubmit={handleEssayFormSubmit} className="space-y-4">
                <input type="hidden" name="admin_id" value={selectedEssayFellow?.id || ''} />
                <input type="hidden" name="title" value={essayTitle} />
                <input type="hidden" name="description" value={essayDescription} />
                <div>
                  <Label htmlFor="essay-deadline">Deadline (Optional)</Label>
                  <InputWithRing id="essay-deadline" name="deadline" type="date" value={essayDeadline} onChange={(e) => setEssayDeadline(e.target.value)} disabled={isEssaySubmitting} className="border border-neutral-200  transition-colors duration-200 ease-in-out rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="google-docs-link">Google Docs Link</Label>
                  <InputWithRing id="google-docs-link" name="googleDocsLink" type="url" placeholder="https://docs.google.com/document/d/..." value={essayLink} onChange={(e) => setEssayLink(e.target.value)} disabled={isEssaySubmitting} required className="border border-neutral-200  transition-colors duration-200 ease-in-out rounded-xl" />
                </div>
                <div className="flex justify-between space-x-2 pt-2">
                  <Button variant="outline" className="rounded-xl" onClick={() => setEssayStep('details')} disabled={isEssaySubmitting}>Back</Button>
                  <Button
                    type="submit"
                    className="bg-statColors-1 hover:bg-statColors-1/80 rounded-xl px-8 text-sm shadow-[inset_-2px_2px_0_rgba(255,255,255,0.1),0_1px_6px_rgba(0,128,0,0.4)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_4px_rgba(0,128,0,0.1)] transition duration-200"
                    disabled={isEssaySubmitting}
                  >
                    {isEssaySubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEssaySubmitting ? 'Submitting...' : 'Submit Essay'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
