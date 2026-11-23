
import { auth, db, storage } from "./app.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import {
    ref,
    uploadBytesResumable,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";




const form = document.querySelector("#create-recipe-form");
const message = document.querySelector("#recipe-message");
const submitButton = document.querySelector("#create-submit");
const imageInput = document.querySelector("#recipe-image");
const imageFileName = document.querySelector("#image-file-name");

const ingredientsContainer =
    document.querySelector("#ingredients-container");

const instructionsContainer =
    document.querySelector("#instructions-container");

const greeting = document.querySelector("#recipe-greeting");

const addIngredientButton =
    document.querySelector("#add-ingredient");

const addInstructionButton =
    document.querySelector("#add-instruction");




if (
    !form ||
    !message ||
    !submitButton ||
    !imageInput ||
    !ingredientsContainer ||
    !instructionsContainer
) {
    throw new Error("Create Recipe page is missing required HTML elements.");
}




let currentUser = null;
let isSaving = false;




function showMessage(text, isError = false) {

    message.textContent = text;

    message.classList.toggle("error", isError);

}




onAuthStateChanged(auth, (user) => {

    currentUser = user;

    if (!user) {

        if (greeting) {
            greeting.textContent = "Please log in to create a recipe.";
        }

        form.querySelectorAll("input, textarea, button")
            .forEach(element => {
                element.disabled = true;
            });

        showMessage(
            "You must be logged in to create a recipe.",
            true
        );

        return;
    }

    form.querySelectorAll("input, textarea, button")
        .forEach(element => {
            element.disabled = false;
        });

    if (greeting) {
        greeting.textContent =
            `Hey ${user.displayName || "there"}, create your recipe!`;
    }

    showMessage("");

});




imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    imageFileName.textContent = file
        ? file.name
        : "No image selected";

});




let ingredientCount =
    document.querySelectorAll(".ingredient-input").length || 3;

addIngredientButton?.addEventListener("click", () => {

    ingredientCount++;

    const input = document.createElement("input");

    input.type = "text";
    input.className = "dynamic-input ingredient-input";
    input.placeholder = `Ingredient #${ingredientCount}`;
    input.maxLength = 200;
    input.required = true;

    ingredientsContainer.appendChild(input);

});




let instructionCount =
    document.querySelectorAll(".instruction-input").length || 3;

addInstructionButton?.addEventListener("click", () => {

    instructionCount++;

    const textarea = document.createElement("textarea");

    textarea.className = "dynamic-input instruction-input";
    textarea.placeholder = `Instruction #${instructionCount}`;
    textarea.maxLength = 1000;
    textarea.required = true;

    instructionsContainer.appendChild(textarea);

});




function resetDynamicFields() {

    ingredientsContainer.innerHTML = "";
    instructionsContainer.innerHTML = "";

    ingredientCount = 3;
    instructionCount = 3;

    for (let i = 1; i <= 3; i++) {

        const ingredient = document.createElement("input");

        ingredient.type = "text";
        ingredient.className = "dynamic-input ingredient-input";
        ingredient.placeholder = `Ingredient #${i}`;
        ingredient.maxLength = 200;
        ingredient.required = true;

        ingredientsContainer.appendChild(ingredient);


        const instruction = document.createElement("textarea");

        instruction.className = "dynamic-input instruction-input";
        instruction.placeholder = `Instruction #${i}`;
        instruction.maxLength = 1000;
        instruction.required = true;

        instructionsContainer.appendChild(instruction);

    }

}


function uploadRecipeImage(image, userId) {

    return new Promise((resolve, reject) => {

        const safeFileName =
            image.name.replace(/[^a-zA-Z0-9._-]/g, "_");

        const imageReference = ref(
            storage,
            `recipe-images/${userId}/${Date.now()}-${safeFileName}`
        );

        const uploadTask = uploadBytesResumable(
            imageReference,
            image,
            {
                contentType: image.type
            }
        );

        uploadTask.on(

            "state_changed",

            (snapshot) => {

                const progress = Math.round(
                    (snapshot.bytesTransferred /
                    snapshot.totalBytes) * 100
                );

                showMessage(
                    `Uploading image: ${progress}% complete...`
                );

            },

            (error) => {

                reject(error);

            },

            async () => {

                try {

                    const imageUrl = await getDownloadURL(
                        uploadTask.snapshot.ref
                    );

                    resolve(imageUrl);

                } catch (error) {

                    reject(error);

                }

            }

        );

    });

}




