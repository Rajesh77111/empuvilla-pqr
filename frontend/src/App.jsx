import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Menu, LogIn, LogOut, Shield, 
  MapPin, CheckCircle, AlertTriangle, Droplets, RefreshCw, Trash2, 
  Sparkles, Download, BarChart3, CheckSquare, XCircle, User, Lock, Phone,
  HardHat // Icono para operarios
} from 'lucide-react';

// --- IMPORTAR BASE DE DATOS EXTERNA ---
// Asegúrate de que el archivo subscribers.js esté en la carpeta src/data
import { SUBSCRIBERS_DB } from './data/subscribers';

// --- CONFIGURACIÓN DEL SERVIDOR ---
const API_URL = 'https://empuvilla-api.onrender.com/api/pqrs';

// --- LISTA DE OPERARIOS ---
const OPERATORS_LIST = ['Rosa', 'Hernan', 'Arnoldo', 'Jaiver'];

// --- HELPER GEMINI API ---
const callGeminiAPI = async (prompt) => {
  const apiKey = ""; // La clave se inyecta en tiempo de ejecución
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!response.ok) throw new Error('Error API');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Error generando texto.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

// --- COMPONENTES UI ---
const Card = ({ children, className = "", ...props }) => (
  <div 
    className={`bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden ${className}`}
    {...props}
  >
    {children}
  </div>
);

