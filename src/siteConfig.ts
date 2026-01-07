export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  website: string;
  ogImage: string;
  dir: "ltr" | "rtl" | "auto";
  lang: string;
  timezone: string;
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
} as const;
