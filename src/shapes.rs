use rand::Rng;

use super::Question;

#[derive(Debug, Copy, Clone, Serialize, Deserialize)]
pub enum SpanishColor {
    Red,
    Pink,
    Blue,
    Black,
    Brown,
    Grey,
    LightBlue,
    Green,
    Purple,
    Yellow,
    Orange,
    White
}
impl SpanishColor {
    fn choose<R: Rng>(rng: &mut R) -> SpanishColor {
        match rng.gen_range(0, 12) {
            0 => SpanishColor::Red,
            1 => SpanishColor::Pink,
            2 => SpanishColor::Blue,
            3 => SpanishColor::Black,
            4 => SpanishColor::Brown,
            5 => SpanishColor::Grey,
            6 => SpanishColor::LightBlue,
            7 => SpanishColor::Green,
            8 => SpanishColor::Purple,
            9 => SpanishColor::Yellow,
            10 => SpanishColor::Orange,
            11 => SpanishColor::White,
            _ => unreachable!()
        }
    }
    fn css_color(self) -> &'static str {
        match self {
            SpanishColor::Red => "red",
            SpanishColor::Pink => "deeppink",
            SpanishColor::Blue => "blue",
            SpanishColor::Black => "black",
            SpanishColor::Brown => "brown",
            SpanishColor::Grey => "grey",
            SpanishColor::LightBlue => "aqua",
            SpanishColor::Green => "green",
            SpanishColor::Purple => "purple",
            SpanishColor::Yellow => "yellow",
            SpanishColor::Orange => "orange",
            SpanishColor::White => "white",
        }
    }
    fn spanish_name(self, male: bool) -> &'static str {
        match (self, male) {
            (SpanishColor::Red, true) => "rojo",
            (SpanishColor::Red, false) => "roja",
            (SpanishColor::Pink, _) => "rosa",
            (SpanishColor::Blue, _) => "azul",
            (SpanishColor::Black, true) => "negro",
            (SpanishColor::Black, false) => "negra",
            (SpanishColor::Brown, _) => "café",
            (SpanishColor::Grey, _) => "gris",
            (SpanishColor::LightBlue, _) => "azul celeste",
            (SpanishColor::Green, _) => "verde",
            (SpanishColor::Purple, true) => "marado",
            (SpanishColor::Purple, false) => "marada",
            (SpanishColor::Yellow, true) => "amarillo",
            (SpanishColor::Yellow, false) => "amarilla",
            (SpanishColor::Orange, true) => "anaranjado",
            (SpanishColor::Orange, false) => "anaranjada",
            (SpanishColor::White, true) => "blanco",
            (SpanishColor::White, false) => "blanca",
        }
    }
}
#[derive(Debug, Copy, Clone, Serialize, Deserialize, PartialEq, Eq)]
enum SpanishShape {
    Square,
    Circle,
    Triangle,
    Oval,
    Rectangle,
    Star,
    Heart,
    Diamond
}
impl SpanishShape {
    #[inline]
    fn is_male(self) -> bool {
        self != SpanishShape::Star
    }
    fn choose<R: Rng>(rng: &mut R) -> SpanishShape {
        match rng.gen_range(0, 8) {
            0 => SpanishShape::Square,
            1 => SpanishShape::Circle,
            2 => SpanishShape::Triangle,
            3 => SpanishShape::Oval,
            4 => SpanishShape::Rectangle,
            5 => SpanishShape::Star,
            6 => SpanishShape::Heart,
            7 => SpanishShape::Diamond,
            _ => unreachable!()
        }
    }
    fn word(self) -> &'static str {
        match self {
            SpanishShape::Square => "cuadrado",
            SpanishShape::Circle => "círculo",
            SpanishShape::Triangle => "triángulo",
            SpanishShape::Oval => "óvalo",
            SpanishShape::Rectangle => "rectángulo",
            SpanishShape::Star => "estrella",
            SpanishShape::Heart => "corazón",
            SpanishShape::Diamond => "diamante",
        }
    }
    fn render_svg(self, color: SpanishColor) -> String {
        let css = color.css_color();
        match self {
            SpanishShape::Square => {
                format!(r#"<rect width = "50" height="50" stroke="black" stroke-width="4" fill="{}"/>"#, css)
            },
            SpanishShape::Circle => {
                format!(r#"<circle cx="50" cy="50" r="40" stroke="black" stroke-width="4" fill="{}"/>"#, css)
            },
            SpanishShape::Triangle => {
                format!(r#"<g
     transform="translate(0,-261.40834)"
     id="layer1">
    <path
       style="stroke-width:1.41111111;fill:{};fill-opacity:1;stroke:#000000;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none"
       d="M 17.197916,264.98544 34.779984,294.52193 0.40959956,294.9802 Z"
       id="path3721" />
  </g>
"#, css)
            },
            SpanishShape::Oval => {
                format!(r#"<ellipse cx="50" cy="50" rx="40" ry="20" stroke="black" stroke-width="4" fill="{}"/>"#, css)
            },
            SpanishShape::Rectangle => {
                format!(r#"<rect width = "100" height="50" stroke="black" stroke-width="4" fill="{}"/>"#, css)
            },
            SpanishShape::Star => format!(r##"<defs
     id="defs2">
    <style
       type="text/css"
       id="style4705"><![CDATA[
    .outline {{ stroke:none; stroke-width:0 }}
  ]]></style>
    <g
       id="heart">
      <path
         d="M0 200 v-200 h200      a100,100 90 0,1 0,200     a100,100 90 0,1 -20
0,0     z"
         id="path4707" />
    </g>
  </defs>
<g
     transform="translate(0,-261.40834)"
     id="layer1">
    <path
       transform="matrix(0.79732647,0,0,0.86879316,7.9603325,33.694232)"
       d="m 12.160763,263.8853 7.42721,11.25343 13.115577,3.12807 -8.407515,10.5412 1.077969,13.44028 -12.62334,-4.73862 -12.44935479,5.17849 0.60586212,-13.46982 -8.77209433,-10.2398 12.9977834,-3.5862 z"
       id="path4773"
       style="fill:{};fill-opacity:1;stroke:#000000;stroke-width:1.41111112;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
  </g>"##, css),
            SpanishShape::Heart => {
                format!(r##"<defs
     id="defs2">
    <style
       type="text/css"
       id="style4705"><![CDATA[
    .outline {{ stroke:none; stroke-width:0 }}
  ]]></style>
    <g
       id="heart">
      <path
         d="M0 200 v-200 h200      a100,100 90 0,1 0,200     a100,100 90 0,1 -200,0     z"
         id="path4707" />
    </g>
  </defs>
<g
     transform="translate(0,-261.40834)"
     id="layer1">
    <use
       height="100%"
       width="100%"
       y="0"
       x="0"
       style="fill:{};stroke:#000000;stroke-width:13.95495625;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none"
       xlink:href="#heart"
       class="outline "
       transform="matrix(-0.07162162,-0.07138243,0.07162162,-0.07138243,17.578271,295.25429)"
       id="use4714" />
  </g>"##, css)
            },
            SpanishShape::Diamond => format!(r##"
              <defs
     id="defs2">
    <style
       type="text/css"
       id="style4705"><![CDATA[
    .outline {{ stroke:none; stroke-width:0 }}
  ]]></style>
    <g
       id="heart">
      <path
         d="M0 200 v-200 h200      a100,100 90 0,1 0,200     a100,100 90 0,1 -20
0,0     z"
         id="path4707" />
    </g>
  </defs>
<g
     transform="translate(0,-261.40834)"
     id="layer1">
    <rect
       transform="matrix(0.62343415,0.78187586,-0.57871286,0.81553137,0,0)"
       y="156.09402"
       x="173.11827"
       height="20.873373"
       width="20.539051"
       id="rect4800"
       style="fill:{};fill-opacity:1;stroke:#000000;stroke-width:1.26968241;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
  </g>"##, css),
        }
    }
}

#[inline]
fn singular_definite_article(male: bool) -> &'static str {
    if male { "el" } else { "la" }
}
pub fn generate_question<R: Rng>(rng: &mut R) -> Question {
    let shape = SpanishShape::choose(rng);
    let color = SpanishColor::choose(rng);
    Question {
        question: format!(r#"Name this shape: <svg width="100" height="100">{}</svg>"#, shape.render_svg(color)),
        answers: vec![format!(
            "{} {} {}",
            singular_definite_article(shape.is_male()),
            color.spanish_name(shape.is_male()),
            shape.word(),
        )],
    }
}
