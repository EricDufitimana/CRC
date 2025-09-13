import React from 'react';
import { toast } from 'react-hot-toast';
import ErrorButton from '../Motion/Errorbutton';

interface ToastErrorProps {
  headerText: string;
  paragraphText: string;
  direction?: 'left' | 'right';
}

export const showToastError = ({ headerText, paragraphText, direction = 'left' }: ToastErrorProps) => {
  const enterClass = direction === 'right' ? 'animate-custom-enter-right' : 'animate-custom-enter';
  const leaveClass = direction === 'right' ? 'animate-custom-leave-right' : 'animate-custom-leave';

  toast.custom((t) => (
    <div
      className={`${
        t.visible ? enterClass : leaveClass
      } bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md relative`}
    >
      {/* Content */}
      <div className="flex items-center gap-3 max-w-sm">
        <ErrorButton />
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

export default showToastError;
