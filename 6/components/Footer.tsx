import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="self-stretch pt-12 pb-8 mt-10 w-full bg-zinc-900">
      <div className="flex flex-col items-start pr-20 pl-4 w-full">
        <h3 className="text-base font-semibold tracking-normal leading-none text-white">
          Company
        </h3>
        <a href="#" className="mt-4 text-sm leading-none text-white">
          About Us
        </a>
        <a href="#" className="mt-5 text-sm leading-none text-white">
          Track Your Order
        </a>
        <a href="#" className="mt-5 text-sm leading-none text-white">
          Contact Us
        </a>
        <a href="#" className="mt-4 text-sm leading-none text-white">
          Become an Affiliate
        </a>

        <h3 className="mt-10 text-base font-semibold tracking-normal leading-none text-white">
          Support
        </h3>
        <a href="#" className="mt-5 text-sm leading-none text-white">
          Get Help
        </a>

        <h3 className="mt-9 text-base font-semibold tracking-normal leading-none text-white">
          Information
        </h3>
        <a href="#" className="mt-5 text-sm leading-none text-white">
          Privacy Policy
        </a>
        <a href="#" className="mt-3.5 text-sm leading-none text-white">
          Terms of Sale, Service and Conditions of Use
        </a>
        <a href="#" className="mt-4 text-sm leading-none text-white">
          Refund & Return Policy
        </a>
        <a href="#" className="mt-3.5 text-sm leading-none text-white">
          Shipping Policy
        </a>
        <a href="#" className="mt-3.5 text-sm leading-none text-white">
          Billing Terms & Condition
        </a>

        <h3 className="mt-9 text-base font-semibold tracking-normal leading-none text-white">
          Pay Securely with
        </h3>
        <div className="flex gap-1 mt-4">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/c93469f927758d3c13483c2acc093ebc1561455b?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 aspect-square w-[38px]"
            alt="Payment method 1"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/86cc002fa55302625c96a62bf77b37a1954eeea6?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 aspect-square w-[38px]"
            alt="Payment method 2"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/6dbf1ae42306232a0abcaecf48e7216e8f108e57?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 aspect-square w-[38px]"
            alt="Payment method 3"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/1031475d2796009d413b215c1299be8afcb2f444?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 aspect-square w-[38px]"
            alt="Payment method 4"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/1be8a1b573972ef62a42dc1a6ac0f09c754e296d?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 aspect-square w-[38px]"
            alt="Payment method 5"
          />
        </div>
      </div>

      <div className="flex flex-col justify-center px-7 py-10 mt-5 w-full text-xs leading-6 text-center text-white bg-zinc-900">
        <p>
          <span>
            LumiClean is not a medical device and is not intended to diagnose,
          </span>
          <br />
          <span>
            treat, cure, or prevent any disease. The statements regarding UVC
          </span>
          <br />
          <span>
            and ozone technology refer to general disinfection purposes for air
          </span>
          <br />
          <span>
            and surfaces and do not imply any specific endorsement by the
          </span>
          <br />
          <span>
            FDA, EPA, or medical professionals. Results mentioned in this page
          </span>
          <br />
          <span>
            may vary depending on individual conditions and usage. UVC and
          </span>
          <br />
          <span>
            ozone must be used in accordance with safety guidelines. Avoid
          </span>
          <br />
          <span>
            direct exposure to UVC light and excessive ozone. Please refer to
            the
          </span>
          <br />
          <span>
            product's instructions for safe and proper use. This is a paid
          </span>
          <br />
          <span>advertisement for LumiClean.</span>
        </p>
      </div>
    </footer>
  );
};
