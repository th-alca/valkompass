let currentQuestion = 0;
let language = "sv";
let userAnswers = [];

function renderQuestion() {
  const container = document.getElementById("questionContainer");
  const q = surveyQuestions[currentQuestion];

  container.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = q.question[language];
  container.appendChild(title);

  // --- SINGLE / REQUIRED ---
  if (q.type === "single" || q.type === "required") {
    q.options[language].forEach((opt, i) => {
      const label = document.createElement("label");
      const input = document.createElement("input");

      input.type = "radio";
      input.name = "q" + q.id;
      input.value = i;

      if (userAnswers[currentQuestion] === i) {
        input.checked = true;
      }

      input.addEventListener("change", () => {
        userAnswers[currentQuestion] = i;
        updateButtons();
      });

      label.appendChild(input);
      label.appendChild(document.createTextNode(opt));
      container.appendChild(label);
      container.appendChild(document.createElement("br"));
    });
  }

  // --- RANKING (med SortableJS) ---
  if (q.type === "ranking") {
    const ul = document.createElement("ul");
    ul.id = "ranking";

    let saved = userAnswers[currentQuestion] || q.options[language].map((_, i) => i);

    saved.forEach((opt, index) => {
      const li = document.createElement("li");
      li.className = "ranking-item";
      li.dataset.index = opt;

      li.innerHTML = `
        <span class="drag-handle">☰</span>
        <span class="rank-number">${index + 1}</span>
        <span class="rank-text">${q.options[language][opt]}</span>
      `;

      ul.appendChild(li);
    });

    container.appendChild(ul);

    // 🔥 SortableJS här
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
    li.querySelector(".rank-number").textContent = index + 1;
  });
}

// spara ranking
function saveRanking() {
  const items = document.querySelectorAll("#ranking li");

  userAnswers[currentQuestion] = Array.from(items).map(li => {
    return parseInt(li.dataset.index);
  });
}

// navigationsknappar
function updateButtons() {
  const answered = isAnswered();

  document.getElementById("prevBtn").style.display =
    currentQuestion === 0 ? "none" : "inline-block";

  document.getElementById("nextBtn").style.display =
    currentQuestion === surveyQuestions.length - 1 ? "none" : "inline-block";

  document.getElementById("submitBtn").style.display =
    currentQuestion === surveyQuestions.length - 1 ? "inline-block" : "none";

  //  lås knappar
  if (!answered) {
    document.getElementById("nextBtn").disabled = true;
    document.getElementById("submitBtn").disabled = true;
  } else {
    document.getElementById("nextBtn").disabled = false;
    document.getElementById("submitBtn").disabled = false;
  }
}

// navigation
document.getElementById("nextBtn").onclick = () => {
  currentQuestion++;
  renderQuestion();
};

document.getElementById("prevBtn").onclick = () => {
  currentQuestion--;
  renderQuestion();
};

// språk toggle
document.getElementById("langToggle").onclick = () => {
  language = language === "sv" ? "en" : "sv";
  document.getElementById("langToggle").textContent =
    language === "sv" ? "EN" : "SV";
  renderQuestion();
};

// --- MATCHNING (samma som innan) ---
function matchParties(userAnswers, parties) {
  return parties.map(party => {
    let total = 0;

    party.answers.forEach((partyAnswer, idx) => {
      const userAnswer = userAnswers[idx];

      if (Array.isArray(userAnswer)) {
        // ranking
        const n = userAnswer.length;

        userAnswer.forEach((ua, userPos) => {
          const partyPos = partyAnswer.indexOf(ua);
          if (partyPos >= 0) {
            total += n - Math.abs(userPos - partyPos);
          }
        });

      } else {
        // single
        if (userAnswer === partyAnswer) {
          total += 1;
        }
      }
    });

    return { party: party.name, score: total };
  }).sort((a,b)=>b.score-a.score);
}


function getMaxScore(parties) {
  let max = 0;
  const answers = parties[0].answers;

  answers.forEach(answer => {
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

  // ranking: måste innehålla något
  if (Array.isArray(answer)) {
    return answer.length > 0;
  }

  return true;
}


// submit
document.getElementById("submitBtn").onclick = () => {
  const matched = matchParties(userAnswers, parties);
  const maxScore = getMaxScore(parties);

  const resultsDiv = document.getElementById("results");
  resultsDiv.style.display = "block";
  resultsDiv.innerHTML = "<h2>Resultat</h2>";

  matched.forEach(p => {
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

  // 🔽 NY DEL – länken
  const linkText = document.createElement("p");
  linkText.innerHTML = `
    Valkompassen innehåller bara svar från de listor som har valt att delta. Här kan du läsa mer om samtliga listor och vad de står för:
    <a href="https://www.sus.se/karval" target="_blank">
      https://www.sus.se/karval
    </a>
  `;
  linkText.style.marginTop = "20px";

  resultsDiv.appendChild(linkText);

  document.getElementById("questionContainer").style.display = "none";
};


const parties = [
  {
    name: "Trygghetslistan",
    answers: [
      0, // fråga 1
      1, // fråga 2
      null, // fråga 3 (”varken eller” → ingen exakt match i alternativen)
      [0,1,2,3,4,5], // fråga 4
      [0,1,2,3,4,5], // fråga 5
      2 // fråga 6
    ]
  },
  {
    name: "S-Studenter",
    answers: [
      null, // (deras svar finns ej i listan)
      0,
      0,
      [3,4,1,5,0,2],
      [5,0,4,1,2,3],
      3
    ]
  },
  {
    name: "Vänsterns studentförening",
    answers: [
      1,
      0,
      0,
      [4,3,0,5,2,1],
      [2,0,4,3,5,1],
      3
    ]
  },
  {
    name: "Framtidens Vänster – Studenterna",
    answers: [
      3,
      0,
      0,
      [4,3,1,2,5,0],
      [2,4,0,5,1,3],
      3
    ]
  },
  {
    name: "Högerstudenter",
    answers: [
      0,
      2,
      2,
      [2,0,1,4,5,3],
      [5,4,1,0,2,3],
      1
    ]
  },
  {
    name: "MED och Fria Studenter",
    answers: [
      null,
      3,
      2,
      [2,0,1,3,5,4],
      [5,1,2,3,0,4],
      4
    ]
  }
];

// start
renderQuestion();
