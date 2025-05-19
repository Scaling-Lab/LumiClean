"use client";
import React, { useState } from "react";

export const FaqSection: React.FC = () => {
  const [toggleFaq, setToggleFaq] = useState<string | null>(null);

  const toggleQuestion = (questionId: string) => {
    setToggleFaq(toggleFaq === questionId ? null : questionId);
  };

  return (
    <section className="mt-20">
      <h2 className="text-3xl font-bold leading-9 text-center text-white">
        Frequently Asked Questions
      </h2>
      <div className="px-4 py-5 mt-8 w-full text-lg font-semibold text-black bg-white rounded-2xl max-w-[358px] shadow-[0px_0px_20px_rgba(52,150,214,0.1)]">
        {/* Question 1 */}
        <div>
          <div className="flex gap-5 tracking-wider leading-6">
            <button
              className="flex-auto cursor-pointer w-[276px] text-left"
              onClick={() => toggleQuestion("isScamOpen")}
            >
              Is this a scam? Do you have any evidence it works?
            </button>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/3c557652e0a341c6f1d78e6229899d40348e8efd?placeholderIfAbsent=true"
              className="object-contain overflow-hidden shrink-0 my-auto w-6 aspect-square"
              alt="Toggle arrow"
            />
          </div>
          {toggleFaq === "isScamOpen" && (
            <p className="mt-3 text-base">
              <span>
                UVC disinfection is not a scam. Many scientific studies,
                including CDC and EPA studies, prove that UVC light kills almost
                all biological pollutants and germs.
              </span>
              <br />
              <span>
                For example, a study published in the Asian Pacific Journal of
                Tropical Biomedicine named &quot;Effect of germicidal UV-C
                light(254 nm) on eggs and adult of house dust mites,
                Dermatophagoides pteronyssinus and Dermatophagoides
                farinae&quot; showed the efficacy of UVC on killing dust mites
                and their eggs.
              </span>
              <br />
              <span>
                The EPA also states that &quot;UV lamps may destroy indoor
                biological pollutants such as viruses, bacteria, and
                molds.&quot;
              </span>
              <br />
              <span>
                In addition to UVC, countless research suggests that Ozone
                fumigation applied at appropriate concentrations could
                effectively control several disturbing organisms like dust
                mites, bacteria, viruses, pests, etc.
              </span>
              <br />
              <span>
                UVO254™ lamps combine both UVC and Ozone for maximum
                effectiveness.
              </span>
            </p>
          )}
        </div>
        <hr className="shrink-0 mt-4 h-px border border-solid border-stone-300" />

        {/* Question 2 */}
        <div>
          <div className="flex gap-4 mt-4 tracking-wider leading-6">
            <div
              className="flex justify-between items-center w-full cursor-pointer"
              onClick={() => toggleQuestion("isLampSafeOpen")}
            >
              <button className="flex-auto w-[280px] text-left">
                Is LumiClean UVO254™ Lamp Safe?
              </button>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/d094ed853ab26fe773343efdf0b5487e04bc867d?placeholderIfAbsent=true"
                className="object-contain overflow-hidden shrink-0 my-auto w-6 transition-transform aspect-square duration-[0.3s] ease-[ease]"
                style={{
                  transform:
                    toggleFaq === "isLampSafeOpen"
                      ? "rotate(90deg)"
                      : "rotate(0deg)",
                }}
                alt="Toggle arrow"
              />
            </div>
          </div>
          {toggleFaq === "isLampSafeOpen" && (
            <div className="pb-3 mt-3 text-base leading-normal text-neutral-800">
              <span>
                Yes, LumiClean UVO254™ Lamp is completely safe when used as
                directed. The device comes with multiple built-in safety
                features:
              </span>
              <ul className="pl-5 mt-2">
                <li>
                  Motion sensors that automatically shut off if movement is
                  detected
                </li>
                <li>
                  Timer-based operation that turns off automatically after the
                  disinfection cycle
                </li>
                <li>
                  Remote control operation so you can activate it from a safe
                  distance
                </li>
                <li>
                  Clear warning indicators when the device is in operation
                </li>
              </ul>
              <p className="mt-2">
                However, like all UV-C devices, direct exposure should be
                avoided. Always follow the safety guidelines:
              </p>
              <ul className="pl-5 mt-2">
                <li>Never look directly at the UV light</li>
                <li>Leave the room during operation</li>
                <li>Keep pets out of the room during use</li>
                <li>Wait for the cycle to complete before re-entering</li>
              </ul>
            </div>
          )}
        </div>
        <hr className="shrink-0 mt-4 h-px border border-solid border-stone-300" />

        {/* Question 3 */}
        <div className="flex gap-4 mt-4 tracking-wider leading-6">
          <button className="flex-auto w-[280px] text-left">
            How is the UVO254™ Lamp different from traditional UVC lamps or
            Ozone generators?
          </button>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/d094ed853ab26fe773343efdf0b5487e04bc867d?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 my-auto w-6 aspect-square"
            alt="Toggle arrow"
          />
        </div>
        <hr className="shrink-0 mt-4 h-px border border-solid border-stone-300" />

        {/* Question 4 */}
        <div className="flex gap-5 justify-between mt-4 tracking-wider leading-tight">
          <button className="text-left">Does it work on mold?</button>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/d094ed853ab26fe773343efdf0b5487e04bc867d?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 w-6 aspect-square"
            alt="Toggle arrow"
          />
        </div>
        <hr className="shrink-0 mt-4 h-px border border-solid border-stone-300" />

        {/* Question 5 */}
        <div className="flex gap-4 mt-4 tracking-wider leading-6">
          <button className="flex-auto w-[280px] text-left">
            What happens to allergens and germs after being broken down?
          </button>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/d094ed853ab26fe773343efdf0b5487e04bc867d?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 my-auto w-6 aspect-square"
            alt="Toggle arrow"
          />
        </div>
        <hr className="shrink-0 mt-4 h-px border border-solid border-stone-300" />

        {/* Question 6 */}
        <div className="flex gap-4 mt-4 tracking-wider leading-6">
          <button className="flex-auto w-[280px] text-left">
            How long does the bulb last? What if I need a new bulb?
          </button>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/d094ed853ab26fe773343efdf0b5487e04bc867d?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 my-auto w-6 aspect-square"
            alt="Toggle arrow"
          />
        </div>
        <hr className="shrink-0 mt-4 h-px border border-solid border-stone-300" />

        {/* Question 7 */}
        <div className="flex gap-5 justify-between mt-4 tracking-wider leading-6">
          <button className="w-[285px] text-left">
            Does the UV light lose potency over time?
          </button>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/d094ed853ab26fe773343efdf0b5487e04bc867d?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 my-auto w-6 aspect-square"
            alt="Toggle arrow"
          />
        </div>
        <hr className="shrink-0 mt-4 h-px border border-solid border-stone-300" />

        {/* Question 8 */}
        <div className="flex gap-4 mt-4 tracking-wider leading-6">
          <button className="flex-auto w-[280px] text-left">
            Can I use LumiClean to sterilize my phone or other personal items?
          </button>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/d094ed853ab26fe773343efdf0b5487e04bc867d?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 my-auto w-6 aspect-square"
            alt="Toggle arrow"
          />
        </div>
      </div>
    </section>
  );
};
