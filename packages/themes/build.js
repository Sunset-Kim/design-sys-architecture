import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, "./");
const pkg = path.resolve(root, "package.json");
const dev = process.argv.includes("--dev");
const minify = !dev;

const watch = process.argv.includes("--watch");

const pkgJson = JSON.parse(fs.readFileSync(pkg, "utf8"));
const external = Object.keys({
  ...pkgJson.dependencies || {},
  ...pkgJson.devDependencies || {},
});

async function run() {
  try {
    if(watch) {
      let ctx = await esbuild.context({
        entryPoints: ["src/index.ts"],
        bundle: true,
        minify: minify,
        format: "esm",
        outfile: "dist/index.js",
        external,
      });
      ctx.watch();
      console.log("Watching for changes...");
    } else {
      await Promise.all([
        esbuild.build({
          entryPoints: ["src/index.ts"],
          bundle: true,
          minify: minify,
          format: "esm",
          outfile: "dist/index.js",
          external,
        }),
        esbuild.build({
          entryPoints: ["src/index.ts"],
          bundle: true,
          minify: minify,
          format: "cjs",
          outfile: "dist/index.cjs",
          external,
        }),
      ]);
      console.log("Build completed");
    }
  } catch (error) {
    console.error("Build failed", error);
    process.exit(1);
  }
}

run();