const Badge = ({ status }) => {
  const styles = {
    Radicada: "bg-gray-100 text-gray-800 border-gray-200",
    "En Proceso": "bg-blue-100 text-blue-800 border-blue-200",
    Resuelta: "bg-green-100 text-green-800 border-green-200",
    Cerrada: "bg-slate-800 text-white border-slate-600",
    Rechazada: "bg-red-100 text-red-800 border-red-200"
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.Radicada}`}>{status}</span>;
};

// --- APP PRINCIPAL ---
export default function App() {
  const [role, setRole] = useState('guest'); 
  const [view, setView] = useState('home'); 
  const [pqrs, setPqrs] = useState([]);
  const [notification, setNotification] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    fetchPqrs();
  }, []);

  const fetchPqrs = async () => {
    setLoadingData(true);
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setPqrs(data);
      } else {
        console.error("Error al cargar datos del servidor");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreatePQR = async (newPQR) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPQR)
      });
      
      if (response.ok) {
        const savedPQR = await response.json();
        setPqrs([savedPQR, ...pqrs]); 
        showNotification(`Solicitud Radicada con Éxito: ${savedPQR.id}`, 'success');
        setView('home');
      } else {
        showNotification("Error al guardar en la nube", "error");
      }
    } catch (error) {
      showNotification("Error de conexión al guardar", "error");
    }
  };

  const handleUpdatePQR = async (updatedPQR) => {
    try {
      const response = await fetch(`${API_URL}/${updatedPQR.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPQR)
      });

      if (response.ok) {
        const result = await response.json();
        const updatedList = pqrs.map(p => p.id === result.id ? result : p);
        setPqrs(updatedList);
        showNotification('Gestión guardada y sincronizada correctamente', 'success');
      } else {
        showNotification("Error al actualizar en la nube", "error");
      }
    } catch (error) {
      showNotification("Error de conexión al actualizar", "error");
    }
  };

  const handleDeletePQR = async (id) => {
    if (!window.confirm("¿ESTÁ SEGURO? Esta acción eliminará la PQR permanentemente.")) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedList = pqrs.filter(p => p.id !== id);
        setPqrs(updatedList);
        showNotification('PQR Eliminada del sistema', 'success');
      } else {
        showNotification("Error al eliminar", "error");
      }
    } catch (error) {
      showNotification("Error de conexión al eliminar", "error");
    }
  };

  const handleLogin = (userRole) => {
    setRole(userRole);
    setShowLogin(false);
    setView(userRole === 'manager' || userRole === 'admin' ? 'admin' : 'operations');
    fetchPqrs(); 
    
    let welcomeMsg = "Bienvenido";
    if(userRole === 'manager') welcomeMsg = "Bienvenido Gerencia";
    if(userRole === 'operator') welcomeMsg = "Bienvenido Operaciones";
    if(userRole === 'admin') welcomeMsg = "Bienvenido Administrador (Superusuario)";
    
    showNotification(welcomeMsg, 'success');
  };

  const handleLogout = () => {
    setRole('guest');
    setView('home');
    showNotification('Sesión cerrada correctamente');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* HEADER */}
      <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-50 border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
            
            {/* LOGO */}
            <div className="bg-white p-1 rounded-lg">
              <img 
                src="/logoEMPUVILLA.png" 
                alt="Logo EMPUVILLA" 
                className="h-10 w-auto object-contain" 
              />
            </div>

            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight leading-none">EMPUVILLA S.A. E.S.P.</h1>
              <p className="text-xs text-blue-200 font-light">Gestión de Servicios Públicos</p>
            </div>
          </div>
          
          <nav className="hidden md:flex gap-2 items-center">
            {role === 'guest' && (
              <>
                <NavButton active={view === 'create'} onClick={() => setView('create')} icon={<FileText size={16}/>} label="Radicar PQR" />
                <NavButton active={view === 'search'} onClick={() => setView('search')} icon={<Search size={16}/>} label="Consultar Estado" />
                <div className="h-6 w-px bg-blue-700 mx-2"></div>
                <button onClick={() => setShowLogin(true)} className="text-xs bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded border border-blue-600 flex items-center gap-1">
                  <Lock size={12}/> Acceso Funcionarios
                </button>
              </>
            )}
            
            {role !== 'guest' && (
              <>
                <span className={`text-xs font-bold px-2 py-1 rounded mr-2 ${role === 'admin' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-blue-900'}`}>
                  {role === 'manager' ? 'GERENCIA' : role === 'operator' ? 'OPERACIONES' : 'ADMIN / DEV'}
                </span>
                <button onClick={handleLogout} className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded flex items-center gap-1">
                  <LogOut size={12}/> Salir
                </button>
              </>
            )}
          </nav>
          
          <button className="md:hidden p-2"><Menu /></button>
        </div>
      </header>

      {/* NOTIFICACIONES */}
      {notification && (
        <div className={`fixed top-24 right-4 z-50 px-6 py-4 rounded-lg shadow-xl text-white flex items-center gap-3 animate-bounce-in ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {notification.type === 'success' ? <CheckCircle /> : <AlertTriangle />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      {/* MODAL LOGIN */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
        {loadingData && pqrs.length === 0 && (
           <div className="text-center py-4 text-blue-600 animate-pulse">Conectando con el servidor...</div>
        )}

        {role === 'guest' && view === 'home' && <HomeView setView={setView} setShowLogin={setShowLogin} />}
        {role === 'guest' && view === 'create' && <CreatePQRForm onCreate={handleCreatePQR} onCancel={() => setView('home')} />}
        {role === 'guest' && view === 'search' && <SearchPQR pqrs={pqrs} />}
        
        {(role === 'manager' || role === 'admin') && <AdminDashboard pqrs={pqrs} role={role} onDelete={handleDeletePQR} />}
        {role === 'operator' && <OperationalPanel pqrs={pqrs} onUpdate={handleUpdatePQR} />}
      </main>

      <footer className="bg-slate-100 border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
        <p className="font-semibold text-slate-700">EMPUVILLA S.A. E.S.P.</p>
        <p>Vigilado Superservicios - Villa Rica, Cauca</p>
        <p className="mt-4 text-xs text-slate-400 font-light">
          Software desarrollado por <strong>Multivela Studio</strong>
        </p>
      </footer>
    </div>
  );
}

const NavButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all text-sm font-medium ${active ? 'bg-yellow-400 text-blue-900 shadow-sm' : 'text-blue-100 hover:bg-blue-800'}`}
  >
    {icon} {label}
  </button>
);

// --- COMPONENTE LOGIN ---
function LoginModal({ onLogin, onClose }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (user === 'operario' && pass === 'empuvilla2025') {
      onLogin('operator');
    } else if (user === 'gerente' && pass === 'admin2025') {
      onLogin('manager');
    } else if (user === 'admin' && pass === 'master2025') { 
      onLogin('admin');
    } else {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full animate-in fade-in zoom-in">
      <div className="text-center mb-6">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-900">
          <Shield size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Acceso Restringido</h3>
        <p className="text-sm text-slate-500">Solo personal autorizado</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Usuario</label>
          <input type="text" value={user} onChange={e => setUser(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: operario" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
        </div>
        
        {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
        
        <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors">Ingresar</button>
        <button type="button" onClick={onClose} className="w-full text-slate-500 py-2 text-sm hover:underline">Cancelar</button>
      </form>
      <div className="mt-4 text-xs text-center text-slate-400 bg-slate-50 p-2 rounded border border-dashed">
         <p><strong>Operario:</strong> operario / empuvilla2025</p>
         <p><strong>Gerente:</strong> gerente / admin2025</p>
         <p className="text-red-500 font-bold"><strong>Admin:</strong> admin / master2025</p>
      </div>
    </div>
  );
}

// --- VISTA HOME (GUEST) ---
function HomeView({ setView, setShowLogin }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-8 animate-in fade-in zoom-in duration-300">
      <div className="text-center max-w-2xl">
        <h2 className="text-3xl font-bold text-blue-900 mb-4">Portal de Atención al Usuario</h2>
        <p className="text-slate-600">Bienvenido al sistema digital de EMPUVILLA. Aquí podrá realizar sus trámites de Acueducto, Alcantarillado y Aseo sin filas.</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
        <Card className="hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1" onClick={() => setView('create')}>
          <div className="p-8 flex flex-col items-center text-center h-full hover:bg-blue-50 transition-colors">
            <div className="bg-blue-100 p-4 rounded-full text-blue-600 mb-4 group-hover:scale-110 transition-transform">
              <FileText size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Radicar Solicitud</h3>
            <p className="text-slate-500 text-sm">Presente peticiones, quejas o reclamos. Requiere código de suscriptor.</p>
            <span className="mt-4 text-blue-600 text-sm font-bold flex items-center gap-1">Iniciar <span className="text-lg">→</span></span>
          </div>
        </Card>

        <Card className="hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1" onClick={() => setView('search')}>
          <div className="p-8 flex flex-col items-center text-center h-full hover:bg-green-50 transition-colors">
            <div className="bg-green-100 p-4 rounded-full text-green-600 mb-4 group-hover:scale-110 transition-transform">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Consultar Estado</h3>
            <p className="text-slate-500 text-sm">Verifique el avance de sus trámites con su número de radicado.</p>
            <span className="mt-4 text-green-600 text-sm font-bold flex items-center gap-1">Consultar <span className="text-lg">→</span></span>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <button onClick={() => setShowLogin(true)} className="text-slate-400 text-sm hover:text-blue-600 underline flex items-center gap-1">
          <Lock size={12} /> Acceso administrativo
        </button>
      </div>
    </div>
  );
}

// --- FORMULARIO DE RADICACIÓN (GUEST) ---
function CreatePQRForm({ onCreate, onCancel }) {
  const [step, setStep] = useState(1);
  const [subscriberCode, setSubscriberCode] = useState('');
  const [subscriberData, setSubscriberData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [wantsAgreement, setWantsAgreement] = useState(false);
  const [aiImproving, setAiImproving] = useState(false);
  const [formData, setFormData] = useState({ service: '', description: '', addressDetails: '', cedula: '', phone: '', receiptImage: null });

  const validateSubscriber = () => {
    setLoading(true);
    setTimeout(() => {
      const data = SUBSCRIBERS_DB[subscriberCode];
      if (data) { setSubscriberData(data); setFormData(prev => ({ ...prev, phone: data.phone })); setStep(2); }
      else { alert("Código no encontrado. Verifique su factura."); }
      setLoading(false);
    }, 800);
  };

  const handleAiImprove = async () => {
    setAiImproving(true);
    const improved = await callGeminiAPI(`Mejora esta queja formalmente para una empresa de servicios públicos: "${formData.description}"`);
    if (improved) setFormData(prev => ({...prev, description: improved}));
    setAiImproving(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paymentStatus) return alert("Indique estado de pago.");
    
    // --- GENERACIÓN DE ID PROFESIONAL ---
    const now = new Date();
    const fecha = now.toISOString().slice(0,10).replace(/-/g, '');
    const hora = now.toTimeString().slice(0,5).replace(/:/g, '');
    const aleatorio = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    const nuevoID = `PQR-${fecha}-${hora}${aleatorio}`;

    const newPQR = {
      id: nuevoID,
      subscriberCode,
      ...subscriberData,
      ...formData,
      fullAddress: `${subscriberData.address} ${formData.addressDetails || ''}`,
      paymentStatus: paymentStatus === 'yes' ? 'Al día' : 'En Mora',
      wantsAgreement,
      date: new Date().toISOString(),
      status: 'Radicada',
      history: [{ date: new Date().toISOString(), action: 'Radicación', user: 'Web' }]
    };
    onCreate(newPQR);
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <div className="bg-blue-900 text-white p-4 font-bold flex justify-between items-center">
        <span className="flex items-center gap-2"><FileText size={18}/> Radicar Nueva PQR</span>
        <button onClick={onCancel}><XCircle size={20}/></button>
      </div>
      <div className="p-6">
        {step === 1 && (
          <div className="text-center space-y-6 py-8">
             <h3 className="font-bold text-lg text-slate-700">Validación de Suscriptor</h3>
             <p className="text-slate-500">Ingrese el código que aparece en su factura (Ej: 1001)</p>
             <div className="flex gap-2 max-w-sm mx-auto">
               <input className="flex-1 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Código" value={subscriberCode} onChange={e=>setSubscriberCode(e.target.value)} />
               <button onClick={validateSubscriber} disabled={loading} className="bg-yellow-400 px-6 rounded-lg font-bold text-blue-900 hover:bg-yellow-300 disabled:opacity-50">
                 {loading ? '...' : 'Validar'}
               </button>
             </div>
          </div>
        )}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-10">
             <div className="bg-slate-50 p-4 rounded-lg grid md:grid-cols-2 gap-4 text-sm border border-slate-200">
               <div>
                 <label className="text-xs font-bold text-slate-400 uppercase">Suscriptor</label>
                 <div className="font-medium text-slate-800">{subscriberData.name}</div>
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-400 uppercase">Dirección</label>
                 <div className="font-medium text-slate-800 flex items-center gap-1"><MapPin size={14} className="text-red-500"/> {subscriberData.address}</div>
               </div>
             </div>
             
             <div className="grid md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Cédula *</label>
                 <input required className="w-full p-2 border rounded-md" onChange={e => setFormData({...formData, cedula: e.target.value})} />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono *</label>
                 <input required className="w-full p-2 border rounded-md" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
               </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Indicaciones Adicionales</label>
               <input className="w-full p-2 border rounded-md" placeholder="Ej: Casa rejas blancas..." onChange={e => setFormData({...formData, addressDetails: e.target.value})} />
             </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Servicio *</label>
                <div className="grid grid-cols-3 gap-3">
                  {['Acueducto', 'Alcantarillado', 'Aseo'].map(svc => (
                    <label key={svc} className={`border p-3 text-center rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${formData.service === svc ? 'bg-blue-100 border-blue-500 text-blue-800 font-bold' : ''}`}>
                      <input type="radio" name="svc" value={svc} className="hidden" onChange={e=>setFormData({...formData, service: e.target.value})} required/>
                      <div className="flex justify-center mb-1">
                        {svc === 'Acueducto' && <Droplets size={20} className="text-blue-500"/>}
                        {svc === 'Alcantarillado' && <RefreshCw size={20} className="text-gray-500"/>}
                        {svc === 'Aseo' && <Trash2 size={20} className="text-green-500"/>}
                      </div>
                      {svc}
                    </label>
                  ))}
               </div>
             </div>

             <div className="border-2 border-yellow-100 p-4 rounded-xl text-center bg-white shadow-sm">
                <p className="font-bold text-lg mb-3">¿Está al día con el pago del servicio?</p>
                <div className="flex justify-center gap-6 mb-4">
                   <button type="button" onClick={()=>setPaymentStatus('yes')} className={`px-6 py-2 rounded-full font-bold transition-all ${paymentStatus==='yes'?'bg-green-600 text-white shadow-md':'border border-slate-300 text-slate-600'}`}>SÍ</button>
                   <button type="button" onClick={()=>setPaymentStatus('no')} className={`px-6 py-2 rounded-full font-bold transition-all ${paymentStatus==='no'?'bg-red-600 text-white shadow-md':'border border-slate-300 text-slate-600'}`}>NO</button>
                </div>
                {paymentStatus === 'yes' && <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">Verificaremos en sistema. Si hay mora, la atención puede demorar.</p>}
                {paymentStatus === 'no' && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded space-y-2">
                    <p>La atención puede demorar por mora. Acérquese a realizar acuerdo de pago.</p>
                    <label className="flex items-center justify-center gap-2 cursor-pointer font-bold">
                      <input type="checkbox" checked={wantsAgreement} onChange={e => setWantsAgreement(e.target.checked)} />
                      Deseo realizar acuerdo de pago
                    </label>
                  </div>
                )}
             </div>

             <div>
               <div className="flex justify-between items-end mb-1">
                 <label className="block text-sm font-medium text-slate-700">Descripción detallada *</label>
                 <button type="button" onClick={handleAiImprove} disabled={aiImproving} className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded hover:bg-purple-100 flex items-center gap-1">
                   <Sparkles size={12}/> {aiImproving ? 'Mejorando...' : 'Mejorar Redacción con IA'}
                 </button>
               </div>
               <textarea required className="w-full border p-3 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Describa su problema..." value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} />
             </div>

             <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 shadow-lg transition-transform transform hover:-translate-y-0.5">Radicar Solicitud</button>
          </form>
        )}
      </div>
    </Card>
  );
}

// --- CONSULTA PQR (GUEST) ---
function SearchPQR({ pqrs }) {
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null);
  
  const handleSearch = () => {
    if(!q) return;
    const found = pqrs.filter(p => p.id === q || p.subscriberCode === q);
    setRes(found);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-8 text-center">
         <h2 className="text-2xl font-bold text-slate-800 mb-6">Consulta de Trámites</h2>
         <div className="flex gap-2 max-w-lg mx-auto">
           <input className="flex-1 border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Número PQR o Código Suscriptor" value={q} onChange={e=>setQ(e.target.value)}/>
           <button onClick={handleSearch} className="bg-green-600 text-white px-6 rounded-lg font-bold hover:bg-green-700 shadow"><Search/></button>
         </div>
      </Card>
      
      {res && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5">
           {res.length === 0 && <div className="text-center text-slate-400 py-4">No se encontraron resultados.</div>}
           {res.map(p => (
             <Card key={p.id} className="p-6">
               <div className="flex justify-between items-start border-b pb-4 mb-4">
                 <div>
                   <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2"><FileText size={18}/> {p.id}</h3>
                   <p className="text-sm text-slate-500">{new Date(p.date).toLocaleString()}</p>
                 </div>
                 <Badge status={p.status}/>
               </div>
               <div className="grid md:grid-cols-2 gap-6 text-sm">
                 <div className="space-y-2">
                   <p><strong>Servicio:</strong> {p.service}</p>
                   <p><strong>Suscriptor:</strong> {p.name}</p>
                   <div className="bg-slate-50 p-3 rounded border text-slate-600 italic">"{p.description}"</div>
                 </div>
                 <div className="border-l pl-4">
                   <h4 className="font-bold text-slate-500 mb-2 uppercase text-xs">Historial</h4>
                   <div className="space-y-3 max-h-40 overflow-y-auto">
                     {p.history?.map((h, i) => (
                       <div key={i} className="text-xs relative pl-4 border-l-2 border-blue-200">
                         <div className="font-bold text-slate-700">{h.action}</div>
                         <div className="text-slate-400">{new Date(h.date).toLocaleDateString()} - {h.user}</div>
                         {h.note && <div className="mt-1 text-slate-600 bg-yellow-50 p-1 rounded border border-yellow-100">{h.note}</div>}
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
               {p.attendedInAbsence && (
                  <div className="mt-4 bg-orange-50 border border-orange-200 p-3 rounded text-orange-800 text-sm flex items-center gap-2">
                    <AlertTriangle size={18}/> <strong>Atención en Ausencia:</strong> No se obtuvo respuesta en la visita. Debe generar nueva PQR.
                  </div>
               )}
             </Card>
           ))}
        </div>
      )}
    </div>
  );
}

// --- PANEL GERENCIAL (MANAGER & ADMIN) ---
function AdminDashboard({ pqrs, role, onDelete }) {
  const total = pqrs.length;
  const resueltas = pqrs.filter(p => p.status === 'Resuelta').length;
  const pendientes = pqrs.filter(p => p.status === 'Radicada' || p.status === 'En Proceso').length;
  const efectividad = total > 0 ? Math.round((resueltas/total)*100) : 0;

  // --- NUEVA FUNCIÓN DE EXPORTACIÓN EXCEL CON ESTILOS ---
  const exportExcel = () => {
    // 1. Datos para el reporte
    const dateStr = new Date().toLocaleDateString();
    
    // 2. Estilos CSS para Excel (Excel interpreta HTML básico)
    const tableStyle = `
      <style>
        .header { background-color: #1e3a8a; color: white; font-weight: bold; text-align: center; border: 1px solid #000; }
        .row { border: 1px solid #ccc; text-align: left; }
        .title { font-size: 18px; font-weight: bold; text-align: center; background-color: #facc15; color: #1e3a8a; border: 1px solid #000; }
        .meta { font-weight: bold; background-color: #f3f4f6; border: 1px solid #000; }
      </style>
    `;

    // 3. Construcción de la Tabla HTML
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <!--[if gte mso 9]>
        <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Reporte PQR</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        ${tableStyle}
      </head>
      <body>
        <table>
          <tr>
            <td colspan="6" class="title" height="40">REPORTE DE GESTIÓN DE PQR - EMPUVILLA S.A. E.S.P.</td>
          </tr>
          <tr>
            <td colspan="6" class="meta">Fecha de Generación: ${dateStr}</td>
          </tr>
          <tr></tr>
          <tr>
            <th class="header">ID PQR</th>
            <th class="header">Fecha Radicación</th>
            <th class="header">Servicio</th>
            <th class="header">Suscriptor</th>
            <th class="header">Responsable</th>
            <th class="header">Estado</th>
          </tr>
    `;

    // 4. Agregar filas de datos
    pqrs.forEach(p => {
      html += `
        <tr>
          <td class="row">${p.id}</td>
          <td class="row">${new Date(p.date).toLocaleDateString()}</td>
          <td class="row">${p.service}</td>
          <td class="row">${p.name}</td>
          <td class="row">${p.lastResponsible || 'Sin asignar'}</td>
          <td class="row">${p.status}</td>
        </tr>
      `;
    });

    html += `
        </table>
      </body>
      </html>
    `;

    // 5. Crear Blob y descargar
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Reporte_Empuvilla_${new Date().toISOString().slice(0,10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-slate-800">
           {role === 'admin' ? 'Panel de Administración (Superusuario)' : 'Panel Gerencial'}
         </h2>
         {/* BOTÓN ACTUALIZADO PARA EXPORTAR EXCEL ELEGANTE */}
         <button onClick={exportExcel} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 flex items-center gap-2 text-sm font-bold">
           <Download size={16}/> Descargar Reporte Excel
         </button>
       </div>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-blue-500"><div className="text-xs uppercase font-bold text-slate-500">Total</div><div className="text-3xl font-black text-blue-900">{total}</div></Card>
          <Card className="p-4 border-l-4 border-yellow-500"><div className="text-xs uppercase font-bold text-slate-500">Pendientes</div><div className="text-3xl font-black text-yellow-600">{pendientes}</div></Card>
          <Card className="p-4 border-l-4 border-green-500"><div className="text-xs uppercase font-bold text-slate-500">Resueltas</div><div className="text-3xl font-black text-green-700">{resueltas}</div></Card>
          <Card className="p-4 border-l-4 border-purple-500"><div className="text-xs uppercase font-bold text-slate-500">Efectividad</div><div className="text-3xl font-black text-purple-700">{efectividad}%</div></Card>
       </div>
       <Card className="p-6">
         <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-700"><BarChart3 size={20}/> Listado General de Solicitudes</h3>
         <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
             <thead className="bg-slate-100 font-bold text-slate-600 uppercase text-xs">
               <tr>
                 <th className="p-3">ID</th>
                 <th className="p-3">Fecha</th>
                 <th className="p-3">Servicio</th>
                 <th className="p-3">Suscriptor</th>
                 <th className="p-3">Responsable</th>
                 <th className="p-3">Estado</th>
                 {role === 'admin' && <th className="p-3 text-center">Acciones</th>}
               </tr>
             </thead>
             <tbody className="divide-y">
               {pqrs.map(p=>(
                 <tr key={p.id} className="hover:bg-slate-50">
                   <td className="p-3 font-bold text-blue-900">{p.id}</td>
                   <td className="p-3">{new Date(p.date).toLocaleDateString()}</td>
                   <td className="p-3">{p.service}</td>
                   <td className="p-3">{p.name}</td>
                   <td className="p-3 font-medium text-slate-700">{p.lastResponsible || <span className="text-slate-400 italic">--</span>}</td>
                   <td className="p-3"><Badge status={p.status}/></td>
                   {role === 'admin' && (
                     <td className="p-3 text-center">
                       <button onClick={() => onDelete(p.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors" title="Eliminar definitivamente">
                         <Trash2 size={18} />
                       </button>
                     </td>
                   )}
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </Card>
    </div>
  );
}

// --- PANEL OPERATIVO (OPERATOR) ---
function OperationalPanel({ pqrs, onUpdate }) {
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('');
  const [operator, setOperator] = useState(''); // Nuevo estado para el operario
  const [aiGenerating, setAiGenerating] = useState(false);
  const [personPresent, setPersonPresent] = useState('Titular');

  const pendingList = pqrs.filter(p => p.status !== 'Resuelta' && p.status !== 'Cerrada' && p.status !== 'Rechazada');
  
  const handleSelectPQR = (pqr) => {
      setSelected(pqr);
      setStatus(pqr.status);
      setOperator(''); // Reset al cambiar de PQR
      setNote('');
      setPersonPresent('Titular');
  };

  const handleAiGenerate = async () => {
    setAiGenerating(true);
    const report = await callGeminiAPI(`Genera reporte técnico breve: Problema "${selected.description}" en servicio ${selected.service}. Acción: Inspección y reparación.`);
    if(report) setNote(report);
    setAiGenerating(false);
  };

  const handleSave = () => {
    if(!status || !note || !operator) return alert("Complete estado, operario y nota técnica"); // Validación de operario
    
    const isAbsent = personPresent === 'Ausente';
    const finalStatus = isAbsent ? 'Cerrada' : status;
    const finalNote = isAbsent ? `VISITA FALLIDA: ${note} (Ausente)` : `${note} | Atendido por: ${personPresent}`;
    
    onUpdate({
      ...selected, 
      status: finalStatus,
      lastResponsible: operator, // Se guarda el nombre del operario seleccionado
      attendedInAbsence: isAbsent,
      history: [...selected.history, {date: new Date().toISOString(), action: `Estado: ${finalStatus}`, user: operator, note: finalNote}]
    });
    setSelected(null);
    setNote('');
    setStatus('');
    setOperator('');
  };

  return (
    <div className="grid md:grid-cols-3 gap-6 h-[80vh]">
      <div className="col-span-1 border rounded-xl bg-white overflow-hidden flex flex-col shadow-sm">
        <div className="p-4 bg-slate-50 border-b font-bold text-slate-700 flex justify-between items-center">
           <span>Pendientes ({pendingList.length})</span>
           <RefreshCw size={16} className="text-slate-400"/>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2 bg-slate-50/50">
          {pendingList.length === 0 && <div className="text-center p-4 text-slate-400 text-sm">No hay solicitudes pendientes</div>}
          {pendingList.map(p=>(
            <div key={p.id} onClick={() => handleSelectPQR(p)} className={`p-3 rounded-lg border cursor-pointer hover:bg-blue-50 transition-colors text-sm bg-white ${selected?.id===p.id?'border-blue-500 ring-1 ring-blue-500':''}`}>
              <div className="font-bold flex justify-between text-blue-900"><span>{p.id}</span><span className="text-xs font-normal text-slate-500">{new Date(p.date).toLocaleDateString()}</span></div>
              <div className="flex gap-2 mt-1"><Badge status={p.status}/><span className="text-xs bg-slate-100 px-2 rounded border">{p.service}</span></div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="col-span-2">
        {selected ? (
          <Card className="h-full flex flex-col p-6 animate-in fade-in">
             <div className="flex justify-between items-center font-bold text-lg mb-4 border-b pb-4">
               <div>Gestión: <span className="text-blue-900">{selected.id}</span></div>
               <button onClick={()=>setSelected(null)} className="text-slate-400 hover:text-slate-600"><XCircle/></button>
             </div>
             
             <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100 text-sm grid grid-cols-2 gap-4">
               <div className="col-span-2"><strong>Problema:</strong> {selected.description}</div>
               <div><strong>Suscriptor:</strong> {selected.name}</div>
               <div><strong>Dirección:</strong> {selected.fullAddress}</div>
             </div>

             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nuevo Estado</label>
                   <select className="w-full border p-2 rounded text-sm" onChange={e=>setStatus(e.target.value)} value={status}>
                      <option value="Radicada">Radicada</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Resuelta">Resuelta</option>
                      <option value="Rechazada">Rechazada</option>
                      <option value="Cerrada">Cerrada</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold uppercase text-slate-500 mb-1 flex items-center gap-1"><HardHat size={12}/> Operario Responsable</label>
                   <select className="w-full border p-2 rounded text-sm bg-yellow-50 font-medium" onChange={e=>setOperator(e.target.value)} value={operator}>
                      <option value="">-- Seleccionar --</option>
                      {OPERATORS_LIST.map(op => <option key={op} value={op}>{op}</option>)}
                   </select>
                 </div>
               </div>

               <div>
                   <label className="block text-xs font-bold uppercase text-slate-500 mb-1">¿Quién atiende la visita?</label>
                   <select className="w-full border p-2 rounded text-sm mb-4" onChange={e=>setPersonPresent(e.target.value)} value={personPresent}>
                      <option value="Titular">Titular</option>
                      <option value="Familiar">Familiar</option>
                      <option value="Vecino">Vecino</option>
                      <option value="Ausente">NADIE (Ausente)</option>
                   </select>
               </div>

               <div>
                 <div className="flex justify-between items-end mb-1">
                    <label className="block text-xs font-bold uppercase text-slate-500">Informe Técnico</label>
                    <button onClick={handleAiGenerate} disabled={aiGenerating} className="text-xs text-purple-600 flex items-center gap-1 hover:underline"><Sparkles size={10}/> {aiGenerating ? 'Generando...' : 'Sugerir reporte'}</button>
                 </div>
                 <textarea className="w-full border p-3 rounded-lg h-32 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Describa la labor realizada..." onChange={e=>setNote(e.target.value)} value={note}></textarea>
               </div>
               
               <div className="flex justify-end pt-2">
                 <button onClick={handleSave} className="bg-blue-900 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-blue-800 flex items-center gap-2"><CheckSquare size={16}/> Guardar Gestión</button>
               </div>
             </div>
          </Card>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 border border-dashed rounded-xl bg-slate-50/50">
             <RefreshCw size={48} className="mb-4 opacity-50"/>
             <p>Seleccione una solicitud de la lista</p>
          </div>
        )}
      </div>
    </div>
  );
}
