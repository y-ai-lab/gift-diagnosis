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
const directionText = document.querySelector("#direction-text");
const candidateList = document.querySelector("#candidate-list");
const firstCandidateSupport = document.querySelector("#first-candidate-support");
const avoidList = document.querySelector("#avoid-list");
const safeChoiceText = document.querySelector("#safe-choice-text");
const reasonText = document.querySelector("#reason-text");
const primaryKeyword = document.querySelector("#primary-keyword");
const copyKeywordButton = document.querySelector("#copy-keyword-button");
const copyStatus = document.querySelector("#copy-status");
const keywordList = document.querySelector("#keyword-list");
const shopLinks = document.querySelector("#shop-links");
const searchGuidance = document.querySelector("#search-guidance");
const giftPhrase = document.querySelector("#gift-phrase");
const nextStepList = document.querySelector("#next-step-list");

let currentQuestion = 0;
let currentSearchKeyword = "";
let copyStatusTimer = null;

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
    title: "実用的な消耗品ギフト",
    candidate: "上質なタオル・日用品ギフト",
    keyword: "実用的 ギフト タオル 消耗品",
    description: "使い道が分かりやすく、好みが大きく外れにくい方向性です。",
  },
  stylish: {
    icon: "✨",
    title: "見た目が整ったおしゃれギフト",
    candidate: "パッケージのきれいな消えものギフト",
    keyword: "おしゃれ ギフト 消えもの",
    description: "写真映えや渡した時の印象を作りやすい方向性です。",
  },
  food: {
    icon: "☕",
    title: "個包装のお菓子・ドリンクギフト",
    candidate: "個包装のお菓子ギフト",
    keyword: "お菓子 ギフト 個包装",
    description: "食べ切りやすく、相手に気を遣わせにくい定番です。",
  },
  relax: {
    icon: "🛁",
    title: "リラックス・ケア用品",
    candidate: "入浴剤・ケア用品ギフト",
    keyword: "癒し ギフト ケア用品",
    description: "疲れをいたわる気持ちが伝わりやすい方向性です。",
  },
  experience: {
    icon: "🎟️",
    title: "体験・チケット系ギフト",
    candidate: "選べる体験ギフト",
    keyword: "体験ギフト チケット",
    description: "物を増やさず、印象に残しやすい方向性です。",
  },
  premium: {
    icon: "🎀",
    title: "少し上質な定番ギフト",
    candidate: "上質な定番ギフト",
    keyword: "上質 ギフト 定番",
    description: "予算を活かして、特別感を出しやすい方向性です。",
  },
  safe: {
    icon: "💌",
    title: "相手が選べるギフト",
    candidate: "カタログ・選べるギフト",
    keyword: "選べる ギフト カタログ",
    description: "好みが分からない時に、外しにくさを優先できます。",
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
    addScore(scores, "food", 2);
    addScore(scores, "practical", 2);
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
    addScore(scores, "practical", 2);
  }

  if (answers.recipient === "職場の人" && answers.purpose === "お礼") {
    addScore(scores, "food", 4);
    addScore(scores, "practical", 1);
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
    .map(([key]) => ({ key, ...genreProfiles[key] }));

  const direction = buildDirection(answers, topGenres);
  const searchKeywords = buildKeywords(answers, topGenres);

  return {
    direction,
    genres: topGenres,
    avoidItems: buildAvoidItems(answers),
    safeChoice: buildSafeChoice(answers, topGenres),
    reason: buildReason(answers, topGenres),
    keywords: searchKeywords,
    primaryKeyword: searchKeywords[0],
    phrase: buildGiftPhrase(answers),
    firstCandidateSupport: buildFirstCandidateSupport(topGenres[0]),
    searchGuidance:
      "検索したら、上から全部見なくてOKです。評価が高いものを3つだけ開いて、見た目・価格・渡しやすさで決めてください。",
    nextSteps: [
      "まず検索ワードをコピーする",
      "Amazon・楽天・Yahooのどれかで検索する",
      "評価が高い商品を3つだけ見比べて、迷ったら第一候補に近いものを選ぶ",
    ],
  };
}

function buildFirstCandidateSupport(firstGenre) {
  if (firstGenre.key === "food" || firstGenre.key === "stylish") {
    return "迷ったら第一候補でOKです。今回の条件では、相手に気を遣わせにくく、好みも大きく外しにくい方向性です。";
  }

  if (firstGenre.key === "practical") {
    return "迷ったら第一候補でOKです。今回の条件では、使い道が分かりやすく、無駄になりにくい方向性です。";
  }

  if (firstGenre.key === "experience") {
    return "迷ったら第一候補でOKです。今回の条件では、物を増やさずに印象に残しやすい方向性です。";
  }

  return "迷ったら第一候補でOKです。今回の条件では、いちばん外しにくい方向性です。";
}

