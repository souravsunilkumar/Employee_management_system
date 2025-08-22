import React from 'react';
import { CgSpinner } from 'react-icons/cg';
import PropTypes from 'prop-types';

const ScreenLoaderComponet = ({
  isLoading = true,
  fullScreen = true,
  message = 'Loading...',
  spinnerSize = 'xl',
  spinnerColor = 'primary',
  bgOpacity = 75,
  showLogo = true,
}) => {
  // Early return if not loading
  if (!isLoading) return null;
  
  // Map spinner sizes to Tailwind classes
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
    '2xl': 'text-6xl',
  };
  
  // Map colors to CSS variables
  const colorClasses = {
    primary: 'text-[var(--color-primary)]',
    secondary: 'text-[var(--color-secondary)]',
    accent: 'text-[var(--color-accent)]',
    white: 'text-white',
  };
  
  // Container classes based on fullScreen prop
  const containerClasses = fullScreen
    ? `fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-${bgOpacity}`
    : 'w-full h-full flex items-center justify-center';
  
  return (
    <div className={containerClasses} data-testid="screen-loader">
      <div className="flex flex-col items-center justify-center gap-4">
        {showLogo && (
          <div className="mb-2">
            <h2 className="text-2xl font-bold text-white">EMS</h2>
          </div>
        )}
        
        <CgSpinner 
          className={`${sizeClasses[spinnerSize] || 'text-5xl'} ${colorClasses[spinnerColor] || 'text-[var(--color-primary)]'} animate-spin`} 
        />
        
        {message && (
          <p className="text-white font-medium mt-2">{message}</p>
        )}
      </div>
    </div>
  );
};

ScreenLoaderComponet.propTypes = {
  isLoading: PropTypes.bool,
  fullScreen: PropTypes.bool,
  message: PropTypes.string,
  spinnerSize: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl']),
  spinnerColor: PropTypes.oneOf(['primary', 'secondary', 'accent', 'white']),
  bgOpacity: PropTypes.number,
  showLogo: PropTypes.bool,
};

export default ScreenLoaderComponet;