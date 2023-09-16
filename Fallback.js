class Fallback extends ReceiveResourceOS {
  connectedCallback() {
    super.connectedCallback();
    let prevActive = elem =>
      elem.previousElementSibling == null ||
      elem.previousElementSibling.hasAttribute("active")
        ? elem.previousElementSibling
        : prevActive(elem.previousElementSibling);

    this.prevSiblings = [];
    let sib = prevActive(this);
    //TODO also stop if the sib is another Fallback
    while (sib != null && sib != {}) {
      this.prevSiblings.push(sib);
      sib = prevActive(sib);
    }
    var observer = new MutationObserver(mutations => {
      this.update();
    });
    this.prevSiblings.forEach(e => {
      observer.observe(e, {
        attributes: true,
        attributeFilter: ["active"]
      });
    });
    this.setAttribute("active", "tbc");
  }
  active() {
    let prev = this.prevSiblings.map(e => e.getAttribute("active"));
    if (prev.some(e => e == "true")) return "false";
    if (prev.some(e => e == "tbc")) return "tbc";
    return "true";
  }
  update() {
    let tpl = this.querySelector("template");
    if (tpl) {
      if (this.active() == "true") {
        this.replaceChildren(tpl.content);
      } else {
        return false;
      }
    }
    //TODO support inline element?
    this.style.display = this.active() == "true" ? "block" : "none";
    this.setAttribute("active", this.active());
  }
}
