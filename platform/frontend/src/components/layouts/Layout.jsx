import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../../context/OAuthContext';

const Layout = () => {
  return (
    <div className='flex flex-col h-screen'>
      <AuthProvider>
      <Header />
      <main className="flex-grow">
      
      <Outlet></Outlet>
      
      </main>
      {/* <Footer /> */}
      </AuthProvider>
    </div>
  );
};

export default Layout;
