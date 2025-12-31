import React from 'react';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'bottom-end';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: TooltipPlacement;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, placement = 'top' }) => {
  let positionClasses = '';
  let arrowClasses = '';

  switch (placement) {
    case 'top':
      positionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      arrowClasses = 'left-1/2 top-full -mt-1 -translate-x-1/2 border-b border-r';
      break;
    case 'bottom':
      positionClasses = 'top-full left-1/2 -translate-x-1/2 mt-2';
      arrowClasses = 'left-1/2 bottom-full -mb-1 -translate-x-1/2 border-t border-l';
      break;
    case 'left':
      positionClasses = 'right-full top-1/2 -translate-y-1/2 mr-2';
      arrowClasses = 'left-full top-1/2 -ml-1 -translate-y-1/2 border-t border-r';
      break;
    case 'right':
      positionClasses = 'left-full top-1/2 -translate-y-1/2 ml-2';
      arrowClasses = 'right-full top-1/2 -mr-1 -translate-y-1/2 border-b border-l';
      break;
    case 'bottom-end':
      positionClasses = 'top-full right-0 mt-2';
      arrowClasses = 'right-2 bottom-full -mb-1 border-t border-l'; 
      break;
    default:
      positionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      arrowClasses = 'left-1/2 top-full -mt-1 -translate-x-1/2 border-b border-r';
  }

  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <div className={`absolute ${positionClasses} hidden w-max max-w-xs whitespace-normal rounded bg-gray-800 px-3 py-2 text-xs text-white shadow-xl border border-gray-700 group-hover:block z-50`}>
        {content}
        <div className={`absolute h-2 w-2 rotate-45 bg-gray-800 ${arrowClasses} border-gray-700`}></div>
      </div>
    </div>
  );
};

export default Tooltip;
