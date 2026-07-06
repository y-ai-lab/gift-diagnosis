const screens = {
  top: document.querySelector("#top-screen"),
  quiz: document.querySelector("#quiz-screen"),
  result: document.querySelector("#result-screen"),
};

const quizForm = document.querySelector("#quiz-form");
const questions = [...document.querySelectorAll(".question")];
const progressText = document.querySelector("#progress-text");
const progressBar = document.querySelector("#progress-bar");
const formError = document.querySelector("#form-error");
const prevButton = document.querySelector("#prev-button");
const nextButton = document.querySelector("#next-button");
const submitButton = document.querySelector("#submit-button");
const resultSummary = document.querySelector("#result-summary");
const conditionList = document.querySelector("#condition-list");
const genreList = document.querySelector("#genre-list");
const reasonText = document.querySelector("#reason-text");
const keywordList = document.querySelector("#keyword-list");
const nextStepText = document.querySelector("#next-step-text");

let currentQuestion = 0;

const answerLabels = {
  recipient: "誰へのプレゼントか",
  purpose: "目的",
  budget: "予算",
  vibe: "相手の雰囲気",
  avoid: "避けたいもの",
};

const genreProfiles = {
  practical: {
    icon: "🧺",
    title: "毎日使える実用品",
    keyword: "実用",
    description: "タオル、ケーブル周りの小物、使い切りやすい日用品など、相手の生活に自然になじむもの。",
  },
  stylish: {
    icon: "✨",
    title: "おしゃれな消耗品・小物",
    keyword: "おしゃれ",
    description: "見た目が整ったパッケージの消耗品や、相手の雰囲気に合わせやすい軽めのアイテム。",
  },
  food: {
    icon: "☕",
    title: "食べ物・飲み物ギフト",
    keyword: "消えもの",
    description: "焼き菓子、コーヒー、お茶など、受け取ったあとに残りすぎない定番のギフト。",
  },
  relax: {
    icon: "🛁",
    title: "リラックス・ケア用品",
    keyword: "癒し",
    description: "休む時間を作れるケア用品や、肌ざわりのよいタオルなど、疲れをいたわる方向のギフト。",
  },
  experience: {
    icon: "🎟️",
    title: "体験・チケット系",
    keyword: "体験",
    description: "映画券、体験チケット、選べるサービス券など、相手が使うタイミングを選べるもの。",
  },
  premium: {
    icon: "🎀",
    title: "少し上質な定番品",
    keyword: "上質",
    description: "予算内で見た目と質感が整いやすい、特別感のある定番ギフト。",
  },
  safe: {
    icon: "💌",
    title: "相手が選べるギフト",
    keyword: "選べる",
    description: "ギフトカードやカタログ系など、好みが分からないときでも外しにくいもの。",
  },
};

const questionNames = ["recipient", "purpose", "budget", "vibe", "avoid"];

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => screen.classList.remove("screen-active"));
  screens[screenName].classList.add("screen-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showQuestion(index) {
  currentQuestion = Math.max(0, Math.min(index, questions.length - 1));
  questions.forEach((question, questionIndex) => {
    question.classList.toggle("question-active", questionIndex === currentQuestion);
  });

  progressText.textContent = `${currentQuestion + 1} / ${questions.length}`;
  progressBar.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
  prevButton.textContent = currentQuestion === 0 ? "トップへ戻る" : "戻る";
  nextButton.style.display = currentQuestion === questions.length - 1 ? "none" : "inline-block";
  submitButton.style.display = currentQuestion === questions.length - 1 ? "inline-block" : "none";
  formError.textContent = "";
}

function getAnswers() {
  const data = new FormData(quizForm);
  return {
    recipient: data.get("recipient"),
    purpose: data.get("purpose"),
    budget: data.get("budget"),
    vibe: data.get("vibe"),
    avoid: data.get("avoid"),
  };
}

function currentAnswerSelected() {
  const name = questionNames[currentQuestion];
  return Boolean(quizForm.querySelector(`input[name="${name}"]:checked`));
}

function addScore(scores, key, point = 1) {
  scores[key] = (scores[key] || 0) + point;
}

function getExcludedGenres(answers) {
  const excluded = new Set();

  if (answers.avoid === "食べ物") {
    excluded.add("food");
  }

  if (answers.avoid === "香りもの") {
    excluded.add("relax");
  }

  if (answers.avoid === "形に残るもの") {
    excluded.add("practical");
    excluded.add("stylish");
    excluded.add("premium");
  }

  return excluded;
}

