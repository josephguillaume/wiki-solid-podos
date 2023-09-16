/*
 * Alternative to pos-app as function rather than custom component
 * - Called as the first script on the page
 * - Calls handleIncomingRedirect sooner, and therefore faster and with less chance of client code intercepting credentials
 * - Uses client id document
 * - Implements silent authenticate with localStorage value given by `clientId`
 * - Restores url after silent authenticate using localStorage
 * - Overwrites os.session.login to use clientId
 *
 * In the process, also replicates other features
 * - Sets isLoggedIn on stencil/store
 * - Listens for pod-os:init to distribute os object
 * - Requires elements to listen to os, because @State is no longer called 
 *
    <script src="https://unpkg.com/@pod-os/core@0.9.0/lib/index.js"></script>
    <script src="/scripts/setupPodOS.js"></script>
    <script type="module">
      import { s as session } from "https://unpkg.com/@pod-os/elements@0.13.0/dist/elements/p-03fac5e7.js";
      window.session = session;
      setupPodOS(
        "REDIRECT URI",
        "CLIENT ID URI"
      );
    </script>
*/
function setupPodOS(redirectUrl, clientId) {
  let oidcIssuer = localStorage.getItem(clientId);
  let os = new PodOS.PodOS();

  os.session.redirectUrl = redirectUrl;
  os.session.clientId = clientId;
  //This would be changed in authentication.ts instead
  async function login(oidcIssuer) {
    localStorage.setItem(this.clientId, oidcIssuer);
    localStorage.setItem("KEY_CURRENT_URL", window.location.href);
    return this.session.login({
      oidcIssuer,
      redirectUrl: this.redirectUrl,
      clientId: this.clientId
    });
  }
  os.session.login = login.bind(os.session);
  async function logout() {
    localStorage.removeItem(this.clientId);
    return this.session.logout();
  }
  os.session.logout = logout.bind(os.session);

  async function initializeOs(event) {
    //console.log(event);
    event.stopPropagation();
    event.detail(os);
  }
  window.document.addEventListener("pod-os:init", initializeOs);

  os.trackSession(async sessionInfo => {
    session.state.isLoggedIn = sessionInfo.isLoggedIn;
    session.state.webId = sessionInfo.webId;
    //console.log(sessionInfo);
  });

  os.session.session.onLogin(() => {
    //TODO do something with expiratiom instead
    let origUrl = localStorage.getItem("KEY_CURRENT_URL");
    if (origUrl != null) {
      window.history.replaceState({}, "", origUrl);
      window.onload();
    }
    localStorage.removeItem("KEY_CURRENT_URL");
  });
  os.session.session.onError(e => {
    localStorage.removeItem(clientId);
    throw new Error(e);
  });

  os.session.handleIncomingRedirect().then(info => {
    if (!info.isLoggedIn && oidcIssuer) {
      localStorage.setItem(clientId, oidcIssuer);
      localStorage.setItem("KEY_CURRENT_URL", window.location.href);
      os.session.session.login({
        prompt: "none",
        oidcIssuer: oidcIssuer,
        redirectUrl: redirectUrl,
        clientId: clientId
      });
    }
  });
}
