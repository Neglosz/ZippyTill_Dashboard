import React from "react";

export const PageHeader = ({
  title,
  description,
  icon: Icon,
  color = "primary",
  children,
}) => {
  return (
    <div className="bg-white rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-premium relative overflow-hidden border border-gray-100 group mb-8">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-white opacity-90 z-20"></div>
      <div className="flex items-center gap-6">
        <div
          className={`w-20 h-20 bg-${color}/10 rounded-[24px] flex items-center justify-center border border-${color}/20 shrink-0 shadow-sm group-hover:rotate-6 transition-transform duration-500`}
        >
          <Icon className={`w-10 h-10 text-${color}`} strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter mb-1 text-gray-900 leading-tight">
            {title}
            <span className={`text-${color}`}>.</span>
          </h1>
          <p className="text-sm font-medium text-inactive">{description}</p>
        </div>
      </div>
      {children && <div className="flex-shrink-0 mt-4 md:mt-0">{children}</div>}
    </div>
  );
};

export const PageBackground = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
    <div className="absolute top-[20%] right-[-10%] w-[45%] h-[45%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
    <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] bg-primary/5 rounded-full blur-[100px]" />
  </div>
);
