import React from "react";

export const IntroductionSection: React.FC = () => {
  return (
    <section className="flex flex-col items-center self-stretch">
      <div className="flex gap-1.5 items-center px-3 py-1.5 mt-10 text-base font-semibold tracking-wider text-center text-black uppercase bg-white rounded-[50px] shadow-[0px_0px_25px_rgba(0,43,91,0.05)]">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/38976e0e8e962941942135f37207d4f47407620f?placeholderIfAbsent=true"
          className="object-contain overflow-hidden shrink-0 self-stretch my-auto w-6 aspect-square"
          alt="LumiClean icon"
        />
        <span className="self-stretch my-auto">Introducing lumiclean</span>
      </div>
      <h2 className="mt-3 text-3xl font-bold tracking-tight leading-9 text-center text-sky-700">
        Hospital-like Disinfection, Reimagined for Your Home.
      </h2>
      <p className="mt-2 text-lg leading-6 text-center text-neutral-800">
        <span style={{ color: "rgba(34,38,39,1)" }}>
          Imagine a device that goes beyond surface cleaning, reaching every
          corner of your room – sanitizing not just surfaces, but the very air
          you breathe.
        </span>
        <br />
        <span style={{ color: "rgba(34,38,39,1)" }}>
          LUMICLEAN harnesses the proven technology of
        </span>
        <span style={{ fontWeight: 700, color: "rgba(34,38,39,1)" }}>
          hospital-like UV-C light and natural ozone
        </span>
        <span style={{ color: "rgba(34,38,39,1)" }}>
          to deliver a level of cleanliness you simply can't achieve with
          conventional methods. It's the same technology trusted in operating
          rooms and laboratories, now designed for safe and easy use in your
          home.
        </span>
        <br />
        <span style={{ color: "rgba(34,38,39,1)" }}>
          With just the push of a button, LUMICLEAN floods your room with
          germ-killing power, eliminating 99.9% of bacteria, viruses, mold
          spores, and dust mites. It's hands-free, chemical-free, and incredibly
          effective.{" "}
        </span>
      </p>
      <div className="flex gap-5 justify-between items-start mt-16 w-full text-base font-medium leading-5 text-center max-w-[345px] text-neutral-800">
        <div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/f52aa0fc35eb4002f85690689d035b317e47e22c?placeholderIfAbsent=true"
            className="object-contain overflow-hidden w-20 aspect-square"
            alt="Dual technology"
          />
          <p className="mt-3"> Dual UV-C + Ozone Technology </p>
        </div>
        <div className="self-stretch">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/4b4a4381e200ad5e9526f7c89f7c7255dddc9f7a?placeholderIfAbsent=true"
            className="object-contain overflow-hidden w-20 aspect-square"
            alt="Targets germs"
          />
          <p className="mt-3"> Targets Germs, Viruses & particles </p>
        </div>
        <div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/a3344f4d1215d9e95c842dcb3c3ce5806762de3d?placeholderIfAbsent=true"
            className="object-contain overflow-hidden w-20 aspect-square"
            alt="Disinfects air"
          />
          <p className="mt-3"> Disinfects both air and surfaces </p>
        </div>
      </div>
      <div className="flex gap-5 justify-between items-start mt-8 w-full text-base font-medium leading-5 text-center max-w-[348px] text-neutral-800">
        <div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/cba2e4c0fc81517f231cf3491503a59150c7c4ea?placeholderIfAbsent=true"
            className="object-contain overflow-hidden w-20 aspect-square"
            alt="Chemical-free"
          />
          <p className="mt-3"> Chemical-Free & Eco-Friendly </p>
        </div>
        <div className="flex flex-col self-stretch">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/d34562f5a1a0e49b10dbf871c7f5a37bc54e5564?placeholderIfAbsent=true"
            className="object-contain overflow-hidden self-center w-20 aspect-square"
            alt="Targets allergens"
          />
          <p className="mt-3">
            {" "}
            Targets allergens like dust mite & MOLD spores{" "}
          </p>
        </div>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/af1f36ec1321d2118ccc0761f792e19461837759?placeholderIfAbsent=true"
          className="object-contain overflow-hidden shrink-0 max-w-full aspect-square w-[110px]"
          alt="Additional feature"
        />
      </div>
    </section>
  );
};
