import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/landing';
import Authentication from './pages/authentication';

function App() {

  return (
  <div className="App">

    <BrowserRouter>

      <Routes>

        <Route path='/' element={<LandingPage/>} />

        <Route path='/auth' element={<Authentication/>} />

      </Routes>
      
    </BrowserRouter>
  </div>
  )
}

export default App
