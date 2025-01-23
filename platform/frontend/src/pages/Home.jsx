import React, { useState } from 'react';
import { useAuth } from "../context/OAuthContext";
import { sendOAuthRequest } from '../services/AuthService';
import { Navigate } from "react-router-dom";

// const HomePage = () => {
//     return (
//         <div className="bg-gray-900 text-gray-200 min-h-screen font-sans">
//             {/* Hero Section */}
//             <div className="hero min-h-screen bg-gradient-to-r from-blue-900 to-indigo-800 text-white">
//                 <div className="hero-content flex flex-col lg:flex-row-reverse items-center">
//                     <img
//                         src="https://kubernetes.io/images/blog/2024-04-17-kubernetes-1.30-release/k8s-1.30.png"
//                         alt="Technology"
//                         className="w-full max-w-md rounded-lg"
//                     />
//                     <div className="text-center lg:text-left max-w-2xl">
//                         <h1 className="text-5xl font-extrabold">Unlock the Future of Learning</h1>
//                         <p className="py-6 text-lg">
//                             Join our cutting-edge platform to access world-class courses, stay ahead with industry trends, and achieve your professional goals.
//                         </p>
//                         <button className="btn btn-primary btn-lg"><Link to="/courses">Get Started</Link></button>
//                     </div>
//                 </div> 
//             </div>
//             {/* Features Section */}
//             <div className="p-10">
//                 <h2 className="text-4xl font-bold text-center text-white my-8">Why Choose Us?</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//                     <div className="card bg-gray-800 shadow-md">
//                         <div className="card-body">
//                             <h3 className="card-title text-xl font-semibold text-primary">Learn Anytime, Anywhere</h3>
//                             <p>Access courses from any device, at your convenience.</p>
//                         </div>
//                     </div>
//                     <div className="card bg-gray-800 shadow-md">
//                         <div className="card-body">
//                             <h3 className="card-title text-xl font-semibold text-primary">Expert-Led Content</h3>
//                             <p>Gain insights from industry leaders and seasoned professionals.</p>
//                         </div>
//                     </div>
//                     <div className="card bg-gray-800 shadow-md">
//                         <div className="card-body">
//                             <h3 className="card-title text-xl font-semibold text-primary">Interactive Learning</h3>
//                             <p>Engage with hands-on projects, quizzes, and collaborative tasks.</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Capabilities Section */}
//             <div className="p-10 bg-gray-800">
//                 <h2 className="text-4xl font-bold text-center text-white my-8">Platform Features</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                     <div className="flex items-start">
//                         <div className="text-primary text-3xl mr-4">🎓</div>
//                         <div>
//                             <h3 className="text-2xl font-semibold">Certification</h3>
//                             <p>Earn certificates that showcase your expertise to employers.</p>
//                         </div>
//                     </div>
//                     <div className="flex items-start">
//                         <div className="text-primary text-3xl mr-4">📚</div>
//                         <div>
//                             <h3 className="text-2xl font-semibold">Diverse Topics</h3>
//                             <p>Explore a wide array of courses, from tech to creative skills.</p>
//                         </div>
//                     </div>
//                     <div className="flex items-start">
//                         <div className="text-primary text-3xl mr-4">📈</div>
//                         <div>
//                             <h3 className="text-2xl font-semibold">Progress Tracking</h3>
//                             <p>Monitor your learning journey with advanced analytics.</p>
//                         </div>
//                     </div>
//                     <div className="flex items-start">
//                         <div className="text-primary text-3xl mr-4">🌐</div>
//                         <div>
//                             <h3 className="text-2xl font-semibold">Global Community</h3>
//                             <p>Connect with learners and professionals worldwide.</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Call to Action */}
//             <div className="p-10 text-center bg-gradient-to-r from-blue-900 to-indigo-800">
//                 <h2 className="text-3xl font-bold text-white my-4">Ready to Transform Your Career?</h2>
//                 <button className="btn btn-primary btn-lg">Join Now</button>
//             </div>
//         </div>
//     );
// };

// export default HomePage;

// const HomePage = () => {
//     return (
//       <div className="bg-gray-100 text-gray-800 min-h-screen font-sans">
//         {/* Header Section */}
//         {/* <header className="bg-white shadow sticky top-0 z-50">
//           <div className="container mx-auto flex items-center justify-between py-4 px-6">
//             <h1 className="text-2xl font-bold">EduPlatform</h1>
//             <nav className="space-x-4">
//               <a href="#features" className="hover:underline">Features</a>
//               <a href="#stats" className="hover:underline">Stats</a>
//               <a href="#contact" className="hover:underline">Contact</a>
//             </nav>
//           </div>
//         </header> */}

//         {/* Hero Section */}
//         <section className="text-center py-20 bg-gradient-to-b from-gray-200 via-gray-100 to-white">
//           <h2 className="text-4xl font-bold mb-4">Learn Smarter, Not Harder</h2>
//           <p className="text-lg mb-6">An interactive platform designed to make learning engaging and effective.</p>
//           <div className="flex justify-center mt-6">
//             <input
//               type="text"
//               className="input input-bordered input-lg max-w-xs placeholder-gray-500"
//               placeholder="Start typing to explore..."
//             />
//           </div>
//         </section>

