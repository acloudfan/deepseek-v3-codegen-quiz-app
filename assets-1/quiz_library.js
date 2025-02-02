// quiz_library.js

const quiz_library = (function () {
    let quizData = null;

    // Helper function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Initialize the quiz by loading the JSON data
    function initialize_quiz() {
        fetch('quiz_data.json')
            .then(response => response.json())
            .then(data => {
                quizData = data;
                document.getElementById('quiz-title').innerText = quizData.title;
                document.getElementById('quiz-description').innerText = quizData.description;
                render_quiz(quizData.questions);
            })
            .catch(error => console.error('Error loading quiz data:', error));
    }

    // Render the quiz questions and choices
    function render_quiz(questions) {
        const quizContainer = document.getElementById('quiz-container');
        quizContainer.innerHTML = ''; // Clear previous content

        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = `question ${index % 2 === 0 ? 'even' : 'odd'}`;
            questionDiv.innerHTML = `<h3>Question ${index + 1}: ${question.text}</h3>`;

            // Shuffle choices
            const shuffledChoices = shuffleArray([...question.choices]);

            // Render choices
            shuffledChoices.forEach((choice, choiceIndex) => {
                const choicePrefix = String.fromCharCode(65 + choiceIndex); // A, B, C, etc.
                const inputType = question.choices.filter(c => c.correct).length > 1 ? 'checkbox' : 'radio';
                questionDiv.innerHTML += `
                    <label>
                        <input type="${inputType}" name="question${index}" value="${choice.answer}">
                        ${choicePrefix}. ${choice.answer}
                    </label><br>
                `;
            });

            quizContainer.appendChild(questionDiv);
        });

        // Add the "Score" button
        const scoreButton = document.createElement('button');
        scoreButton.innerText = 'Score';
        scoreButton.onclick = score_quiz;
        quizContainer.appendChild(scoreButton);
    }

    // Score the quiz
    function score_quiz() {
        const questions = quizData.questions;
        let unansweredQuestions = [];
        let score = 0;

        questions.forEach((question, index) => {
            const selectedAnswers = Array.from(document.querySelectorAll(`input[name="question${index}"]:checked`)).map(input => input.value);
            if (selectedAnswers.length === 0) {
                unansweredQuestions.push(index + 1);
            } else {
                const correctAnswers = question.choices.filter(choice => choice.correct).map(choice => choice.answer);
                if (JSON.stringify(selectedAnswers.sort()) === JSON.stringify(correctAnswers.sort())) {
                    score++;
                }
            }
        });

        if (unansweredQuestions.length > 0) {
            alert(`Please answer all questions (Unanswered questions: ${unansweredQuestions.join(', ')})!!!`);
            return;
        }

        // Display score
        const scoreDisplay = document.createElement('div');
        scoreDisplay.id = 'score-display';
        scoreDisplay.innerHTML = `<h3>Your score is ${score}/${questions.length}</h3>`;
        document.getElementById('quiz-container').appendChild(scoreDisplay);

        // Highlight correct and incorrect answers
        questions.forEach((question, index) => {
            const choices = document.querySelectorAll(`input[name="question${index}"]`);
            choices.forEach(input => {
                const label = input.parentElement;
                const choiceText = input.value;
                const isCorrect = question.choices.find(choice => choice.answer === choiceText && choice.correct);

                if (isCorrect) {
                    label.style.color = 'darkgreen';
                } else if (input.checked) {
                    label.style.color = 'darkred';
                }

                input.disabled = true; // Disable inputs
            });

            // Show explanation and references
            const questionDiv = document.querySelector(`.question:nth-child(${index + 1})`);
            if (question.explanation) {
                questionDiv.innerHTML += `<p><strong>Explanation:</strong> ${question.explanation}</p>`;
            }
            if (question.references && question.references.length > 0) {
                questionDiv.innerHTML += `<p><strong>References:</strong></p><ul>`;
                question.references.forEach(ref => {
                    questionDiv.innerHTML += `<li><a href="${ref.url}" target="_blank">${ref.title}</a></li>`;
                });
                questionDiv.innerHTML += `</ul>`;
            }
        });

        // Replace "Score" button with "Retake Quiz" button
        const scoreButton = document.querySelector('button');
        scoreButton.innerText = 'Retake Quiz';
        scoreButton.onclick = reset_quiz;
    }

    // Reset the quiz
    function reset_quiz() {
        const quizContainer = document.getElementById('quiz-container');
        quizContainer.innerHTML = ''; // Clear all content
        render_quiz(quizData.questions); // Re-render the quiz
    }

    return {
        initialize_quiz,
        render_quiz,
        score_quiz,
        reset_quiz
    };
})();

// Initialize the quiz when the script loads
window.onload = quiz_library.initialize_quiz;