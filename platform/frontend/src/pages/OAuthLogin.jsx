import { getUser } from '../services/AuthService';
import { sendOAuthRequest } from '../services/AuthService';
import { Navigate } from "react-router-dom";

function OAuthLogin() {
    const user = getUser();
    const accessToken = user?.id_token;
    if (accessToken) {
        return <Navigate to='/resources' replace />;
    }

    return (
        <div class="relative flex flex-col justify-center h-screen overflow-hidden">
        <div class="w-full p-6 m-auto bg-base-300 rounded-md shadow-md ring-2 ring-gray-800/50 lg:max-w-lg">
            <h1 class="text-3xl font-semibold text-center text-accent">[Platform]</h1>
            <form class="space-y-4">
                <div>
                    <label class="label">
                        <span class="text-base label-text">Username</span>
                    </label>
                    <input type="text" name="username" placeholder="Enter Username" class="w-full input input-bordered" disabled/>
                </div>
                <div>
                    <label class="label">
                        <span class="text-base label-text">Password</span>
                    </label>
                    <input type="password" name="password" placeholder="Enter Password" class="w-full input input-bordered" disabled/>
                </div>
                <a href="#" class="text-xs text-gray-600 hover:underline hover:text-blue-600">Forget Password?</a>
                <div>
                    <button type="submit" class="btn-neutral btn btn-block" disabled="disabled">Login</button>
                </div>
            </form>
            <div className="divider">OIDC</div>
            <button class="btn btn-primary btn-block" onClick={sendOAuthRequest}>Login via Dex</button>
        </div>
    </div>
    )
}

export default OAuthLogin;