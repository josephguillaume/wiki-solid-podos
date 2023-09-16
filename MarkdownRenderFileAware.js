class MarkdownRenderFileAware extends MarkdownRender {
  get uri() {
    return this._uri;
  }
  set uri(value) {
    this._uri = value;
    this.render();
  }
  get files() {
    return this._files;
  }
  set files(value) {
    this._files = value;
    this.render();
  }
  render() {
    if (typeof this.files == "undefined") return false;
    if (typeof this.uri == "undefined") return false;
    this.text += replaceGithubWikiLinks(this.text, this.files);
    super.render();

    this.interceptHrefs(this);
  }
  interceptHrefs = renderElement => {
    let tpl = document.createElement("template");
    tpl.innerHTML = `
<style>
.external {
	color: var(--link-color-external,"green");
}
.create {
	color: var(--link-color-create,red);
}
</style>
		`;

    renderElement.appendChild(tpl.content);
    var Anchors = renderElement.querySelectorAll("a");
    let containerUri = this.uri.substr(0, this.uri.lastIndexOf("/") + 1);
    for (var i = 0; i < Anchors.length; i++) {
      if (!Anchors[i].href.startsWith(containerUri)) {
        Anchors[i].classList.add("external");
      } else if (
        !this.files.includes(
          decodeURIComponent(Anchors[i].href.replace(containerUri, ""))
        )
      ) {
        Anchors[i].classList.add("create");
      }
      Anchors[i].addEventListener(
        "click",
        function(event) {
          event.preventDefault();
          go(this);
        },
        false
      );
    }
  };
}
