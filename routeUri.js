function routeUri(callback, getBase) {
  document.addEventListener("pod-os:link", e => {
    callback(e.detail);
    history.pushState({}, "", "?uri=" + encodeURIComponent(e.detail));
  });
  addEventListener("popstate", event => {
    let uri =
      new URLSearchParams(window.location.search).get("uri") ||
      window.location.href;
    callback(uri);
  });
  window.onload = () => {
    let uri =
      new URLSearchParams(window.location.search).get("uri") || getBase();

    callback(uri);
  };
  window.go = elem => {
    const url = new URL(elem.href, getBase());
    let ev = new CustomEvent("pod-os:link", {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: url.href
    });
    elem.dispatchEvent(ev);
    return false;
  };
}
