// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).

import { themes as prismThemes } from "prism-react-renderer";

/** @type {import('@docusaurus/types').Config} */

const config = {
  title: "DiscOps Docs",
  tagline: "Documentation for EY's DiscOps Project.",
  favicon: "img/logo.svg",

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
        title: "Home",
        logo: {
          alt: "Disc Ops Logo",
          src: "img/logo.svg",
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
            title: "Docs",
            items: [
              {
                label: "Home",
                to: "/",
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
                label: "Docs GitHub",
                position: "right",
              },
              {
                href: "https://github.com/cmckenz87/discops2024",
                label: "DiscOps Github",
                position: "right",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} DiscOps Docs, EY.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
