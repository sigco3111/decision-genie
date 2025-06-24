
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent text-center p-4 text-sm text-slate-600 mt-auto">
      <p>&copy; {new Date().getFullYear()} 고민 결정 마법사. AI의 결정은 참고용으로만 활용해주세요.</p>
    </footer>
  );
};