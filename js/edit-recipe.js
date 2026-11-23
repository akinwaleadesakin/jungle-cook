
import { auth, db } from "./app.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";


const form = document.querySelector("#edit-recipe-form");
const message = document.querySelector("#edit-message");

const ingredientsContainer =
    document.querySelector("#ingredients-container");

const instructionsContainer =
    document.querySelector("#instructions-container");

const imageElement =
    document.querySelector("#current-recipe-image");

const saveButton =
    document.querySelector("#save-changes");

let currentUser = null;
let recipeId = null;
let recipeReference = null;
let currentRecipe = null;
let isSaving = false;




function showMessage(text, isError = false) {

    message.textContent = text;
    message.classList.toggle("error", isError);

}




const params = new URLSearchParams(window.location.search);

recipeId = params.get("id");

if (!recipeId) {

    showMessage("No recipe was selected.", true);

}




function addIngredient(value = "") {

    const wrapper = document.createElement("div");
    wrapper.className = "dynamic-field";

    const input = document.createElement("input");

    input.type = "text";
    input.className = "ingredient-input";
    input.placeholder = "Enter ingredient";
    input.maxLength = 200;
    input.value = value;
    input.required = true;

    const removeButton = document.createElement("button");

    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.className = "remove-button";

    removeButton.addEventListener("click", () => {

        if (ingredientsContainer.children.length <= 1) {
            showMessage("At least one ingredient is required.", true);
            return;
        }

        wrapper.remove();

    });

    wrapper.append(input, removeButton);

    ingredientsContainer.appendChild(wrapper);

}




function addInstruction(value = "") {

    const wrapper = document.createElement("div");
    wrapper.className = "dynamic-field";

    const textarea = document.createElement("textarea");

    textarea.className = "instruction-input";
    textarea.placeholder = "Enter instruction";
    textarea.maxLength = 1000;
    textarea.value = value;
    textarea.required = true;

    const removeButton = document.createElement("button");

    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.className = "remove-button";

    removeButton.addEventListener("click", () => {

        if (instructionsContainer.children.length <= 1) {
            showMessage("At least one instruction is required.", true);
            return;
        }

        wrapper.remove();

    });

    wrapper.append(textarea, removeButton);

    instructionsContainer.appendChild(wrapper);

}




document.querySelector("#add-ingredient")
    .addEventListener("click", () => addIngredient());

document.querySelector("#add-instruction")
    .addEventListener("click", () => addInstruction());




async function loadRecipe(user) {

    try {

        if (!recipeId) return;

        showMessage("Loading your recipe...");

        recipeReference = doc(db, "recipes", recipeId);

        const snapshot = await getDoc(recipeReference);

        if (!snapshot.exists()) {

            showMessage("Recipe could not be found.", true);
            return;

        }

        currentRecipe = snapshot.data();

        if (currentRecipe.userId !== user.uid) {

            showMessage(
                "You are not authorized to edit this recipe.",
                true
            );

            return;

        }


        

        form.elements.recipeName.value =
            currentRecipe.name || "";

        form.elements.recipeDescription.value =
            currentRecipe.description || "";

        form.elements.recipeTime.value =
            currentRecipe.totalTime || "";

        form.elements.recipeServings.value =
            currentRecipe.servings || 1;


        

        if (
            typeof currentRecipe.imageUrl === "string" &&
            currentRecipe.imageUrl.startsWith("https://")
        ) {

            imageElement.src = currentRecipe.imageUrl;

        } else {

            imageElement.hidden = true;

        }


        

        ingredientsContainer.replaceChildren();

        const ingredients =
            Array.isArray(currentRecipe.ingredients)
                ? currentRecipe.ingredients
                : [];

        ingredients.forEach(ingredient => {
            addIngredient(ingredient);
        });

        if (!ingredients.length) {
            addIngredient();
        }


     

        instructionsContainer.replaceChildren();

        const instructions =
            Array.isArray(currentRecipe.instructions)
                ? currentRecipe.instructions
                : [];

        instructions.forEach(instruction => {
            addInstruction(instruction);
        });

        if (!instructions.length) {
            addInstruction();
        }


        form.hidden = false;

        showMessage("Recipe loaded successfully.");

    } catch (error) {

        console.error("Loading recipe error:", error);

        showMessage(
            "Unable to load recipe. Please try again.",
            true
        );

    }

}




form.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (isSaving || !currentUser || !recipeReference) return;

    if (!form.checkValidity()) {

        form.reportValidity();
        return;

    }


    const ingredients = Array.from(
        document.querySelectorAll(".ingredient-input")
    )
        .map(input => input.value.trim())
        .filter(Boolean);


    const instructions = Array.from(
        document.querySelectorAll(".instruction-input")
    )
        .map(input => input.value.trim())
        .filter(Boolean);


    if (!ingredients.length || !instructions.length) {

        showMessage(
            "Add at least one ingredient and one instruction.",
            true
        );

        return;

    }


    const servings = Number(form.elements.recipeServings.value);

    if (!Number.isInteger(servings) || servings < 1 || servings > 100) {

        showMessage("Enter a valid serving size.", true);
        return;

    }


    try {

        isSaving = true;

        saveButton.disabled = true;
        saveButton.textContent = "Saving Changes...";

        showMessage("Updating your recipe...");


        await updateDoc(recipeReference, {

            name: form.elements.recipeName.value.trim(),

            description: form.elements.recipeDescription.value.trim(),

            totalTime: form.elements.recipeTime.value.trim(),

            servings: servings,

            ingredients: ingredients,

            instructions: instructions,

            updatedAt: serverTimestamp()

        });


        showMessage("Recipe updated successfully!");

        setTimeout(() => {

            window.location.href = "your-recipes.html";

        }, 1200);


    } catch (error) {

        console.error("Update recipe error:", error);

        showMessage(
            "Unable to update recipe. Check your Firestore permissions.",
            true
        );

    } finally {

        isSaving = false;

        saveButton.disabled = false;
        saveButton.textContent = "Save Changes";

    }

});




onAuthStateChanged(auth, (user) => {

    currentUser = user;

    if (!user) {

        form.hidden = true;

        showMessage("Please log in to edit your recipes.", true);

        return;

    }

    loadRecipe(user);

});
