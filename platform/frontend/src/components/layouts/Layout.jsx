import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../../context/OAuthContext';
import { TaskProvider } from '../../context/TaskContext';

const Layout = () => {
  return (
    <div className='flex flex-col h-screen'>
      <AuthProvider>
        <TaskProvider>
          <Header />
          <main className="flex-grow bg-base-200">

            <Outlet></Outlet>

          </main>
          {/* <Footer /> */}
        </TaskProvider>
      </AuthProvider>
    </div>
  );
};

export default Layout;
