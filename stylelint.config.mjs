const config = {
  extends: ["stylelint-config-standard"],
  rules: {
    // Prettier owns whitespace and wrapping, not the correctness checker.
    "at-rule-empty-line-before": null,
    "comment-empty-line-before": null,
    "custom-property-empty-line-before": null,
    "rule-empty-line-before": null,
    "declaration-block-single-line-max-declarations": null,
    "import-notation": "string",
    "media-feature-range-notation": "prefix",
    "custom-property-pattern": "^[a-z][a-z0-9]*(-{1,2}[a-z0-9]+)*$",
    "value-keyword-case": [
      "lower",
      { ignoreKeywords: ["currentColor", "optimizeLegibility"] },
    ],
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "theme",
          "utility",
          "custom-variant",
          "variant",
          "apply",
          "source",
          "reference",
          "plugin",
        ],
      },
    ],
    "selector-class-pattern": "^[a-z][a-zA-Z0-9-]*$",
  },
  overrides: [
    {
      files: ["src/**/*.module.css"],
      rules: {
        "color-named": "never",
        // Responsive and Radix state selectors deliberately override local baselines.
        "no-descending-specificity": null,
        "declaration-property-value-disallowed-list": {
          "/.*/": [
            "/var\\(\\s*--palette-/",
            "/#[0-9a-fA-F]{3,8}\\b/",
            "/(?:rgba?|hsla?|oklch|oklab)\\(/",
          ],
        },
      },
    },
  ],
};

export default config;
