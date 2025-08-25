import React from 'react';
import { toast } from 'react-hot-toast';
import SuccessButton from '../Motion/SuccessButton';

interface ToastSuccessProps {
  headerText: string;
  paragraphText: string;
}

export const showToastSuccess = ({ headerText, paragraphText }: ToastSuccessProps) => {
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
          <h4 className="text-gray-800 font-medium text-sm">{headerText}</h4>
          <p className="text-gray-500 text-xs">{paragraphText}</p>
        </div>
      </div>
    </div>
  ), {
    duration: 4000,
    style: {
      background: 'transparent',
      padding: 0,
      margin: 0,
      boxShadow: 'none',
    },
  });
};

export default showToastSuccess;
