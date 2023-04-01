const { withPlaiceholder } = require("@plaiceholder/next");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["barberianextjs.s3.eu-central-1.amazonaws.com"],
  },
};

module.exports = withPlaiceholder(nextConfig);
