export const SITE = {
  title: "Abhishek",
  description: "brain made thoughts",
  author: "Abhishek Singh",
  website: "https://abhishe.com",
  ogImage: "og.jpg",
  timezone: "Asia/Kolkata",
  headerLinks: [
    {
      href: "/writings",
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
      text: "Talent",
      footer: false,
    },
  ],
} as const;

export type Site = typeof SITE;
