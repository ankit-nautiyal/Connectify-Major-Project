import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import { AuthProvider } from './contexts/AuthContext';
import VideoMeetComponent from './pages/VideoMeet';
import History from './pages/history';
import HomeComponent from './pages/home';

function App() {

  return (
  <div className="App">

    <BrowserRouter>
      
      <AuthProvider>

        <Routes>

          <Route path='/' element={<LandingPage/>} />

          <Route path='/auth' element={<Authentication/>} />

          <Route path='/:url' element={<VideoMeetComponent/>} />

          <Route path='/history' element={<History/> } />

          <Route path='/home' element={<HomeComponent/> } />

        </Routes>

      </AuthProvider> 

    </BrowserRouter> 

  </div>
  )
}

export default App
