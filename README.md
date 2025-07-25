# Personal Website

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/tiny.svg)](https://docs.astro.build)
[![Hosted on Cloudflare Worker](https://img.shields.io/badge/Hosted%20on-Cloudflare%20Worker-FBAD41?logo=cloudflare&color=F6821F&labelColor=azure&logoColor=FBAD41)](https://developers.cloudflare.com/workers/)
[![Uses Git Submodules](https://img.shields.io/badge/Git%20Submodules-azure?logo=git&logoColor=red)](https://git-scm.com/book/en/v2/Git-Tools-Submodules)

## 🚀 Project Structure

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
