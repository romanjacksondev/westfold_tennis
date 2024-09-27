import React from "react";

interface TennisBallLoaderProps {
  size?: "small" | "medium" | "large";
  color?: string;
}

export default function LoadingComponent({
  size = "medium",
  color = "#acdf77",
}: TennisBallLoaderProps = {}) {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-16 h-16",
    large: "w-24 h-24",
  };

  const ballSize = sizeClasses[size];
  const shadowSize = {
    small: "w-6 h-1.5",
    medium: "w-12 h-3",
    large: "w-20 h-4",
  }[size];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
      <div className="relative">
        <div
          className={`${ballSize} rounded-full border-2 border-white shadow-md animate-bounce`}
          style={{
            backgroundColor: color,
            animation: "bounce 0.6s infinite",
          }}
        >
          <div className="absolute top-1/2 left-1/2 w-[87.5%] h-[43.75%] border-2 border-white rounded-[100%/50%] transform -translate-x-1/2 -translate-y-1/2 rotate-[30deg]"></div>
        </div>
        <div
          className={`absolute bottom-0 left-1/2 ${shadowSize} bg-black/20 rounded-full transform -translate-x-1/2 animate-squish`}
          style={{
            animation: "squish 0.6s infinite",
          }}
        ></div>
      </div>
      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        @keyframes squish {
          0%,
          100% {
            transform: translateX(-50%) scale(1, 1);
          }
          50% {
            transform: translateX(-50%) scale(1.2, 0.8);
          }
        }
      `}</style>
    </div>
  );
}