function diagnose(answers) {
  const scores = {
    practical: 1,
    stylish: 1,
    food: 1,
    relax: 1,
    experience: 1,
    premium: 1,
    safe: 1,
  };

  if (answers.vibe === "実用的なものが好き") addScore(scores, "practical", 5);
  if (answers.vibe === "おしゃれなものが好き") addScore(scores, "stylish", 5);
  if (answers.vibe === "食べ物や飲み物が好き") addScore(scores, "food", 5);
  if (answers.vibe === "癒し系が好き") addScore(scores, "relax", 5);
  if (answers.vibe === "よく分からない") {
    addScore(scores, "safe", 5);
    addScore(scores, "experience", 2);
  }

  if (answers.purpose === "記念日") {
    addScore(scores, "premium", 4);
    addScore(scores, "experience", 2);
    addScore(scores, "stylish", 2);
  }

  if (answers.purpose === "お礼") {
    addScore(scores, "food", 3);
    addScore(scores, "safe", 2);
    addScore(scores, "practical", 1);
  }

  if (answers.purpose === "ちょっとした贈り物") {
    addScore(scores, "food", 3);
    addScore(scores, "practical", 2);
    addScore(scores, "safe", 1);
  }

  if (answers.purpose === "季節イベント") {
    addScore(scores, "food", 2);
    addScore(scores, "relax", 2);
    addScore(scores, "stylish", 1);
  }

  if (answers.recipient === "職場の人") {
    addScore(scores, "safe", 4);
    addScore(scores, "food", 3);
    addScore(scores, "experience", 1);
  }

  if (answers.recipient === "恋人") {
    addScore(scores, "stylish", 3);
    addScore(scores, "premium", 3);
    addScore(scores, "experience", 2);
  }

  if (answers.recipient === "家族") {
    addScore(scores, "practical", 3);
    addScore(scores, "relax", 2);
    addScore(scores, "premium", 1);
  }

  if (answers.recipient === "その他") {
    addScore(scores, "safe", 4);
    addScore(scores, "experience", 1);
  }

  if (answers.budget === "1,000〜3,000円") {
    addScore(scores, "food", 2);
    addScore(scores, "practical", 2);
    addScore(scores, "safe", 1);
  }

  if (answers.budget === "3,000〜5,000円") {
    addScore(scores, "practical", 2);
    addScore(scores, "stylish", 2);
    addScore(scores, "food", 1);
  }

  if (answers.budget === "5,000〜10,000円") {
    addScore(scores, "premium", 3);
    addScore(scores, "experience", 2);
    addScore(scores, "stylish", 1);
  }

  if (answers.budget === "10,000円以上") {
    addScore(scores, "premium", 5);
    addScore(scores, "experience", 3);
  }

  const excludedGenres = getExcludedGenres(answers);
  const topGenres = Object.entries(scores)
    .filter(([key]) => !excludedGenres.has(key))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => genreProfiles[key]);

  return {
    genres: topGenres,
    keywords: buildKeywords(answers, topGenres),
    reason: buildReason(answers),
    nextStep:
      "この中から商品候補を3つだけ探して、価格・雰囲気・渡しやすさで比べてみましょう。",
  };
}

