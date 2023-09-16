class MyRouter extends HTMLElement {
  setOs = async os => {
    this.os = os;
    this.os.trackSession(sessionInfo => {
      //session.state.isLoggedIn = sessionInfo.isLoggedIn;
      //session.state.webId = sessionInfo.webId;
      //sessionInfo.isLoggedIn && this.load();
      this.load();
    });
  };
  static get observedAttributes() {
    return ["uri"];
  }
  constructor() {
    super();

    const pElem = document.createElement("div");
    pElem.innerHTML = "<slot/>";

    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(pElem);
  }
  connectedCallback() {
    let ev = new CustomEvent("pod-os:init", {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: this.setOs
    });
    this.dispatchEvent(ev);
    // These are needed with setupPodOS because pos-app caused rerenders that no longer happen
    // Replaces @State os
    setTimeout(() => {
      if (typeof this.os == "undefined") this.connectedCallback();
    }, 10);
    if (typeof session != "undefined")
      session.onChange("isLoggedIn", this.connectedCallback.bind(this));
  }
  get uri() {
    return this.getAttribute("uri");
  }
  set uri(value) {
    this.setAttribute("uri", value);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "uri") {
      this.load();
    }
  }
  loading() {
    return (
      typeof this.uri === "undefined" ||
      typeof this.os === "undefined" ||
      this.uri === null
    );
  }
  load() {
    if (this.loading()) return null;
    //this.shadowRoot.querySelector("pos-resource").uri=this.uri
    this.shadowRoot.querySelector(
      "div"
    ).innerHTML = `<pos-resource uri=${this.uri}><pos-type-router/></pos-resource>`;
    return false;
  }
}
//window.customElements.define("my-router", MyRouter);
