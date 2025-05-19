import React from "react";

export const ProblemSection: React.FC = () => {
  return (
    <section className="flex flex-col items-center self-stretch pb-10 w-full bg-slate-50">
      <div className="flex overflow-hidden relative flex-col justify-center items-center self-stretch px-20 py-36 w-full aspect-square">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/0978c41d8369b0ace1c381834fb7ff5d8db6baaf?placeholderIfAbsent=true"
          className="object-cover absolute inset-0 size-full"
          alt="Background"
        />
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/278c988d88bc76e084da0c69e4335748a7d51870?placeholderIfAbsent=true"
          className="object-contain overflow-hidden mb-0 max-w-full aspect-square w-[100px]"
          alt="Warning icon"
        />
      </div>
      <h2 className="mt-6 text-3xl font-bold leading-9 text-center text-sky-700">
        Ordinary Cleaning Isn't Cutting It ?
      </h2>
      <p className="mt-2 text-lg leading-6 text-center text-neutral-800">
        <span style={{ color: "rgba(34,38,39,1)" }}>
          You meticulously wipe down surfaces. You vacuum religiously. But deep
          down, a nagging worry persists:
        </span>
        <span style={{ fontWeight: 700, color: "rgba(34,38,39,1)" }}>
          is it really clean enough?
        </span>
        <br />
        <span style={{ fontWeight: 700, color: "rgba(34,38,39,1)" }}>
          The truth is
        </span>
        <span style={{ fontWeight: 700, color: "rgba(34,38,39,1)" }}>,</span>
        <span style={{ color: "rgba(34,38,39,1)" }}>
          standard cleaning methods often fall short. Wipes and sprays only
          sanitize where they touch, missing hidden crevices, fabrics, and even
          the air you breathe. Microscopic germs and bacteria can linger,
          silently impacting your peace of mind.
        </span>
        <br />
        <span style={{ fontWeight: 700, color: "rgba(34,38,39,1)" }}>
          Think about it:
        </span>
        <span style={{ color: "rgba(34,38,39,1)" }}>
          Dust mites thrive in mattresses, bacteria cling to countertops, and
          odor sticks into walls, furniture and trash cans.
        </span>
      </p>
      <button className="px-16 py-1.5 mt-6 w-full text-base font-bold leading-5 text-center text-white uppercase bg-red-700 max-w-[358px] rounded-[100px]">
        Deep clean my house from unseen threats
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
        src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/c557b2b68d49bf7010e02d59af06a7444a82951b?placeholderIfAbsent=true"
        className="object-contain overflow-hidden self-stretch mt-10 w-full aspect-square"
        alt="LumiClean product"
      />
    </section>
  );
};
