import { UserManager } from 'oidc-client-ts';
import { oidcConfig } from '../utils/config';

const userManager = new UserManager(oidcConfig.settings);

export async function getUser() {
    const user = await userManager.getUser();
    return user;
}

export async function isAuthenticated() {
    let token = await getAccessToken();

    return !!token;
}

export async function handleOAuthCallback(callbackUrl) {
    try {
        const user = await userManager.signinRedirectCallback(callbackUrl);
        console.log(user)
        return user;
    } catch (e) {
        alert(e);
        console.log(`error while handling oauth callback: ${e}`);
    }
}

export async function sendOAuthRequest() {
    return await userManager.signinRedirect();
}

// renews token using refresh token
export async function renewToken() {
    const user = await userManager.signinSilent();

    return user;
}

export async function getAccessToken() {
    const user = await getUser();

    if (user?.expired) {
        console.log('Token expired, attempting to renew...');
        const refreshedUser = await userManager.signinSilent();
        return refreshedUser.access_token;
    }
    return user?.id_token;
}

export async function logout() {
    await userManager.clearStaleState()
    await userManager.signoutRedirect();
}