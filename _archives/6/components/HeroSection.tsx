import React from "react";

export const HeroSection: React.FC = () => {
  return (
    <>
      <img
        src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/734e0754ab249254dad708f2cc71512e001cca9b?placeholderIfAbsent=true"
        className="object-contain overflow-hidden self-stretch w-full aspect-square"
        alt="LumiClean device"
      />
      <section className="flex flex-col items-center self-stretch px-4 py-10 w-full">
        <span className="gap-1.5 self-stretch px-4 py-2 text-sm font-medium tracking-wider text-center text-black bg-white rounded-[50px] shadow-[0px_0px_25px_rgba(0,43,91,0.05)]">
          20,000+ Home Disinfected!
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-wide leading-9 text-center text-sky-950">
          <span>Are You Really Living in</span>
          <br />
          <span>a Clean Home? (Or Just Hoping For The Best?)</span>
        </h1>
        <p className="mt-2 text-lg leading-6 text-center text-zinc-900">
          Stop Second-Guessing Your Cleaning. Finally Achieve True Sanitization
          – With a Push Of A Button.
        </p>
        <div className="flex gap-3 self-start px-4 py-3 mt-6 text-base tracking-normal leading-none bg-white rounded-xl shadow-[0px_0px_5px_rgba(0,0,0,0.05)] text-zinc-700">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/2251fc5dbc6967a7777b733b0e6848dd14b0dd0f?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 w-7 aspect-square"
            alt="Targets icon"
          />
          <span className="flex-auto my-auto">Targets Germs & Bacteria</span>
        </div>
        <div className="flex gap-3 self-start px-4 py-3 mt-2 text-base tracking-normal leading-none bg-white rounded-xl shadow-[0px_0px_5px_rgba(0,0,0,0.05)] text-zinc-700">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/32f00e805b3b942ff488d9e203983a1ffc9b074f?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 w-7 aspect-square"
            alt="UV-C icon"
          />
          <span className="flex-auto my-auto">UV-C + Ozone Technology</span>
        </div>
        <div className="flex gap-3 self-start px-4 py-3 mt-2 text-base tracking-normal leading-none bg-white rounded-xl shadow-[0px_0px_5px_rgba(0,0,0,0.05)] text-zinc-700">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/19c2e6839dd4eba030ee994020365d461d898d8a?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 w-7 aspect-square"
            alt="Disinfection icon"
          />
          <span className="flex-auto my-auto">Whole-Room Disinfection</span>
        </div>
        <button className="self-start px-16 py-3.5 mt-6 text-base font-bold leading-tight text-center text-white uppercase bg-red-700 rounded-[100px]">
          Yes i want a clean home
        </button>
        <div className="flex gap-1.5 items-center px-3 py-1.5 mt-2 bg-white rounded-[50px] shadow-[0px_0px_25px_rgba(0,43,91,0.05)]">
          <div className="flex overflow-hidden relative flex-col self-stretch my-auto aspect-square w-[21px]">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/cb3ad5940bad93815e440f2e18a0b10426a9b19f?placeholderIfAbsent=true"
              className="object-cover absolute inset-0 size-full"
              alt="Guarantee background"
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/c79e426272fdae8203872a7776e75f793cd0e19d?placeholderIfAbsent=true"
              className="object-contain overflow-hidden w-full aspect-square"
              alt="Guarantee icon"
            />
          </div>
          <span className="self-stretch my-auto text-sm font-medium tracking-wider text-center text-black">
            60-DAY MONEY BACK GUARANTEE
          </span>
        </div>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/d5245bcffa89e2001843b417dc6d45686dffd254?placeholderIfAbsent=true"
          className="object-contain overflow-hidden mt-10 w-full aspect-square"
          alt="LumiClean product"
        />
      </section>
    </>
  );
};
