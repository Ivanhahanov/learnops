import React from 'react';
import { Link } from "react-router-dom";

const HomePage = () => {
    return (
        <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
            {/* Hero Section */}
            <div className="hero min-h-screen bg-gradient-to-r from-blue-900 to-indigo-800 text-white">
                <div className="hero-content flex flex-col lg:flex-row-reverse items-center">
                    <img
                        src="https://kubernetes.io/images/blog/2024-04-17-kubernetes-1.30-release/k8s-1.30.png"
                        alt="Technology"
                        className="w-full max-w-md rounded-lg"
                    />
                    <div className="text-center lg:text-left max-w-2xl">
                        <h1 className="text-5xl font-extrabold">Unlock the Future of Learning</h1>
                        <p className="py-6 text-lg">
                            Join our cutting-edge platform to access world-class courses, stay ahead with industry trends, and achieve your professional goals.
                        </p>
                        <button className="btn btn-primary btn-lg"><Link to="/courses">Get Started</Link></button>
                    </div>
                </div> 
            </div>
            {/* Features Section */}
            <div className="p-10">
                <h2 className="text-4xl font-bold text-center text-white my-8">Why Choose Us?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="card bg-gray-800 shadow-md">
                        <div className="card-body">
                            <h3 className="card-title text-xl font-semibold text-primary">Learn Anytime, Anywhere</h3>
                            <p>Access courses from any device, at your convenience.</p>
                        </div>
                    </div>
                    <div className="card bg-gray-800 shadow-md">
                        <div className="card-body">
                            <h3 className="card-title text-xl font-semibold text-primary">Expert-Led Content</h3>
                            <p>Gain insights from industry leaders and seasoned professionals.</p>
                        </div>
                    </div>
                    <div className="card bg-gray-800 shadow-md">
                        <div className="card-body">
                            <h3 className="card-title text-xl font-semibold text-primary">Interactive Learning</h3>
                            <p>Engage with hands-on projects, quizzes, and collaborative tasks.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Capabilities Section */}
            <div className="p-10 bg-gray-800">
                <h2 className="text-4xl font-bold text-center text-white my-8">Platform Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-start">
                        <div className="text-primary text-3xl mr-4">🎓</div>
                        <div>
                            <h3 className="text-2xl font-semibold">Certification</h3>
                            <p>Earn certificates that showcase your expertise to employers.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="text-primary text-3xl mr-4">📚</div>
                        <div>
                            <h3 className="text-2xl font-semibold">Diverse Topics</h3>
                            <p>Explore a wide array of courses, from tech to creative skills.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="text-primary text-3xl mr-4">📈</div>
                        <div>
                            <h3 className="text-2xl font-semibold">Progress Tracking</h3>
                            <p>Monitor your learning journey with advanced analytics.</p>
                        </div>
                    </div>
                    <div className="flex items-start">
                        <div className="text-primary text-3xl mr-4">🌐</div>
                        <div>
                            <h3 className="text-2xl font-semibold">Global Community</h3>
                            <p>Connect with learners and professionals worldwide.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="p-10 text-center bg-gradient-to-r from-blue-900 to-indigo-800">
                <h2 className="text-3xl font-bold text-white my-4">Ready to Transform Your Career?</h2>
                <button className="btn btn-primary btn-lg">Join Now</button>
            </div>
        </div>
    );
};

export default HomePage;
