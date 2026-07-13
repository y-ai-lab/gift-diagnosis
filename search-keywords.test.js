const assert = require("node:assert/strict");
const { buildSearchKeywords, buildShopUrls, forbiddenWords } = require("./search-keywords.js");

const heavy = "高すぎる・重く受け取られそうなもの";
const cases = [
  ["恋人・誕生日・おしゃれ・香りNG", "stylish", { recipient: "恋人", distance: "かなり親しい", purpose: "誕生日", budget: "3,000〜5,000円", vibe: "おしゃれなものが好き", avoid: ["香りもの"] }],
  ["友人・誕生日・おしゃれ・食べ物NG", "stylish", { recipient: "友人", distance: "そこそこ親しい", purpose: "誕生日", budget: "3,000〜5,000円", vibe: "おしゃれなものが好き", avoid: ["食べ物"] }],
  ["家族・誕生日・実用的・香りNG", "practical", { recipient: "家族", distance: "かなり親しい", purpose: "誕生日", budget: "5,000〜10,000円", vibe: "実用的なものが好き", avoid: ["香りもの"] }],
  ["職場・お礼・食べ物・重いものNG", "food", { recipient: "職場の人", distance: "気を遣う関係", purpose: "お礼", budget: "1,000〜3,000円", vibe: "食べ物や飲み物が好き", avoid: [heavy] }],
  ["恋人・記念日・おしゃれ・食べ物NG", "stylish", { recipient: "恋人", distance: "かなり親しい", purpose: "記念日", budget: "5,000〜10,000円", vibe: "おしゃれなものが好き", avoid: ["食べ物"] }],
  ["友人・プチギフト・癒し・香りNG", "relax", { recipient: "友人", distance: "そこそこ親しい", purpose: "ちょっとした贈り物", budget: "1,000〜3,000円", vibe: "癒し系が好き", avoid: ["香りもの"] }],
  ["家族・お礼・食べ物・重いものNG", "food", { recipient: "家族", distance: "そこそこ親しい", purpose: "お礼", budget: "3,000〜5,000円", vibe: "食べ物や飲み物が好き", avoid: [heavy] }],
  ["職場・プチギフト・形に残るものNG", "practical", { recipient: "職場の人", distance: "気を遣う関係", purpose: "ちょっとした贈り物", budget: "1,000〜3,000円", vibe: "実用的なものが好き", avoid: ["形に残るもの"] }],
  ["恋人・誕生日・実用的・香りNG", "practical", { recipient: "恋人", distance: "かなり親しい", purpose: "誕生日", budget: "3,000〜5,000円", vibe: "実用的なものが好き", avoid: ["香りもの"] }],
  ["友人・お礼・食べ物・形に残るものNG", "food", { recipient: "友人", distance: "そこそこ親しい", purpose: "お礼", budget: "3,000〜5,000円", vibe: "食べ物や飲み物が好き", avoid: ["形に残るもの"] }],
  ["家族・記念日・癒し・食べ物NG", "premium", { recipient: "家族", distance: "かなり親しい", purpose: "記念日", budget: "5,000〜10,000円", vibe: "癒し系が好き", avoid: ["食べ物"] }],
  ["職場・誕生日・おしゃれ・食べ物NG", "stylish", { recipient: "職場の人", distance: "気を遣う関係", purpose: "誕生日", budget: "1,000〜3,000円", vibe: "おしゃれなものが好き", avoid: ["食べ物"] }],
];

const expectedKeywords = [
  "ボールペン ギフト 恋人 誕生日 5000円",
  "ボールペン ギフト 友人 誕生日 5000円",
  "今治タオル 箱入り 家族 誕生日 10000円",
  "焼き菓子 個包装 職場 お礼 3000円",
  "ボールペン ギフト 恋人 記念日 10000円",
  "ハンドタオル 箱入り 友人 プチギフト 3000円",
  "焼き菓子 個包装 家族 お礼 5000円",
  "焼き菓子 個包装 職場 プチギフト 3000円",
  "今治タオル 箱入り 恋人 誕生日 5000円",
  "焼き菓子 個包装 友人 お礼 5000円",
  "バスタオルセット ギフト 10000円",
  "ボールペン ギフト 職場 誕生日 3000円",
];

for (const [index, [label, genreKey, answers]] of cases.entries()) {
  const keyword = buildSearchKeywords(answers, [{ key: genreKey }])[0];
  const terms = keyword.split(" ");
  assert.ok(keyword, `${label}: empty keyword`);
  assert.ok(!["ギフト", "プレゼント", "おしゃれ", "実用的", "癒し", "無難"].includes(terms[0]), `${label}: abstract category`);
  assert.ok(terms.length <= 5, `${label}: too many terms`);
  assert.equal(new Set(terms).size, terms.length, `${label}: duplicate terms`);
  terms.forEach((term) => assert.ok(!forbiddenWords.has(term), `${label}: forbidden ${term}`));
  if (answers.avoid.includes("食べ物")) assert.ok(!/焼き菓子|カフェ|カタログギフト/.test(keyword), `${label}: food conflict`);
  if (answers.avoid.includes("香りもの")) assert.ok(!keyword.includes("入浴剤"), `${label}: fragrance conflict`);
  if (answers.avoid.includes("形に残るもの")) assert.ok(!/タオル|ボールペン|カタログ/.test(keyword), `${label}: keeps-item conflict`);
  assert.equal(keyword, expectedKeywords[index], `${label}: unexpected keyword change`);
  if (label === "家族・記念日・癒し・食べ物NG") assert.equal(keyword, "バスタオルセット ギフト 10000円", `${label}: expected shared marketplace keyword`);
  const urls = buildShopUrls(keyword);
  assert.ok(urls.amazon.startsWith("https://www.amazon.co.jp/s?k="));
  assert.ok(urls.rakuten.startsWith("https://search.rakuten.co.jp/search/mall/"));
  assert.ok(urls.yahoo.startsWith("https://shopping.yahoo.co.jp/search/"));
  assert.equal(decodeURIComponent(urls.amazon.split("s?k=")[1]), keyword);
  assert.equal(decodeURIComponent(urls.rakuten.split("/mall/")[1].slice(0, -1)), keyword);
  assert.equal(decodeURIComponent(urls.yahoo.split("/search/")[1].split("/0/")[0]), keyword);
  assert.ok(!urls.yahoo.includes("%25"), `${label}: double-encoded URL`);
}

console.log(`${cases.length} search keyword cases passed`);