function buildDirection(answers, genres) {
  if (answers.recipient === "職場の人" || answers.purpose === "お礼" || answers.purpose === "ちょっとした贈り物") {
    return "気を遣わせない消えもの・無難ギフトタイプ";
  }

  if (answers.avoid === "形に残るもの") {
    return "手元に残りにくい消えものギフトタイプ";
  }

  if (answers.recipient === "恋人" || answers.purpose === "記念日") {
    return "特別感を出しつつ好みを外しにくいギフトタイプ";
  }

  if (answers.vibe === "実用的なものが好き" || answers.recipient === "家族") {
    return "暮らしで使いやすい実用ギフトタイプ";
  }

  if (answers.vibe === "よく分からない") {
    return "相手に選ぶ余地を残す安全ギフトタイプ";
  }

  return `${genres[0].title}を軸にした外しにくいギフトタイプ`;
}

function buildAvoidItems(answers) {
  const base = [];

  if (answers.avoid === "食べ物") {
    base.push("お菓子・食品・コーヒー・お茶など食べ物や飲み物系");
  }

  if (answers.avoid === "香りもの") {
    base.push("香りが強いもの、入浴剤、香水、ハンドクリーム系");
  }

  if (answers.avoid === "高すぎるもの") {
    base.push("相手が気を遣うほど高額に見えるもの");
  }

  if (answers.avoid === "形に残るもの") {
    base.push("雑貨、マグカップ、文房具など長く残るもの");
  }

  if (answers.avoid === "特になし") {
    base.push("サイズが関係するもの");
    base.push("好みが強く出るデザインのもの");
  }

  if (answers.recipient === "職場の人") {
    base.push("個人的すぎるもの");
  }

  return [...new Set(base)];
}

function buildSafeChoice(answers, genres) {
  if (answers.avoid === "食べ物") {
    return "迷ったら、タオルや消耗品など使い道が分かりやすいものを選ぶのが安全です。食品を外しても、見た目の整った実用品なら受け取りやすくなります。";
  }

  if (answers.avoid === "香りもの") {
    return "迷ったら、香りが残らない個包装のお菓子やドリンク系を選ぶのが安全です。香りの好みに左右されにくく、渡しやすさも保てます。";
  }

  if (answers.avoid === "形に残るもの") {
    return "迷ったら、食べ切れるお菓子やドリンク、体験チケットなど手元に残りにくいものを選ぶのが安全です。置き場所や好みの負担を減らせます。";
  }

  if (answers.recipient === "職場の人") {
    return "迷ったら、個包装で分けやすいお菓子やドリンク系を選ぶのが安全です。相手に気を遣わせにくく、職場でも受け取りやすいです。";
  }

  return `迷ったら、第一候補の「${genres[0].candidate}」に近い商品から選ぶのが安全です。価格、見た目、渡しやすさの3点で比べると候補を絞りやすくなります。`;
}

function buildReason(answers, genres) {
  const reasons = [];

  if (answers.recipient === "職場の人" && answers.purpose === "お礼") {
    reasons.push("職場の人へのお礼なので、好みが出すぎるものより、受け取りやすく気を遣わせにくい方向性を優先しました。");
  } else {
    reasons.push(`${answers.recipient}への${answers.purpose}なので、相手との関係性と予算に合いやすい方向性を優先しました。`);
  }

  if (answers.avoid !== "特になし") {
    reasons.push(`避けたいものが「${answers.avoid}」なので、結果から該当しやすいジャンルを外しています。`);
  }

  reasons.push(`${answers.budget}の予算でも探しやすく、検索で候補を絞りやすい「${genres[0].candidate}」を第一候補にしています。`);

  return reasons.join("");
}

function buildGiftPhrase(answers) {
  if (answers.purpose === "お礼") {
    return "いつもありがとう。気軽に使ってもらえたら嬉しいです。";
  }

  if (answers.purpose === "誕生日") {
    return "誕生日おめでとう。好みに合いそうなものを選んでみました。";
  }

  if (answers.purpose === "記念日") {
    return "いつもありがとう。記念に、少し特別感のあるものを選びました。";
  }

  if (answers.purpose === "ちょっとした贈り物") {
    return "ほんの気持ちです。気軽に受け取ってもらえたら嬉しいです。";
  }

  return "季節のごあいさつに、気軽に楽しめそうなものを選びました。";
}

