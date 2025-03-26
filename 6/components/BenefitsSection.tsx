import React from "react";

export const BenefitsSection: React.FC = () => {
  return (
    <section className="flex flex-col items-start self-stretch py-12 pl-3.5 w-full max-sm:bg-blue-500">
      <h2 className="self-center text-3xl font-bold leading-9 text-white">
        This is What Lumiclean Disinfection Towers Can Do For You
      </h2>
      <div className="flex gap-2 mt-6 text-lg leading-6 text-white">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/bb341722258275f6223f5d3d838f112675e06123?placeholderIfAbsent=true"
          className="object-contain overflow-hidden shrink-0 self-start w-7 aspect-square"
          alt="Checkmark"
        />
        <p className="flex-auto">
          Targets dust mites, mold spores, bacteria, and other unseen biological
          threats.
        </p>
      </div>
      <div className="flex gap-2 mt-4">
        <div className="self-start">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/bb341722258275f6223f5d3d838f112675e06123?placeholderIfAbsent=true"
            className="object-contain overflow-hidden w-7 aspect-square"
            alt="Checkmark"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/bb341722258275f6223f5d3d838f112675e06123?placeholderIfAbsent=true"
            className="object-contain overflow-hidden mt-14 w-7 aspect-square"
            alt="Checkmark"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/bb341722258275f6223f5d3d838f112675e06123?placeholderIfAbsent=true"
            className="object-contain overflow-hidden mt-20 w-7 aspect-square"
            alt="Checkmark"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/bb341722258275f6223f5d3d838f112675e06123?placeholderIfAbsent=true"
            className="object-contain overflow-hidden mt-14 w-7 aspect-square"
            alt="Checkmark"
          />
        </div>
        <div className="flex flex-col grow shrink-0 text-lg leading-6 text-white basis-0 w-fit">
          <p className="self-start">
            Transforms your indoor air into a fresh, clean oasis that's a joy to
            breathe.
          </p>
          <p className="self-start mt-4">
            Removes foul odors caused by bacteria, cooking oils, tobacco smoke,
            and pets…making your house smell like...home.
          </p>
          <p className="mt-4">
            Makes your home safer by disinfecting surfaces and air at the same
            time.
          </p>
          <p className="mt-4">
            Helps decrease the risk of flu and transmission of diseases indoors,
            providing extra safety for your family.
          </p>
        </div>
      </div>
      <img
        src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/38f51fa73fbef27ebcd4e691ff574abe1e741874?placeholderIfAbsent=true"
        className="object-contain overflow-hidden mt-14 ml-3 w-full aspect-square"
        alt="LumiClean device"
      />
    </section>
  );
};
