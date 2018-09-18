#![feature(plugin, decl_macro)]
#![plugin(rocket_codegen)]

extern crate rocket;
extern crate rocket_contrib;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate spanish_website;
extern crate parking_lot;
extern crate rand;

use std::io;
use std::path::{Path, PathBuf};

use rocket::response::{NamedFile};
use rocket_contrib::Json;

use spanish_website::{Question, SpanishProblemKind};

#[derive(Debug, Deserialize)]
struct QuestionRequest {
    kind: SpanishProblemKind,
    amount: u32
}
#[derive(Debug, Serialize)]
struct QuestionResponse {
    questions: Vec<Question>
}

const MAXIMUM_QUESTIONS: u32 = 100;
#[post("/api/questions", format = "application/json", data = "<request>")]
fn questions(request: Json<QuestionRequest>) -> Json<QuestionResponse> {
    let request: QuestionRequest = request.into_inner();
    let mut rng = ::rand::thread_rng();
    assert!(request.amount <= MAXIMUM_QUESTIONS);
    let mut questions = Vec::with_capacity(request.amount as usize);
    for _ in 0..request.amount {
        questions.push(request.kind.generate_question(&mut rng))
    }
    Json(QuestionResponse { questions })
}

fn main() {
    rocket::ignite().mount("/", routes![questions]).launch();
}
