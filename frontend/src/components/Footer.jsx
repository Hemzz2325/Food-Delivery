// src/components/Footer.jsx
import React from "react";
import assets from "../assets/assets.js";

const Footer = () => {
  const appStoreImg = assets?.app_store;
  const playStoreImg = assets?.play_store;
  const heroImg = assets?.header_img || "/src/assets/header_img.jpg";

  const socials = [
    assets?.twitter_icon && { key: "twitter", src: assets.twitter_icon, href: "https://twitter.com", label: "Twitter" },
    assets?.facebook_icon && { key: "facebook", src: assets.facebook_icon, href: "https://facebook.com", label: "Facebook" },
    assets?.linkedin_icon && { key: "linkedin", src: assets.linkedin_icon, href: "https://linkedin.com", label: "LinkedIn" },
  ].filter(Boolean);

  return (
    <footer
      className="w-full relative border-t"
      style={{
        backgroundImage: `url(${heroImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0"></div>

      <div className="relative max-w-6xl mx-auto px-6 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Brand */}
        <div className="text-center sm:text-left">
          <h4 className="text-lg font-bold text-gray-900">Country‑Kitchen</h4>
          <p className="text-gray-700 text-xs mt-1">
            © {new Date().getFullYear()} Country‑Kitchen. All rights reserved.
          </p>
        </div>

        {/* Store badges */}
        <div className="flex items-center justify-center gap-3">
          {appStoreImg && (
            <img
              src={appStoreImg}
              alt="App Store"
              className="h-8 w-auto rounded-md shadow-md hover:shadow-lg transition"
              style={{ imageRendering: "crisp-edges" }}
            />
          )}
          {playStoreImg && (
            <img
              src={playStoreImg}
              alt="Google Play"
              className="h-8 w-auto rounded-md shadow-md hover:shadow-lg transition"
              style={{ imageRendering: "crisp-edges" }}
            />
          )}
        </div>

        {/* Social icons */}
        <div className="flex items-center justify-center sm:justify-end gap-2">
          {socials.map((s) => (
            <a
              key={s.key}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 hover:bg-gray-800 transition border border-gray-900 shadow-sm"
              aria-label={s.label}
              title={s.label}
            >
              <img
                src={s.src}
                alt={s.label}
                className="w-4 h-4 object-contain"
                style={{ imageRendering: "crisp-edges" }}
              />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
