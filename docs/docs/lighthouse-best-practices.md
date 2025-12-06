---
title: Lighthouse SEO Best Practices
---

This document outlines the recommended configurations and best practices for optimizing Docusaurus sites for SEO using Lighthouse.

## 1. Docusaurus Configuration
- Ensure `docusaurus.config.ts` has the correct `url` and `baseUrl`.
- Verify the `@docusaurus/plugin-sitemap` is active (included in `@docusaurus/preset-classic`).

## 2. Meta Tags
- Chapters and pages should have descriptive `title` and `description` meta tags.

## 3. Image Optimization
- All images should include meaningful `alt` attributes for accessibility and SEO.

## 4. Content Structure
- Use semantic HTML tags (e.g., `<h1>` for main titles, `<p>` for paragraphs).
- Ensure a logical heading structure (h1, h2, h3...).

## 5. Mobile Responsiveness
- Docusaurus themes are generally responsive; ensure no custom CSS breaks this.

## 6. Performance
- Optimize image sizes and formats.
- Leverage browser caching.

## 7. Accessibility
- Provide good color contrast.
- Ensure keyboard navigability.
