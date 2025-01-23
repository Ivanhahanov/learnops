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
    return user?.access_token;
}

export async function logout() {
    await userManager.clearStaleState()
    await userManager.signoutRedirect();
}

// This function is used to access token claims
// `.profile` is available in Open Id Connect implementations
// in simple OAuth2 it is empty, because UserInfo endpoint does not exist
// export async function getRole() {
//     const user = await getUser();
//     return user?.profile?.role;
// }

// This function is used to change account similar way it is done in Google
// export async function selectOrganization() {
//     const args = {
//         prompt: "select_account"
//     }
//     await userManager.signinRedirect(args);
// }


[
    {
        "id": "c8e5aa8d-1ed0-450e-90e9-953c8ab3091e",
        "title": "[Basics] Linux",
        "name": "linux-basic",
        "description": "Пример курса",
        "category": "Linux",
        "difficulty": "Beginner",
        "is_started": true,
        "completed_tasks": 1,
        "total_tasks": 3,
        "completed_lectures": 1,
        "total_lectures": 1,
        "completed_quizzes": 1,
        "total_quizzes": 2,
    }
]