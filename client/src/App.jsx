import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import RouteProtegee from './components/RouteProtegee'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Contact from './pages/Contact'
import Inscription from './pages/Inscription'
import Connexion from './pages/Connexion'
import Reservation from './pages/Reservation'
import EspaceClient from './pages/EspaceClient'
import ModifierReservation from './pages/ModifierReservation'
import BackOfficeReservations from './pages/BackOfficeReservations'
import BackOfficeFermetures from './pages/BackOfficeFermetures'
import PageIntrouvable from './pages/PageIntrouvable'

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route
            path="/espace-client"
            element={
              <RouteProtegee>
                <EspaceClient />
              </RouteProtegee>
            }
          />
          <Route
            path="/espace-client/:id/modifier"
            element={
              <RouteProtegee>
                <ModifierReservation />
              </RouteProtegee>
            }
          />
          <Route
            path="/back-office"
            element={
              <RouteProtegee roleRequis="RESTAURATEUR">
                <BackOfficeReservations />
              </RouteProtegee>
            }
          />
          <Route
            path="/back-office/fermetures"
            element={
              <RouteProtegee roleRequis="RESTAURATEUR">
                <BackOfficeFermetures />
              </RouteProtegee>
            }
          />
          <Route path="*" element={<PageIntrouvable />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
