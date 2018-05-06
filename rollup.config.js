import commonjs from "rollup-plugin-commonjs";
import cssnext from "postcss-cssnext";
import postcss from "rollup-plugin-postcss";
import resolve from "rollup-plugin-node-resolve";
import uglify from "rollup-plugin-uglify";
// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/main.js",
  output: {
    file: "public/bundle.js",
    format: "iife", // immediately-invoked function expression — suitable for <script> tags
    sourcemap: true,
  },
  plugins: [
    resolve(), // tells Rollup how to find date-fns in node_modules
    commonjs(), // converts date-fns to ES modules
    postcss({
      extract: true,
      plugins: [cssnext({ warnForDuplicates: false })],
    }),
    production && uglify(), // minify, but only in production
  ],
};