form.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (isSaving) return;

    if (!currentUser) {

        showMessage(
            "Please log in before creating a recipe.",
            true
        );

        return;

    }


   

    if (!form.checkValidity()) {

        form.reportValidity();

        return;

    }


    const image = imageInput.files[0];

    if (!image) {

        showMessage("Please select a recipe image.", true);

        return;

    }


    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(image.type)) {

        showMessage(
            "Please upload a JPG, PNG, or WEBP image.",
            true
        );

        return;

    }


    if (image.size > 5 * 1024 * 1024) {

        showMessage(
            "Your image must be smaller than 5 MB.",
            true
        );

        return;

    }


  

    const ingredients = Array.from(
        document.querySelectorAll(".ingredient-input")
    )
        .map(input => input.value.trim())
        .filter(value => value !== "");


    

    const instructions = Array.from(
        document.querySelectorAll(".instruction-input")
    )
        .map(input => input.value.trim())
        .filter(value => value !== "");


    if (ingredients.length === 0) {

        showMessage("Please enter at least one ingredient.", true);

        return;

    }


    if (instructions.length === 0) {

        showMessage("Please enter at least one instruction.", true);

        return;

    }


    

    const recipeData = {

        name: form.elements.recipeName.value.trim(),

        description: form.elements.recipeDescription.value.trim(),

        totalTime: form.elements.recipeTime.value.trim(),

        servings: Number(form.elements.recipeServings.value),

        ingredients: ingredients,

        instructions: instructions,

        userId: currentUser.uid,

        userName: currentUser.displayName || currentUser.email,

        createdAt: serverTimestamp()

    };


   

    isSaving = true;

    submitButton.disabled = true;
    submitButton.textContent = "Creating Recipe...";


    try {

        

        showMessage("Starting image upload...");

        const imageUrl = await uploadRecipeImage(
            image,
            currentUser.uid
        );


        

        showMessage("Image uploaded! Saving recipe to database...");


        const recipeReference = await addDoc(
            collection(db, "recipes"),
            {
                ...recipeData,
                imageUrl: imageUrl
            }
        );


        console.log(
            "Recipe successfully created:",
            recipeReference.id
        );


       

        showMessage(
            "Success! Your recipe has been saved."
        );


      

        form.reset();

        imageFileName.textContent = "No image selected";

        resetDynamicFields();


    } catch (error) {

        console.error("Recipe creation error:", error);

        let errorMessage =
            "Unable to create your recipe. Please try again.";


        if (error.code === "storage/unauthorized") {

            errorMessage =
                "Storage permission denied. Check your Firebase Storage rules.";

        } else if (error.code === "storage/bucket-not-found") {

            errorMessage =
                "Firebase Storage bucket was not found. Check your Firebase project settings.";

        } else if (error.code === "storage/canceled") {

            errorMessage =
                "Image upload was canceled.";

        } else if (error.code === "permission-denied") {

            errorMessage =
                "Firestore permission denied. Check your database rules.";

        } else if (error.code === "unavailable") {

            errorMessage =
                "Firebase is temporarily unavailable. Check your connection.";

        } else if (error.code === "storage/unauthenticated") {

            errorMessage =
                "Your login session expired. Please log in again.";

        } else {

            errorMessage =
                `${error.code || "Error"}: ${error.message || "Please try again."}`;

        }

        showMessage(errorMessage, true);

    } finally {

        isSaving = false;

        submitButton.disabled = false;
        submitButton.textContent = "Create Recipe";

    }

});
