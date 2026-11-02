# Jungle Cook

A small static restaurant-style recipe landing page built with HTML, CSS, and Sass.

## Project overview

This project is a front-end mockup for a recipe website called "The Jungle Cook." It includes:

- A home page with a hero section and call-to-action styling
- A login/auth page
- Responsive layout styles for tablet and mobile screens
- Sass-based styling with reusable variables and partials

## Tech stack

- HTML
- CSS
- Sass
- JavaScript (for UI behavior)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Compile Sass to CSS:

   ```bash
   npm run compile-sass
   ```

3. Preview the site locally:

   ```bash
   npx live-server
   ```

   Or open `index.html` directly in a browser.

## Useful scripts

```bash
npm run compile-sass
```

Watch and rebuild the SCSS files whenever they change.

## Project structure

```text
jungle-cook/
├── index.html
├── login.html
├── app.js
├── css/
│   └── styles.css
├── scss/
│   ├── styles.scss
│   ├── _variables.scss
│   ├── _navigation.scss
│   ├── _home.scss
│   ├── _login.scss
│   └── _footer.scss
├── package.json
└── README.md
```

## Notes

- The Sass source files live in `scss/`.
- Generated CSS is written to `css/styles.css`.
- The project is designed as a static front-end site and does not require a backend.
  web 4
  https://in-info-web4.luddy.indianapolis.iu.edu/~aadesaki/n315/jungle-cook/
