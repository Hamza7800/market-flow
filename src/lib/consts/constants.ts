export const animationStyles = {
  backdrop: [
    "data-[entering]:duration-500",
    "data-[entering]:ease-[cubic-bezier(0.25,1,0.5,1)]",
    "data-[exiting]:duration-200",
    "data-[exiting]:ease-[cubic-bezier(0.5,0,0.75,0)]",
  ].join(" "),
  container: [
    "data-[entering]:animate-in",
    "data-[entering]:fade-in-0",
    "data-[entering]:slide-in-from-bottom-4",
    "data-[entering]:duration-500",
    "data-[entering]:ease-[cubic-bezier(0.25,1,0.5,1)]",
    "data-[exiting]:animate-out",
    "data-[exiting]:fade-out-0",
    "data-[exiting]:slide-out-to-bottom-2",
    "data-[exiting]:duration-200",
    "data-[exiting]:ease-[cubic-bezier(0.5,0,0.75,0)]",
  ].join(" "),
};

export const defaultImage = "https://picsum.photos/seed/candle1/800/800";