function buildReason(answers) {
  const reasons = [];

  if (answers.recipient === "職場の人" && answers.purpose === "お礼") {
    reasons.push(
      "職場の人へのお礼なので、好みが出すぎるものより、消耗品で受け取りやすいジャンルを優先しました。"
    );
  } else if (answers.recipient === "恋人" && answers.purpose === "記念日") {
    reasons.push(
      "恋人への記念日なので、普段使いだけでなく、少し特別感が伝わるジャンルを優先しました。"
    );
  } else if (answers.purpose === "ちょっとした贈り物") {
    reasons.push(
      "ちょっとした贈り物なので、相手が重く感じにくく、気軽に受け取りやすい方向に寄せています。"
    );
  } else {
    reasons.push(
      `${answers.recipient}への${answers.purpose}なので、相手との距離感に合いやすいジャンルを優先しました。`
    );
  }

  if (answers.avoid === "食べ物") {
    reasons.push("食べ物を避けたい条件があるため、お菓子、食品、コーヒー、お茶系は外しています。");
  }

  if (answers.avoid === "香りもの") {
    reasons.push("香りものを避けたい条件があるため、入浴剤、香水、ハンドクリーム系は外しています。");
  }

  if (answers.avoid === "形に残るもの") {
    reasons.push("形に残るものを避けたい条件があるため、雑貨、マグカップ、文房具系は外しています。");
  }

  if (answers.avoid === "高すぎるもの") {
    reasons.push("高すぎる印象を避けたい条件があるため、価格よりも見た目と渡しやすさのバランスを重視しています。");
  }

  if (answers.avoid === "特になし") {
    reasons.push("避けたいものが特にないため、相手の雰囲気と予算に合わせて幅広く候補を残しています。");
  }

  if (answers.budget === "3,000〜5,000円") {
    reasons.push("3,000〜5,000円の予算でも見た目が整いやすいジャンルを選んでいます。");
  } else if (answers.budget === "1,000〜3,000円") {
    reasons.push("1,000〜3,000円の予算なので、小さくても気持ちが伝わりやすいものを中心にしています。");
  } else if (answers.budget === "10,000円以上") {
    reasons.push("10,000円以上の予算なので、安さよりも特別感や体験価値が出やすい方向を残しています。");
  }

  return reasons.join("");
}

function budgetKeyword(budget) {
  if (budget === "1,000〜3,000円") return "3000円";
  if (budget === "3,000〜5,000円") return "5000円";
  if (budget === "5,000〜10,000円") return "10000円";
  return "10000円以上";
}

function recipientKeyword(recipient) {
  if (recipient === "職場の人") return "職場";
  return recipient;
}

function purposeKeyword(purpose) {
  return purpose === "ちょっとした贈り物" ? "プチギフト" : purpose;
}

function buildKeywords(answers, genres) {
  return genres.map((genre) =>
    [
      recipientKeyword(answers.recipient),
      purposeKeyword(answers.purpose),
      "プレゼント",
      budgetKeyword(answers.budget),
      genre.keyword,
    ].join(" ")
  );
}

function renderConditions(answers) {
  conditionList.innerHTML = "";

  Object.entries(answerLabels).forEach(([key, label]) => {
    const term = document.createElement("dt");
    const detail = document.createElement("dd");
    term.textContent = label;
    detail.textContent = answers[key];
    conditionList.append(term, detail);
  });
}

function renderResult(result, answers) {
  resultSummary.textContent = `${answers.recipient}への${answers.purpose}に合いそうな方向性です。`;
  reasonText.textContent = result.reason;
  nextStepText.textContent = result.nextStep;
  renderConditions(answers);

  genreList.innerHTML = "";
  result.genres.forEach((genre, index) => {
    const card = document.createElement("div");
    card.className = "genre-card";
    card.innerHTML = `
      <div class="genre-rank">${index + 1}</div>
      <div>
        <strong><span class="genre-icon" aria-hidden="true">${genre.icon}</span>${genre.title}</strong>
        <span>${genre.description}</span>
      </div>
    `;
    genreList.appendChild(card);
  });

  keywordList.innerHTML = "";
  result.keywords.forEach((keyword) => {
    const chip = document.createElement("div");
    chip.className = "keyword-chip";
    chip.textContent = keyword;
    keywordList.appendChild(chip);
  });
}

document.querySelector("#start-button").addEventListener("click", () => {
  showQuestion(0);
  showScreen("quiz");
});

prevButton.addEventListener("click", () => {
  if (currentQuestion === 0) {
    showScreen("top");
    return;
  }

  showQuestion(currentQuestion - 1);
});

nextButton.addEventListener("click", () => {
  if (!currentAnswerSelected()) {
    formError.textContent = "この質問に答えてから次へ進んでください。";
    return;
  }

  showQuestion(currentQuestion + 1);
});

questions.forEach((question) => {
  question.addEventListener("change", () => {
    formError.textContent = "";
  });
});

document.querySelector("#retry-button").addEventListener("click", () => {
  quizForm.reset();
  showQuestion(0);
  showScreen("quiz");
});

document.querySelector("#edit-button").addEventListener("click", () => {
  showQuestion(0);
  showScreen("quiz");
});

quizForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!currentAnswerSelected()) {
    formError.textContent = "この質問に答えてから診断結果を見てください。";
    return;
  }

  if (!quizForm.checkValidity()) {
    formError.textContent = "未回答の質問があります。戻って確認してください。";
    return;
  }

  const answers = getAnswers();
  const result = diagnose(answers);
  renderResult(result, answers);
  showScreen("result");
});

