
import React, { useState, useEffect } from 'react';
import { 
  User, UserSession, UserRole, Fueling, MaintenanceRequest, 
  RouteDeparture, Vehicle, DailyRoute, Toll, Customer, 
  FixedExpense, AgregadoFreight, Agregado, 
  FuelingStatus, MaintenanceStatus, RouteStatus, FinanceiroStatus 
} from './types';
import { INITIAL_USERS, INITIAL_VEHICLES, INITIAL_CUSTOMERS } from './constants';
import { Logo } from './components/UI';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('login');

  // Estados dos Dados com Inicialização do LocalStorage
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('pg_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('pg_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLES;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('pg_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [fuelings, setFuelings] = useState<Fueling[]>(() => {
    const saved = localStorage.getItem('pg_fuelings');
    return saved ? JSON.parse(saved) : [];
  });

  const [maintenances, setMaintenances] = useState<MaintenanceRequest[]>(() => {
    const saved = localStorage.getItem('pg_maintenances');
    return saved ? JSON.parse(saved) : [];
  });

  const [routes, setRoutes] = useState<RouteDeparture[]>(() => {
    const saved = localStorage.getItem('pg_routes');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyRoutes, setDailyRoutes] = useState<DailyRoute[]>(() => {
    const saved = localStorage.getItem('pg_daily_routes');
    return saved ? JSON.parse(saved) : [];
  });

  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => {
    const saved = localStorage.getItem('pg_fixed_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [agregados, setAgregados] = useState<Agregado[]>(() => {
    const saved = localStorage.getItem('pg_agregados');
    return saved ? JSON.parse(saved) : [];
  });

  const [agregadoFreights, setAgregadoFreights] = useState<AgregadoFreight[]>(() => {
    const saved = localStorage.getItem('pg_agregado_freights');
    return saved ? JSON.parse(saved) : [];
  });

  const [tolls, setTolls] = useState<Toll[]>(() => {
    const saved = localStorage.getItem('pg_tolls');
    return saved ? JSON.parse(saved) : [];
  });

  // Efeito de Persistência (Salva no LocalStorage sempre que algo muda)
  useEffect(() => {
    localStorage.setItem('pg_users', JSON.stringify(users));
    localStorage.setItem('pg_vehicles', JSON.stringify(vehicles));
    localStorage.setItem('pg_customers', JSON.stringify(customers));
    localStorage.setItem('pg_fuelings', JSON.stringify(fuelings));
    localStorage.setItem('pg_maintenances', JSON.stringify(maintenances));
    localStorage.setItem('pg_routes', JSON.stringify(routes));
    localStorage.setItem('pg_daily_routes', JSON.stringify(dailyRoutes));
    localStorage.setItem('pg_fixed_expenses', JSON.stringify(fixedExpenses));
    localStorage.setItem('pg_agregados', JSON.stringify(agregados));
    localStorage.setItem('pg_agregado_freights', JSON.stringify(agregadoFreights));
    localStorage.setItem('pg_tolls', JSON.stringify(tolls));
  }, [users, vehicles, customers, fuelings, maintenances, routes, dailyRoutes, fixedExpenses, agregados, agregadoFreights, tolls]);

  // Login Persistente
  useEffect(() => {
    const savedUserId = localStorage.getItem('prime_group_user_id');
    const savedSession = localStorage.getItem('prime_group_session');
    if (savedUserId) {
      const user = users.find(u => u.id === savedUserId);
      if (user && user.ativo) {
        setCurrentUser(user);
        if (savedSession) setSession(JSON.parse(savedSession));
        setCurrentPage('operation');
      }
    }
  }, []);

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('prime_group_user_id', user.id);
    navigate('operation');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSession(null);
    localStorage.removeItem('prime_group_user_id');
    localStorage.removeItem('prime_group_session');
    navigate('login');
  };

  const saveRecord = (setFn: any, record: any) => {
    setFn((prev: any) => [record, ...prev]);
  };

  const updateRecord = (setFn: any, id: string, update: any) => {
    setFn((prev: any[]) => prev.map(i => i.id === id ? { ...i, ...update } : i));
  };

  const onSaveUser = async (u: User) => {
    const exists = users.find(x => x.id === u.id);
    setUsers(prev => exists ? prev.map(x => x.id === u.id ? u : x) : [u, ...prev]);
  };

  const onSaveVehicle = async (v: Vehicle) => {
    setVehicles(prev => [...prev, v]);
  };

  // Lazy Pages
  const Login = React.lazy(() => import('./pages/Login'));
  const OperationHome = React.lazy(() => import('./pages/OperationHome'));
  const FuelingForm = React.lazy(() => import('./pages/FuelingForm'));
  const MaintenanceForm = React.lazy(() => import('./pages/MaintenanceForm'));
  const RouteForm = React.lazy(() => import('./pages/RouteForm'));
  const MyRequests = React.lazy(() => import('./pages/MyRequests'));
  const MyRoutes = React.lazy(() => import('./pages/MyRoutes'));
  const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
  const AdminPending = React.lazy(() => import('./pages/AdminPending'));
  const UserManagement = React.lazy(() => import('./pages/UserManagement'));
  const VehicleManagement = React.lazy(() => import('./pages/VehicleManagement'));
  const DriverDailyRoute = React.lazy(() => import('./pages/DriverDailyRoute'));
  const AdminVehicleReport = React.lazy(() => import('./pages/AdminVehicleReport'));
  const AdminActivityReport = React.lazy(() => import('./pages/AdminActivityReport'));
  const AdminChecklistReport = React.lazy(() => import('./pages/AdminChecklistReport'));
  const AdminFixedExpenses = React.lazy(() => import('./pages/AdminFixedExpenses'));
  const AdminTracking = React.lazy(() => import('./pages/AdminTracking'));
  const AdminConsolidatedFinancialReport = React.lazy(() => import('./pages/AdminConsolidatedFinancialReport'));
  const VehicleSelection = React.lazy(() => import('./pages/VehicleSelection'));
  const AdminCustomerManagement = React.lazy(() => import('./pages/AdminCustomerManagement'));
  const AdminAgregadoManagement = React.lazy(() => import('./pages/AdminAgregadoManagement'));
  const AdminAgregadoFreight = React.lazy(() => import('./pages/AdminAgregadoFreight'));
  const AdminTollManagement = React.lazy(() => import('./pages/AdminTollManagement'));
  const AdminCreateDailyRoute = React.lazy(() => import('./pages/AdminCreateDailyRoute'));
  const AdminPreventiveMaintenance = React.lazy(() => import('./pages/AdminPreventiveMaintenance'));
  const AdminAgregadoReport = React.lazy(() => import('./pages/AdminAgregadoReport'));
  const AdminMaintenanceHistory = React.lazy(() => import('./pages/AdminMaintenanceHistory'));
  const HelperRouteBinding = React.lazy(() => import('./pages/HelperRouteBinding'));

  const renderPage = () => {
    if (!currentUser) return <React.Suspense fallback={null}><Login onLogin={handleLogin} users={users} syncStatus="ok" /></React.Suspense>;

    const isOp = currentUser.perfil === UserRole.MOTORISTA || currentUser.perfil === UserRole.AJUDANTE;
    if (isOp && ['fueling', 'maintenance', 'route', 'daily-route', 'helper-binding'].includes(currentPage) && !session) {
      return <React.Suspense fallback={null}><VehicleSelection vehicles={vehicles} onSelect={(vId, pl) => {
        const s = { userId: currentUser.id, vehicleId: vId, placa: pl, updatedAt: new Date().toISOString() };
        setSession(s); localStorage.setItem('prime_group_session', JSON.stringify(s)); navigate('operation');
      }} onBack={() => navigate('operation')} /></React.Suspense>;
    }

    switch (currentPage) {
      case 'fueling': return <FuelingForm session={session!} user={currentUser} onBack={() => navigate('operation')} onSubmit={(f) => { saveRecord(setFuelings, f); navigate('operation'); }} />;
      case 'maintenance': return <MaintenanceForm session={session!} user={currentUser} onBack={() => navigate('operation')} onSubmit={(m) => { saveRecord(setMaintenances, m); navigate('operation'); }} />;
      case 'route': return <RouteForm session={session!} user={currentUser} drivers={users.filter(u => u.perfil === UserRole.MOTORISTA)} customers={customers} onBack={() => navigate('operation')} onSubmit={(r) => { saveRecord(setRoutes, r); navigate('operation'); }} />;
      case 'daily-route': return <DriverDailyRoute session={session!} user={currentUser} customers={customers} onBack={() => navigate('operation')} onSubmit={(dr) => { saveRecord(setDailyRoutes, dr); navigate('operation'); }} />;
      case 'helper-binding': return <HelperRouteBinding session={session!} user={currentUser} dailyRoutes={dailyRoutes} users={users} onBack={() => navigate('operation')} onBind={(rId) => { updateRecord(setDailyRoutes, rId, { ajudanteId: currentUser.id, ajudanteNome: currentUser.nome }); navigate('operation'); }} />;
      case 'select-vehicle': return <VehicleSelection vehicles={vehicles} onSelect={(vId, pl) => { const s = { userId: currentUser.id, vehicleId: vId, placa: pl, updatedAt: new Date().toISOString() }; setSession(s); localStorage.setItem('prime_group_session', JSON.stringify(s)); navigate('operation'); }} onBack={() => navigate('operation')} />;
      case 'my-requests': return <MyRequests fuelings={fuelings.filter(f => f.motoristaId === currentUser.id)} maintenances={maintenances.filter(m => m.motoristaId === currentUser.id)} onBack={() => navigate('operation')} />;
      case 'my-routes': return <MyRoutes routes={dailyRoutes.filter(r => r.ajudanteId === currentUser.id)} onBack={() => navigate('operation')} />;
      
      // Admin
      case 'admin-dashboard': return <AdminDashboard fuelings={fuelings} maintenances={maintenances} vehicles={vehicles} fixedExpenses={fixedExpenses} onBack={() => navigate('operation')} />;
      case 'admin-pending': return <AdminPending fuelings={fuelings} maintenances={maintenances} dailyRoutes={dailyRoutes} routes={routes} vehicles={vehicles} users={users} currentUser={currentUser} onUpdateFueling={(id, up) => updateRecord(setFuelings, id, up)} onUpdateMaintenance={(id, up) => updateRecord(setMaintenances, id, up)} onUpdateDailyRoute={(id, up) => updateRecord(setDailyRoutes, id, up)} onUpdateRoute={(id, up) => updateRecord(setRoutes, id, up)} onBack={() => navigate('operation')} />;
      case 'user-mgmt': return <UserManagement users={users} onSaveUser={onSaveUser} onBack={() => navigate('operation')} />;
      case 'vehicle-mgmt': return <VehicleManagement vehicles={vehicles} onSaveVehicle={onSaveVehicle} onBack={() => navigate('operation')} />;
      case 'admin-customers': return <AdminCustomerManagement customers={customers} setCustomers={setCustomers} onBack={() => navigate('operation')} />;
      case 'admin-agregado-mgmt': return <AdminAgregadoManagement agregados={agregados} onUpdateAgregados={setAgregados} onBack={() => navigate('operation')} />;
      case 'admin-agregado-freight': return <AdminAgregadoFreight agregados={agregados} onSubmit={(f) => saveRecord(setAgregadoFreights, f)} onBack={() => navigate('operation')} />;
      case 'admin-agregado-report': return <AdminAgregadoReport freights={agregadoFreights} onBack={() => navigate('operation')} />;
      case 'admin-tolls': return <AdminTollManagement tolls={tolls} vehicles={vehicles} onUpdateTolls={setTolls} onBack={() => navigate('operation')} />;
      case 'admin-fixed-expenses': return <AdminFixedExpenses fixedExpenses={fixedExpenses} onUpdateExpenses={setFixedExpenses} onBack={() => navigate('operation')} />;
      case 'admin-create-route': return <AdminCreateDailyRoute users={users} vehicles={vehicles} customers={customers} onSubmit={(r) => { saveRecord(setDailyRoutes, r); navigate('operation'); }} onBack={() => navigate('operation')} />;
      case 'admin-preventive': return <AdminPreventiveMaintenance vehicles={vehicles} onUpdateVehicle={(id, up) => updateRecord(setVehicles, id, up)} onBack={() => navigate('operation')} />;
      case 'admin-maintenance-history': return <AdminMaintenanceHistory maintenances={maintenances} users={users} onBack={() => navigate('operation')} />;
      case 'admin-tracking': return <AdminTracking vehicles={vehicles} onUpdateVehicle={(id, up) => updateRecord(setVehicles, id, up)} onBack={() => navigate('operation')} />;
      case 'admin-checklists': return <AdminChecklistReport dailyRoutes={dailyRoutes} users={users} vehicles={vehicles} onBack={() => navigate('operation')} />;
      case 'admin-consolidated-finance': return <AdminConsolidatedFinancialReport dailyRoutes={dailyRoutes} routes={routes} fuelings={fuelings} maintenances={maintenances} tolls={tolls} agregadoFreights={agregadoFreights} fixedExpenses={fixedExpenses} onBack={() => navigate('operation')} />;
      case 'admin-vehicle-report': return <AdminVehicleReport fuelings={fuelings} maintenances={maintenances} vehicles={vehicles} dailyRoutes={dailyRoutes} routes={routes} tolls={tolls} fixedExpenses={fixedExpenses} onBack={() => navigate('operation')} onUpdateDailyRoute={(id, up) => updateRecord(setDailyRoutes, id, up)} onUpdateRoute={(id, up) => updateRecord(setRoutes, id, up)} />;
      case 'admin-activity-report': return <AdminActivityReport dailyRoutes={dailyRoutes} routes={routes} fuelings={fuelings} maintenances={maintenances} users={users} onUpdateDailyRoute={(id, up) => updateRecord(setDailyRoutes, id, up)} onUpdateRoute={(id, up) => updateRecord(setRoutes, id, up)} onUpdateFueling={(id, up) => updateRecord(setFuelings, id, up)} onUpdateMaintenance={(id, up) => updateRecord(setMaintenances, id, up)} onBack={() => navigate('operation')} />;

      default: return <OperationHome user={currentUser} session={session} onNavigate={navigate} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('operation')}>
          <Logo size="sm" showText={true} />
          <div className="flex items-center gap-1.5 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Local Mode</span>
          </div>
        </div>
        {currentUser && (
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <div className="text-xs font-bold text-white uppercase">{currentUser.nome}</div>
              <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{currentUser.perfil}</div>
            </div>
            <button onClick={handleLogout} className="bg-red-900/30 text-red-400 px-3 py-1.5 rounded-lg text-xs font-black uppercase border border-red-900/20 hover:bg-red-900/50 transition-all">Sair</button>
          </div>
        )}
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
        <React.Suspense fallback={<div className="p-20 text-center font-bold animate-pulse text-slate-700 uppercase tracking-widest">Iniciando Sistemas...</div>}>
          {renderPage()}
        </React.Suspense>
      </main>
    </div>
  );
};

export default App;
