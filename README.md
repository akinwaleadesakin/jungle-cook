# Jungle Cook

The Jungle Cook is a responsive recipe website built with HTML, CSS, Sass,
JavaScript, and Firebase. It provides a public recipe catalog and account-based
tools for creating and managing your own recipes.

## How the website works

### Home

The [home page](/index.html) introduces the website and contains links to the
main Browse and Create Recipe pages. The navigation changes for signed-in users:
"Login" becomes "Logout" and the header shows the user's name or email address.

### Browse recipes

The [Browse page](/browse.html) fetches the sample catalog from
[data/recipes.json](/data/recipes.json). JavaScript creates a card for every
recipe and displays its image, description, cooking time, and serving count.
Loading and image errors are shown with an accessible status message.

### Accounts

The [Login page](/login.html) supports both:

- Signing in with an existing email and password
- Signing up with a first name, last name, email, and password

Firebase Authentication maintains the signed-in state. After login or signup,
the user is returned to the home page. The login, signup, and logout controls
show success or user-friendly error messages for common Firebase errors.

### Create a recipe

The [Create Recipe page](/create-recipe.html) is available to signed-out
visitors, but its form is disabled until the user logs in. A signed-in user can:

1. Attach one JPG, PNG, or WEBP image (up to 5 MB).
2. Enter a name, description, total time, and serving size.
3. Add or remove dynamic ingredient fields.
4. Add or remove dynamic instruction fields.
5. Upload the image to Firebase Storage and save the recipe to Firestore.

The browser validates required fields and allowed image types. The page reports
image-upload and save progress while the recipe is being created.

### Your recipes

The [Your Recipes page](/your-recipes.html) queries Firestore for recipes whose
`userId` matches the signed-in user's Firebase user ID. From this page, users
can edit or delete their own recipes. Editing currently uses prompts for the
recipe fields. Deletion asks for confirmation and also attempts to remove the
stored recipe image before deleting the Firestore document.

An edit page and recipe-details page are included in the project, but the
recipe-details page is not yet implemented and the [Your Recipes page] is the
current entry point for editing a recipe.

## Tech stack

- HTML and JavaScript
- CSS and Sass
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase-compatible ES modules loaded from the Google CDN

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start a local HTTP server:

   ```bash
   npm run serve
   ```

   Use `http://localhost:8080` (or the address printed by `live-server`) rather
   than opening an HTML file directly. Serving over HTTP allows the JavaScript
   module imports to load correctly.

3. When editing styles, compile the Sass in another terminal:

   ```bash
   npm run compile-sass
   ```

## Firebase setup

The browser Firebase project configuration is in
[js/firebase-config.js](/js/firebase-config.js). Before using accounts or user
recipes, configure the matching Firebase project with:

- Email/password Authentication enabled
- A Firestore `recipes` collection
- Firebase Storage enabled for recipe images
- Security rules that allow signed-in users to read and write only their own
  recipe documents and uploaded images

Firestore recipe documents contain the recipe name and description, total time,
serving size, ingredients, instructions, owner ID/name, image URL, and creation
timestamp.

The Firebase web configuration is client-facing, not a secret. Access must be
restricted with Firebase Authentication and database/storage security rules.

## Project structure

```text
jungle-cook/
├── index.html
├── browse.html
├── create-recipe.html
├── your-recipes.html
├── login.html
├── edit-recipe.html
├── css/
├── scss/
├── js/
│   ├── app.js
│   ├── firebase-config.js
│   ├── browse.js
│   ├── create-recipe.js
│   └── your-recipes.js
├── data/
│   └── recipes.json
├── images/
├── package.json
└── README.md
```

- Sass source files live in `scss/`.
- `css/styles.css` is generated from `scss/styles.scss`.
- Page-specific styles and scripts are kept in `css/` and `js/`.
- The public catalog is loaded from `data/recipes.json`; user-created recipes
  are loaded from Firestore.

## Live deployment

The project is currently available at:

https://in-info-web4.luddy.indianapolis.iu.edu/~aadesaki/n315/jungle-cook/index.html
