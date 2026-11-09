
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import { firebaseConfig } from "./firebase-config.js";



const app = initializeApp(firebaseConfig);
const auth = getAuth(app);




const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#main-nav");

if (menuButton && navigation) {

    menuButton.addEventListener("click", () => {

        const isOpen = navigation.classList.toggle("open");

        menuButton.setAttribute("aria-expanded", String(isOpen));

    });

    navigation.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navigation.classList.remove("open");

            menuButton.setAttribute("aria-expanded", "false");

        });

    });

}




function showMessage(id, message, isError = false) {

    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = message;

    element.classList.toggle("error", isError);

}




function handleError(error) {

    console.error("Firebase Error:", error);

    const errors = {

        "auth/email-already-in-use":
            "This email is already registered.",

        "auth/invalid-email":
            "Please enter a valid email address.",

        "auth/weak-password":
            "Password must contain at least 6 characters.",

        "auth/invalid-credential":
            "Incorrect email or password.",

        "auth/too-many-requests":
            "Too many attempts. Please try again later.",

        "auth/network-request-failed":
            "Check your internet connection."

    };

    return errors[error.code] || "Something went wrong. Please try again.";

}




const signupForm = document.querySelector("#signup-form");

if (signupForm) {

    signupForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const firstName =
            signupForm.elements.firstName.value.trim();

        const lastName =
            signupForm.elements.lastName.value.trim();

        const email =
            signupForm.elements.email.value.trim();

        const password =
            signupForm.elements.password.value;

        try {

            
            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            
            await updateProfile(userCredential.user, {

                displayName: `${firstName} ${lastName}`

            });

            
            await userCredential.user.reload();

            showMessage(
                "signup-message",
                `Welcome, ${firstName} ${lastName}! Your account was created successfully.`
            );

            
            window.location.href = "index.html";

        } catch (error) {

            showMessage(
                "signup-message",
                handleError(error),
                true
            );

        }

    });

}



const loginForm = document.querySelector("#login-form");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            loginForm.elements.email.value.trim();

        const password =
            loginForm.elements.password.value;

        try {

            
            const userCredential =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            
            await userCredential.user.reload();

            
            const user = auth.currentUser;

           
            const name = user.displayName || user.email;

            showMessage(
                "login-message",
                `Welcome back, ${name}!`
            );

           
            window.location.href = "index.html";

        } catch (error) {

            showMessage(
                "login-message",
                handleError(error),
                true
            );

        }

    });

}




onAuthStateChanged(auth, (user) => {

    const authLinks =
        document.querySelectorAll("[data-auth-link]");

    
    authLinks.forEach(link => {

        if (user) {

            link.textContent = "Logout";

            link.href = "#logout";

            link.onclick = async (event) => {

                event.preventDefault();

                try {

                    await signOut(auth);

                    window.location.href = "index.html";

                } catch (error) {

                    console.error("Logout error:", error);

                }

            };

        } else {

            link.textContent = "Login";

            link.href = "login.html";

            link.onclick = null;

        }

    });


    // Remove previous greeting
    const oldGreeting =
        document.querySelector("#user-greeting");

    if (oldGreeting) {

        oldGreeting.remove();

    }


    // Display logged-in user's name
    if (user && navigation) {

        const greeting = document.createElement("span");

        greeting.id = "user-greeting";

        greeting.className = "user-greeting";

        greeting.textContent =
            `Welcome, ${user.displayName || user.email}!`;

        // Insert greeting before logout
        const loginLink =
            navigation.querySelector("[data-auth-link]");

        if (loginLink) {

            navigation.insertBefore(greeting, loginLink);

        }

    }

});
