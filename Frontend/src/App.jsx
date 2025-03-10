import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/VideoMeet';

function App() {

  return (
  <div className="App">

    <BrowserRouter>
      
      <AuthProvider>

        <Routes>

          <Route path='/' element={<LandingPage/>} />

          <Route path='/auth' element={<Authentication/>} />

          <Route path='/:url' element={<VideoMeetComponent/>} />

        </Routes>

      </AuthProvider> 

    </BrowserRouter> 

  </div>
  )
}

export default App
