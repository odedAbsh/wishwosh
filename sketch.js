let sandParticles = [];
const gridSize = 5;
const particlesPerFrame = 10;
const rows = 3;
const cols = 4;
const maxRevealedSquares = 3;
const maxClicks = 5; // מקסימום לחיצות
let clickCount = 0;
let revealedSquares = [];
let revealedLamps = [];
let lampImage;
let genieImage;
let lamps = [];
let fallingSandParticles = [];
let gameOver = false;
let showWishCard = false;
let wishText = '';
let responseText = '';
let cursorBlink = true;
let customFont;

function preload() {
  // טעינת התמונה שלך במקום יצירת תמונת המנורה
  lampImage = loadImage('lamp2.png'); // ודא שהנתיב נכון
  // טעינת תמונת הג'יני
  genieImage = loadImage('genie-face.png'); // ודא שהנתיב נכון
  // טעינת הפונט המותאם אישית
  customFont = loadFont('kingofthieves.ttf'); // ודא שהנתיב נכון
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  setInterval(() => cursorBlink = !cursorBlink, 500); // מחליף את מצב הקו כל חצי שנייה
  textFont(customFont); // הגדרת הפונט לשימוש
  startGame();
}

function startGame() {
  background(245, 222, 179);
  noStroke();
  clickCount = 0;
  gameOver = false;
  showWishCard = false;
  wishText = '';
  responseText = '';
  revealedSquares = [];
  revealedLamps = [];
  fallingSandParticles = [];
  lamps = [];

  // יצירת 5 מנורות במיקומים אקראיים
  while (lamps.length < 5) {
    let x = floor(random(cols));
    let y = floor(random(rows));
    if (!lamps.some(lamp => lamp.x === x && lamp.y === y)) {
      lamps.push({ x, y });
    }
  }

  sandParticles = [];
  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      createSandParticle(x, y);
    }
  }
}

function draw() {
  background(245, 222, 179);

  drawLampsUnderSand();
  updateSandParticles();
  drawSandParticles();

  if (mouseIsPressed && !gameOver) {
    revealSandUnderMouse();
  }

  if (gameOver && revealedLamps.length >= 3) {
    drawGenieAndCard();
  }
}

function drawLampsUnderSand() {
  const squareWidth = width / cols;
  const squareHeight = height / rows;
  const lampSize = min(squareWidth, squareHeight) * 0.5; // הקטנת התמונה כך שתהיה חצי מהגודל המקורי

  for (let lamp of lamps) {
    const x = lamp.x * squareWidth;
    const y = lamp.y * squareHeight;

    if (revealedLamps.some(sq => sq.x === lamp.x && sq.y === lamp.y)) {
      image(lampImage, x + squareWidth / 2 - lampSize / 2, y + squareHeight / 2 - lampSize / 2, lampSize, lampSize);
    }
  }
}

function updateSandParticles() {
  for (let i = fallingSandParticles.length - 1; i >= 0; i--) {
    let p = fallingSandParticles[i];
    p.y += 4; // מהירות נפילה של החול מוגברת
    p.x += random(-1, 1); // תנועה רוחבית קלה

    if (p.y >= height) {
      fallingSandParticles.splice(i, 1); // הסרת חלקיקי חול שמגיעים לשורה התחתונה
    }
  }
}

function drawSandParticles() {
  for (let particle of sandParticles) {
    fill(particle.color);
    rect(particle.x, particle.y, gridSize, gridSize);
  }

  for (let particle of fallingSandParticles) {
    fill(particle.color);
    rect(particle.x, particle.y, gridSize, gridSize);
  }
}

