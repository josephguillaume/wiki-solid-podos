class WikiMarkdownEditor extends HTMLElement {
  get uri() {
    return this._uri;
  }
  set uri(value) {
    this._uri = value;
    this.render();
  }
  get value() {
    return this.text;
  }
  set value(value) {
    this.text = value;
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
    this.innerHTML = `<ion-textarea
        placeholder="Type something here"
	fill="outline"
	auto-grow="true"
	wrap=soft
	debounce=50
	style="margin:15px;width:90%"
	>
	</ion-textarea>
`;
    this.text += replaceGithubWikiLinks(this.text, this.files);
    this.querySelector("ion-textarea").value = this.text;
    this.addModalInsertLink();
  }
  addModalInsertLink = () => {
    let frag = document.createElement("template");
    frag.innerHTML = `
<ion-modal>
  <ion-header>
    <ion-toolbar>
      <ion-title>Insert link</ion-title>
      <ion-buttons slot="end">
        <ion-button name=close>Close</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <p>
      <input name=targetPage type="text" list="pages">
      <datalist id=pages>
      </datalist>
      <ion-button name="insert">Insert</ion-button>
    </p>
  </ion-content>
</ion-modal>
`;
    this.appendChild(frag.content);
    let modal = this.querySelector("ion-modal");
    modal.addEventListener("ionModalDidPresent", () =>
      modal.querySelector("input").focus()
    );
    let addWikilink = textarea => {
      if (this.text.substr(textarea.selectionStart - 2, 2) != "[[")
        return false;
      modal.isOpen = true;
      modal.querySelector("input").value = "";
    };
    this.querySelector("ion-textarea").addEventListener("ionInput", e => {
      this.text = e.target.value;
      if (e.detail.data == "[")
        this.querySelector("ion-textarea")
          .getInputElement()
          .then(addWikilink);
    });
    let datalist = this.querySelector("datalist");
    this.files.forEach(f => {
      let opt = document.createElement("option");
      opt.value = f.replace(".md", "");
      datalist.appendChild(opt);
    });
    this.querySelector("ion-button[name='close']").addEventListener(
      "click",
      e => (modal.isOpen = false)
    );
    this.querySelector("ion-button[name='insert']").addEventListener(
      "click",
      () => this.insertLink(modal, this.querySelector("ion-textarea"))
    );
  };
  insertLink = async (modal, ionTextarea) => {
    let link = modal.querySelector("input[name='targetPage']").value;
    modal.isOpen = false;
    let textarea = await ionTextarea.getInputElement();
    let cursor = textarea.selectionStart;
    textarea.value =
      textarea.value.substr(0, cursor) +
      link +
      "]]" +
      this.text.substr(cursor, textarea.value.length);
    this.text = textarea.value;
    cursor += link.length + 2;
    textarea.setSelectionRange(cursor, cursor);
    //TODO not quite right
    let ev = new CustomEvent("ionInput", {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { message: "Saved text restored" }
    });
    this.dispatchEvent(ev);
  };
}
