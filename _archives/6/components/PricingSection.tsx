import React from "react";

export const PricingSection: React.FC = () => {
  return (
    <section className="flex flex-col self-stretch px-4 py-10 mt-10 w-full bg-indigo-50">
      <h2 className="self-center text-3xl font-extrabold leading-9 text-center text-sky-700">
        Get a Free Gift With Your Order Today!
      </h2>
      <p className="self-center mt-2 text-base leading-5 text-center text-black">
        Hurry! This special offer is only available while supplies last!
      </p>

      {/* Single Device Option */}
      <article className="flex flex-col pt-20 pb-5 mt-6 font-bold leading-tight bg-white rounded-xl shadow-[0px_0px_20px_rgba(52,150,214,0.1)]">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/aa1dd0b8cb0cbb9878d86d0cfe2eeaff13b98d89?placeholderIfAbsent=true"
          className="object-contain overflow-hidden self-center max-w-full aspect-square w-[127px]"
          alt="Single LumiClean device"
        />
        <div className="flex flex-col px-4 mt-16 w-full">
          <h3 className="self-start text-xl text-black">
            1x LuminClean Device
          </h3>
          <hr className="shrink-0 mt-4 h-px border border-solid border-zinc-300" />
          <div className="flex gap-2 self-start mt-4 whitespace-nowrap">
            <span className="grow text-2xl line-through text-neutral-400">
              $99.99
            </span>
            <span className="text-2xl text-black">$79.95</span>
          </div>
          <button className="px-16 py-4 mt-5 text-lg text-center text-white bg-red-700 rounded-[100px]">
            Add to cart
          </button>
          <div className="flex gap-2 px-3 py-2 mt-2 text-sm font-medium text-center text-black bg-amber-100 rounded-xl">
            <div className="flex shrink-0 my-auto w-2 h-2 bg-green-600 rounded-full" />
            <p className="flex-auto w-[284px]">Ships Tomorrow, March 1</p>
          </div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/c74336a231f6da4fd372f137ed103e331dd57d1d?placeholderIfAbsent=true"
            className="object-contain overflow-hidden mt-2 aspect-square w-[326px]"
            alt="Payment methods"
          />
        </div>
      </article>

      {/* Most Popular Option */}
      <article className="pb-5 mt-6 bg-white rounded-xl shadow-[0px_0px_20px_rgba(52,150,214,0.1)]">
        <div className="px-16 py-2.5 text-lg font-bold leading-tight text-center text-white uppercase bg-red-500 rounded-xl">
          Most Popular
        </div>
        <div className="flex flex-col px-4 mt-16 w-full">
          <div className="flex gap-1 self-center max-w-full w-[258px]">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/a98536e44120bea7cced83e6f7e77ea5622e971e?placeholderIfAbsent=true"
              className="object-contain overflow-hidden shrink-0 max-w-full aspect-square w-[127px]"
              alt="LumiClean device 1"
            />
            <img
              src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/f016ecef4af73f03f2ac79d9a3c60a84694e527c?placeholderIfAbsent=true"
              className="object-contain overflow-hidden shrink-0 w-32 max-w-full aspect-square"
              alt="LumiClean device 2"
            />
          </div>
          <h3 className="self-start mt-10 text-xl font-bold leading-tight text-black">
            2x LuminClean Device
          </h3>
          <hr className="shrink-0 mt-4 h-px border border-solid border-zinc-300" />
          <div className="flex gap-2 self-start mt-4 font-bold leading-tight whitespace-nowrap">
            <span className="grow text-2xl line-through text-neutral-400">
              $199.98
            </span>
            <span className="text-2xl text-black">$139.90</span>
          </div>
          <button className="px-16 py-4 mt-5 text-lg font-bold leading-tight text-center text-white bg-red-700 rounded-[100px]">
            Add to cart
          </button>
          <div className="flex gap-2 px-3 py-2 mt-2 text-sm font-medium leading-tight text-center text-black bg-amber-100 rounded-xl">
            <div className="flex shrink-0 my-auto w-2 h-2 bg-green-600 rounded-full" />
            <p className="flex-auto w-[284px]">Ships Tomorrow, March 1</p>
          </div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/c74336a231f6da4fd372f137ed103e331dd57d1d?placeholderIfAbsent=true"
            className="object-contain overflow-hidden mt-2 aspect-square w-[326px]"
            alt="Payment methods"
          />
        </div>
      </article>

      {/* Best Value Option */}
      <article className="pb-5 mt-6 font-bold leading-tight bg-white rounded-xl shadow-[0px_0px_20px_rgba(52,150,214,0.1)]">
        <div className="px-16 py-2.5 text-lg text-center text-white uppercase bg-red-500 rounded-xl">
          Best value
        </div>
        <div className="flex flex-col px-4 mt-14 w-full">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/86c9dbab764100c0ae5c55422a35c0c59d7bd50e?placeholderIfAbsent=true"
            className="object-contain overflow-hidden self-center max-w-full aspect-square w-[244px]"
            alt="Three LumiClean devices"
          />
          <h3 className="self-start mt-12 text-xl text-black">
            3x LuminClean Device
          </h3>
          <hr className="shrink-0 mt-4 h-px border border-solid border-zinc-300" />
          <div className="flex gap-2 self-start mt-4 whitespace-nowrap">
            <span className="grow text-2xl line-through text-neutral-400">
              $299.97
            </span>
            <span className="text-2xl text-black">$194.70</span>
          </div>
          <button className="px-16 py-4 mt-5 text-lg text-center text-white bg-red-700 rounded-[100px]">
            Add to cart
          </button>
          <div className="flex gap-2 px-3 py-2 mt-2 text-sm font-medium text-center text-black bg-amber-100 rounded-xl">
            <div className="flex shrink-0 my-auto w-2 h-2 bg-green-600 rounded-full" />
            <p className="flex-auto w-[284px]">Ships Tomorrow, March 1</p>
          </div>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/c74336a231f6da4fd372f137ed103e331dd57d1d?placeholderIfAbsent=true"
            className="object-contain overflow-hidden mt-2 aspect-square w-[326px]"
            alt="Payment methods"
          />
        </div>
      </article>
    </section>
  );
};
