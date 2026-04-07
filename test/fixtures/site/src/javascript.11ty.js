export default class JavaScriptExamplePage {
  data() {
    return {
      title: "JavaScript Example",
      description: "A page rendered through an Eleventy JavaScript template.",
      mastodon_hashtags: ["eleventy", "javascript"],
      permalink: "javascript/index.html",
    };
  }

  render(data) {
    return [
      this.mastodonShareStyles(),
      this.mastodonSharePost({
        title: data.title,
        description: data.description,
        hashtags: data.mastodon_hashtags,
      }),
      this.mastodonShareScript(),
    ].join("\n");
  }
}
