extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate rand;

mod numbers;
mod shapes;

use rand::prelude::*;

use numbers::NumberProblemKind;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Question {
    question: String,
    answers: Vec<String>
}


#[derive(Copy, Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SpanishProblemKind {
    Number,
    Shapes
}
impl SpanishProblemKind {
    pub fn generate_question<T: Rng>(&self, rng: &mut T) -> Question {
        match *self {
            SpanishProblemKind::Number => NumberProblemKind::choose(rng)
                .generate_question(rng),
            SpanishProblemKind::Shapes => ::shapes::generate_question(rng)
        }
    }
}


