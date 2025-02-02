// quiz_library.js

class QuizLibrary {
    constructor() {
        this.quizData = null;
    }

    // Initialize the quiz by loading the JSON data from the provided URL and rendering the quiz
    async initialize_quiz(url) {
        try {
            const response = await fetch(url);
            this.quizData = await response.json();
            this.render_quiz(this.quizData.questions);
            this.setQuizTitleAndDescription();
        } catch (error) {
            console.error('Error loading quiz data:', error);
            alert('Failed to load quiz data. Please check the URL and try again.');
        }
    }

    // Set the quiz title and description in the DOM
    setQuizTitleAndDescription() {
        document.getElementById('quiz-title').innerText = this.quizData.title;
        document.getElementById('quiz-description').innerText = this.quizData.description;
    }

    // Render the quiz questions and choices in the DOM
    render_quiz(questions) {
        const quizContainer = document.getElementById('quiz-container');
        quizContainer.innerHTML = ''; // Clear previous content

        questions.forEach((question, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = `question ${index % 2 === 0 ? 'even' : 'odd'}`;

            // Add question text
            const questionText = document.createElement('p');
            questionText.innerHTML = `<strong>Question ${index + 1}:</strong> ${question.text}`;
            questionDiv.appendChild(questionText);

            // Add choices
            question.choices.forEach((choice, choiceIndex) => {
                const choiceLabel = document.createElement('label');
                const choiceInput = document.createElement('input');
                choiceInput.type = question.choices.filter(c => c.correct).length > 1 ? 'checkbox' : 'radio';
                choiceInput.name = `question-${index}`;
                choiceInput.value = choice.answer;
                choiceLabel.appendChild(choiceInput);
                choiceLabel.appendChild(document.createTextNode(` ${String.fromCharCode(65 + choiceIndex)}. ${choice.answer}`));
                questionDiv.appendChild(choiceLabel);
                questionDiv.appendChild(document.createElement('br'));
            });

            quizContainer.appendChild(questionDiv);
        });

        // Add "Score" button
        const scoreButton = document.createElement('button');
        scoreButton.innerText = 'Score';
        scoreButton.addEventListener('click', () => this.score_quiz());
        quizContainer.appendChild(scoreButton);
    }

    // Score the quiz and display results
    score_quiz() {
        const questions = this.quizData.questions;
        let unansweredQuestions = [];
        let score = 0;

        questions.forEach((question, index) => {
            const selectedChoices = Array.from(document.querySelectorAll(`input[name="question-${index}"]:checked`)).map(input => input.value);
            if (selectedChoices.length === 0) {
                unansweredQuestions.push(index + 1);
            } else {
                const correctAnswers = question.choices.filter(choice => choice.correct).map(choice => choice.answer);
                if (JSON.stringify(selectedChoices.sort()) === JSON.stringify(correctAnswers.sort())) {
                    score++;
                }
            }
        });

        if (unansweredQuestions.length > 0) {
            alert(`Please answer all questions (Unanswered questions: ${unansweredQuestions.join(', ')})!!!`);
            return;
        }

        // Display score
        const scoreDisplay = document.createElement('p');
        scoreDisplay.innerHTML = `<strong>Your score is ${score}/${questions.length}</strong>`;
        document.getElementById('quiz-container').appendChild(scoreDisplay);

        // Highlight correct and incorrect answers
        questions.forEach((question, index) => {
            const choices = document.querySelectorAll(`input[name="question-${index}"]`);
            choices.forEach((choice, choiceIndex) => {
                const choiceLabel = choice.parentElement;
                if (question.choices[choiceIndex].correct) {
                    choiceLabel.style.color = 'darkgreen';
                } else if (choice.checked) {
                    choiceLabel.style.color = 'darkred';
                }
                choice.disabled = true;
            });

            // Show explanation if available
            if (question.explanation) {
                const explanationDiv = document.createElement('p');
                explanationDiv.innerHTML = `<strong>Explanation:</strong> ${question.explanation}`;
                document.querySelector(`.question:nth-child(${index + 1})`).appendChild(explanationDiv);
            }

            // Show references if available
            if (question.references && question.references.length > 0) {
                const referencesDiv = document.createElement('div');
                referencesDiv.innerHTML = `<strong>References:</strong><ul>${question.references.map(ref => `<li><a href="${ref.url}" target="_blank">${ref.title}</a></li>`).join('')}</ul>`;
                document.querySelector(`.question:nth-child(${index + 1})`).appendChild(referencesDiv);
            }
        });

        // Hide "Score" button and show "Retake Quiz" button
        document.querySelector('button').style.display = 'none';
        const retakeButton = document.createElement('button');
        retakeButton.innerText = 'Retake Quiz';
        retakeButton.addEventListener('click', () => this.reset_quiz());
        document.getElementById('quiz-container').appendChild(retakeButton);
    }

    // Reset the quiz to its initial state
    reset_quiz() {
        const quizContainer = document.getElementById('quiz-container');
        quizContainer.innerHTML = ''; // Clear all content
        this.render_quiz(this.quizData.questions); // Re-render the quiz
    }
}