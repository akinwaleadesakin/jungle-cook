
const recipeGrid = document.querySelector("#recipe-grid");
const browseStatus = document.querySelector("#browse-status");

async function loadRecipes() {

    browseStatus.textContent = "Loading recipes...";

    try {

        const response = await fetch("./data/recipes.json");

        if (!response.ok) {
            throw new Error("Could not load recipes.");
        }

        const recipes = await response.json();

        displayRecipes(recipes);

        browseStatus.textContent =
            `${recipes.length} recipes loaded successfully.`;

    } catch (error) {

        console.error("Recipe loading error:", error);

        browseStatus.textContent =
            "Unable to load recipes. Please refresh the page.";

        browseStatus.classList.add("error");

    }

}


function displayRecipes(recipes) {

    recipeGrid.replaceChildren();

    recipes.forEach(recipe => {

        const card = document.createElement("article");
        card.className = "recipe-card";

        const image = document.createElement("img");

        image.src = recipe.image;
        image.alt = recipe.name;
        image.loading = "lazy";

        image.addEventListener("error", () => {

            image.alt = `${recipe.name} image unavailable`;

            image.classList.add("image-error");

        });

        const content = document.createElement("div");
        content.className = "recipe-card-content";

        const title = document.createElement("h2");
        title.textContent = recipe.name;

        const description = document.createElement("p");
        description.textContent = recipe.description;

        const details = document.createElement("div");
        details.className = "recipe-details";

        const time = document.createElement("p");
        time.textContent = `◷  ${recipe.time}`;

        const servings = document.createElement("p");
        servings.textContent = `♧  ${recipe.servings}`;

        details.append(time, servings);

        content.append(title, description, details);

        card.append(image, content);

        recipeGrid.append(card);

    });

}


loadRecipes();
