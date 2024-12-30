import fs from "fs";
import * as theme from "../dist/index.js";

function convertToKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}


function generateStatic() {
  const staticVars = theme.vars.$static;

  let css = "";

  Object.keys(staticVars).forEach((key) => {
    if(key === "colors") {
      css += generateColors(staticVars[key]);
    }
  });

  return css;
}

function generateColors(themes) {


  let css = "";
  Object.keys(themes).forEach((theme) => {
    let root = "";
    if(theme === "dark") {
      root = ":root .dark {\n";
    } else {
      root = ":root {\n";
    }

    Object.keys(themes[theme]).forEach((color) => {
      Object.keys(themes[theme][color]).forEach((token) => {
        root += `--${convertToKebabCase(color)}-${convertToKebabCase(token)}: ${themes[theme][color][token]};\n`;
      });
    });

    root += "}\n";

    css += root;
  });

  return css;
}

function generateSemantic() {
  const semantic = theme.vars.semantic;
  let css = ":root {\n";
  Object.keys(semantic).forEach((color) => {
    css += `--${convertToKebabCase(color)}: ${semantic[color]};\n`;
  });
  css += "}\n";

  return css;
}

function generateVariables() {

  const staticCss = generateStatic();
  const semanticCss = generateSemantic();

  fs.writeFileSync("dist/variables.css", staticCss + semanticCss);
}

try {
  generateVariables();
} catch (error) {
  console.error("Failed to generate variables", error);
  process.exit(1);
}