function budgetKeyword(budget) {
  if (budget === "1,000〜3,000円") return "3000円";
  if (budget === "3,000〜5,000円") return "5000円";
  if (budget === "5,000〜10,000円") return "10000円";
  return "10000円以上";
}

function recipientKeyword(recipient) {
  if (recipient === "職場の人") return "職場";
  if (recipient === "その他") return "相手";
  return recipient;
}

function purposeKeyword(purpose) {
  if (purpose === "ちょっとした贈り物") return "プチギフト";
  if (purpose === "季節イベント") return "季節 ギフト";
  return purpose;
}

function moodKeyword(answers) {
  if (answers.recipient === "職場の人" || answers.vibe === "よく分からない") return "無難";
  if (answers.vibe === "おしゃれなものが好き") return "おしゃれ";
  if (answers.vibe === "実用的なものが好き") return "実用的";
  if (answers.vibe === "癒し系が好き") return "癒し";
  return "外さない";
}

function safetyKeyword(answers) {
  if (answers.avoid === "香りもの") return "香りなし";
  if (answers.avoid === "食べ物") return "食品以外";
  if (answers.avoid === "形に残るもの") return "消えもの";
  if (answers.avoid === "高すぎるもの") return "気軽";
  return "";
}

function buildKeywords(answers, genres) {
  return genres.map((genre) =>
    [
      budgetKeyword(answers.budget),
      recipientKeyword(answers.recipient),
      purposeKeyword(answers.purpose),
      moodKeyword(answers),
      genre.keyword,
      safetyKeyword(answers),
    ]
      .filter(Boolean)
      .join(" ")
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

function renderCandidates(genres) {
  candidateList.innerHTML = "";

  genres.slice(0, 2).forEach((genre, index) => {
    const card = document.createElement("div");
    card.className = "candidate-card";
    card.innerHTML = `
      <div class="candidate-rank">${index === 0 ? "第一候補" : "第二候補"}</div>
      <div>
        <strong><span aria-hidden="true">${genre.icon}</span>${genre.candidate}</strong>
        <p>${genre.description}</p>
      </div>
    `;
    candidateList.appendChild(card);
  });
}

function renderAvoidItems(items) {
  avoidList.innerHTML = "";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    avoidList.appendChild(li);
  });
}

function renderKeywords(keywords) {
  keywordList.innerHTML = "";

  keywords.forEach((keyword) => {
    const chip = document.createElement("div");
    chip.className = "keyword-chip";
    chip.textContent = keyword;
    keywordList.appendChild(chip);
  });
}

function renderShopLinks(keyword) {
  const encodedKeyword = encodeURIComponent(keyword);
  const links = [
    ["Amazonで探す", `https://www.amazon.co.jp/s?k=${encodedKeyword}`],
    ["楽天で探す", `https://search.rakuten.co.jp/search/mall/${encodedKeyword}/`],
    ["Yahooショッピングで探す", `https://shopping.yahoo.co.jp/search?p=${encodedKeyword}`],
  ];

  shopLinks.innerHTML = "";
  links.forEach(([label, url]) => {
    const link = document.createElement("a");
    link.className = "shop-link";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;
    shopLinks.appendChild(link);
  });
}

function renderNextSteps(steps) {
  nextStepList.innerHTML = "";

  steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    nextStepList.appendChild(li);
  });
}

function renderResult(result, answers) {
  currentSearchKeyword = result.primaryKeyword;

  resultSummary.textContent = `${answers.recipient}への${answers.purpose}で迷いにくい候補を整理しました。`;
  directionText.textContent = result.direction;
  firstCandidateSupport.textContent = result.firstCandidateSupport;
  safeChoiceText.textContent = result.safeChoice;
  reasonText.textContent = result.reason;
  primaryKeyword.textContent = result.primaryKeyword;
  searchGuidance.textContent = result.searchGuidance;
  giftPhrase.textContent = result.phrase;
  copyStatus.textContent = "";

  renderConditions(answers);
  renderCandidates(result.genres);
  renderAvoidItems(result.avoidItems);
  renderKeywords(result.keywords);
  renderShopLinks(result.primaryKeyword);
  renderNextSteps(result.nextSteps);
}

async function copySearchKeyword() {
  copyStatus.textContent = "";

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(currentSearchKeyword);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = currentSearchKeyword;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      if (!copied) throw new Error("copy command failed");
    }

    copyStatus.textContent = "コピーしました";
  } catch (error) {
    copyStatus.textContent = "コピーできませんでした。手動でコピーしてください";
  }

  clearTimeout(copyStatusTimer);
  copyStatusTimer = setTimeout(() => {
    copyStatus.textContent = "";
  }, 3000);
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

copyKeywordButton.addEventListener("click", copySearchKeyword);

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
