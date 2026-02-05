
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
      <input
        className={`
            w-full rounded-lg border border-slate-300 dark:border-slate-600 
            bg-white dark:bg-slate-800 
            px-3 py-2.5 md:py-2 
            text-slate-900 dark:text-slate-100 
            placeholder-slate-400 dark:placeholder-slate-500
            shadow-sm transition-colors
            focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400
            text-base md:text-sm
            disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-900 dark:disabled:text-slate-600
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''} 
            ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
            <select
                className={`
                    w-full rounded-lg border border-slate-300 dark:border-slate-600
                    bg-white dark:bg-slate-800 
                    px-3 py-2.5 md:py-2 
                    text-slate-900 dark:text-slate-100
                    shadow-sm transition-colors
                    focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400
                    text-base md:text-sm
                    ${className}
                `}
                {...props}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="dark:bg-slate-800 dark:text-slate-100">{opt.label}</option>
                ))}
            </select>
        </div>
    );
};
