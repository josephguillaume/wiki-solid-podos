class MarkdownRender extends HTMLElement {
  get value() {
    return this.text;
  }
  set value(value) {
    this.text = value;
    this.render();
  }
  render() {
    if (typeof this.value == "undefined") return false;
    var md = window
      .markdownit()
      .use(window.markdownitFootnote)
      .use(markdownItAttrs);
    md.normalizeLink = href => {
      const url = new URL(
        href,
        document.querySelector("pos-navigation-bar").uri
      );
      return url.href;
    };
    var result = md.render(this.value);
    this.innerHTML = result;
  }
}
