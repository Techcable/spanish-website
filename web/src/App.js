import React, { Component } from 'react';
import './App.css';
import { Alert, Form, Label, Button, Card, CardBody,
    CardHeader, CardText, Input, FormGroup, Container, Col, Row } from 'reactstrap';
import { damerau_levenshtein, minBy, createDiffFragment, allElementsEqual } from './utils.js';
import $ from 'jquery';

class QuestionForm extends Component {
    constructor(props) {
        super(props);
        this.state = {questionKind: 'number'};
        // This binding is necessary to make `this` work in the callback
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(event) {
        console.log(`Loading ${this.state.questionKind} questions after submit`);
        this.props.onLoadQuestions(this.state.questionKind);
        event.preventDefault();
    }

    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <Label for="questionKind">Question mode:</Label>
                <Input type="select" id="questionKind" value={this.state.questionKind}
                    onChange={(e) => this.setState({questionKind: e.target.value})}>
                    <option value="number">Numbers</option>
                    <option value="shapes">Shapes & Colors</option>
                </Input>
                <Button type="submit" color="primary">Load Questions</Button>
            </Form>
        );
    }
}

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
    equals(other) {
        return this.question == other.question &&
            allElementsEqual(this.answers, other.answers, (first, second) => first == second);
    }
    toString() {
        return `Question { question = ${this.question}, answers = ${this.answers} }`
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
class GradedQuestion {
    constructor(question, actualAnswer) {
        if (question == null) throw new Error("Invalid question");
        if (actualAnswer == null) throw new Error("Invalid actualAnswer");
        this.question = question;
        this.actualAnswer = actualAnswer;
        this.correct = question.answers.includes(actualAnswer);
        if (this.correct) {
            this.closestExpected = actualAnswer;
        } else {
            this.closestExpected = minBy(question.answers, (element) => damerau_levenshtein(element, actualAnswer));
        }
    }
}


function QuestionCard(props) {
    const question = props.question;
    return (
    <Card>
        <CardHeader>Questions</CardHeader>
        <CardBody>
            {question != null ? (<div dangerouslySetInnerHTML={{__html: question.question}} />)
                : (<Alert color="primary">Finished all questions</Alert>)}
        </CardBody>
    </Card>
    );
}
function AnswerStatusCard(props) {
    const gradedQuestion = props.gradedQuestion;
    if (gradedQuestion == null) return null;
    return (
        <Card>
            <AnswerStatus gradedQuestion={gradedQuestion} />
            <Button color="primary" onClick={props.onNextQuestion}>Next Question</Button>
        </Card>
    );
}

function AnswerStatus(props) {
    const gradedQuestion = props.gradedQuestion;
    if (gradedQuestion == null) {
        return null;
    } else if (gradedQuestion.correct) {
        return (
            <Alert color="success">Correct answer</Alert>
        );
    } else {
        // NOTE: Modeled after Quizlet
        const correctDiff = createDiffFragment(gradedQuestion.closestExpected, gradedQuestion.actualAnswer, (part) => {
            if (part.added) return 'green';
            else if (part.removed) return null;
            else return 'black';
        });
        const yourDiff = createDiffFragment(gradedQuestion.closestExpected, gradedQuestion.actualAnswer, (part) => {
            if (part.added) return null;
            else if (part.removed) return 'red';
            else return 'black';
        })
        return (
            <React.Fragment>
                <Alert color="danger">Incorrect answer</Alert>
                <p>Correct answer: {correctDiff}</p>
                <p>Your answer: {yourDiff}</p>
            </React.Fragment>
        );
    }
}
class AnswerForm extends Component {
    constructor(props) {
        super(props);
        this.state = { answerInput: '' };
        // This binding is necessary to make `this` work in the callback
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.onSubmitAnswer(this.state.answerInput);
    }
    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <FormGroup>
                    <Label for="answerInput">Answer</Label>
                    <Input type="text" id="answerInput"
                        value={this.state.value}
                        onChange={(e) => this.setState({answerInput: e.target.value})} placeholder="Enter answer" />
                </FormGroup>
                <Button type="submit" color="primary">Submit</Button>
            </Form>
        );
    }
}

class SessionRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            remainingQuestions: null,
            questions: null,
            gradedQuestion: null
        };
        // This binding is necessary to make `this` work in the callback
        this.handleAnswer = this.handleAnswer.bind(this);
        this.nextQuestion = this.nextQuestion.bind(this);
    }
    get hasQuestions() {
        return this.state.questions != null;
    }

    nextQuestion() {
        this.setState((state, props) => {
            return {
                remainingQuestions: state.remainingQuestions.slice(1),
                gradedQuestion: null
            };
        });
    }
    handleAnswer(answer) {
        this.setState({gradedQuestion: new GradedQuestion(this.currentQuestion(), answer)});
    }
    currentQuestion() {
        if (!this.hasQuestions) throw new Error("Missing questions");
        const remainingQuestions = this.state.remainingQuestions;
        if (remainingQuestions == null) throw new Error(`Missing remainingQuestions with questions = ${this.props.questions}`);
        return remainingQuestions.length > 0 ? remainingQuestions[0] : null;
    }
    static getDerivedStateFromProps(props, state) {
        if (!allElementsEqual(props.questions, state.questions, (first, second) => first.equals(second))) {
            return {
                remainingQuestions: props.questions != null ? props.questions.slice() : null,
                questions: props.questions != null ? props.questions.slice() : null,
            };
        } else {
            return null;
        }
    }
    render() {
        if (!this.hasQuestions) return null;
        return (
            <React.Fragment>
                <Col size="lg">
                    <QuestionCard question={this.currentQuestion()} />
                </Col>
                <Col size="lg">
                    <AnswerForm onSubmitAnswer={this.handleAnswer} />
                    <AnswerStatusCard onNextQuestion={this.nextQuestion}
                        gradedQuestion={this.state.gradedQuestion} />
                </Col>
            </React.Fragment>
        );
    }
}

const QUESTION_AMOUNT = 20;

class App extends Component {
/*

<div class="container">
    <div class="row">
        <div class="col-lg">
            <!-- TODO: It'd be nice to make this part of the nav somehow
            <form id="questionForm">
                <label for="questionKind">Question mode:</label>
                <select id="questionKind" class="form-control">
                    <option value="number">Number</option>
                    <option value="shapes">Shapes & Colors</option>
                </select>
                <button type="button" id="loadQuestions" class="btn btn-primary">Load Questions</button>
            </form>
        </div>
    </div>
    <div hidden="hidden" id="app" class="card">
        <div class="card-header" id="appHeader"></div>
        <div class="card-body" id="appBody"></div>
    </div>

</div>*/
    constructor(props) {
        super(props);

        this.state = {
            questionKind: null,
            questions: null
        };
        // This binding is necessary to make `this` work in the callback
        this.loadQuestions = this.loadQuestions.bind(this);
    }

    loadQuestions(kind) {
        this.setState({questionKind: kind, questions: null});
        // TODO: Inseret a loading spinner
        new QuestionRequest(kind, QUESTION_AMOUNT).run((response) => {
            this.setState({questions: response.questions});
        });
    }


    render() {
        return (
            <Container>
                <Row>
                    <Col size="lg">
                        <QuestionForm onLoadQuestions={this.loadQuestions}/>
                    </Col>
                </Row>
                <Row>
                    <SessionRow questions={this.state.questions}/>
                </Row>
            </Container>
        );
    }
}

export default App;
