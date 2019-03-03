# oauth-client-spa
A client library for oauth in SPAs (Single Page Applications). It's intended to be used with [express-oauth-server-spa](https://github.com/luckv/express-oauth-server-spa)

## Library import
This library make use of [jscookie](https://github.com/js-cookie/js-cookie) for parsing and create cookies.<br>
In the html page where you want to use the library add this
```html
<script src="https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js"></script>
<script src="oauth_client.js"></script>
```
## Use
Functions exposed to the client
### Access token and oauth session manipulation
+ `oauth2_token()` Return the acccess token. Throws an `Error` if there is any cookie associated with the access token
+ `oauth2_has_access_token()` Return true if there is a cookie with the access token, false otherwise. **Attention**, the token may be invalid
+ `oauth2_destroy_access_token()` Destroy the cookie associated with the access token
+ `logout(redirect_url)` Destroy the cookie associated with the access token, and redirect the user agent to `redirect_url`
### Loading protected resources inside the browser
+ `oauth2_authorization_header()` Returns the `Authorization` header field to be used when making requests to protected url. Throws an `Error` if there is any cookie associated with the access token
+ `oauth_load_protected_resource(resource_url)` Try to load the protected resource at `resource_url` using the access token in the cookie. Returns a `Promise` that resolve to a url containing the resource correctly loaded, otherwise the promise is rejected
### During oauth authorization code grant flow
The only function exposed is `oauth2_authorization_code_authentication(type, data)`. Create a cookie with the authentication data and reload the page, sending the cookie to the server. See [Authorization Form](https://github.com/luckv/express-oauth-server-spa/blob/master/README.md#authorization-form) in express-oauth-server-spa.
