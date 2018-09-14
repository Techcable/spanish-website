function damerau_levenshtein(first, second) {
    "use strict";
    // TODO: Support non-BMP characters (like that's ever going to happen)
    if (first == second) return 0;
    var firstLen = first.length;
    var secondLen = second.length;
    if (firstLen == 0) return secondLen;
    if (secondLen == 0) return firstLen;


    var distances = [];
    for (var i = 0; i < firstLen + 2; i++) {
        distances.push(Array(secondLen + 2).fill(0));
    }
    const maxDistance = firstLen + secondLen;
    distances[0][0] = maxDistance;

    for (var i = 0; i < firstLen + 1; i++) {
        distances[i + 1][0] = maxDistance;
        distances[i + 1][1] = i;
    }
    for (var j = 0; j < secondLen + 1; j++) {
        distances[0][j + 1] = maxDistance;
        distances[1][j + 1] = j;
    }

    var chars = new Map();

    for (var i = 1; i < firstLen + 1; i++) {
        var db = 0;
        for (var j = 1; j < secondLen + 1; j++) {
            var k = chars.get(second.charAt(j - 1));
            if (typeof k == 'undefined') {
                k = 0;
            }
            const l = db;
            var cost = 1;
            if (first[i - 1] == second[j - 1]) {
                cost = 0;
                db = j;
            }

            const substitutionCost = distances[i][j] + cost;
            const insertionCost = distances[i][j + 1] + 1;
            const deletionCost = distances[i + 1][j] + 1;
            const transpositionCost = distances[k][l] +
                (i - k -1) + 1 + (j - l - 1);
            distances[i + 1][j + 1] = Math.min(
                substitutionCost,
                insertionCost,
                deletionCost,
                transpositionCost
            );
        }
        chars.set(first[i - 1], i);
    }
    return distances[firstLen + 1][secondLen + 1];
}

// Utils
function createDiffFragment(original, revised, color_function) {
    const diff = JsDiff.diffChars(original, revised);
    var fragment = document.createDocumentFragment();

    diff.forEach(function(part) {
        var color = color_function(part);
        if (color != null) {
            var span = document.createElement('span');
            span.style.color = color;
            span.appendChild(document.createTextNode(part.value));
            fragment.appendChild(span);
        }
    })

    return fragment;
}

function minBy(target_array, func) {
    if (target_array.length < 1) return undefined;
    var smallest_element = target_array[0];
    var smallest_value = func(smallest_element);
    for (var i = 1; i < target_array.length; i++) {
        var element = target_array[i];
        var value = func(element);
        if (value < smallest_value) {
            smallest_element = element;
            smallest_value = value;
        }
    }
    return smallest_element;
}

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
        return $("#questionKind").val();
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
            $("#question").empty();
            // $("#questionSpinner").removeAttr("hidden");
            $("#answerStatus").empty();
            $("#continueButton").attr("hidden", "hidden");
        } else {
            $("#question").html(question.question);
            // $("#questionSpinner").attr("hidden", "hidden");
            $("#answerStatus").empty();
            $("#continueButton").attr("hidden", "hidden");
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
        correctQuestions = 0;
        renderQuestion(null);
        new QuestionRequest(questionKind(), QUESTION_AMOUNT).run(function(response) {
            var jsonQuestions = response.questions.map(function(question) { return question.question; });
            console.log(`Loaded ${QUESTION_AMOUNT} questions: ${jsonQuestions}`);
            remainingQuestions = response.questions.slice();
            renderQuestion(currentQuestion());
        });
    });
    $("#answerButton").on('click', function() {
        $("#answerStatus").empty();
        var answer = $("#answerInput").val();
        var question = remainingQuestions.pop();
        if (question === undefined) {
            alert("Finished questions");
            return
        }
        if (question.answers.includes(answer)) {
            $("#answerStatus").append(`<div class="alert alert-success" role="alert">Correct answer</div>`);
            correctQuestions += 1;
        } else {
            const actual = answer;
            const expected = question.answers;
            const closestExpected = minBy(expected, function(element) {
                return damerau_levenshtein(element, actual);
            });
            $("#answerStatus").append(`<div class="alert alert-danger" role="alert">Incorrect answer</div>`);
            // NOTE: Modeled after Quizlet
            var correctDiff = createDiffFragment(closestExpected, actual, function(part) {
                if (part.added) return 'green';
                else if (part.removed) return null;
                else return 'black';
            })
            var yourDiff = createDiffFragment(closestExpected, actual, function(part) {
                if (part.added) return null;
                else if (part.removed) return 'red';
                else return 'black';
            });
            $("#answerStatus").append($("<p>").append("Correct answer: ").append(correctDiff));
            $("#answerStatus").append($("<p>").append("Your answer: ").append(yourDiff))
        }
        $("#continueButton").removeAttr("hidden");
    })
    $("#continueButton").on('click', function() {
        console.log("Advancing to next question")
        $("#answerStatus").empty();
        updateScoreboard(correctQuestions, totalQuestions());
        renderQuestion(currentQuestion());
    })
});