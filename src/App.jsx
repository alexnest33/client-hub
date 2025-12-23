// import './App.css'
// import { Route, Routes } from 'react-router'
// import ClientRequest from './pages/ClientRequest'
// import AdminSignIn from './pages/AdminSignIn'
// import AdminDashboard from './pages/AdminDashboard'
// import PrivateRoute from './components/PrivateRoute'
// import { initTrafficSource,getSavedUtmParams } from './utils/utmParams'
// import { useEffect } from 'react'
// import { useLocation } from 'react-router'





// function App() {
//   const location = useLocation();

//   useEffect(() => {
//     initTrafficSource();
//     const saved = getSavedUtmParams();
//     console.log("💾 Сохраненные UTM:", saved);
//   }, [location.search]);


//   return (
//     <>
//       <Routes>
//         <Route path='/' element={<ClientRequest />} />
//         <Route path='/login' element={<AdminSignIn />} />
//         <Route element={<PrivateRoute />}>
//           <Route path='/admin' element={<AdminDashboard />} />
//         </Route>
//       </Routes>


//     </>
//   )
// }

// export default App


import './App.css'
import { Route, Routes } from 'react-router'
import { lazy, Suspense, useEffect } from 'react'
import { useLocation } from 'react-router'
import ClientRequest from './pages/ClientRequest'
import AdminSignIn from './pages/AdminSignIn'
import PrivateRoute from './components/PrivateRoute'
import { initTrafficSource, getSavedUtmParams } from './utils/utmParams'

// Lazy load админку
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))

function App() {
  const location = useLocation();

  useEffect(() => {
    initTrafficSource();
    const saved = getSavedUtmParams();
    console.log("💾 Сохраненные UTM:", saved);
  }, [location.search]);

  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <Routes>
        <Route path='/' element={<ClientRequest />} />
        <Route path='/login' element={<AdminSignIn />} />
        <Route element={<PrivateRoute />}>
          <Route path='/admin' element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
