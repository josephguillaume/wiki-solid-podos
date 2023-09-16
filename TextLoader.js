/*
 * Container-aware text loader
 * Provides buttons for edit, preview, reset, save
 * Editor and renderer need to be provided by child components
 * Autosaves changes
 *
 * Attributes
 * - uri
 * - active (optional): "tbc", "true" or "false", indicates whether component is handling provided uri
 * - ext
 *
 * Methods
 * - ext, defaults to .md
 * - active: see attribute
 * - load: GET uri
 * - save: PUT using content type for ext
 * - render: display component with additonal edit button and error handling
 * - editor: display component with save, preview, reset buttons and autosave to localstorage
 * - loadFiles: in same LDP container
 *
 * Localstorage
 * - wiki:URI : autosaved text for uri, removed on reset or save
 *
 * Slots, both with properties: value, files, uri
 * - editor
 *   Listens for ionInput event
 * - render
 *
 */
class TextLoader extends MyRouter {
  get ext() {
    return this.getAttribute("ext") == null ? ".md" : this.getAttribute("ext");
  }
  active() {
    if (this.loading()) return "tbc";
    return this.uri.endsWith(this.ext) ? "true" : "false";
  }
  load = async () => {
    if (this.hasAttribute("active")) this.setAttribute("active", this.active());
    // TODO got a bit of flickr from changing visibility before render
    this.style.display = this.active() == "true" ? "block" : "none";
    if (this.loading() || this.active() != "true") {
      return false;
    }
    let autosaved = localStorage.getItem("wiki:" + this.uri);
    if (autosaved != null) {
      this.text = autosaved;

      let ev = new CustomEvent("pod-os:error", {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail: { message: "Saved text restored" }
      });
      this.dispatchEvent(ev);
      this.status = 200;
    } else {
      const file = await this.os.session.authenticatedFetch(this.uri);
      this.text = await file.text();
      this.status = file.status;
    }
    if (this.status == 200) await this.loadFiles();
    this.render();
  };
  save = async () => {
    //TODO podos style would require analog to or modification of fetchFile
    let ContentType = {
      ".md": "text/markdown; charset=UTF-8"
    }[this.ext];
    await this.os.session.authenticatedFetch(this.uri, {
      method: "PUT",
      body: this.text,
      //Note: using object not Headers because of https://github.com/linkeddata/rdflib.js/issues/426
      headers: {
        "Content-Type": ContentType
      }
    });
    localStorage.removeItem("wiki:" + this.uri);
    this.load();
  };
  render = () => {
    var pElem = this.shadowRoot.querySelector("div");
    pElem.replaceChildren([]);

    if (this.status == 401) {
      pElem.innerHTML = "Unauthorised: Please login";
      return false;
    }

    let renderElement = document.createElement("slot");
    renderElement.name = "render";
    pElem.appendChild(renderElement);
    //This is core to .value based rendering component
    renderElement.assignedElements()[0].value = this.text;
    //This is provided for a container aware rendering component
    renderElement.assignedElements()[0].files = this.files;
    // TODO not sure this should part of the interface
    renderElement.assignedElements()[0].uri = this.uri;

    if (this.status == 200 || this.status == 404) {
      let tpl = document.createElement("template");
      tpl.innerHTML = `<button type="submit">EDIT</button>`;
      pElem.appendChild(tpl.content);

      pElem.querySelector("button").addEventListener("click", this.editor);
    }
  };
  editor = () => {
    let pElem = this.shadowRoot.querySelector("div");
    pElem.replaceChildren([]);

    let editorElement = document.createElement("slot");
    editorElement.name = "editor";
    pElem.appendChild(editorElement);
    //This is core to .value based editor component
    if (this.status == 200) {
      editorElement.assignedElements()[0].value = this.text;
    }
    //This is provided for a container aware editor component
    editorElement.assignedElements()[0].files = this.files;
    // TODO not sure this should part of the interface
    editorElement.assignedElements()[0].uri = this.uri;

    //TODO generalise from ionInput
    editorElement.addEventListener("ionInput", () => {
      this.text = editorElement.assignedElements()[0].value;
      localStorage.setItem("wiki:" + this.uri, this.text);
    });

    let tpl = document.createElement("template");
    tpl.innerHTML = `
<div style="margin:15px;margin-bottom:20px">
  <button name="save">SAVE</button>
  <button name="preview">Preview</button>
  <button name="cancel">Reset</button>
</div>
`;
    pElem.appendChild(tpl.content);
    pElem
      .querySelector("button[name='save']")
      .addEventListener("click", this.save);
    pElem
      .querySelector("button[name='preview']")
      .addEventListener("click", this.render);
    pElem
      .querySelector("button[name='cancel']")
      .addEventListener("click", () => {
        localStorage.removeItem("wiki:" + this.uri);
        this.load();
      });
  };
  async loadFiles() {
    let containerUri = this.uri.substr(0, this.uri.lastIndexOf("/") + 1);
    await this.os.store.fetcher.load(containerUri);
    let graph = this.os.store.graph;
    this.files = graph
      .statementsMatching(
        graph.sym(containerUri),
        graph.sym("http://www.w3.org/ns/ldp#contains"),
        null,
        graph.sym(containerUri)
      )
      .map(content =>
        decodeURIComponent(content.object.value).replace(
          new RegExp(`${containerUri}([^/]*)/?`),
          "$1"
        )
      );
  }
}