//         {/* Features Section */}
//         <section id="features" className="container mx-auto py-16 px-6">
//           <h3 className="text-3xl font-bold mb-10 text-center">Why Choose EduPlatform?</h3>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="card shadow-lg bg-white p-6">
//               <h4 className="text-xl font-semibold mb-2">Personalized Learning</h4>
//               <p>Get tailored recommendations and progress tracking.</p>
//             </div>
//             <div className="card shadow-lg bg-white p-6">
//               <h4 className="text-xl font-semibold mb-2">Interactive Content</h4>
//               <p>Engage with quizzes, videos, and interactive lessons.</p>
//             </div>
//             <div className="card shadow-lg bg-white p-6">
//               <h4 className="text-xl font-semibold mb-2">Community Support</h4>
//               <p>Join a network of learners and experts worldwide.</p>
//             </div>
//           </div>
//         </section>

//         {/* Statistics Section */}
//         <section id="stats" className="bg-gray-200 py-16">
//           <h3 className="text-3xl font-bold mb-10 text-center">Our Achievements</h3>
//           <div className="flex justify-center space-x-8">
//             <div className="stat">
//               <div className="stat-title">Users</div>
//               <div className="stat-value">50K+</div>
//             </div>
//             <div className="stat">
//               <div className="stat-title">Courses</div>
//               <div className="stat-value">200+</div>
//             </div>
//             <div className="stat">
//               <div className="stat-title">Success Rate</div>
//               <div className="stat-value">95%</div>
//             </div>
//           </div>
//         </section>

//         {/* CTA Section */}
//         <section className="bg-white py-16">
//           <div className="container mx-auto text-center">
//             <h3 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h3>
//             <p className="mb-6">Sign up now and take the first step towards mastering your goals!</p>
//             <button className="btn btn-primary">Get Started</button>
//           </div>
//         </section>

//         {/* Footer */}
//         <footer className="bg-gray-800 text-white py-8">
//           <div className="container mx-auto text-center">
//             <p>&copy; 2025 EduPlatform. All Rights Reserved.</p>
//           </div>
//         </footer>
//       </div>
//     );
//   };

//   export default HomePage;



const HomePage = () => {
    const { user } = useAuth();
    if (user?.id_token) {
        return <Navigate to='/courses' replace />;
    }
    const [loading, setLoading ] = useState(false)
    const loginHandler = async () => {
        setLoading(true)
        await sendOAuthRequest()
    }

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Левая часть: лендинг */}
            <div className="flex-[1.7_2] bg-base-200 flex items-center justify-center">

                <div className="max-w-4xl p-8">

                    <h1 className="text-5xl font-bold mb-6">Интерактивная IT-платформа</h1>
                    <p className="text-lg mb-8">
                        Платформа для обучения IT и ИБ-специалистов. Получите доступ к среде, которая позволяет учиться на реальных задачах.
                    </p>

                    {/* Карточки с информацией */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="card bg-base-100 shadow-lg p-4">
                            <h2 className="text-xl font-semibold">Автоматическое развертывание</h2>
                            <p className="text-sm">
                                Мы предоставляем готовую инфраструктуру для выполнения заданий.
                            </p>
                        </div>
                        <div className="card bg-base-100 shadow-lg p-4">
                            <h2 className="text-xl font-semibold">Реальные сценарии</h2>
                            <p className="text-sm">
                                Выполняйте задания в окружении, которое имитирует реальный мир.
                            </p>
                        </div>
                        <div className="card bg-base-100 shadow-lg p-4">
                            <h2 className="text-xl font-semibold">Отчеты и аналитика</h2>
                            <p className="text-sm">
                                Получайте подробные отчеты об обучении и прогрессе.
                            </p>
                        </div>
                        <div className="card bg-base-100 shadow-lg p-4">
                            <h2 className="text-xl font-semibold">Безопасная среда</h2>
                            <p className="text-sm">
                                Ваша работа проходит в изолированной и безопасной инфраструктуре.
                            </p>
                        </div>
                    </div>

                    {/* Кнопка перехода к документации */}
                    <button className="btn btn-primary">
                        <a href="/docs" target="_blank" rel="noopener noreferrer">
                            Перейти к документации
                        </a>
                    </button>
                </div>
            </div>

            {/* Правая часть: авторизация */}
            <div className="flex-1 bg-base-100 flex items-center justify-center">
                <div className="w-full max-w-md p-6 border border-gray-500 shadow-xl rounded-lg text-center">
                    <h2 className="text-3xl font-semibold mb-6">Вход в систему</h2>
                    <p className="text-sm mb-6">
                        Используйте вашу учетную запись.
                    </p>
                    {loading ?
                        <button className="btn btn-primary btn-block">
                            <span className="loading loading-spinner"></span>Redirecting
                        </button>
                        :
                        <button className="btn btn-primary btn-block" onClick={loginHandler}>Login via OIDC</button>

                    }
                </div>
            </div>
        </div>
    );
};

export default HomePage;