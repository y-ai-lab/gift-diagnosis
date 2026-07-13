(function (root, factory) {
  const api = factory();
  root.GiftSearchKeywords = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const heavyAvoidValue = "高すぎる・重く受け取られそうなもの";
  const forbiddenWords = new Set([
    "気軽",
    "無難",
    "外さない",
    "重くない",
    "食品以外",
    "食べ物NG",
    "香りなし",
    "実用的",
    "癒し",
    "上質",
    "定番",
    "予約可",
  ]);

  function hasAvoid(answers, value) {
    return Array.isArray(answers.avoid) && answers.avoid.includes(value);
  }

  function budgetKeyword(budget) {
    if (budget === "1,000〜3,000円") return "3000円";
    if (budget === "3,000〜5,000円") return "5000円";
    return "10000円";
  }

  function recipientKeyword(recipient) {
    if (recipient === "職場の人") return "職場";
    if (recipient === "その他") return "相手";
    return recipient;
  }

  function purposeKeyword(purpose) {
    if (purpose === "ちょっとした贈り物") return "プチギフト";
    if (purpose === "季節イベント") return "季節イベント";
    return purpose;
  }

  function categoryForGenre(genreKey, answers) {
    const foodAllowed = !hasAvoid(answers, "食べ物");
    const keepsItems = !hasAvoid(answers, "形に残るもの");
    const lightGift = hasAvoid(answers, heavyAvoidValue);

    if (genreKey === "food" && foodAllowed) return "焼き菓子";
    if (genreKey === "practical" && keepsItems) return lightGift ? "ハンドタオル" : "今治タオル";
    if (genreKey === "stylish" && keepsItems) return "ボールペン";
    if (genreKey === "relax" && !hasAvoid(answers, "香りもの")) return "入浴剤";
    if (genreKey === "experience") return foodAllowed ? "体験チケット" : "ワークショップ体験";
    if (genreKey === "premium" && keepsItems) {
      if (!foodAllowed) return "バスタオルセット";
      return lightGift ? "ハンドタオル" : "カタログギフト";
    }

    if (foodAllowed && !hasAvoid(answers, "香りもの")) return "焼き菓子";
    if (keepsItems) return "ハンドタオル";
    return "体験チケット";
  }

  function concreteCondition(category, answers) {
    if (category === "焼き菓子") return "個包装";
    if (category === "今治タオル" || category === "ハンドタオル") return "箱入り";
    if (category === "カタログギフト") return "選べる";
    if (category === "体験チケット" || category === "ワークショップ体験") return "予約可";
    return "ギフト";
  }

  function uniqueTerms(terms) {
    const seen = new Set();
    return terms.filter((term) => {
      const normalized = String(term || "").trim();
      if (!normalized || forbiddenWords.has(normalized) || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }

  function buildSearchKeyword(answers, genreKey) {
    const category = categoryForGenre(genreKey, answers);
    if (category === "バスタオルセット") {
      return uniqueTerms([category, "ギフト", budgetKeyword(answers.budget)]).join(" ");
    }

    return uniqueTerms([
      category,
      concreteCondition(category, answers),
      recipientKeyword(answers.recipient),
      purposeKeyword(answers.purpose),
      budgetKeyword(answers.budget),
    ])
      .slice(0, 5)
      .join(" ");
  }

  function buildSearchKeywords(answers, genres) {
    return genres.map((genre) => buildSearchKeyword(answers, genre.key));
  }

  function buildShopUrls(keyword) {
    const encodedKeyword = encodeURIComponent(keyword);
    return {
      amazon: `https://www.amazon.co.jp/s?k=${encodedKeyword}`,
      rakuten: `https://search.rakuten.co.jp/search/mall/${encodedKeyword}/`,
      yahoo: `https://shopping.yahoo.co.jp/search/${encodedKeyword}/0/`,
    };
  }

  return { buildSearchKeyword, buildSearchKeywords, buildShopUrls, forbiddenWords };
});
