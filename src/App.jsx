import './App.css'
import { Route, Routes } from 'react-router'
import ClientRequest from './pages/ClientRequest'
import AdminSignIn from './pages/AdminSignIn'
import AdminDashboard from './pages/AdminDashboard'
import PrivateRoute from './components/PrivateRoute'
import { initTrafficSource,getSavedUtmParams } from './utils/utmParams'
import { useEffect } from 'react'
import { useLocation } from 'react-router'





function App() {
  const location = useLocation();

  useEffect(() => {
    console.log("🔍 Текущий URL:", window.location.href);
    console.log("🔍 UTM в URL:", {
      utm_source: new URLSearchParams(location.search).get("utm_source"),
      utm_medium: new URLSearchParams(location.search).get("utm_medium"),
      utm_campaign: new URLSearchParams(location.search).get("utm_campaign"),
    });
    
    initTrafficSource();
    
    // Показываем сохраненные UTM для отладки
    const saved = getSavedUtmParams();
    console.log("💾 Сохраненные UTM:", saved);
  }, [location.search]);


  return (
    <>
      <Routes>
        <Route path='/' element={<ClientRequest />} />
        <Route path='/login' element={<AdminSignIn />} />
        <Route element={<PrivateRoute />}>
          <Route path='/admin' element={<AdminDashboard />} />
        </Route>
      </Routes>


    </>
  )
}

export default App
