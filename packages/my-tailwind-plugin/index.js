const plugin = require("tailwindcss/plugin");
const {
  vars: {
    $static: {
      colors: { light, dark },
      ...rest
    },
    $semantic,
  },
  classes,
} = require("@repo/themes");

function convertToKebabCase(str) {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}

module.exports = plugin(
  function ({ addBase, theme, addUtilities }) {
    addBase({
      ":root": {
        // Generate CSS variables for base colors
        ...Object.entries(light)
          .flatMap(([colorName, colorValue]) =>
            typeof colorValue === "object"
              ? Object.entries(colorValue).map(([shade, value]) => ({
                  [`--${convertToKebabCase(colorName)}-${shade}`]: value,
                }))
              : []
          )
          .reduce((acc, curr) => ({ ...acc, ...curr }), {}),

        ...Object.entries(rest)
          .map(([key, value]) => Object.entries(value))
          .flat()
          .map(([key, value]) =>
            Object.fromEntries(
              Object.entries(value).map(([k, v]) => [
                `--${convertToKebabCase(key)}-${k}`,
                v,
              ])
            )
          )
          .reduce((acc, curr) => ({ ...acc, ...curr }), {}),

        // Generate CSS variables for semantic colors
        ...Object.entries($semantic).reduce(
          (acc, [key, value]) => ({
            ...acc,
            [`--${convertToKebabCase(key)}`]: value,
          }),
          {}
        ),
      },

      // Dark mode overrides
      ".dark": {
        // Generate dark mode color variables
        ...Object.entries(light)
          .flatMap(([colorName, colorValue]) =>
            typeof colorValue === "object"
              ? Object.entries(colorValue).map(([shade, _]) => ({
                  [`--${convertToKebabCase(colorName)}-${shade}`]:
                    dark[colorName][shade],
                }))
              : []
          )
          .reduce((acc, curr) => ({ ...acc, ...curr }), {}),
      },
    });

    const utilities = Object.entries(classes).reduce((acc, [key, value]) => {
      Object.entries(value).forEach(([className, classValue]) => {
        Object.entries(classValue).forEach(([shad, value]) => {
          acc[`.${className}-${shad}`] = value;
        });
      });
      return acc;
    }, {});

    addUtilities(utilities);
  },
  {
    theme: {
      extend: {
        colors: {
          // Add semantic colors to Tailwind's color palette
          semantic: Object.entries($semantic).reduce(
            (acc, [key, value]) => ({
              ...acc,
              [convertToKebabCase(key)]: value,
            }),
            {}
          ),

          // Add theme colors to Tailwind's color palette
          // These will automatically update based on the CSS variables
          ...Object.entries(light).reduce((acc, [colorName, colorValue]) => {
            if (typeof colorValue === "object") {
              return {
                ...acc,
                [convertToKebabCase(colorName)]: Object.entries(
                  colorValue
                ).reduce(
                  (shadeAcc, [shade, _]) => ({
                    ...shadeAcc,
                    [shade]: `var(--${convertToKebabCase(colorName)}-${shade})`,
                  }),
                  {}
                ),
              };
            }
            return acc;
          }, {}),
        },
      },
    },
  }
);
