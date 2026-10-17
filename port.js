const text = document.getElementById("typing-text");

if (text) {

    text.style.color = "#26DFB1";

    const words = [
        "FRONTEND DEVELOPER",
        "UI/UX DESIGNER",
        "YOUTUBER"
    ];

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function typeEffect() {

        const currentWord = words[wordIndex];

        if (!deleting) {

            text.textContent = currentWord.substring(
                0,
                charIndex + 1
            );

            charIndex++;

            if (charIndex === currentWord.length) {

                deleting = true;

                setTimeout(typeEffect, 100);

                return;
            }

            setTimeout(typeEffect, 100);

        } else {

            text.textContent = currentWord.substring(
                0,
                charIndex - 1
            );

            charIndex--;

            if (charIndex === 0) {

                deleting = false;

                wordIndex++;

                if (wordIndex === words.length) {
                    wordIndex = 0;
                }

                setTimeout(typeEffect, 500);

                return;
            }

            setTimeout(typeEffect, 60);
        }
    }

    typeEffect();
}


const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

if (password && togglePassword) {

    togglePassword.addEventListener("click", function () {

        if (password.type === "password") {

            password.type = "text";

        } else {

            password.type = "password";

        }

    });

}

const loginPassword = document.getElementById("loginPassword");
const loginTogglePassword = document.getElementById("loginTogglePassword");

if (loginPassword && loginTogglePassword) {

    loginTogglePassword.addEventListener("click", function () {

        if (loginPassword.type === "password") {
            loginPassword.type = "text";
        } else {
            loginPassword.type = "password";
        }

    });

}


const menuToggle = document.getElementById("menuToggle");
const menuOverlay = document.getElementById("menuOverlay");
const mainMenu = document.getElementById("mainMenu");

if (menuToggle && menuOverlay && mainMenu) {

    function closeMenu() {
        document.body.classList.remove("menu-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
    }

    menuToggle.addEventListener("click", function () {
        const isOpen = document.body.classList.toggle("menu-open");

        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close menu" : "Open menu"
        );
    });

    menuOverlay.addEventListener("click", closeMenu);

    mainMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeMenu();
        }
    });
}


/* LOAD NEW PROJECTS FROM SUPABASE */

if (window.supabase) {
    const projectDatabase = window.supabase.createClient(
        "https://ohkvknhqbknocrytirbp.supabase.co",
        "sb_publishable_E_TagxG-byimvX81ZsEGOw_F-gUyL45"
    );

    async function loadPortfolioProjects() {
        const container = document.getElementById("portfolioProjects");

        if (!container) return;

        const { data, error } = await projectDatabase
            .from("projects")
            .select("id, title, description, image_url, project_url")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Projects could not load:", error.message);
            return;
        }

        data.forEach((project) => {
            const card = document.createElement("div");
            card.className = "image-box";

            if (project.image_url) {
                const image = document.createElement("img");
                image.src = project.image_url;
                image.alt = project.title;
                image.width = 380;
                image.height = 188;
                card.appendChild(image);
            }

            const mask = document.createElement("div");
            mask.className = "mask";

            const heading = document.createElement("h3");
            heading.textContent = project.title;

            const description = document.createElement("p");
            description.textContent = project.description || "";

            mask.append(heading, description);
            card.appendChild(mask);
            container.appendChild(card);
        });
    }

async function loadPortfolioSkills() {
    const { data, error } = await projectDatabase
        .from("skills")
        .select("name, level")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Skills could not load:", error.message);
        return;
    }

    const skillsContainer = document.getElementById("dynamicSkills");
    const levelsContainer = document.getElementById("dynamicLevels");

    if (!skillsContainer || !levelsContainer) return;

    skillsContainer.replaceChildren();
    levelsContainer.replaceChildren();

    data.forEach((skill) => {
        const name = document.createElement("p");
        name.textContent = skill.name;
        skillsContainer.appendChild(name);

        if (skill.level) {
            const level = document.createElement("p");
            level.textContent = skill.level;
            levelsContainer.appendChild(level);
        }
    });
}



    loadPortfolioProjects();
    loadPortfolioSkills();


    const contactForm = document.getElementById("contactForm");

    if (contactForm) {
        contactForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const name = document.getElementById("visitorName").value.trim();
            const email = document.getElementById("visitorEmail").value.trim();
            const content = document.getElementById("visitorMessage").value.trim();
            const sendButton = document.getElementById("send");
            const contactStatus = document.getElementById("contactStatus");

            sendButton.disabled = true;
            sendButton.textContent = "Sending...";
            contactStatus.textContent = "";

            try {
                const { error } = await projectDatabase
                    .from("messages")
                    .insert([{ name, email, content }]);

                if (error) throw error;

                contactStatus.textContent = "Message sent successfully!";
                contactForm.reset();

            } catch (error) {
                console.error(error);
                contactStatus.textContent =
                    "Message could not be sent. Please try again.";
            } finally {
                sendButton.disabled = false;
                sendButton.textContent = "Send";
            }
        });
    }

}



function goToBlog() {
    const button = document.getElementById("seeMoreBtn");

    button.textContent = "Loading...";
    button.disabled = true;

    setTimeout(() => {
        window.location.href = "blog.html";
    }, 1000);
}

document.querySelectorAll('a[href$=".jpeg"] button#read').forEach(button => {
    button.addEventListener("click", function (event) {
        event.preventDefault();

        const link = this.parentElement.href;

        this.textContent = "Loading...";
        this.disabled = true;

        setTimeout(() => {
            window.location.href = link;
        }, 700);
    });
});

window.addEventListener("pageshow", function () {
    document.querySelectorAll('a[href$=".jpeg"] button#read').forEach(button => {
        button.textContent = "Read More";
        button.disabled = false;
    });
});
document.querySelectorAll(".see-more-classroom").forEach(function (button) {
    const originalText = button.textContent;

    window.addEventListener("pageshow", function () {
        button.textContent = originalText;
        button.disabled = false;
    });

    button.addEventListener("click", function () {
        button.textContent = "Loading...";
        button.disabled = true;

        setTimeout(function () {
            window.location.href =
                "https://classroom.google.com/c/ODU5ODMyNzIzMjc5";
        }, 1500);
    });
});