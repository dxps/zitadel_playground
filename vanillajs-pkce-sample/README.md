# A Vanilla JavaScript PKCE Example

This is a pure JavaScript implementation of using the OIDC PKCE flow with Zitadel.

<br/>

## Configuration

### Prerequisites

Although this is not a mandatory requirement, [Node.js](https://nodejs.org/en) is used in this case to start the Web server using `npx`.

### Client

The client -- the HTML page -- needs to be configured with the following options, as can be found in the `<script⁸>` section of the page:

```js
const AUTHORIZE_ENDPOINT = 'http://localhost:8080/oauth/v2/authorize'
const TOKEN_ENDPOING = 'http://localhost:8080/oauth/v2/token'
const CLIENT_ID = '230547085663994366@fim'
const REDIRECT_URL = 'http://localhost:1234'
```

## Usage

### Serving the HTML File

The HTML needs to be served somehow from a Web server. Because the client is just a static HTML page, this can be done with a trivial server configuration. Below are a couple of ways to easily serve the static HTML page:

```sh
$ npx http-server -p 1234
```

The provided script named `run.sh` can be used.

### Access

Go to [http://localhost:1234](http://localhost:1234) to access this sample.

<br/>

## Implementation Notes

This section provides the implementation details for using the PKCE flow to delegate the user authentication to Zitadel.

#### Creating the Verifier

This function generates a random string (the verifier) that is later signed before it is sent to the authorization server, to Curity.

```JavaScript
function generateRandomString(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}
```

#### Hashing the Verifier

The Web crypto API is used to hash the verifier using SHA-256. This transformed version is called the code challenge.

```JavaScript
async function generateCodeChallenge(codeVerifier) {
  var digest = await crypto.subtle.digest("SHA-256",
    new TextEncoder().encode(codeVerifier));

  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}
```

Note that Javascript crypto services require that the `index.html` is served in a [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) — either from **(\*.)localhost** or via **HTTPS**.
To enable secure context do one of the following:

-   add an `/etc/hosts` entry like `127.0.0.1 public-test-client.localhost` and load the site from there, or
-   enable SSL using something like [letsencrypt](https://letsencrypt.org/), or
-   refer to this [stackoverflow article](https://stackoverflow.com/questions/46468104/how-to-use-subtlecrypto-in-chrome-window-crypto-subtle-is-undefined) for more alternatives.

If Javascript crypto is not available the script will fall back to using a plain-text code challenge.

#### Storing the Verifier

Store the verification key between requests (using session storage).

```JavaScript
window.sessionStorage.setItem("code_verifier", codeVerifier);
```

#### Sending the Code Challenge in the Authorization Request

The code challenge (the transformed, temporary verification secret) is passed to the authorization server as part of the authorization request. The method (`S256`, in our case) used to transform the secret is also passed with the request.

```JavaScript
// var redirectUri = window.location.href.split('?')[0];
var redirectUri = REDIRECT_URL;
var args = new URLSearchParams({
  response_type: "code",
  client_id: clientId,
  code_challenge_method: "S256",
  code_challenge: codeChallenge,
  redirect_uri: redirectUri
});
window.location = authorizeEndpoint + "?" + args;
```

#### Call the Token Endpoint with the Code and Verifier

The authorization code is passed in the POST request to the token endpoint along with the secret verifier key (retrieved from the session storage).

```js
xhr.responseType = 'json'
xhr.open('POST', tokenEndpoint, true)
xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
xhr.send(
	new URLSearchParams({
		client_id: clientId,
		code_verifier: window.sessionStorage.getItem('code_verifier'),
		grant_type: 'authorization_code',
		redirect_uri: location.href.replace(location.search, ''),
		code: code,
	})
)
```

### OAuth Server

The OAuth server needs to be configured with a client that matches the one configured [above](#Client). Also, the redirect should be set. When using `npx` (described below), this will be `http://localhost:8080` by default if no port is provided. Additionally, scopes may be configured.
