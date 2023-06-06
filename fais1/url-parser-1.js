function urlParser(url) {
  let theString = "";

  for (var i = 0; i < url.length; i++) {
    const c = url.charAt(i);
    if (c === ":") {
      let param = "";
      for (var j = i + 1; j < url.length; j++) {
        if (/\w/.test(url.charAt(j))) {
          param += url.charAt(j);
        } else {
          break;
        }
      }
      theString += `(?<${param}>\\w+)`;
      i = j - 1;
    } else {
      theString += c;
    }
  }
  return theString;
}

export default urlParser;
