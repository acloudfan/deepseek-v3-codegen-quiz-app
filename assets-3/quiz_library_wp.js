// quiz_library_wp.js

// Global variable to store quiz data
let quizData;

// Function to initialize the quiz
function initialize_quiz() {
    // Assume quiz_data is loaded from quiz_data.js
    quizData = window.quiz_data;

    // Set the title and description in the DOM
    document.getElementById("quiz-title").innerText = quizData.title;
    document.getElementById("quiz-description").innerText = quizData.description;

    // Render the quiz questions
    render_quiz(quizData.questions);
}

// Function to render the quiz questions
function render_quiz(questions) {
    const quizContainer = document.getElementById("quiz-container");
    quizContainer.innerHTML = ""; // Clear previous content

    questions.forEach((question, index) => {
        // Create a div for each question
        const questionDiv = document.createElement("div");
        questionDiv.className = `question ${index % 2 === 0 ? "even" : "odd"}`;
        questionDiv.innerHTML = `<h3>Question ${index + 1}: ${question.text}</h3>`;

        // Render choices
        const choicesList = document.createElement("ul");
        question.choices.forEach((choice, choiceIndex) => {
            const choiceItem = document.createElement("li");
            const inputType = question.choices.filter(c => c.correct).length > 1 ? "checkbox" : "radio";
            choiceItem.innerHTML = `
                <input type="${inputType}" name="question${index}" value="${choice.answer}" id="question${index}_choice${choiceIndex}">
                <label for="question${index}_choice${choiceIndex}">${String.fromCharCode(65 + choiceIndex)}. ${choice.answer}</label>
            `;
            choicesList.appendChild(choiceItem);
        });
        questionDiv.appendChild(choicesList);

        // Append question to the container
        quizContainer.appendChild(questionDiv);
    });

    // Add the "Score" button
    const scoreButton = document.createElement("button");
    scoreButton.innerText = "Score";
    scoreButton.onclick = score_quiz;
    quizContainer.appendChild(scoreButton);
}

// Function to score the quiz
function score_quiz() {
    const questions = quizData.questions;
    let unansweredQuestions = [];
    let score = 0;

    questions.forEach((question, index) => {
        const selectedChoices = Array.from(document.querySelectorAll(`input[name="question${index}"]:checked`));
        if (selectedChoices.length === 0) {
            unansweredQuestions.push(index + 1);
        } else {
            const correctAnswers = question.choices.filter(c => c.correct).map(c => c.answer);
            const userAnswers = selectedChoices.map(input => input.value);
            if (JSON.stringify(correctAnswers.sort()) === JSON.stringify(userAnswers.sort())) {
                score++;
            }
        }
    });

    // Check if all questions are answered
    if (unansweredQuestions.length > 0) {
        alert(`Please answer all questions! (Unanswered questions: ${unansweredQuestions.join(", ")})`);
        return;
    }

    // Highlight correct and incorrect answers
    questions.forEach((question, index) => {
        const choices = document.querySelectorAll(`input[name="question${index}"]`);
        choices.forEach((input, choiceIndex) => {
            const label = input.nextElementSibling;
            if (question.choices[choiceIndex].correct) {
                label.style.color = "darkgreen";
            } else if (input.checked) {
                label.style.color = "darkred";
            }
        });

        // Show explanation if available
        if (question.explanation) {
            const explanationDiv = document.createElement("div");
            explanationDiv.innerHTML = `<strong>Explanation:</strong> ${question.explanation}`;
            document.querySelector(`.question:nth-child(${index + 1})`).appendChild(explanationDiv);
        }

        // Show references if available
        if (question.references && question.references.length > 0) {
            const referencesDiv = document.createElement("div");
            referencesDiv.innerHTML = `<strong>References:</strong><ul>${question.references.map(ref => `<li><a href="${ref.url}" target="_blank">${ref.title}</a></li>`).join("")}</ul>`;
            document.querySelector(`.question:nth-child(${index + 1})`).appendChild(referencesDiv);
        }
    });

    // Display the score
    const scoreDiv = document.createElement("div");
    scoreDiv.innerHTML = `<h3>Your score is ${score}/${questions.length}</h3>`;
    document.getElementById("quiz-container").appendChild(scoreDiv);

    // Disable inputs
    document.querySelectorAll("input").forEach(input => (input.disabled = true));

    // Hide the "Score" button and show the "Retake quiz" button
    document.querySelector("button").style.display = "none";
    const retakeButton = document.createElement("button");
    retakeButton.innerText = "Retake quiz";
    retakeButton.onclick = reset_quiz;
    document.getElementById("quiz-container").appendChild(retakeButton);
}

// Function to reset the quiz
function reset_quiz() {
    // Clear previous content
    document.getElementById("quiz-container").innerHTML = "";

    // Shuffle questions randomly
    const shuffledQuestions = quizData.questions.sort(() => Math.random() - 0.5);

    // Re-render the quiz
    render_quiz(shuffledQuestions);

    // Reset styles
    document.querySelectorAll("label").forEach(label => (label.style.color = "black"));
}