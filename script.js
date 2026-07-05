const screens = {
  top: document.querySelector("#top-screen"),
  quiz: document.querySelector("#quiz-screen"),
  result: document.querySelector("#result-screen"),
};

const quizForm = document.querySelector("#quiz-form");
const resultSummary = document.querySelector("#result-summary");
const genreList = document.querySelector("#genre-list");
const reasonText = document.querySelector("#reason-text");
const keywordList = document.querySelector("#keyword-list");
const nextStepText = document.querySelector("#next-step-text");

const genreProfiles = {
  practical: {
    title: "毎日使える実用品",
    description: "ハンカチ、タンブラー、文具、収納小物など、負担になりにくく使い道が見えやすいもの。",
  },
  stylish: {
    title: "小さめのおしゃれ雑貨",
    description: "デザイン性のあるポーチ、カードケース、インテリア小物など、気分が上がるもの。",
  },
  food: {
    title: "食べ物・飲み物ギフト",
    description: "焼き菓子、コーヒー、紅茶、調味料など、好みが大きく外れにくい消えもの。",
  },
  relax: {
    title: "リラックス・ケア用品",
    description: "入浴剤、アイピロー、肌ざわりのよいタオルなど、休む時間を作れるもの。",
  },
  experience: {
    title: "体験・チケット系",
    description: "食事券、カフェチケット、映画券など、形に残りすぎず相手が選びやすいもの。",
  },
  premium: {
    title: "少し上質な定番品",
    description: "上質な日用品、名入れしない革小物、ブランドの定番アイテムなど、特別感があるもの。",
  },
  safe: {
    title: "好みを選びにくい定番ギフト",
    description: "カタログギフト、ギフトカード、季節の詰め合わせなど、相手が選べる幅を残せるもの。",
  },
};

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => screen.classList.remove("screen-active"));
  screens[screenName].classList.add("screen-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
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

function addScore(scores, key, point = 1) {
  scores[key] = (scores[key] || 0) + point;
}

function diagnose(answers) {
  const scores = {
    practical: 1,
    stylish: 1,
    food: 1,
    relax: 1,
    experience: 1,
    safe: 1,
  };

  if (answers.vibe === "実用的なものが好き") addScore(scores, "practical", 4);
  if (answers.vibe === "おしゃれなものが好き") addScore(scores, "stylish", 4);
  if (answers.vibe === "食べ物や飲み物が好き") addScore(scores, "food", 4);
  if (answers.vibe === "癒し系が好き") addScore(scores, "relax", 4);
  if (answers.vibe === "よく分からない") addScore(scores, "safe", 4);

  if (answers.purpose === "記念日") {
    addScore(scores, "premium", 3);
    addScore(scores, "experience", 2);
  }
  if (answers.purpose === "お礼" || answers.purpose === "ちょっとした贈り物") {
    addScore(scores, "food", 2);
    addScore(scores, "practical", 2);
  }
  if (answers.purpose === "季節イベント") {
    addScore(scores, "food", 2);
    addScore(scores, "relax", 2);
  }

  if (answers.recipient === "職場の人" || answers.recipient === "その他") {
    addScore(scores, "safe", 3);
    addScore(scores, "food", 1);
  }
  if (answers.recipient === "恋人") {
    addScore(scores, "stylish", 2);
    addScore(scores, "premium", 2);
  }
  if (answers.recipient === "家族") {
    addScore(scores, "practical", 2);
    addScore(scores, "relax", 1);
  }

  if (answers.budget === "1,000〜3,000円") {
    addScore(scores, "food", 1);
    addScore(scores, "practical", 1);
  }
  if (answers.budget === "5,000〜10,000円" || answers.budget === "10,000円以上") {
    addScore(scores, "premium", 3);
    addScore(scores, "experience", 2);
  }

  if (answers.avoid === "食べ物") scores.food = -10;
  if (answers.avoid === "香りもの") scores.relax -= 2;
  if (answers.avoid === "高すぎるもの") scores.premium -= 3;
  if (answers.avoid === "形に残るもの") {
    scores.practical -= 2;
    scores.stylish -= 2;
    addScore(scores, "experience", 3);
    addScore(scores, "food", 2);
  }

  const topGenres = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => genreProfiles[key]);

  const keywords = buildKeywords(answers, topGenres);

  return {
    genres: topGenres,
    keywords,
    reason: `${answers.recipient}への${answers.purpose}で、予算は${answers.budget}。相手の雰囲気として「${answers.vibe}」を選んでいるため、使いやすさ・受け取りやすさ・特別感のバランスを優先しました。「${answers.avoid}」は避ける前提で、負担になりにくいジャンルに寄せています。`,
    nextStep: "気になるジャンルを1つ選び、相手の生活・好み・最近話していたことに近いキーワードを足して検索してみましょう。迷う場合は、消えものか相手が選べるギフトを優先すると外しにくくなります。",
  };
}

function buildKeywords(answers, genres) {
  const base = genres.map((genre) => genre.title.replace("ギフト", "").trim());
  const occasion = answers.purpose === "ちょっとした贈り物" ? "プチギフト" : answers.purpose;
  const recipient = answers.recipient === "その他" ? "プレゼント" : `${answers.recipient} プレゼント`;

  return [
    `${recipient} ${occasion}`,
    `${base[0]} ${answers.budget}`,
    `${base[1]} 外さない ギフト`,
  ];
}

function renderResult(result, answers) {
  resultSummary.textContent = `${answers.recipient}への${answers.purpose}に合いそうな方向性です。`;
  reasonText.textContent = result.reason;
  nextStepText.textContent = result.nextStep;

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

document.querySelector("#start-button").addEventListener("click", () => showScreen("quiz"));
document.querySelector("#back-to-top-button").addEventListener("click", () => showScreen("top"));
document.querySelector("#retry-button").addEventListener("click", () => {
  quizForm.reset();
  showScreen("quiz");
});
document.querySelector("#edit-button").addEventListener("click", () => showScreen("quiz"));

quizForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const answers = getAnswers();
  const result = diagnose(answers);
  renderResult(result, answers);
  showScreen("result");
});
