const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

// Fix for Vercel deployment - disable lightningcss
if (process.env.VERCEL) {
  config.plugins.tailwindcss = {
    ...config.plugins.tailwindcss,
    cssnano: false,
  };
}

export default config;
