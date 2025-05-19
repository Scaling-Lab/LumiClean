"use client";
import React, { useState } from "react";
import { Testimonial } from "./types";

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  testimonials,
}) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  function nextSlide() {
    setCurrentTestimonial((currentTestimonial + 1) % testimonials.length);
  }

  function prevSlide() {
    setCurrentTestimonial(
      currentTestimonial === 0
        ? testimonials.length - 1
        : currentTestimonial - 1,
    );
  }

  return (
    <section className="flex overflow-hidden relative flex-col self-stretch px-4 pt-10 pb-20 w-full aspect-[0.447]">
      <img
        src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/adaca41192f7670105965ef5ea4b50984198584b?placeholderIfAbsent=true"
        className="object-cover absolute inset-0 size-full"
        alt="Background"
      />
      <h2 className="relative self-center text-3xl font-bold leading-9 text-center text-black">
        <span>Don't Just Take Our Word For It.</span>
        <br />
        <span style={{ fontStyle: "italic", color: "rgba(52,150,214,1)" }}>
          See What Others Are Saying About LumiClean.
        </span>
      </h2>
      <div className="relative pb-5 mt-8 w-full bg-white rounded-2xl shadow-[0px_4px_8px_rgba(0,0,0,0.08)]">
        <div className="flex gap-2 justify-between items-center p-4">
          <div className="flex-1">
            {testimonials.map((_, index) => (
              <button
                className="p-0 mx-1 my-0 w-2 h-2 rounded-full cursor-pointer border-[none] duration-[0.3s] ease-[ease] transition-[background]"
                key={index}
                aria-label={`Go to testimonial ${index + 1}`}
                onClick={() => setCurrentTestimonial(index)}
                style={{
                  background:
                    currentTestimonial === index
                      ? "rgba(23, 115, 176, 1)"
                      : "rgba(23, 115, 176, 0.2)",
                }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              className="p-3 rounded-full transition-all cursor-pointer bg-sky-700 bg-opacity-10 border-[none] duration-[0.3s] ease-[ease]"
              aria-label="Previous testimonial"
              onClick={prevSlide}
            >
              ←
            </button>
            <button
              className="p-3 rounded-full transition-all cursor-pointer bg-sky-700 bg-opacity-10 border-[none] duration-[0.3s] ease-[ease]"
              aria-label="Next testimonial"
              onClick={nextSlide}
            >
              →
            </button>
          </div>
        </div>
        <div className="overflow-hidden relative">
          <div
            className="flex transition-transform duration-[0.5s] ease-[ease]"
            style={{
              transform: `translateX(-${currentTestimonial * 100}%)`,
            }}
          >
            {testimonials.map((testimonial, index) => (
              <div
                className="transition-opacity duration-[0.3s] ease-[ease] flex-[0_0_100%]"
                key={index}
                style={{
                  opacity: currentTestimonial === index ? 1 : 0.5,
                }}
              >
                <img
                  className="object-contain overflow-hidden w-full rounded-2xl aspect-square"
                  src={testimonial.image}
                  alt={`Testimonial from ${testimonial.author}`}
                />
              </div>
            ))}
          </div>
          <blockquote className="mx-5 mt-12 text-base leading-5 text-black transition-opacity duration-[0.3s] ease-[ease]">
            {testimonials[currentTestimonial].text}
          </blockquote>
        </div>
        <div className="flex gap-5 justify-between mx-5 mt-8 w-full max-w-[318px]">
          <div className="text-sm leading-5 text-black">
            <span style={{ fontWeight: 700, fontSize: 16 }}>
              <span>- </span>
              <span>{testimonials[currentTestimonial].author}</span>
            </span>
            <br />
            <span style={{ fontStyle: "italic" }}>
              <span>(</span>
              <span>{testimonials[currentTestimonial].role}</span>
              <span>)</span>
            </span>
          </div>
          <div className="flex gap-1 items-center px-3 py-1.5 my-auto text-xs font-medium tracking-wider text-center text-teal-600 bg-white border border-teal-600 border-solid rounded-[50px] shadow-[0px_0px_25px_rgba(0,43,91,0.05)]">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/ca002a3e33334ff69f11b80f2d432627/f0174096ba52f9d9232742b8c03b992657d29229?placeholderIfAbsent=true"
              className="object-contain overflow-hidden shrink-0 self-stretch my-auto w-4 aspect-square"
              alt="Verified icon"
            />
            <span className="self-stretch my-auto">Verified Buyer</span>
          </div>
        </div>
      </div>
    </section>
  );
};
