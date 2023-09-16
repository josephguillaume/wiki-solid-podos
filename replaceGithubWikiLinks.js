// adapted from https://github.com/markedjs/marked/issues/471#issuecomment-273718851
function replaceGithubWikiLinks(markdown, files) {
  const existingDefns = Array.from(markdown.matchAll(/\[([^\]]+)\]:/g)).map(x =>
    x[1].toLowerCase()
  );
  let newDefns = "\n\n";
  // github supports [[...]] declaration of links. find all of them
  for (link of markdown.matchAll(/\[\[([^\]]+)\]\]/g)) {
    link = link[1];
    //console.log(link)
    // inside of brekets link can be added as:
    // - page name only [[Calls]], [[Call-Log]];
    // - link title only [[Call Log]];
    // - link title and page name [[Call Log|Call-Log]], [[Log|Call Log]].

    // search for link title
    let linkTitle = link.replace(/\|([^\|]+)/, "");

    // search for page name
    let pageName = link.replace(/([^\|]+)\|/, "");

    if (!linkTitle) {
      linkTitle = link;
    }

    if (!pageName) {
      pageName = link;
    }
    if (existingDefns.includes(pageName.toLowerCase())) continue;

    // make sure page name has correct format
    const pageNameRegex = new RegExp(pageName.replace(/ /g, "."), "i");
    let fileName = files.filter(f => pageNameRegex.test(f))[0];
    if (typeof fileName === "undefined") fileName = `${pageName}.md`;
    //if (typeof fileName === "undefined") continue;
    fileName = encodeURIComponent(fileName);

    // convert [[<link title> | <page name>]] to [<link title>](<page name>)
    link = `[${linkTitle}]: ${fileName}\n`;
    newDefns += link;
  }
  return newDefns.length > 2 ? newDefns : "";
}
