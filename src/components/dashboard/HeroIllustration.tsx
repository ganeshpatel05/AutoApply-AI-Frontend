import React from "react";

export const HeroIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-[260px] sm:max-w-[300px] xl:max-w-[340px] h-38 sm:h-44 xl:h-48 flex items-center justify-center pointer-events-none select-none">
      {/* Background Soft Pastel Glowing Orbs */}
      <div className="absolute -top-4 -right-2 w-32 xl:w-36 h-32 xl:h-36 bg-pink-300/40 dark:bg-pink-500/20 rounded-full blur-2xl animate-pulse-glow" />
      <div className="absolute -bottom-4 -left-2 w-32 xl:w-36 h-32 xl:h-36 bg-cyan-300/50 dark:bg-cyan-500/20 rounded-full blur-2xl animate-pulse-glow" />
      <div className="absolute inset-0 bg-blue-200/40 dark:bg-blue-600/10 rounded-full blur-3xl" />

      {/* Main Illustration Container */}
      <div className="relative z-10 flex items-end justify-center gap-1.5 sm:gap-2.5">
        {/* Left Potted Plant */}
        <div className="relative z-10 flex flex-col items-center mb-1 animate-float" style={{ animationDelay: "0.5s" }}>
          {/* Leaves */}
          <div className="relative -mb-1">
            <div className="w-3.5 h-6 xl:w-4 xl:h-7 bg-[#10B981] rounded-full rotate-[-25deg] origin-bottom shadow-2xs" />
            <div className="w-3.5 h-7 xl:w-4 xl:h-8 bg-[#059669] rounded-full rotate-[15deg] origin-bottom absolute bottom-0 left-1.5 shadow-2xs" />
            <div className="w-3 h-5 xl:w-3.5 xl:h-6 bg-[#14B8A6] rounded-full rotate-[-45deg] origin-bottom absolute bottom-0 -left-1" />
          </div>
          {/* Blue Pot */}
          <div className="w-6 xl:w-7 h-7 xl:h-8 bg-gradient-to-b from-[#1769F5] to-[#3B82F6] rounded-b-lg rounded-t-xs shadow-md border-t border-blue-400" />
        </div>

        {/* Center Laptop */}
        <div className="relative flex flex-col items-center">
          {/* Floating AI Chip Top Right of Laptop with Circuit Pins matching Screenshot */}
          <div className="absolute -top-5 xl:-top-6 -right-4 xl:-right-5 z-30 flex items-center justify-center scale-90 xl:scale-100">
            {/* Top pins */}
            <div className="absolute -top-1.5 flex gap-1.5">
              <div className="w-0.5 h-1.5 bg-[#6D28D9] rounded-full" />
              <div className="w-0.5 h-1.5 bg-[#6D28D9] rounded-full" />
              <div className="w-0.5 h-1.5 bg-[#6D28D9] rounded-full" />
            </div>
            {/* Bottom pins */}
            <div className="absolute -bottom-1.5 flex gap-1.5">
              <div className="w-0.5 h-1.5 bg-[#6D28D9] rounded-full" />
              <div className="w-0.5 h-1.5 bg-[#6D28D9] rounded-full" />
              <div className="w-0.5 h-1.5 bg-[#6D28D9] rounded-full" />
            </div>
            {/* Left pins */}
            <div className="absolute -left-1.5 flex flex-col gap-1.5">
              <div className="w-1.5 h-0.5 bg-[#6D28D9] rounded-full" />
              <div className="w-1.5 h-0.5 bg-[#6D28D9] rounded-full" />
              <div className="w-1.5 h-0.5 bg-[#6D28D9] rounded-full" />
            </div>
            {/* Right pins */}
            <div className="absolute -right-1.5 flex flex-col gap-1.5">
              <div className="w-1.5 h-0.5 bg-[#6D28D9] rounded-full" />
              <div className="w-1.5 h-0.5 bg-[#6D28D9] rounded-full" />
              <div className="w-1.5 h-0.5 bg-[#6D28D9] rounded-full" />
            </div>
            {/* Chip body */}
            <div className="bg-[#6D28D9] text-white font-black text-xs xl:text-sm px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl shadow-xl shadow-purple-500/25 border border-purple-300/50 flex items-center justify-center select-none">
              AI
            </div>
          </div>

          {/* Laptop Screen Frame */}
          <div className="w-44 sm:w-52 xl:w-56 h-28 sm:h-32 xl:h-36 bg-[#1E293B] rounded-t-2xl p-1.5 xl:p-2 shadow-2xl border-2 border-slate-700/80 relative overflow-hidden">
            {/* Camera dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mx-auto mb-1"></div>

            {/* Screen Inner Display */}
            <div className="w-full h-[calc(100%-8px)] bg-gradient-to-br from-[#F8FAFC] via-white to-[#EFF6FF] dark:from-slate-900 dark:to-slate-800 rounded-lg p-2 xl:p-2.5 flex flex-col justify-between border border-blue-100 dark:border-slate-800 shadow-inner">
              {/* Header Bar */}
              <div className="flex items-center justify-between pb-1.5 border-b border-blue-100 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="h-1.5 w-16 bg-blue-200/80 dark:bg-slate-700 rounded-full"></div>
              </div>

              {/* Main Display Mockup Content */}
              <div className="flex items-center gap-2 py-1">
                {/* Avatar Icon */}
                <div className="w-8 h-8 rounded-full bg-[#1769F5] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
                {/* Content Bars */}
                <div className="flex-1 space-y-1.5">
                  <div className="h-2 w-3/4 bg-[#1769F5] dark:bg-blue-400 rounded-full"></div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                  <div className="h-1.5 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>
              </div>

              {/* Bottom Cards row inside screen */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                <div className="h-5 bg-blue-500/10 border border-blue-200/60 rounded-md flex items-center px-1.5 gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1769F5]"></div>
                  <div className="h-1 w-8 bg-blue-400 rounded-full"></div>
                </div>
                <div className="h-5 bg-emerald-500/10 border border-emerald-200/60 rounded-md flex items-center px-1.5 gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div>
                  <div className="h-1 w-8 bg-emerald-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Laptop Base Keyboard Stand */}
          <div className="w-50 sm:w-58 xl:w-64 h-2 xl:h-2.5 bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-800 rounded-b-xl shadow-md relative flex justify-center">
            {/* Notch */}
            <div className="w-8 xl:w-10 h-0.5 xl:h-1 bg-slate-500/40 rounded-b-md"></div>
          </div>
        </div>

        {/* Right Potted Plant */}
        <div className="relative z-10 flex flex-col items-center mb-1 animate-float" style={{ animationDelay: "1s" }}>
          {/* Leaves */}
          <div className="relative -mb-1">
            <div className="w-3.5 h-7 xl:w-4 xl:h-8 bg-[#10B981] rounded-full rotate-[20deg] origin-bottom shadow-2xs" />
            <div className="w-3 h-5 xl:w-3.5 xl:h-6 bg-[#059669] rounded-full rotate-[-20deg] origin-bottom absolute bottom-0 -left-1 shadow-2xs" />
            <div className="w-3.5 h-6 xl:w-4 xl:h-7 bg-[#14B8A6] rounded-full rotate-[40deg] origin-bottom absolute bottom-0 left-1" />
          </div>
          {/* Blue Pot */}
          <div className="w-6 xl:w-7 h-7 xl:h-8 bg-gradient-to-b from-[#1769F5] to-[#3B82F6] rounded-b-lg rounded-t-xs shadow-md border-t border-blue-400" />
        </div>
      </div>
    </div>
  );
};
