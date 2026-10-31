import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord - Mon Comptable</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Chiffre d'affaires</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">12 500 €</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Dépenses</h2>
          <p className="text-3xl font-bold text-red-600 mt-2">3 200 €</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Clients en attente</h2>
          <p className="text-3xl font-bold text-orange-600 mt-2">4</p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <div className="w-64 bg-blue-900 text-white p-6">
          <h2 className="text-2xl font-bold mb-8">PME Gestion</h2>
          <nav className="flex flex-col gap-4">
            <Link to="/" className="hover:text-blue-300">Tableau de bord</Link>
            <Link to="/compta" className="hover:text-blue-300">Mon Comptable</Link>
            <Link to="/stock" className="hover:text-blue-300">Gestion de Stock</Link>
            <Link to="/clients" className="hover:text-blue-300">Espace Clients</Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/compta" element={<div className="p-8">Page Comptabilité</div>} />
            <Route path="/stock" element={<div className="p-8">Page Stock</div>} />
            <Route path="/clients" element={<div className="p-8">Page Clients</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