showQuestion(0);
const screens = {
  top: document.querySelector("#top-screen"),
  quiz: document.querySelector("#quiz-screen"),
  result: document.querySelector("#result-screen"),
};

const quizForm = document.querySelector("#quiz-form");
const questions = [...document.querySelectorAll(".question")];
const progressText = document.querySelector("#progress-text");
const progressBar = document.querySelector("#progress-bar");
const formError = document.querySelector("#form-error");
const prevButton = document.querySelector("#prev-button");
const nextButton = document.querySelector("#next-button");
const submitButton = document.querySelector("#submit-button");
const resultSummary = document.querySelector("#result-summary");
const conditionList = document.querySelector("#condition-list");
const genreList = document.querySelector("#genre-list");
const reasonText = document.querySelector("#reason-text");
const keywordList = document.querySelector("#keyword-list");
const nextStepText = document.querySelector("#next-step-text");

let currentQuestion = 0;

const answerLabels = {
  recipient: "誰へのプレゼントか",
  purpose: "目的",
  budget: "予算",
  vibe: "相手の雰囲気",
  avoid: "避けたいもの",
};

const genreProfiles = {
  practical: {
    title: "毎日使える実用品",
    keyword: "実用",
    description: "タオル、ケーブル周りの小物、使い切りやすい日用品など、相手の生活に自然になじむもの。",
  },
  stylish: {
    title: "おしゃれな消耗品・小物",
    keyword: "おしゃれ",
    description: "見た目が整ったパッケージの消耗品や、相手の雰囲気に合わせやすい軽めのアイテム。",
  },
  food: {
    title: "食べ物・飲み物ギフト",
    keyword: "消えもの",
    description: "焼き菓子、コーヒー、お茶など、受け取ったあとに残りすぎない定番のギフト。",
  },
  relax: {
    title: "リラックス・ケア用品",
    keyword: "癒し",
    description: "休む時間を作れるケア用品や、肌ざわりのよいタオルなど、疲れをいたわる方向のギフト。",
  },
  experience: {
    title: "体験・チケット系",
    keyword: "体験",
    description: "映画券、体験チケット、選べるサービス券など、相手が使うタイミングを選べるもの。",
  },
  premium: {
    title: "少し上質な定番品",
    keyword: "上質",
    description: "予算内で見た目と質感が整いやすい、特別感のある定番ギフト。",
  },
  safe: {
    title: "相手が選べるギフト",
    keyword: "選べる",
    description: "ギフトカードやカタログ系など、好みが分からないときでも外しにくいもの。",
  },
};

const questionNames = ["recipient", "purpose", "budget", "vibe", "avoid"];

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => screen.classList.remove("screen-active"));
  screens[screenName].classList.add("screen-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showQuestion(index) {
  currentQuestion = Math.max(0, Math.min(index, questions.length - 1));
  questions.forEach((question, questionIndex) => {
    question.classList.toggle("question-active", questionIndex === currentQuestion);
  });

  progressText.textContent = `${currentQuestion + 1} / ${questions.length}`;
  progressBar.style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;
  prevButton.textContent = currentQuestion === 0 ? "トップへ戻る" : "戻る";
  nextButton.style.display = currentQuestion === questions.length - 1 ? "none" : "inline-block";
  submitButton.style.display = currentQuestion === questions.length - 1 ? "inline-block" : "none";
  formError.textContent = "";
}

function getAnswers() {
  const data = new FormData(quizForm);
  return {
    recipient: data.get("recipient"),
    purpose: data.get("purpose"),
    budget: data.get("budget"),
    vibe: data.get("vibe"),
    avoid: data.get("avoid"),
  };
}

function currentAnswerSelected() {
  const name = questionNames[currentQuestion];
  return Boolean(quizForm.querySelector(`input[name="${name}"]:checked`));
}

function addScore(scores, key, point = 1) {
  scores[key] = (scores[key] || 0) + point;
}

function getExcludedGenres(answers) {
  const excluded = new Set();

  if (answers.avoid === "食べ物") {
    excluded.add("food");
  }

  if (answers.avoid === "香りもの") {
    excluded.add("relax");
  }

  if (answers.avoid === "形に残るもの") {
    excluded.add("practical");
    excluded.add("stylish");
    excluded.add("premium");
  }

  return excluded;
}

