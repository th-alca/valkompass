let currentQuestion = 0;
let language = "sv";
let userAnswers = [];

/* --------------------------- seed per user/session --------------------------- */

let sessionSeed = sessionStorage.getItem("valkompassSeed");
if (!sessionSeed) {
  sessionSeed = String(Date.now() + Math.floor(Math.random() * 1000000));
  sessionStorage.setItem("valkompassSeed", sessionSeed);
}

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

function shuffledIndices(length, seedKey) {
  const arr = Array.from({ length }, (_, i) => i);
  const rand = seededRandomGenerator(seedKey);

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

// Keep the same option order for a given user/session and question.
const questionOptionOrder = {};

function getOptionOrder(q) {
  const key = String(q.id);

  if (!questionOptionOrder[key]) {
    questionOptionOrder[key] = shuffledIndices(
      q.options.sv.length,
      `${sessionSeed}_${key}`
    );
  }

  return questionOptionOrder[key];
}

/* --------------------------- render --------------------------- */

function renderQuestion() {
  const container = document.getElementById("questionContainer");
  const q = surveyQuestions[currentQuestion];

  container.style.display = "block";
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = q.question[language];
  container.appendChild(title);

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

  if (q.type === "ranking") {
    const ul = document.createElement("ul");
    ul.id = "ranking";

    let saved = userAnswers[currentQuestion];

    if (!Array.isArray(saved) || saved.length !== q.options[language].length) {
      saved = [...getOptionOrder(q)];
      userAnswers[currentQuestion] = [...saved];
    }

    saved.forEach((optIndex, index) => {
      const li = document.createElement("li");
      li.className = "ranking-item";
      li.dataset.index = optIndex;

      li.innerHTML = `
        <span class="drag-handle" aria-hidden="true">☰</span>
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

/* --------------------------- buttons --------------------------- */

function updateButtons() {
  const answered = isAnswered();
  const isFirst = currentQuestion === 0;
  const isLast = currentQuestion === surveyQuestions.length - 1;

  document.getElementById("prevBtn").style.display = isFirst ? "none" : "inline-block";
  document.getElementById("nextBtn").style.display = isLast ? "none" : "inline-block";
  document.getElementById("submitBtn").style.display = isLast ? "inline-block" : "none";

  document.getElementById("nextBtn").disabled = !answered;
  document.getElementById("submitBtn").disabled = !answered;
}

document.getElementById("nextBtn").onclick = () => {
  if (currentQuestion < surveyQuestions.length - 1) {
    currentQuestion++;
    renderQuestion();
  }
};

document.getElementById("prevBtn").onclick = () => {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
};

document.getElementById("langToggle").onclick = () => {
  language = language === "sv" ? "en" : "sv";
  document.getElementById("langToggle").textContent = language === "sv" ? "EN" : "SV";
  renderQuestion();
};

/* --------------------------- matching --------------------------- */

function matchParties(userAnswers, parties) {
  return parties
    .map((party) => {
      let total = 0;
      let maxScore = 0;

      party.answers.forEach((partyAnswer, idx) => {
        const userAnswer = userAnswers[idx];

        if (partyAnswer === null || partyAnswer === undefined) {
          return;
        }

        if (Array.isArray(partyAnswer)) {
          const n = partyAnswer.length;
          maxScore += n * n;

          if (Array.isArray(userAnswer)) {
            userAnswer.forEach((ua, userPos) => {
              const partyPos = partyAnswer.indexOf(ua);
              if (partyPos >= 0) {
                total += n - Math.abs(userPos - partyPos);
              }
            });
          }
        } else {
          maxScore += 1;
          if (userAnswer === partyAnswer) {
            total += 1;
          }
        }
      });

      return {
        party: party.name,
        score: total,
        maxScore: maxScore
      };
    })
    .sort((a, b) => b.score - a.score);
}

function isAnswered() {
  const answer = userAnswers[currentQuestion];

  if (answer === undefined || answer === null) {
    return false;
  }

  if (Array.isArray(answer)) {
    return answer.length > 0;
  }

  return true;
}

/* --------------------------- submit --------------------------- */

document.getElementById("submitBtn").onclick = () => {
  const matched = matchParties(userAnswers, parties);
  const resultsDiv = document.getElementById("results");

  resultsDiv.style.display = "block";
  resultsDiv.innerHTML =
    language === "sv"
      ? "<h2>Resultat</h2>"
      : "<h2>Results</h2>";

  matched.forEach((p) => {
    const percent =
      p.maxScore > 0 ? Math.round((p.score / p.maxScore) * 100) : 0;

    const row = document.createElement("div");
    row.style.marginBottom = "14px";

    const label = document.createElement("div");
    label.textContent = `${p.party} – ${percent}%`;
    label.style.marginBottom = "4px";

    const bar = document.createElement("div");
    bar.style.height = "20px";
    bar.style.background = "green";
    bar.style.width = percent + "%";
    bar.style.borderRadius = "4px";

    row.appendChild(label);
    row.appendChild(bar);
    resultsDiv.appendChild(row);
  });

  const linkText = document.createElement("p");
  linkText.style.marginTop = "20px";

  if (language === "sv") {
    linkText.innerHTML =
      'Valkompassen innehåller bara svar från de listor som har valt att delta. ' +
      'Här kan du läsa mer om samtliga listor och vad de står för: ' +
      '<a href="https://www.sus.se/karval" target="_blank" rel="noopener noreferrer">sus.se/karval</a>';
  } else {
    linkText.innerHTML =
      'This voting guide only includes answers from the lists that chose to participate. ' +
      'You can read more about all lists and what they stand for here: ' +
      '<a href="https://www.sus.se/karval" target="_blank" rel="noopener noreferrer">sus.se/karval</a>';
  }

  resultsDiv.appendChild(linkText);

  document.getElementById("questionContainer").style.display = "none";
  document.getElementById("prevBtn").style.display = "none";
  document.getElementById("nextBtn").style.display = "none";
  document.getElementById("submitBtn").style.display = "none";
};

/* --------------------------- party answers --------------------------- */

const parties = [
  {
    name: "Trygghetslistan",
    answers: [0, 1, null, [0, 1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5], 2]
  },
  {
    name: "S-Studenter",
    answers: [null, 0, 0, [3, 4, 1, 5, 0, 2], [5, 0, 4, 1, 2, 3], 3]
  },
  {
    name: "Vänsterns studentförening",
    answers: [1, 0, 0, [4, 3, 0, 5, 2, 1], [2, 0, 4, 3, 5, 1], 3]
  },
  {
    name: "Framtidens Vänster – Studenterna",
    answers: [3, 0, 0, [4, 3, 1, 2, 5, 0], [2, 4, 0, 5, 1, 3], 3]
  },
  {
    name: "Högerstudenter",
    answers: [0, 2, 2, [2, 0, 1, 4, 5, 3], [5, 4, 1, 0, 2, 3], 1]
  },
  {
    name: "MED och Fria Studenter",
    answers: [null, 3, 2, [2, 0, 1, 3, 5, 4], [5, 1, 2, 3, 0, 4], 4]
  }
];

renderQuestion();
