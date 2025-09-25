// src/components/Header.jsx
import React from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { assets } from "../assets/assets.js";

const Header = () => {
  const { city } = useSelector((s) => s.user);
  const heroImg =  "/userdashbaord.png";

  // Title reveals each word with a small delay
  const title = "Fresh food, fast delivery".split(" ");

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-[380px] rounded-3xl overflow-hidden shadow-2xl">
          {/* Ken-burns pan (slow scale + x drift) */}
          <motion.img
            src={heroImg}
            alt="Delicious meal hero"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ scale: 1.1, x: -15 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            loading="eager"
            draggable="false"
          />

          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/25 to-transparent" />

          {/* Accent blobs */}
          <motion.div
            className="absolute -top-24 -left-20 w-72 h-72 bg-red-500/25 rounded-full blur-3xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          />
          <motion.div
            className="absolute -bottom-24 -right-16 w-72 h-72 bg-pink-400/25 rounded-full blur-3xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          />

          {/* Text block */}
          <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12">
            <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold drop-shadow-lg tracking-tight flex flex-wrap gap-2">
              {title.map((w, i) => (
                <motion.span
                  key={i}
                  initial={{ y: 24, opacity: 0, rotateX: 15 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 * i + 0.2 }}
                  className={w.toLowerCase() === "fast" ? "text-red-300" : ""}
                >
                  {w}
                </motion.span>
              ))}
            </h2>

            {/* Floating city badge */}
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
              className="mt-3 w-fit"
            >
              <span className="text-white/95 text-base sm:text-lg md:text-xl font-medium drop-shadow-md backdrop-blur-sm bg-black/25 px-3 py-1 rounded-lg">
                {city && city !== "Detecting..." ? `Delivering in ${city}` : "🔍 Finding the current city…"}
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
