import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/VideoMeet';
import History from './pages/history';
import HomeComponent from './pages/home';
import withAuth from './utils/withAuth';

function App() {
  const ProtectedVideoMeet = withAuth(VideoMeetComponent); 
  const ProtectedHome = withAuth(HomeComponent); 
  const ProtectedHistory = withAuth(History); 

  return (
  <div className="App">

    <BrowserRouter>
      
      <AuthProvider>

        <Routes>

          <Route path='/' element={<LandingPage/>} />

          <Route path='/auth' element={<Authentication/>} />

          <Route path='/:url' element={<ProtectedVideoMeet/>} />

          <Route path='/history' element={<ProtectedHistory/> } />

          <Route path='/home' element={<ProtectedHome/> } />

        </Routes>

      </AuthProvider> 

    </BrowserRouter> 

  </div>
  )
}

export default App
