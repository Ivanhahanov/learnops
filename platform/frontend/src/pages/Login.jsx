import React, {useContext} from 'react'
import AuthContext from '../context/AuthContext'

const LoginPage = () => {

    let {loginUser} = useContext(AuthContext)

    return (
        <div class="relative flex flex-col justify-center h-screen overflow-hidden">
        <div class="w-full p-6 m-auto bg-base-300 rounded-md shadow-md ring-2 ring-gray-800/50 lg:max-w-lg">
            <h1 class="text-3xl font-semibold text-center text-accent">[Platform]</h1>
            <form class="space-y-4" onSubmit={loginUser}>
                <div>
                    <label class="label">
                        <span class="text-base label-text">Username</span>
                    </label>
                    <input type="text" name="username" placeholder="Enter Username" class="w-full input input-bordered" />
                </div>
                <div>
                    <label class="label">
                        <span class="text-base label-text">Password</span>
                    </label>
                    <input type="password" name="password" placeholder="Enter Password" class="w-full input input-bordered" />
                </div>
                <a href="#" class="text-xs text-gray-600 hover:underline hover:text-blue-600">Forget Password?</a>
                <div>
                    <button type="submit" class="btn-neutral btn btn-block">Login</button>
                </div>
            </form>
            
        </div>
    </div>
    )
}

export default LoginPage