function diagnose(answers) {
  const scores = {
    practical: 1,
    stylish: 1,
    food: 1,
    relax: 1,
    experience: 1,
    premium: 1,
    safe: 1,
  };

  if (answers.vibe === "実用的なものが好き") addScore(scores, "practical", 5);
  if (answers.vibe === "おしゃれなものが好き") addScore(scores, "stylish", 5);
  if (answers.vibe === "食べ物や飲み物が好き") addScore(scores, "food", 5);
  if (answers.vibe === "癒し系が好き") addScore(scores, "relax", 5);
  if (answers.vibe === "よく分からない") {
    addScore(scores, "safe", 5);
    addScore(scores, "experience", 2);
  }

  if (answers.purpose === "記念日") {
    addScore(scores, "premium", 4);
    addScore(scores, "experience", 2);
    addScore(scores, "stylish", 2);
  }

  if (answers.purpose === "お礼") {
    addScore(scores, "food", 3);
    addScore(scores, "safe", 2);
    addScore(scores, "practical", 1);
  }

  if (answers.purpose === "ちょっとした贈り物") {
    addScore(scores, "food", 3);
    addScore(scores, "practical", 2);
    addScore(scores, "safe", 1);
  }

  if (answers.purpose === "季節イベント") {
    addScore(scores, "food", 2);
    addScore(scores, "relax", 2);
    addScore(scores, "stylish", 1);
  }

  if (answers.recipient === "職場の人") {
    addScore(scores, "safe", 4);
    addScore(scores, "food", 3);
    addScore(scores, "experience", 1);
  }

  if (answers.recipient === "恋人") {
    addScore(scores, "stylish", 3);
    addScore(scores, "premium", 3);
    addScore(scores, "experience", 2);
  }

  if (answers.recipient === "家族") {
    addScore(scores, "practical", 3);
    addScore(scores, "relax", 2);
    addScore(scores, "premium", 1);
  }

  if (answers.recipient === "その他") {
    addScore(scores, "safe", 4);
    addScore(scores, "experience", 1);
  }

  if (answers.budget === "1,000〜3,000円") {
    addScore(scores, "food", 2);
    addScore(scores, "practical", 2);
    addScore(scores, "safe", 1);
  }

  if (answers.budget === "3,000〜5,000円") {
    addScore(scores, "practical", 2);
    addScore(scores, "stylish", 2);
    addScore(scores, "food", 1);
  }

  if (answers.budget === "5,000〜10,000円") {
    addScore(scores, "premium", 3);
    addScore(scores, "experience", 2);
    addScore(scores, "stylish", 1);
  }

  if (answers.budget === "10,000円以上") {
    addScore(scores, "premium", 5);
    addScore(scores, "experience", 3);
  }

  const excludedGenres = getExcludedGenres(answers);
  const topGenres = Object.entries(scores)
    .filter(([key]) => !excludedGenres.has(key))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => genreProfiles[key]);

  return {
    genres: topGenres,
    keywords: buildKeywords(answers, topGenres),
    reason: buildReason(answers),
    nextStep:
      "この中から商品候補を3つだけ探して、価格・雰囲気・渡しやすさで比べてみましょう。",
  };
}

