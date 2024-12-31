import fs from "fs";
import * as theme from "../dist/index.js";

function convertToKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function generateStatic() {
  const staticVars = theme.vars.$static;

  let css = "";
  Object.keys(staticVars).forEach((variable) => {
    if (variable === "colors") {
      css += generateColors(staticVars[variable]);
    } else {
      css += ":root {\n";
      Object.entries(staticVars[variable]).forEach(([key, value]) => {
        Object.entries(value).forEach(([subKey, subValue]) => {
          css += `--${convertToKebabCase(key)}-${convertToKebabCase(subKey)}: ${subValue};\n`;
        });
      });
      css += "}\n";
    }
  });
  return css;
}

function generateColors(themes) {
  let css = "";
  Object.keys(themes).forEach((theme) => {
    let root = "";
    if (theme === "dark") {
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
  const semantic = theme.vars.$semantic;
  let css = ":root {\n";
  Object.entries(semantic).forEach(([variableKey, value]) => {
    Object.entries(value).forEach(([subKey, subValue]) => {
      css += `--${convertToKebabCase(subKey)}: ${subValue};\n`;
    });
  });
  css += "}\n";

  return css;
}

function generateClasses() {
  const classes = theme.classes;
  let css = "";
  Object.entries(classes).forEach(([, categoryValue]) => {
    Object.entries(categoryValue).forEach(([className, classValueObj]) => {
      Object.entries(classValueObj).forEach(([property, propertyValues]) => {
        css += `.${className}-${property} {\n`;
        Object.entries(propertyValues).forEach(
          ([propertyValue, propertyValueValue]) => {
            css += `--${convertToKebabCase(propertyValue)}: ${propertyValueValue};\n`;
          }
        );
        css += "}\n";
      });
    });
  });
  return css;
}

function generateCssVariables() {
  const staticCss = generateStatic();
  const semanticCss = generateSemantic();
  const classesCss = generateClasses();

  fs.writeFileSync("dist/variables.css", staticCss + semanticCss + classesCss);
}

try {
  generateCssVariables();
} catch (error) {
  console.error("Failed to generate variables", error);
  process.exit(1);
}
