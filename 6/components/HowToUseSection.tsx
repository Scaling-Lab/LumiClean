import React from "react";

export const HowToUseSection: React.FC = () => {
  return (
    <section className="flex flex-col items-center">
      <h2 className="mt-10 text-3xl font-extrabold leading-tight text-center text-sky-700">
        It's As Easy As 1, 2, 3
      </h2>

      {/* Step 1 */}
      <div className="flex overflow-hidden relative flex-col pb-5 mt-8 w-full rounded-3xl aspect-[0.659] max-w-[358px]">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/9422c542153e6875a7b70edaa0f8b8e2f463d74a?placeholderIfAbsent=true"
          className="object-cover absolute inset-0 size-full"
          alt="Step 1 background"
        />
        <div className="flex overflow-hidden relative flex-col items-start pt-48 pr-20 pb-6 pl-4 w-full font-bold leading-tight rounded-none aspect-[1.059]">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/4292be9048338d55f2540e460ba03743cff83730?placeholderIfAbsent=true"
            className="object-cover absolute inset-0 size-full"
            alt="Step 1 detail background"
          />
          <span className="relative text-8xl text-cyan-900">1.</span>
          <h3 className="relative mt-5 text-2xl text-black">Turn it on.</h3>
        </div>
        <p className="relative z-10 self-end mt-0 text-base text-black w-[292px]">
          Simply place your UVO lamps in every room you want to disinfect,
          whether it's the bedroom, bathroom, kitchen, or office, then use the
          remote to turn all of your UVO lamps simultaneously, making it
          incredibly easy to disinfect your entire living space.
        </p>
      </div>

      {/* Step 2 */}
      <div className="flex overflow-hidden relative flex-col pb-5 mt-4 w-full rounded-3xl aspect-[0.405] max-w-[358px]">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/1fc442d74c558be31ad3a7808eda724576f9982a?placeholderIfAbsent=true"
          className="object-cover absolute inset-0 size-full"
          alt="Step 2 background"
        />
        <div className="flex overflow-hidden relative flex-col px-4 pt-48 w-full font-bold rounded-none aspect-[1.059]">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/3d6e13ae79cb3c7be8d9e16387a15abfbad3f112?placeholderIfAbsent=true"
            className="object-cover absolute inset-0 size-full"
            alt="Step 2 detail background"
          />
          <span className="relative self-start text-8xl leading-tight text-cyan-900">
            2.
          </span>
          <h3 className="relative z-10 mt-5 -mb-1.5 text-2xl leading-7 text-black">
            Take your furry friends out & Leave the room.
          </h3>
        </div>
        <div className="flex relative gap-2.5 self-center mt-6 w-full text-base text-black max-w-[326px]">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/b6d8f45f28f19f7abd0be2697e66f36a9f5101b3?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 self-start w-6 aspect-square"
            alt="Information icon"
          />
          <p className="flex-auto w-[287px]">
            <span>
              After Turning your UVO lamps on, make sure to bring your pets and
              every other family member to another room until the disinfection
              cycle ends.
            </span>
            <br />
            <span>
              I know. It might seem like a hassle to stay away until the UVO
              lamps have completed disinfecting allergens, foul smells, pet
              dander, and other unseen threats from your home.
            </span>
            <br />
            <span>
              But trust me this small investment of time will pay huge dividends
              in protecting the health of your furry friends and loved ones.
            </span>
            <br />
            <span>
              Seriously, it's just 15 minutes. You can use that time to walk
              your dogs, catch up on your favorite show, read a few pages of
              that book you've meant to finish or relax and unwind.
            </span>
          </p>
        </div>
      </div>

      {/* Step 3 */}
      <div className="flex overflow-hidden relative flex-col pb-5 mt-4 w-full text-base text-black rounded-3xl aspect-[0.683] max-w-[358px]">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/963ccf7ada1491cb04da70279569c60e3289964d?placeholderIfAbsent=true"
          className="object-cover absolute inset-0 size-full"
          alt="Step 3 background"
        />
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/c3825a67-f273-44f9-8f0d-66547edaf2c3?placeholderIfAbsent=true"
          className="object-contain overflow-hidden w-full rounded-none aspect-square"
          alt="Step 3 illustration"
        />
        <div className="flex relative gap-2.5 self-center mt-4 w-full max-w-[326px]">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/3c90b3bf456795a1ee7338776b05e35d39a7cfed?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 self-start w-6 aspect-square"
            alt="Information icon"
          />
          <p className="flex-auto w-[287px]">
            The moment you step back into the room, you'll be greeted by a
            refreshingly crisp smell because your home is finally free from the
            musty odors and allergens that once weighed you down.
          </p>
        </div>
      </div>

      <h2 className="mt-10 text-3xl font-bold leading-9 text-center text-sky-700">
        Make Sure To Hurry And Grab Your LumiClean Towers Before They Run Out!
      </h2>
      <p className="mt-4 text-lg leading-6 text-center text-neutral-800">
        <span>
          Whenever we do these promotions, people start buying three, five, or
          even 10 lamps for their homes and offices. So they fly off our
          warehouse shelves super quickly.
        </span>
        <br />
        <span>
          And once we're out of stock, we'll have to take this page down and
          wait for our next shipment.
        </span>
        <br />
        <span>
          Because of what's happening in the world and logistical issues, the
          next shipment could take months, depending on supply and
          transportation lines.
        </span>
        <br />
        <span>
          So if you're interested in getting Lumiclean towers and finally have a
          cleaner space...
        </span>
        <br />
        <span>
          Go ahead and click the &quot;Buy Now&quot; button at the bottom of
          this page to secure your devices today.
        </span>
      </p>

      <div className="flex overflow-hidden relative flex-col items-center px-4 py-5 mt-8 w-full font-bold leading-tight rounded-3xl aspect-[1.845] max-w-[358px]">
        <img
          src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/dd9abeb74661919edbdb6d89937c480794bfa22c?placeholderIfAbsent=true"
          className="object-cover absolute inset-0 size-full"
          alt="Limited time offer background"
        />
        <div className="flex relative gap-4 w-full text-2xl tracking-wide max-w-[286px] text-sky-950">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/ac6801955d0fd0af85205f2b9d6caf8fc4833027?placeholderIfAbsent=true"
            className="object-contain overflow-hidden shrink-0 aspect-square w-[50px]"
            alt="Limited time icon"
          />
          <h3 className="grow shrink my-auto w-[211px]">Limited Time Sale</h3>
        </div>
        <p className="relative mt-4 text-xl leading-tight text-center text-red-700 uppercase">
          Offer Ends Soon
        </p>
        <button className="relative self-stretch px-16 py-4 mt-4 text-base text-center text-white uppercase whitespace-nowrap bg-red-700 rounded-[100px]">
          Redeem
        </button>
      </div>
    </section>
  );
};
