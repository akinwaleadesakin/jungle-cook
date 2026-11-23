
import { auth, db, storage } from "./app.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {
    ref,
    deleteObject
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";




const recipesContainer =
    document.querySelector("#recipes-container");

const recipesMessage =
    document.querySelector("#recipes-message");




function showMessage(message, isError = false) {

    recipesMessage.textContent = message;

    recipesMessage.classList.toggle("error", isError);

}




function createElement(tag, className, text = "") {

    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    element.textContent = text;

    return element;

}




async function loadRecipes(user) {

    recipesContainer.replaceChildren();

    showMessage("Loading your recipes...");

    try {

        const recipesQuery = query(
            collection(db, "recipes"),
            where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(recipesQuery);

        if (snapshot.empty) {

            showMessage("You haven't created any recipes yet.");

            return;

        }

        const recipes = snapshot.docs.map(recipeDoc => ({
            id: recipeDoc.id,
            ...recipeDoc.data()
        }));

        
        recipes.sort((a, b) => {
            const dateA = a.createdAt?.toMillis?.() || 0;
            const dateB = b.createdAt?.toMillis?.() || 0;
            return dateB - dateA;
        });

        showMessage(
            `${recipes.length} recipe(s) loaded successfully.`
        );

        recipes.forEach(recipe => {

            const card = createRecipeCard(recipe, user);

            recipesContainer.appendChild(card);

        });

    } catch (error) {

        console.error("Loading recipes error:", error);

        showMessage(
            "Unable to load your recipes. Check your Firebase permissions and internet connection.",
            true
        );

    }

}




function createRecipeCard(recipe, user) {

    const card = createElement("article", "recipe-card");

    

    const imageContainer =
        createElement("div", "recipe-card-image");

    const image = document.createElement("img");

    image.alt = recipe.name || "Recipe image";

    image.loading = "lazy";

    if (
        typeof recipe.imageUrl === "string" &&
        recipe.imageUrl.startsWith("https://")
    ) {

        image.src = recipe.imageUrl;

    } else {

        imageContainer.appendChild(
            createElement("p", "missing-image", "No image available")
        );

    }

    image.addEventListener("error", () => {

        image.replaceWith(
            createElement("p", "missing-image", "Image unavailable")
        );

    });

    if (image.src) {
        imageContainer.appendChild(image);
    }

    card.appendChild(imageContainer);


    

    const details =
        createElement("div", "recipe-card-details");

    const title = createElement(
        "h2",
        "recipe-card-title",
        recipe.name || "Untitled Recipe"
    );

    const description = createElement(
        "p",
        "recipe-card-description",
        recipe.description || "No description provided."
    );

    const time = createElement(
        "p",
        "recipe-card-info",
        `◷ ${recipe.totalTime || "Time not specified"}`
    );

    const servings = createElement(
        "p",
        "recipe-card-info",
        `♧ ${recipe.servings || "Not specified"} servings`
    );

    details.append(
        title,
        description,
        time,
        servings
    );


    

    const ingredientHeading =
        createElement("h3", "", "Ingredients");

    const ingredientList =
        document.createElement("ul");

    ingredientList.className = "recipe-list";

    if (Array.isArray(recipe.ingredients)) {

        recipe.ingredients.forEach(ingredient => {

            ingredientList.appendChild(
                createElement("li", "", ingredient)
            );

        });

    }

    details.append(ingredientHeading, ingredientList);


    

    const instructionHeading =
        createElement("h3", "", "Instructions");

    const instructionList =
        document.createElement("ol");

    instructionList.className = "recipe-list";

    if (Array.isArray(recipe.instructions)) {

        recipe.instructions.forEach(instruction => {

            instructionList.appendChild(
                createElement("li", "", instruction)
            );

        });

    }

    details.append(instructionHeading, instructionList);


    

    const actions =
        createElement("div", "recipe-card-actions");

    const editButton = createElement(
        "button",
        "edit-recipe-button",
        "Edit Recipe"
    );

    editButton.type = "button";

    editButton.addEventListener("click", () => {
        editRecipe(recipe, user);
    });


    const deleteButton = createElement(
        "button",
        "delete-recipe-button",
        "Delete Recipe"
    );

    deleteButton.type = "button";

    deleteButton.addEventListener("click", () => {
        deleteRecipe(recipe, user);
    });


    actions.append(editButton, deleteButton);

    details.appendChild(actions);

    card.appendChild(details);

    return card;

}




async function editRecipe(recipe, user) {

    const newName = prompt(
        "Enter the new recipe name:",
        recipe.name || ""
    );

    if (newName === null) return;

    if (!newName.trim()) {

        alert("Recipe name cannot be empty.");

        return;

    }


    const newDescription = prompt(
        "Enter the new recipe description:",
        recipe.description || ""
    );

    if (newDescription === null) return;


    const newTime = prompt(
        "Enter the new total cooking time:",
        recipe.totalTime || ""
    );

    if (newTime === null) return;


    const newServings = prompt(
        "Enter the new serving size:",
        String(recipe.servings || 1)
    );

    if (newServings === null) return;

    const servingsNumber = Number(newServings);

    if (
        !Number.isInteger(servingsNumber) ||
        servingsNumber < 1 ||
        servingsNumber > 100
    ) {

        alert("Please enter a serving size between 1 and 100.");

        return;

    }


    const newIngredients = prompt(
        "Enter ingredients separated by commas:",
        Array.isArray(recipe.ingredients)
            ? recipe.ingredients.join(", ")
            : ""
    );

    if (newIngredients === null) return;


    const newInstructions = prompt(
        "Enter instructions separated by | characters:",
        Array.isArray(recipe.instructions)
            ? recipe.instructions.join(" | ")
            : ""
    );

    if (newInstructions === null) return;


    const ingredients = newIngredients
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);

    const instructions = newInstructions
        .split("|")
        .map(item => item.trim())
        .filter(Boolean);


    if (!ingredients.length || !instructions.length) {

        alert("Please provide at least one ingredient and instruction.");

        return;

    }


    try {

        showMessage("Updating your recipe...");

        const recipeReference = doc(
            db,
            "recipes",
            recipe.id
        );

        await updateDoc(recipeReference, {

            name: newName.trim(),

            description: newDescription.trim(),

            totalTime: newTime.trim(),

            servings: servingsNumber,

            ingredients: ingredients,

            instructions: instructions

        });

        showMessage("Recipe updated successfully!");

        await loadRecipes(user);

    } catch (error) {

        console.error("Edit recipe error:", error);

        showMessage(
            "Unable to update this recipe. Please try again.",
            true
        );

    }

}




async function deleteRecipe(recipe, user) {

    const confirmed = confirm(
        `Are you sure you want to delete "${recipe.name}"? This cannot be undone.`
    );

    if (!confirmed) return;


    try {

        showMessage("Deleting your recipe...");

        const recipeReference = doc(
            db,
            "recipes",
            recipe.id
        );


        
        if (
            typeof recipe.imageUrl === "string" &&
            recipe.imageUrl.startsWith("https://")
        ) {

            try {

                const imageReference = ref(
                    storage,
                    recipe.imageUrl
                );

                await deleteObject(imageReference);

            } catch (imageError) {

                console.warn(
                    "Image could not be deleted:",
                    imageError
                );

            }

        }


        

        await deleteDoc(recipeReference);

        showMessage("Recipe deleted successfully!");

        await loadRecipes(user);

    } catch (error) {

        console.error("Delete recipe error:", error);

        showMessage(
            "Unable to delete this recipe. Please try again.",
            true
        );

    }

}




onAuthStateChanged(auth, (user) => {

    if (!user) {

        recipesContainer.replaceChildren();

        showMessage(
            "Please log in to view your recipes.",
            true
        );

        return;

    }

    loadRecipes(user);

});
