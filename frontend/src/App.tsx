import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Meeting } from './pages/Meeting';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/meeting/:meetingId"
          element={
            <PrivateRoute>
              <Meeting />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
