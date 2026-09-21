import { defineHastPlugin } from "satteri";

export const wrapTable = defineHastPlugin({
  name: "wrap-table",
  element: {
    filter: ["table"],
    visit(node, ctx) {
      // Guard against re-wrapping if the walker visits the replacement's children
      const parent = ctx.parent(node);
      if (
        parent?.type === "element" &&
        parent.tagName === "div" &&
        Array.isArray(parent.properties?.className) &&
        parent.properties.className.includes("table-wrap")
      ) {
        return;
      }

      return {
        type: "element",
        tagName: "div",
        properties: { className: ["table-wrap"] },
        children: [node],
      };
    },
  },
});

export default wrapTable;
