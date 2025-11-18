// import Register from './components/Register';
import Login from './components/Login';
import User from './components/User';
import { feedStream } from './components/Feed';
// import Layout from './components/Layout';
// import Editor from './components/Editor';
// import Admin from './components/Admin';
// import Missing from './components/Missing';
// import Unauthorized from './components/Unauthorized';
// import Lounge from './components/Lounge';
// import LinkPage from './components/LinkPage';
// import RequireAuth from './components/RequireAuth';
import { Routes, Route } from 'react-router-dom';

const ROLES = {
  'User': 2001,
  'Editor': 1984,
  'Admin': 5150
}

function App() {

  return (
    <Routes>
      <Route path="/" element={<feedStream />} /> 
      <Route path="/user" element={<User />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;