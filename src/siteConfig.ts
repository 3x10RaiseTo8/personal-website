export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  website: string;
  ogImage: string;
  dir: "ltr" | "rtl" | "auto";
  lang: string;
  timezone: string;
  contacts: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    email?: string;
  };
}

export const SITE: SiteConfig = {
  title: "Abhishek",
  description: "brain made thoughts",
  author: "Abhishek Singh",
  website: "https://abhishe.com", // replace this with your deployed domain
  ogImage: "og.jpg",
  dir: "ltr",
  lang: "en",
  timezone: "Asia/Kolkata",
  contacts: {
    linkedin: "https://www.linkedin.com/in/abhishek7x/",
    twitter: "https://x.com/now7x",
    github: "https://github.com/3x10RaiseTo8",
    email: "mailto:k@abhishe.com",
  },
} as const;
