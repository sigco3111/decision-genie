
import React from 'react';
import { APP_TITLE, APP_SUBTITLE } from '../constants';
import { SparklesIcon } from './icons/SparklesIcon';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/60 backdrop-blur-lg shadow-md p-6 sticky top-0 z-50">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-3">
          <SparklesIcon className="w-10 h-10 text-purple-500" />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            {APP_TITLE}
          </h1>
        </div>
        <p className="text-slate-600 mt-2 sm:mt-0 text-sm sm:text-base">{APP_SUBTITLE}</p>
      </div>
    </header>
  );
};