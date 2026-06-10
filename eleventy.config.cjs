const yaml = require("yaml");

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension("yaml,yml", (contents) => yaml.parse(contents));

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  eleventyConfig.addFilter("padDay", (value) => String(value).padStart(3, "0"));
  eleventyConfig.addFilter("slugify", (value = "") => String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""));
  eleventyConfig.addFilter("roman", (value) => {
    const numerals = [
      [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
      [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
      [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
    ];
    let n = Number(value) || 0;
    let out = "";
    for (const [amount, label] of numerals) {
      while (n >= amount) {
        out += label;
        n -= amount;
      }
    }
    return out || String(value);
  });
  eleventyConfig.addFilter("blockOrdinal", (items, index) => {
    let ordinal = 0;
    let previous = "";
    for (let i = 0; i <= Number(index); i++) {
      const current = items[i]?.data?.block || "";
      if (current && current !== previous) {
        ordinal++;
        previous = current;
      }
    }
    return ordinal;
  });
  eleventyConfig.addFilter("statusClass", (value = "") => {
    const v = String(value).toLowerCase();
    if (v.includes("established")) return "ok";
    if (v.includes("promising") || v.includes("hint")) return "hint";
    return "bad";
  });
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));

  eleventyConfig.addShortcode("statusChip", (label) => {
    const text = String(label || "").trim();
    const cls = text.toLowerCase().includes("established")
      ? "ok"
      : text.toLowerCase().includes("promising") || text.toLowerCase().includes("hint")
        ? "hint"
        : "bad";
    const compact = text.toLowerCase().includes("superseded")
      ? "superseded"
      : text.toLowerCase().includes("established")
        ? "established"
        : text.toLowerCase().includes("promising")
          ? "promising"
          : text.toLowerCase().includes("contested")
            ? "contested"
            : "review";
    return `<span class="chip ${cls}" data-print="${compact}"><i></i>${text}</span>`;
  });

  eleventyConfig.addCollection("days", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/days/*.md")
      .sort((a, b) => Number(a.data.day) - Number(b.data.day));
  });
  eleventyConfig.addCollection("introduction", (collectionApi) => {
    return collectionApi.getFilteredByGlob("src/pages/introduction.md");
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};
