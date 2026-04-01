export const SITE = {
  title: "",
  titleSuffix: "Abhishek Singh",
  description: "Brain made thoughts",
  author: "Abhishek Singh",
  website: "https://abhishe.com",
  domain: "abhishe.com",
  defaultOgImage: "/og/default.png",
  timezone: "Asia/Kolkata",
  lang: "en",
  dir: "ltr",
  copyrightText: "© 2024—present Abhishek Singh",
  headerLinks: [
    {
      href: "/",
      text: "writings",
    },
    {
      href: "/resources",
      text: "resources",
    },
    {
      href: "/about",
      text: "about",
    },
  ],
  links: [
    {
      redirects: [],
      href: "mailto:k@abhishe.com",
      text: "k@abhishe.com",
      footer: true,
    },
    {
      redirects: ["/linkedin", "/li"],
      href: "https://www.linkedin.com/in/abhishek7x/",
      text: "linkedin",
      footer: true,
    },
    {
      redirects: ["/twitter", "/x"],
      href: "https://x.com/now7x",
      text: "twitter",
      footer: true,
    },
    {
      redirects: ["/github", "/gh"],
      href: "https://github.com/3x10RaiseTo8",
      text: "github",
      footer: true,
    },
    {
      redirects: ["/talent"],
      href: "https://docs.google.com/forms/d/e/1FAIpQLScYNoiJFctAxkgqDF564bJ_dij1HM4269V8S-9WcNla7PQVzA/viewform?usp=dialog",
      text: "Talent Database",
      footer: false,
    },
    {
      redirects: ["/source"],
      href: "https://github.com/3x10RaiseTo8/personal-website/",
      text: "source",
      footer: false,
    },
  ],
  websiteAppDisplay: "standalone",
  websiteBackgroundColor: "#FFFCF0",
  websiteThemeColor: "#FFFCF0",
  websiteAppIcons: [
    {
      src: "/icons/favicon-16.png",
      sizes: "16x16",
      type: "image/png",
    },
    {
      src: "/icons/favicon-32.png",
      sizes: "32x32",
      type: "image/png",
    },
    {
      src: "/icons/favicon-48.png",
      sizes: "48x48",
      type: "image/png",
    },
    {
      src: "/icons/favicon-64.png",
      sizes: "64x64",
      type: "image/png",
    },
    {
      src: "/icons/favicon-128.png",
      sizes: "128x128",
      type: "image/png",
    },
    {
      src: "/icons/favicon-180.png",
      sizes: "180x180",
      type: "image/png",
    },
    {
      src: "/icons/favicon-192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/icons/favicon-512.png",
      sizes: "512x512",
      type: "image/png",
    },
  ],
} as const;

export type Site = typeof SITE;
