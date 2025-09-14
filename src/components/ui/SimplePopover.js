"use client";
import {  useEffect, useRef } from 'react';

const SimplePopover = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Onayla", cancelText = "İptal" }) => {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div 
        ref={popoverRef}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs w-full mx-4"
      >
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="ml-2 text-sm font-medium text-gray-900">{title}</h3>
        </div>
        
        <p className="text-xs text-gray-600 mb-4">{message}</p>
        
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 focus:outline-none"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 border border-transparent rounded hover:bg-red-700 focus:outline-none"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimplePopover;
