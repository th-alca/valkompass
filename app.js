let currentQuestion = 0;
let language = "sv";
let userAnswers = [];

/* ---------------------------
   seed per user/session
--------------------------- */

// one pseudo-random seed per browser tab/session
let sessionSeed = sessionStorage.getItem("valkompassSeed");
if (!sessionSeed) {
  sessionSeed = String(Date.now() + Math.floor(Math.random() * 1000000));
  sessionStorage.setItem("valkompassSeed", sessionSeed);
}

// deterministic PRNG from seed
function seededRandomGenerator(seedString) {
  let h = 2166136261;

  for (let i = 0; i < seedString.length; i++) {
    h ^= seedString.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return function () {
    h += 0x6D2B79F5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// deterministic shuffle based on seed + question id + language
function shuffledIndices(length, seedKey) {
  const arr = Array.from({ length }, (_, i) => i);
  const rand = seededRandomGenerator(seedKey);

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

// store option order so it does not change while user clicks around
let questionOptionOrder = {};

function getOptionOrder(q) {
  const key = `${q.id}_${language}`;

  if (!questionOptionOrder[key]) {
    questionOptionOrder[key] = shuffledIndices(
      q.options[language].length,
      `${sessionSeed}_${key}`
    );
  }

  return questionOptionOrder[key];
}

/* ---------------------------
   render
--------------------------- */

function renderQuestion() {
  const container = document.getElementById("questionContainer");
  const q = surveyQuestions[currentQuestion];
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = q.question[language];
  container.appendChild(title);

  // --- SINGLE / REQUIRED ---
  if (q.type === "single" || q.type === "required") {
    const optionOrder = getOptionOrder(q);

    optionOrder.forEach((originalIndex) => {
      const opt = q.options[language][originalIndex];

      const label = document.createElement("label");
      label.className = "option";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "q" + q.id;
      input.value = originalIndex;

      if (userAnswers[currentQuestion] === originalIndex) {
        input.checked = true;
      }

      input.addEventListener("change", () => {
        userAnswers[currentQuestion] = originalIndex;
        updateButtons();
      });

      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + opt));
      container.appendChild(label);
      container.appendChild(document.createElement("br"));
    });
  }

  // --- RANKING ---
  if (q.type === "ranking") {
    const ul = document.createElement("ul");
    ul.id = "ranking";

    let saved = userAnswers[currentQuestion];
    if (!saved) {
      // random initial order also for ranking questions
      saved = getOptionOrder(q);
      userAnswers[currentQuestion] = [...saved];
    }

    saved.forEach((optIndex, index) => {
      const li = document.createElement("li");
      li.className = "ranking-item";
      li.dataset.index = optIndex;

      li.innerHTML = `
        <span class="drag-handle">☰</span>
        <span class="rank-number">${index + 1}</span>
        <span class="rank-text">${q.options[language][optIndex]}</span>
      `;

      ul.appendChild(li);
    });

    container.appendChild(ul);

    new Sortable(ul, {
      animation: 150,
      handle: ".drag-handle",
      onEnd: () => {
        updateRankingNumbers();
        saveRanking();
        updateButtons();
      }
    });
  }

  updateButtons();
}

function updateRankingNumbers() {
  const items = document.querySelectorAll("#ranking li");
  items.forEach((li, index) => {
    const rankNumber = li.querySelector(".rank-number");
    if (rankNumber) {
      rankNumber.textContent = index + 1;
    }
  });
}

function saveRanking() {
  const items = document.querySelectorAll("#ranking li");
  userAnswers[currentQuestion] = Array.from(items).map((li) =>
    parseInt(li.dataset.index, 10)
  );
}

/* ---------------------------
   buttons
--------------------------- */

function updateButtons() {
  const answered = isAnswered();

  document.getElementById("prevBtn").style.display =
    currentQuestion === 0 ? "none" : "inline-block";

  document.getElementById("nextBtn").style.display =
    currentQuestion === surveyQuestions.length - 1 ? "none" : "inline-block";

  document.getElementById("submitBtn").style.display =
    currentQuestion === surveyQuestions.length - 1 ? "inline-block" : "none";

  document.getElementById("nextBtn").disabled = !answered;
  document.getElementById("submitBtn").disabled = !answered;
}

document.getElementById("nextBtn").onclick = () => {
  currentQuestion++;
  renderQuestion();
};

document.getElementById("prevBtn").onclick = () => {
  currentQuestion--;
  renderQuestion();
};

document.getElementById("langToggle").onclick = () => {
  language = language === "sv" ? "en" : "sv";
  document.getElementById("langToggle").textContent =
    language === "sv" ? "EN" : "SV";
  renderQuestion();
};

/* ---------------------------
   matching
--------------------------- */

function matchParties(userAnswers, parties) {
  return parties
    .map((party) => {
      let total = 0;

      party.answers.forEach((partyAnswer, idx) => {
        const userAnswer = userAnswers[idx];

        if (Array.isArray(userAnswer)) {
          const n = userAnswer.length;
          userAnswer.forEach((ua, userPos) => {
            const partyPos = partyAnswer.indexOf(ua);
            if (partyPos >= 0) {
              total += n - Math.abs(userPos - partyPos);
            }
          });
        } else {
          if (userAnswer === partyAnswer) {
            total += 1;
          }
        }
      });

      return { party: party.name, score: total };
    })
    .sort((a, b) => b.score - a.score);
}

function getMaxScore(parties) {
  let max = 0;
  const answers = parties[0].answers;

  answers.forEach((answer) => {
    if (Array.isArray(answer)) {
      const n = answer.length;
      max += n * n;
    } else {
      max += 1;
    }
  });

  return max;
}

function isAnswered() {
  const answer = userAnswers[currentQuestion];
  if (answer === undefined || answer === null) return false;
  if (Array.isArray(answer)) return answer.length > 0;
  return true;
}

/* ---------------------------
   submit
--------------------------- */

document.getElementById("submitBtn").onclick = () => {
  const matched = matchParties(userAnswers, parties);
  const maxScore = getMaxScore(parties);
  const resultsDiv = document.getElementById("results");

  resultsDiv.style.display = "block";
  resultsDiv.innerHTML = "<h2>Resultat</h2>";

  matched.forEach((p) => {
    const percent = Math.round((p.score / maxScore) * 100);

    const row = document.createElement("div");
    const label = document.createElement("div");
    label.textContent = `${p.party} – ${percent}%`;

    const bar = document.createElement("div");
    bar.style.height = "20px";
    bar.style.background = "green";
    bar.style.width = percent + "%";

    row.appendChild(label);
    row.appendChild(bar);
    resultsDiv.appendChild(row);
  });

  const linkText = document.createElement("p");
  linkText.innerHTML = `
    Valkompassen innehåller bara svar från de listor som har valt att delta.
    Här kan du läsa mer om samtliga listor och vad de står för:
    <a href="https://www.sus.se/karval" target="_blank">sus.se/karval</a>
  `;
  linkText.style.marginTop = "20px";
  resultsDiv.appendChild(linkText);

  document.getElementById("questionContainer").style.display = "none";
};

/* ---------------------------
   party answers
--------------------------- */

const parties = [
  {
    name: "Trygghetslistan",
    answers: [0, 1, null, [0,1,2,3,4,5], [0,1,2,3,4,5], 2]
  },
  {
    name: "S-Studenter",
    answers: [null, 0, 0, [3,4,1,5,0,2], [5,0,4,1,2,3], 3]
  },
  {
    name: "Vänsterns studentförening",
    answers: [1, 0, 0, [4,3,0,5,2,1], [2,0,4,3,5,1], 3]
  },
  {
    name: "Framtidens Vänster – Studenterna",
    answers: [3, 0, 0, [4,3,1,2,5,0], [2,4,0,5,1,3], 3]
  },
  {
    name: "Högerstudenter",
    answers: [0, 2, 2, [2,0,1,4,5,3], [5,4,1,0,2,3], 1]
  },
  {
    name: "MED och Fria Studenter",
    answers: [null, 3, 2, [2,0,1,3,5,4], [5,1,2,3,0,4], 4]
  }
];

renderQuestion();
