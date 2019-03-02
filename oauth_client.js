
//Get a cookie that use express format for cookies 
//see https://github.com/js-cookie/js-cookie/pull/488
const ExpressCookies = Cookies.withConverter(
    {
        write: function (value) {
            // Prepend j: prefix if it is JSON
            try {
                var tmp = JSON.parse(value);
                if (typeof tmp !== 'object') {
                    throw undefined;
                }
                value = 'j:' + JSON.stringify(tmp);
            } catch (e) { }

            // Encode all characters according to the "encodeURIComponent" spec
            return encodeURIComponent(value)
                // Revert the characters that are unnecessarily encoded but are
                // allowed in a cookie value
                .replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
        },
        read: function (value) {
            // Decode all characters according to the "encodeURIComponent" spec
            value = value.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent)

            // Check if the value contains j: prefix otherwise return as is
            return value.slice(0, 2) === 'j:' ? value.slice(2) : value;
        }
    }
)

/**
 * Check if there is an access token. This method returns true even of the access token is not valid and/or needs refresh.
 */
function oauth2_has_access_token() {
    return ExpressCookies.get('oauth2_token') !== undefined;
}

/**
 * Destroy the access token
 */
function oauth2_destroy_access_token() {
    ExpressCookies.remove('oauth2_token');
}

/**
 * Destroy the access token, then redirect the browser to /home
 * @param {string} redirect_url Where to redirect the user agent after logout
 */
function oauth2_logout(redirect_url) {
    ExpressCookies.remove('oauth2_token');
    window.location.replace(redirect_url);
}

/**
 * @private
 */
var _oauth2_token = undefined;

/**
 * Get the oauth access token
 * @throws {Error} If there is any cookie with access token
 * @returns {any}
 */
function oauth2_token() {
    if (!_oauth2_token) {
        _oauth2_token = ExpressCookies.getJSON('oauth2_token');

        if (!_oauth2_token)
            throw new Error("There is no cookie with the access token")
    }

    return _oauth2_token;
}

/**
 * Create a cookie with user credentials, then reload page to send the cookie to the server
 * @param {string} type Type of authentication
 * @param {any} data Authentication data
 */
function oauth2_authorization_code_authentication(type, data) {
    if (oauth2_has_access_token()) {
        console.error('Access token already issued. Please delete it before retry to receive another token. Maybe you want to refresh the token?');
        return;
    }
    const cookie = Object.assign({ type: type }, data);

    ExpressCookies.set('oauth2_authorization_code_auth', cookie);
    window.location.reload();
}

/**
 * @private
 */
var _oauth2_authorization_header = undefined;

/**
 * Get the authorization header for making authenticated requests
 * @returns {string}
 */
function oauth2_authorization_header(){
    if(!_oauth2_authorization_header)
    {
        const token = oauth2_token();
        _oauth2_authorization_header = `${token.token_type} ${token.access_token}`;
    }

    return _oauth2_authorization_header;
}


/* Functions for get protected resources */

/**
 * Loads a resource from an url, adding the Authorization header needed for authentication with protected resources.
 * @returns A Promise that resolves to an url to the resource fully loaded, or rejects to an error describing what happened.
 * @returns {Promise<string>}
 */
function oauth_load_protected_resource(resource_url) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest()
        request.open('GET', resource_url, true);
        request.responseType = "blob";

        request.setRequestHeader('Authorization', oauth2_authorization_header());

        request.onreadystatechange = function () {
            if (request.readyState == XMLHttpRequest.DONE) {
                if (request.status === 200)
                    resolve(window.URL.createObjectURL(request.response));
                else {
                    reject(new Error(`Can't load ${resource_url}. Status code ${request.status}`));
                }
            }
        }

        request.onerror = request.onabort = function (request, ev) { reject(ev.error || ev); }

        request.send();
    });
}