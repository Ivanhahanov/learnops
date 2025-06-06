// custom settings that work with our ouwn OAuth server
const oidcSettings = {
    authority: import.meta.env.VITE_OIDC_ISSUER,
    client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
    redirect_uri: `${window.location.origin}/oauth/callback`,
    //client_secret: 'kube-client-secret',
    // silent_redirect_uri: `${window.location.origin}/silent-renew`,
    post_logout_redirect_uri: `${window.location.origin}`,
    response_type: 'code',
    // this is for getting user.profile data, when open id connect is implemented
    //scope: 'api1 openid profile'
    // this is just for OAuth2 flow
    scope: 'openid groups email profile',
    automaticSilentRenew: true,
};

export const oidcConfig = {
    settings: oidcSettings,
    flow: 'oidc'
};