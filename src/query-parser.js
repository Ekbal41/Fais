/**
Parses the query string from a URL and returns an object containing the key-value pairs.
@param {string} url - The URL containing the query string.
@returns {Object} - An object containing the parsed query parameters.
*/
function queryParser(url) {
  const queryStartIndex = url.indexOf("?");
  if (queryStartIndex === -1) {
    return {};
  }

  const query = url.slice(queryStartIndex + 1);
  const pairs = query.split("&");
  const params = {};

  for (let pair of pairs) {
    const [key, value] = pair.split("=");
    const decodedKey = decodeURIComponent(key);
    const decodedValue = decodeURIComponent(value);
    params[decodedKey] = decodedValue;
  }

  return params;
}

export default queryParser;
