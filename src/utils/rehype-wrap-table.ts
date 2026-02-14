import type { Plugin } from "unified";
import type { Root, Element, Parent } from "hast";
import { visit } from "unist-util-visit";

export const rehypeWrapTable: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(
      tree,
      "element",
      (node: Element, index, parent: Parent | undefined) => {
        if (!parent || typeof index !== "number" || node.tagName !== "table") {
          return;
        }

        const wrapper: Element = {
          type: "element",
          tagName: "div",
          properties: { className: ["table-wrap"] },
          children: [node],
        };

        parent.children[index] = wrapper;
      },
    );
  };
};

export default rehypeWrapTable;