function revealSandUnderMouse() {
  const squareWidth = width / cols;
  const squareHeight = height / rows;
  const col = floor(mouseX / squareWidth);
  const row = floor(mouseY / squareHeight);

  if (clickCount < maxClicks && !revealedSquares.some(sq => sq.row === row && sq.col === col)) {
    clickCount++;
    if (revealedSquares.length < maxRevealedSquares) {
      revealedSquares.push({ row, col });
    } else {
      revealedSquares.shift();
      revealedSquares.push({ row, col });
    }

    for (let i = sandParticles.length - 1; i >= 0; i--) {
      const p = sandParticles[i];
      if (revealedSquares.some(sq => p.x >= sq.col * squareWidth && p.x < (sq.col + 1) * squareWidth && p.y >= sq.row * squareHeight && p.y < (sq.row + 1) * squareHeight)) {
        fallingSandParticles.push(p);
        sandParticles.splice(i, 1);
      }
    }

    for (let lamp of lamps) {
      if (lamp.x === col && lamp.y === row && !revealedLamps.some(sq => sq.x === lamp.x && sq.y === lamp.y)) {
        revealedLamps.push({ x: lamp.x, y: lamp.y });
      }
    }

    if (revealedLamps.length >= 3) {
      gameOver = true;
    }
  }

  if (clickCount >= maxClicks && revealedLamps.length < 3) {
    gameOver = true;
  }
}

function createSandParticle(x, y) {
  let baseColor = color(245, 222, 179);
  let shade = random(0.8, 1.2);
  let sandColor = color(
    red(baseColor) * shade,
    green(baseColor) * shade,
    blue(baseColor) * shade,
    random(150, 255)
  );

  let particle = {
    x: round(x / gridSize) * gridSize,
    y: round(y / gridSize) * gridSize,
    color: sandColor
  };

  sandParticles.push(particle);
}

function drawLampOnGraphics(graphics) {
  // פונקציה זו לא נחוצה יותר כיוון שאנו משתמשים בתמונה טעונה
}

function mousePressed() {
  if (gameOver && revealedLamps.length >= 3) {
    let cardY = height / 2 + 50;
    let genieX = width / 2 - (genieImage.width / 3) / 2;
    let genieY = cardY - (genieImage.height / 3) - 10; // הזזת הג'יני למעלה
    if (mouseX >= genieX && mouseX <= genieX + genieImage.width / 3 && mouseY >= genieY && mouseY <= genieY + genieImage.height / 3) {
      showWishCard = !showWishCard;
    }
  } else if (gameOver) {
    startGame();
  }
}

function keyPressed() {
  if (showWishCard) {
    if (keyCode === ENTER) {
      // פעולה לביצוע כאשר לוחצים על אנטר
      responseText = "I'm not Alexa, sorry";
      wishText = ''; // איפוס השדה לאחר שליחה
    } else if (keyCode === BACKSPACE) {
      wishText = wishText.slice(0, -1);
    } else {
      wishText += key;
    }
  }
}

function drawGenieAndCard() {
  let cardWidth = width * 0.8;
  let cardHeight = 150;
  let cardX = width / 2 - cardWidth / 2;
  let cardY = height / 2 + 50;
  let genieX = width / 2 - (genieImage.width / 3) / 2;
  let genieY = cardY - (genieImage.height / 3) - 10; // הזזת הג'יני למעלה

  image(genieImage, genieX, genieY, genieImage.width / 3, genieImage.height / 3);

  if (showWishCard) {
    fill(255, 255, 255, 200);
    rect(cardX, cardY, cardWidth, cardHeight, 10);

    fill(0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text(responseText || "What is your wish master", cardX + cardWidth / 2, cardY + 40);

    if (!responseText) {
      fill(0);
      textSize(14);
      textAlign(LEFT, CENTER);
      text(wishText, cardX + 20, cardY + 80);

      // ציור הקו המהבהב
      if (cursorBlink) {
        let txtWidth = textWidth(wishText); // חישוב רוחב הטקסט
        line(cardX + 20 + txtWidth, cardY + 65, cardX + 20 + txtWidth, cardY + 95);
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(245, 222, 179);
}
