import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-black/95 flex items-center justify-center relative overflow-hidden">
      {/* Abstract background decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[120px]"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 bg-card/40 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-400">
            ReflexOS
          </h1>
          <p className="text-muted-foreground mt-2">The intelligent workspace</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
