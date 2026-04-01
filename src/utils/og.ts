import satori from "satori";
import sharp from "sharp";
import { SITE } from "@/siteConfig";
import { readFileSync } from "fs";
import { resolve } from "path";

const faviconPath = resolve(process.cwd(), "public/icons/favicon-32.svg");
const faviconData = `data:image/svg+xml;base64,${Buffer.from(readFileSync(faviconPath)).toString("base64")}`;

function titleToSpans(title: string, spacing: number) {
  const words = title.split(" ");
  return words.map((word, i) => ({
    type: "span",
    props: {
      style: {
        marginRight: i < words.length - 1 ? `${spacing}px` : "0px",
      },
      children: word,
    },
  }));
}

export async function generateOgImage(title: string): Promise<Buffer> {
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: SITE.websiteBackgroundColor,
          padding: "72px",
        },
        children: [
          {
            type: "h1",
            props: {
              style: {
                flex: 1,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                alignContent: "center",
                justifyContent: "flex-start",
                margin: "0",
                fontSize: "110px",
                fontFamily: "Instrument Serif",
                fontWeight: "400",
                color: "black",
                lineHeight: "1.2",
                letterSpacing: "-0.04em",
                paddingBottom: "40px",
              },
              children: titleToSpans(title, 28),
            },
          },
          {
            type: "footer",
            props: {
              style: {
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                borderTop: "1px solid black",
                paddingTop: "40px",
                width: "100%",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "12px",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            fontSize: "28px",
                            fontFamily: "Noto Sans",
                            fontWeight: "400",
                            color: "black",
                            letterSpacing: "0.1em",
                          },
                          children: SITE.domain,
                        },
                      },
                      {
                        type: "img",
                        props: {
                          src: faviconData,
                          width: 32,
                          height: 32,
                          style: { display: "block" },
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Instrument Serif",
          data: await fetch(
            "https://cdn.jsdelivr.net/npm/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff",
          ).then((res) => res.arrayBuffer()),
          weight: 400,
          style: "normal",
        },
        {
          name: "Noto Sans",
          data: await fetch(
            "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff",
          ).then((res) => res.arrayBuffer()),
          weight: 700,
          style: "normal",
        },
      ],
    },
  );

  return await sharp(Buffer.from(svg)).png().toBuffer();
}
