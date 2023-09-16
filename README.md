# Experimental modular wiki using Solid and PodOS

<https://josephguillaume.github.io/wiki-solid-podos/>

While this works as a [Solid Project] app, it's intended as an experiment in a user-defined modular app.

- [PodOS] provides base components and overall architecture. Web components built with https://stenciljs.com are supplemented with https://ionicframework.com/ and no-build vanilla js custom components 
- An experimental [setup function] uses a [client id] to restore a logged in session. A permanent solution is being investigated in PodOS [issue 27]
- A simple [routing function] managing history and url query parameter changes
- A [text loader] web component with
  - Solid protocol authenticated read and write
  - Basic edit, preview and save buttons
  - LocalStorage caching of unsaved edits to a document
  - slots for render and editor components
  - Loading of list of files in a container
- A basic [markdown render] web component using markdown-it
- A more advanced [file aware markdown render] web component
  - Rewrites wikilinks based on filenames in the same container, adding markdown reference links
  - Intercepts local links to be opened within the wiki
- A [wiki markdown editor] that additionally autocompletes wiki links based on filenames in the same container
- Experimental routing with the textloader component reporting whether it is active, and a [fallback] component providing a generic view of resources not handled by preceding components (md and html files)

The intention is that each element can be swapped out in order to achieve different outcomes and that this can be done by a user (e.g. with the web page hosted on a Solid pod) without a build step. This website was primarily built on a mobile phone with support from the [Eruda] console.


[Solid Project]: https://solidproject.org/
[PodOS]: https://github.com/pod-os/PodOS/tree/main/elements
[setup function]: https://github.com/josephguillaume/wiki-solid-podos/blob/main/setupPodOS.js
[client id]: https://github.com/josephguillaume/wiki-solid-podos/blob/main/webid.jsonld
[issue 27]: https://github.com/pod-os/PodOS/issues/27
[routing function]: https://github.com/josephguillaume/wiki-solid-podos/blob/main/routeUri.js
[text loader]: https://github.com/josephguillaume/wiki-solid-podos/blob/main/TextLoader.js
[markdown render]: https://github.com/josephguillaume/wiki-solid-podos/blob/main/MarkdownRender.js
[file aware markdown render]: https://github.com/josephguillaume/wiki-solid-podos/blob/main/MarkdownRenderFileAware.js
[wiki markdown editor]: https://github.com/josephguillaume/wiki-solid-podos/blob/main/WikiMarkdownEditor.js
[fallback]: https://github.com/josephguillaume/wiki-solid-podos/blob/main/Fallback.js
[Eruda]: https://github.com/liriliri/eruda


