/**
 * Parses the URL pattern and converts it into a regular expression pattern
 * @param {string} url - The URL pattern to parse
 * @returns {string} - The regular expression pattern
 */
function urlParser(url) {
  let regexPattern = "";

  for (let i = 0; i < url.length; i++) {
    const c = url.charAt(i);
    if (c === ":") {
      let param = "";
      let j;
      for (j = i + 1; j < url.length; j++) {
        if (/\w/.test(url.charAt(j))) {
          param += url.charAt(j);
        } else {
          break;
        }
      }
      regexPattern += `(?<${param}>\\w+)`;
      i = j - 1;
    } else {
      regexPattern += c;
    }
  }

  return regexPattern;
}

export default urlParser;
