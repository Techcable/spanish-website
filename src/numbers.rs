use rand::Rng;

use Question;

#[derive(Copy, Clone, Debug, Serialize, Deserialize)]
#[serde(rename = "snake_case")]
pub enum NumberProblemKind {
    ReadArithmetic,
    WriteArithmetic
}
impl NumberProblemKind {
    pub fn generate_question<T: Rng>(&self, rng: &mut T) -> Question {
        match *self {
            NumberProblemKind::ReadArithmetic => {
                let problem = ArithmeticKind::choose(rng).generate_problem(rng);
                problem.reading_question(rng)
            },
            NumberProblemKind::WriteArithmetic => {
                let problem = ArithmeticKind::choose(rng).generate_problem(rng);
                problem.writing_question(rng)
            }
        }
    }
    pub fn choose<T: Rng>(rng: &mut T) -> NumberProblemKind {
        *rng.choose(&[NumberProblemKind::ReadArithmetic, NumberProblemKind::WriteArithmetic]).unwrap()
    }
}
const MAXIMUM_NUMBER: u32 = 100;
#[derive(Copy, Clone, Debug)]
enum ArithmeticKind {
    Addition,
    Subtraction,
    Multiplication,
    Division
}
impl ArithmeticKind {
    pub fn spanish_verbs(self) -> &'static [&'static str] {
        match self {
            ArithmeticKind::Addition => &["y", "más"],
            ArithmeticKind::Subtraction => &["menos"],
            ArithmeticKind::Multiplication => &["por"],
            ArithmeticKind::Division => &["dividido por", "dividido entre"],
        }
    }
    pub fn verb(self) -> &'static str {
        match self {
            ArithmeticKind::Addition => "plus",
            ArithmeticKind::Subtraction => "minus",
            ArithmeticKind::Multiplication => "times",
            ArithmeticKind::Division => "divided by",
        }
    }
    pub fn symbol(self) -> char {
        match self {
            ArithmeticKind::Addition => '+',
            ArithmeticKind::Subtraction => '-',
            ArithmeticKind::Multiplication => '*',
            ArithmeticKind::Division => '/',
        }
    }
    pub fn generate_problem<T: Rng>(self, rng: &mut T) -> ArithmeticProblem {
        let (left, right) = match self {
            ArithmeticKind::Addition => {
                let first = rng.gen_range(0, MAXIMUM_NUMBER + 1);
                let maximum_second = MAXIMUM_NUMBER - first;
                let second = rng.gen_range(0, maximum_second + 1);
                (first, second)
            },
            ArithmeticKind::Subtraction => {
                let first = rng.gen_range(0, MAXIMUM_NUMBER);
                let second = rng.gen_range(0, first + 1);
                (first, second)
            },
            ArithmeticKind::Multiplication => {
                let first = rng.gen_range(0, MAXIMUM_NUMBER);
                let second = rng.gen_range(0, if first != 0 { MAXIMUM_NUMBER / first } else { MAXIMUM_NUMBER });
                (first, second)
            },
            ArithmeticKind::Division => {
                // NOTE: We only want exact divisors, so we just reverse a multiplication problem
                let first = rng.gen_range(0, MAXIMUM_NUMBER);
                let multiple = rng.gen_range(0, if first != 0 { MAXIMUM_NUMBER / first } else { MAXIMUM_NUMBER });
                let second = if first == 0 || multiple == 0 { 1 } else { first * multiple };
                (first, second)
            },
        };
        ArithmeticProblem { left, right, kind: self }
    }
    pub fn choose<T: Rng>(rng: &mut T) -> ArithmeticKind {
        *rng.choose(&[
            ArithmeticKind::Addition, ArithmeticKind::Subtraction,
            ArithmeticKind::Multiplication, ArithmeticKind::Division
        ]).unwrap()
    }
}
fn name_equals(plural: bool) -> &'static str {
    if plural { "son" } else { "es" }
}
#[derive(Copy, Clone, Debug)]
pub struct ArithmeticProblem {
    left: u32,
    right: u32,
    kind: ArithmeticKind
}
impl ArithmeticProblem {
    fn answer(&self) -> u32 {
        match self.kind {
            ArithmeticKind::Addition => self.left + self.right,
            ArithmeticKind::Subtraction => self.left - self.right,
            ArithmeticKind::Multiplication => self.left * self.right,
            ArithmeticKind::Division => self.left / self.right,
        }
    }
    fn symbolic_equation(&self) -> String {
        format!("{} {} {} = {}", self.left, self.kind.symbol(), self.right, self.answer())
    }
    fn spanish_equations(&self) -> Vec<String> {
        let answer = self.answer();
        let mut result = Vec::new();
        for &verb in self.kind.spanish_verbs() {
            result.push(format!(
                "{} {} {} {} {}",
                spanish_number(self.left),
                verb,
                spanish_number(self.right),
                name_equals(answer != 1),
                spanish_number(answer)
            ));
        }
        result
    }
    fn writing_question<T: Rng>(&self, _rng: &mut T) -> Question {
        Question {
            question: format!("How do you write <code>{}</code>?", self.symbolic_equation()),
            answers: self.spanish_equations()
        }
    }
    fn reading_question<T: Rng>(&self, rng: &mut T) -> Question {
        Question {
            question: format!("How do you read <code>{}</code>?", rng.choose(&self.spanish_equations()).unwrap()),
            answers: vec![self.symbolic_equation()]
        }
    }
}

const BASIC_NUMBERS: [&str; 16] = [
    "cero",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince"
];
const MULTIPLES_OF_10: [&str; 11] = [
    BASIC_NUMBERS[0],
    BASIC_NUMBERS[10],
    "veinte",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa",
    "cien"
];
pub fn spanish_number(i: u32) -> String {
    assert!(i <= MAXIMUM_NUMBER, "Unsupported number: {}", i);
    if i < 16 {
        BASIC_NUMBERS[i as usize].to_owned()
    } else if i % 10 == 0 {
        MULTIPLES_OF_10[(i / 10) as usize].to_owned()
    } else {
        format!("{} y {}", MULTIPLES_OF_10[(i / 10) as usize], BASIC_NUMBERS[(i % 10) as usize])
    }
}

