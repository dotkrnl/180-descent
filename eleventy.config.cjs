const yaml = require("yaml");

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension("yaml,yml", (contents) => yaml.parse(contents));

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  eleventyConfig.addFilter("padDay", (value) => String(value).padStart(3, "0"));
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
    return `<span class="chip ${cls}"><i></i>${text}</span>`;
  });

  eleventyConfig.addCollection("days", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/days/*.md")
      .sort((a, b) => Number(a.data.day) - Number(b.data.day));
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

