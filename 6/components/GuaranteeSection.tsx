import React from "react";

export const GuaranteeSection: React.FC = () => {
  return (
    <section className="flex flex-col items-center">
      <h2 className="mt-10 text-3xl font-bold tracking-wider leading-9 text-center text-black uppercase">
        Real Results or Money Back Guarantee
      </h2>
      <p className="flex z-10 flex-col justify-center px-5 py-4 mt-4 w-full text-lg tracking-wider leading-6 text-center text-black rounded-2xl bg-slate-100 max-w-[358px]">
        <span style={{ fontWeight: 800, color: "rgba(23,115,176,1)" }}>
          Try the LumiClean Towers
        </span>
        <span>
          for 60 days. If you dont feel a difference in your air, or for any
          given reason you don't like it..return it for a full refund—no
          questions asked.
        </span>
      </p>
      <img
        src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/75e6df564a411e1dc8041f18e41333b09d0499e6?placeholderIfAbsent=true"
        className="object-contain overflow-hidden self-stretch w-full aspect-square"
        alt="Money back guarantee"
      />
    </section>
  );
};
