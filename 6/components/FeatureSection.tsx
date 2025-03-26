"use client";
import React, { useState } from "react";
import { FeatureToggles } from "./types";

export const FeatureSection: React.FC = () => {
  const [features, setFeatures] = useState<FeatureToggles>({
    chemicalFree: true,
    disinfectsAir: false,
    notOnlyHome: false,
    safetyFeature: false,
    suitable: false,
  });

  function toggleFeature(feature: keyof FeatureToggles) {
    setFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  }

  return (
    <section className="flex flex-col self-stretch px-4 py-10 w-full bg-slate-50 text-zinc-700">
      <h2 className="self-center text-3xl font-bold leading-9 text-center text-black">
        <span style={{ color: "rgba(24,144,213,1)" }}>Features</span>
        <span>of LumiClean's disinfection towers</span>
      </h2>

      {/* Chemical-Free Feature */}
      <div
        className="px-5 pt-5 mt-6 w-full rounded-3xl transition-all cursor-pointer duration-[0.3s] ease-[ease] shadow-[0px_0px_25px_rgba(52,150,214,0.08)]"
        onClick={() => toggleFeature("chemicalFree")}
        style={{
          backgroundColor: features.chemicalFree
            ? "rgba(24, 144, 213, 1)"
            : "rgba(255, 255, 255, 1)",
          color: features.chemicalFree
            ? "rgba(255, 255, 255, 1)"
            : "rgba(0, 0, 0, 1)",
          paddingBottom: features.chemicalFree ? "20px" : "20px",
        }}
      >
        <div className="flex gap-10 text-lg font-semibold">
          <h3 className="flex-auto w-[246px]">Chemical-Free Disinfection</h3>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/c40a060385e0111430f1fff36c3612774e2adfa9?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 transition-transform aspect-square duration-[0.3s] ease-[ease] w-[27px]"
            style={{
              transform: features.chemicalFree
                ? "rotate(90deg)"
                : "rotate(0deg)",
            }}
            alt="Toggle arrow"
          />
        </div>
        <p className="mt-2 text-base leading-6">
          Unlike sprays, and chemical disinfectants, the UVO254™ Lamp is
          chemical-free. Our bodies are already exposed to tons of toxins. By
          using LumiClean's Lamp, you minimize the use of chemical cleaning
          products and thus, reduce the toxic burden on your body. The UVO254™
          Lamp is great for surfaces, the environment, your time, and your
          wallet.
        </p>
      </div>

      {/* Disinfects Air Feature */}
      <div
        className="flex gap-5 justify-between px-5 pt-5 mt-2 text-lg font-semibold leading-6 rounded-2xl transition-all cursor-pointer duration-[0.3s] ease-[ease] shadow-[0px_0px_25px_rgba(52,150,214,0.08)]"
        onClick={() => toggleFeature("disinfectsAir")}
        style={{
          backgroundColor: features.disinfectsAir
            ? "rgba(24, 144, 213, 1)"
            : "rgba(255, 255, 255, 1)",
          color: features.disinfectsAir
            ? "rgba(255, 255, 255, 1)"
            : "rgba(0, 0, 0, 1)",
          paddingBottom: "20px",
        }}
      >
        <h3 className="w-[269px]">Disinfects The Air And The Surfaces</h3>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/db0a7b4b8d24f10fa22aef60157db8a0d7a5e4d9?placeholderIfAbsent=true"
          className="object-contain overflow-hidden shrink-0 my-auto aspect-square w-[27px]"
          alt="Toggle arrow"
        />
      </div>

      {/* Not Only For Home Feature */}
      <div className="flex gap-5 justify-between p-5 mt-2 text-lg font-semibold leading-tight bg-white rounded-2xl shadow-[0px_0px_25px_rgba(52,150,214,0.08)]">
        <h3 className="my-auto">Not Only For Your Home</h3>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/db0a7b4b8d24f10fa22aef60157db8a0d7a5e4d9?placeholderIfAbsent=true"
          className="object-contain overflow-hidden shrink-0 aspect-square w-[27px]"
          alt="Toggle arrow"
        />
      </div>

      {/* Safety Feature */}
      <div
        className="mt-2 text-lg font-semibold leading-tight rounded-2xl transition-all cursor-pointer duration-[0.3s] ease-[ease] shadow-[0px_0px_25px_rgba(52,150,214,0.08)]"
        onClick={() => toggleFeature("safetyFeature")}
        style={{
          backgroundColor: "rgba(255, 255, 255, 1)",
          paddingLeft: "20px",
          paddingRight: "20px",
          paddingTop: "20px",
          paddingBottom: features.safetyFeature ? "0" : "20px",
        }}
      >
        <div className="flex justify-between items-center w-full">
          <h3>Built-in Safety Feature</h3>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/db0a7b4b8d24f10fa22aef60157db8a0d7a5e4d9?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 transition-transform aspect-square duration-[0.3s] ease-[ease] w-[27px]"
            style={{
              transform: features.safetyFeature
                ? "rotate(90deg)"
                : "rotate(0deg)",
            }}
            alt="Toggle arrow"
          />
        </div>
        {features.safetyFeature && (
          <div className="pb-5 mt-3 text-base leading-normal">
            <span>
              LumiClean comes with multiple built-in safety features to ensure
              safe operation:
            </span>
            <ul className="pl-5 mt-2">
              <li>Motion sensors for automatic shutdown</li>
              <li>Timer-based operation</li>
              <li>Remote control functionality</li>
              <li>Warning indicators</li>
              <li>Child-safety lock</li>
            </ul>
          </div>
        )}
      </div>

      {/* Suitable Feature */}
      <div className="flex gap-10 p-5 mt-2 text-lg font-semibold leading-tight bg-white rounded-2xl shadow-[0px_0px_25px_rgba(52,150,214,0.08)]">
        <h3 className="grow shrink my-auto w-[228px]">
          Suitable For 100-250 Sq Ft
        </h3>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/db0a7b4b8d24f10fa22aef60157db8a0d7a5e4d9?placeholderIfAbsent=true"
          className="object-contain overflow-hidden shrink-0 aspect-square w-[27px]"
          alt="Toggle arrow"
        />
      </div>

      <img
        src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/7724696de091961d05031a94f364c5104fb3f376?placeholderIfAbsent=true"
        className="object-contain overflow-hidden self-center mt-10 max-w-full aspect-square w-[213px]"
        alt="LumiClean device"
      />
    </section>
  );
};
