import { Navigate, Outlet } from 'react-router-dom';
//localstorage'e token ve user bilgilerini kaydediyoruz

const PrivateRoute = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoute; 