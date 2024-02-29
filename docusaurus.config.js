// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).

import { themes as prismThemes } from "prism-react-renderer";

/** @type {import('@docusaurus/types').Config} */

const config = {
  title: "EPOC Doc",
  tagline: "Documentation for EY's EPOC Project.",
  favicon: "img/EYLogo.png",

  // Production URL here:
  url: "https://stevenz1998.github.io/",

  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/EPOCDoc/",

  // GitHub pages deployment config (Really, not needed).
  organizationName: "StevenZ1998",
  projectName: "stevenz1998.github.io",
  deploymentBranch: "main",
  trailingSlash: false,

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Language localization.
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: "/",
          sidebarPath: "./sidebars.js",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Change here to modify navbar.
      navbar: {
        title: "EPOC",
        logo: {
          alt: "EY",
          src: "img/EYLogo.png",
        },

        // Items in the navbar.
        items: [
          {
            type: "doc",
            docId: "docs/introduction",
            sidebarID: "gettingStartedSideBar",
            position: "left",
            label: "Docs",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Navigation",
            items: [
              {
                label: "Home",
                to: "/",
              },
              {
                label: "Docs",
                to: "/docs/introduction",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "EY",
                to: "https://www.ey.com/en_us",
              },
              {
                href: "https://github.com/StevenZ1998/DiscOps_Docs",
                label: "EPOC Doc Repository",
                position: "right",
              },
              {
                href: "https://github.com/cmckenz87/discops2024",
                label: "EPOC Repository",
                position: "right",
              },
            ],
          },
        ],
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