function buildReason(answers) {
  const reasons = [];

  if (answers.recipient === "職場の人" && answers.purpose === "お礼") {
    reasons.push(
      "職場の人へのお礼なので、好みが出すぎるものより、消耗品で受け取りやすいジャンルを優先しました。"
    );
  } else if (answers.recipient === "恋人" && answers.purpose === "記念日") {
    reasons.push(
      "恋人への記念日なので、普段使いだけでなく、少し特別感が伝わるジャンルを優先しました。"
    );
  } else if (answers.purpose === "ちょっとした贈り物") {
    reasons.push(
      "ちょっとした贈り物なので、相手が重く感じにくく、気軽に受け取りやすい方向に寄せています。"
    );
  } else {
    reasons.push(
      `${answers.recipient}への${answers.purpose}なので、相手との距離感に合いやすいジャンルを優先しました。`
    );
  }

  if (answers.avoid === "食べ物") {
    reasons.push("食べ物を避けたい条件があるため、お菓子、食品、コーヒー、お茶系は外しています。");
  }

  if (answers.avoid === "香りもの") {
    reasons.push("香りものを避けたい条件があるため、入浴剤、香水、ハンドクリーム系は外しています。");
  }

  if (answers.avoid === "形に残るもの") {
    reasons.push("形に残るものを避けたい条件があるため、雑貨、マグカップ、文房具系は外しています。");
  }

  if (answers.avoid === "高すぎるもの") {
    reasons.push("高すぎる印象を避けたい条件があるため、価格よりも見た目と渡しやすさのバランスを重視しています。");
  }

  if (answers.avoid === "特になし") {
    reasons.push("避けたいものが特にないため、相手の雰囲気と予算に合わせて幅広く候補を残しています。");
  }

  if (answers.budget === "3,000〜5,000円") {
    reasons.push("3,000〜5,000円の予算でも見た目が整いやすいジャンルを選んでいます。");
  } else if (answers.budget === "1,000〜3,000円") {
    reasons.push("1,000〜3,000円の予算なので、小さくても気持ちが伝わりやすいものを中心にしています。");
  } else if (answers.budget === "10,000円以上") {
    reasons.push("10,000円以上の予算なので、安さよりも特別感や体験価値が出やすい方向を残しています。");
  }

  return reasons.join("");
}

function budgetKeyword(budget) {
  if (budget === "1,000〜3,000円") return "3000円";
  if (budget === "3,000〜5,000円") return "5000円";
  if (budget === "5,000〜10,000円") return "10000円";
  return "10000円以上";
}

function recipientKeyword(recipient) {
  if (recipient === "職場の人") return "職場";
  return recipient;
}

function purposeKeyword(purpose) {
  return purpose === "ちょっとした贈り物" ? "プチギフト" : purpose;
}

function buildKeywords(answers, genres) {
  return genres.map((genre) =>
    [
      recipientKeyword(answers.recipient),
      purposeKeyword(answers.purpose),
      "プレゼント",
      budgetKeyword(answers.budget),
      genre.keyword,
    ].join(" ")
  );
}

function renderConditions(answers) {
  conditionList.innerHTML = "";

  Object.entries(answerLabels).forEach(([key, label]) => {
    const term = document.createElement("dt");
    const detail = document.createElement("dd");
    term.textContent = label;
    detail.textContent = answers[key];
    conditionList.append(term, detail);
  });
}

function renderResult(result, answers) {
  resultSummary.textContent = `${answers.recipient}への${answers.purpose}に合いそうな方向性です。`;
  reasonText.textContent = result.reason;
  nextStepText.textContent = result.nextStep;
  renderConditions(answers);

  genreList.innerHTML = "";
  result.genres.forEach((genre, index) => {
    const card = document.createElement("div");
    card.className = "genre-card";
    card.innerHTML = `<strong>${index + 1}. ${genre.title}</strong><span>${genre.description}</span>`;
    genreList.appendChild(card);
  });

  keywordList.innerHTML = "";
  result.keywords.forEach((keyword) => {
    const chip = document.createElement("div");
    chip.className = "keyword-chip";
    chip.textContent = keyword;
    keywordList.appendChild(chip);
  });
}

document.querySelector("#start-button").addEventListener("click", () => {
  showQuestion(0);
  showScreen("quiz");
});

prevButton.addEventListener("click", () => {
  if (currentQuestion === 0) {
    showScreen("top");
    return;
  }

  showQuestion(currentQuestion - 1);
});

nextButton.addEventListener("click", () => {
  if (!currentAnswerSelected()) {
    formError.textContent = "この質問に答えてから次へ進んでください。";
    return;
  }

  showQuestion(currentQuestion + 1);
});

questions.forEach((question) => {
  question.addEventListener("change", () => {
    formError.textContent = "";
  });
});

document.querySelector("#retry-button").addEventListener("click", () => {
  quizForm.reset();
  showQuestion(0);
  showScreen("quiz");
});

document.querySelector("#edit-button").addEventListener("click", () => {
  showQuestion(0);
  showScreen("quiz");
});

quizForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!currentAnswerSelected()) {
    formError.textContent = "この質問に答えてから診断結果を見てください。";
    return;
  }

  if (!quizForm.checkValidity()) {
    formError.textContent = "未回答の質問があります。戻って確認してください。";
    return;
  }

  const answers = getAnswers();
  const result = diagnose(answers);
  renderResult(result, answers);
  showScreen("result");
});

showQuestion(0);
