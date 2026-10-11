/** Inspect style expressions only, never user text, documentation, or comments. */
function styleContext(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (current.type === "JSXAttribute")
      return ["className", "style", "overlayClassName"].includes(
        current.name.name,
      );
    if (
      current.type === "CallExpression" &&
      current.callee.type === "Identifier" &&
      ["cn", "clsx", "cva"].includes(current.callee.name)
    )
      return true;
    if (
      current.type === "VariableDeclarator" &&
      current.id.type === "Identifier" &&
      /(?:Classes|ClassName)$/.test(current.id.name)
    )
      return true;
    if (
      ["Statement", "Declaration"].some((suffix) =>
        current.type.endsWith(suffix),
      )
    )
      break;
  }
  return false;
}

/** @type {import("eslint").Rule.RuleModule} */
export const semanticStylesRule = {
  meta: {
    type: "problem",
    schema: [],
    messages: {
      token:
        "使用设计系统语义 Token；不要在组件中使用硬编码颜色、dark: 变体或原始 palette。",
    },
  },
  create(context) {
    function inspect(node, value) {
      if (!styleContext(node)) return;
      if (
        /\bdark:|--palette-|#[\da-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab)\(|(?:^|[:\s])(?:bg|text|border|ring|fill|stroke|outline|decoration|from|via|to|shadow)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+)(?:\/[^\s]+)?(?=$|[:\s])/.test(
          value,
        )
      ) {
        context.report({ node, messageId: "token" });
      }
    }
    return {
      Literal(node) {
        if (typeof node.value === "string") inspect(node, node.value);
      },
      TemplateElement(node) {
        inspect(node, node.value.cooked ?? node.value.raw);
      },
    };
  },
};

const plugin = { rules: { "semantic-styles": semanticStylesRule } };
export default plugin;
