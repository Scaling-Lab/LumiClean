import React from "react";

export const ComparisonSection: React.FC = () => {
  return (
    <section className="flex flex-col items-start self-stretch pl-4 mt-10 w-full text-lg font-medium text-black">
      <h2 className="self-center text-4xl font-extrabold leading-10 text-center text-sky-700">
        <span
          style={{ fontWeight: 600, fontSize: 20, color: "rgba(23,115,176,1)" }}
        >
          What Makes LumiClean
        </span>
        <br />
        <span style={{ fontSize: 28, color: "rgba(23,115,176,1)" }}>
          Far Superior to Others
        </span>
      </h2>
      <div className="flex gap-2 self-stretch mt-10 text-sm leading-4 text-center">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/b73e11b8-e2a4-4078-8529-b52fc56dfd49?placeholderIfAbsent=true"
          className="object-contain overflow-hidden w-full rounded-xl aspect-square"
          alt="LumiClean comparison"
        />
        <div className="flex flex-col px-2.5 py-8 bg-blue-50 rounded-xl">
          <p>Other UVC towers</p>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/e0135b02cb0c9dfe8d6dce2b0bd059132513359b?placeholderIfAbsent=true"
            className="object-contain overflow-hidden self-center mt-9 w-8 aspect-square"
            alt="Comparison icon"
          />
        </div>
        <div className="flex shrink-0 bg-blue-50 rounded-xl h-[819px] w-[13px]" />
      </div>
      <div className="flex gap-3 mt-10 leading-tight bg-blue-50 rounded-2xl">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/736ab4d866f9861a325ec6a3834b6223dca06acd?placeholderIfAbsent=true"
          className="object-contain overflow-hidden shrink-0 rounded-none aspect-square w-[72px]"
          alt="Happy customers"
        />
        <p className="flex-auto my-auto">1000K+ Happy Customers</p>
      </div>
      <div className="flex gap-3 mt-3 leading-tight bg-blue-50 rounded-2xl">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/59df476a751acde383a57a9441833acbbf6ee0f0?placeholderIfAbsent=true"
          className="object-contain overflow-hidden shrink-0 rounded-none aspect-square w-[72px]"
          alt="Hospital technology"
        />
        <p className="flex-auto my-auto">Hospital-like Technology</p>
      </div>
      <div className="flex gap-3 mt-3 leading-6 bg-blue-50 rounded-2xl">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/6daaa63aa0d28c6c2225f0463b96e9f5495fdf9c?placeholderIfAbsent=true"
          className="object-contain overflow-hidden shrink-0 rounded-none aspect-square w-[72px]"
          alt="Money-back guarantee"
        />
        <p className="flex-auto my-auto">60-Day Money-Back Guarantee</p>
      </div>
    </section>
  );
};
