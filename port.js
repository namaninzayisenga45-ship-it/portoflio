
const text = document.getElementById("typing-text");

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