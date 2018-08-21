$(function() {
    "use strict";
    class Question {
        constructor(question, answers) {
            this.question = question;
            this.answers = answers;
        }
        static parse(data) {
            return new Question(data["question"], data["answers"]);
        }
        toJson() {
            return {
                question: this.question,
                answers: this.answers
            };
        }
    }
    /*
     * TODO: This is shitty code, I need to refactor it to be more object oriented.
     * In my defense I can't think straight in this pathetic excuse for a language
     */
    class QuestionResponse {
        constructor(questions) {
            this.questions = questions;
        }
        static parse(data) {
            var questions = [];
            data.questions.forEach(function(element) {
                questions.push(Question.parse(element));
            });
            return new QuestionResponse(questions);
        }
    }
    class QuestionRequest {
        constructor(kind, amount) {
            this.kind = kind;
            this.amount = amount;
            console.log("Created request");
        }
        get json() {
            return {
                kind: this.kind,
                amount: this.amount
            }
        }
        run(callback) {
            console.log(`Running request ${JSON.stringify(this.json)}`);
            $.ajax({
                url: "api/questions",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(this.json),
                converters: {
                    "text json": function(result) {
                        var result = JSON.parse(result);
                        var parsed = QuestionResponse.parse(result);
                        console.log(`Parsed ${JSON.stringify(result)} into ${parsed.questions.length}`);
                        return parsed;
                    }
                }
            }).done(callback)
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log("Failed: " + errorThrown);
                console.trace(errorThrown);
            }).always(function (a, textStatus, b) {
                console.log("Final status: " + textStatus);
            });
        }
    }
    $("#answerForm").on('submit', function(event) {
        $("#answerButton").trigger('click');
        event.preventDefault();
    })
    const QUESTION_AMOUNT = 20;
    function questionKind() {
        // TODO: Let people change this
        return "number";
    }
    var nameChart = null;
    var similarityWorker = null;
    function updateScoreboard(correct, total) {
        console.assert(correct <= total, `Correct ${correct} must be <= total ${total}`);
        console.assert(total <= 20, `Total ${total} must be less than 20`);
        var score = 'undefined';
        if (total != 0) {
            score = ((correct / total) * 100).toFixed(2) + '%';
        }
        $("#score").text(`Score: ${score}, Completed: ${total}/20`);
    }
    function renderQuestion(question) {
        if (question == null) {
            $("#question").text("Question: Loading");
        } else {
            $("#question").html(question.question);
        }
    }
    var remainingQuestions = [];
    var correctQuestions = 0;
    function currentQuestion() {
        return remainingQuestions[remainingQuestions.length - 1];
    }
    function totalQuestions() {
        return QUESTION_AMOUNT - remainingQuestions.length;
    }
    $("#loadQuestions").on('click', function() {
        updateScoreboard(0, 0);
        remainingQuestions = [];
        renderQuestion(null);
        new QuestionRequest(questionKind(), QUESTION_AMOUNT).run(function(response) {
            var jsonQuestions = response.questions.map(function(question) { return question.question; });
            console.log(`Loaded ${QUESTION_AMOUNT} questions: ${jsonQuestions}`);
            remainingQuestions = response.questions.slice();
            renderQuestion(currentQuestion());
        });
    });
    $("#answerButton").on('click', function() {
        var answer = $("#answerInput").val();
        var question = remainingQuestions.pop();
        if (question === undefined) {
            alert("Finished questions");
            return
        }
        if (question.answers.includes(answer)) {
            alert(`Correct answer: ${answer}`)
            correctQuestions += 1;
        } else {
            alert(`Incorrect answer ${answer}, expected ${question.answers}`)
        }
        updateScoreboard(correctQuestions, totalQuestions());
        renderQuestion(currentQuestion());
    })
});