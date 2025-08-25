import React from 'react';
import { toast } from 'react-hot-toast';
import SuccessButton from '../Motion/SuccessButton';
import ErrorButton from '../Motion/Errorbutton';

interface ToastPromiseProps {
  promise: Promise<any>;
  loadingText: string;
  successText: string;
  errorText: string;
}

export const showToastPromise = ({ 
  promise, 
  loadingText, 
  successText, 
  errorText 
}: ToastPromiseProps) => {
  // Show loading toast
  const loadingToast = toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-custom-enter' : 'animate-custom-leave'
      } bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm relative`}
    >
      {/* Content */}
      <div className="flex items-center gap-3">
        {/* Minimal loading spinner */}
        <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
        <div>
          <h4 className="text-gray-800 font-medium text-sm">{loadingText}</h4>
          <p className="text-gray-500 text-xs">Please wait...</p>
        </div>
      </div>
    </div>
  ), {
    duration: Infinity, // Keep loading until promise resolves
    style: {
      background: 'transparent',
      padding: 0,
      margin: 0,
      boxShadow: 'none',
    },
  });

  // Handle the promise
  promise
    .then((result) => {
      // Update the existing loading toast to show success
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-custom-enter' : 'animate-custom-leave'
          } bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm relative`}
        >
          {/* Content */}
          <div className="flex items-center gap-3">
            <SuccessButton />
            <div>
              <h4 className="text-gray-800 font-medium text-sm">Success!</h4>
              <p className="text-gray-500 text-xs">{successText}</p>
            </div>
          </div>
        </div>
      ), {
        id: loadingToast, // Use the same ID to update the existing toast
        duration: 4000,
        style: {
          background: 'transparent',
          padding: 0,
          margin: 0,
          boxShadow: 'none',
        },
      });
      
      return result;
    })
    .catch((error) => {
      // Update the existing loading toast to show error
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-custom-enter' : 'animate-custom-leave'
          } bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm relative`}
        >
          {/* Content */}
          <div className="flex items-center gap-3">
            <ErrorButton />
            <div>
              <h4 className="text-gray-800 font-medium text-sm">Error</h4>
              <p className="text-gray-500 text-xs">{errorText}</p>
            </div>
          </div>
        </div>
      ), {
        id: loadingToast, // Use the same ID to update the existing toast
        duration: 4000,
        style: {
          background: 'transparent',
          padding: 0,
          margin: 0,
          boxShadow: 'none',
        },
      });
      
      throw error; // Re-throw so calling code can handle it if needed
    });

  return loadingToast; // Return the loading toast ID in case you want to dismiss it manually
};

export default showToastPromise;
