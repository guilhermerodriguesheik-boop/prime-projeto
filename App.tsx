
import React, { useState, useEffect } from 'react';
import { User, UserSession, UserRole, Fueling, MaintenanceRequest, RouteDeparture, Vehicle, DailyRoute, Toll, Customer, FixedExpense, AgregadoFreight, Agregado, FuelingStatus, MaintenanceStatus, RouteStatus, FinanceiroStatus } from './types';
import { INITIAL_USERS, INITIAL_VEHICLES, INITIAL_CUSTOMERS } from './constants';
import { Logo } from './components/UI';
import { supabase } from './supabase';

// Imports de Páginas
import Login from './pages/Login';
import VehicleSelection from './pages/VehicleSelection';
import OperationHome from './pages/OperationHome';
import FuelingForm from './pages/FuelingForm';
import MaintenanceForm from './pages/MaintenanceForm';
import RouteForm from './pages/RouteForm';
import MyRequests from './pages/MyRequests';
import MyRoutes from './pages/MyRoutes';
import AdminDashboard from './pages/AdminDashboard';
import AdminPending from './pages/AdminPending';
import UserManagement from './pages/UserManagement';
import VehicleManagement from './pages/VehicleManagement';
import TechnicalDocs from './pages/TechnicalDocs';
import DriverDailyRoute from './pages/DriverDailyRoute';
import AdminMaintenanceHistory from './pages/AdminMaintenanceHistory';
import AdminPreventiveMaintenance from './pages/AdminPreventiveMaintenance';
import AdminVehicleReport from './pages/AdminVehicleReport';
import AdminActivityReport from './pages/AdminActivityReport';
import AdminCreateDailyRoute from './pages/AdminCreateDailyRoute';
import AdminTollManagement from './pages/AdminTollManagement';
import AdminCustomerManagement from './pages/AdminCustomerManagement';
import AdminChecklistReport from './pages/AdminChecklistReport';
import AdminFixedExpenses from './pages/AdminFixedExpenses';
import AdminAgregadoFreight from './pages/AdminAgregadoFreight';
import AdminAgregadoReport from './pages/AdminAgregadoReport';
import AdminAgregadoManagement from './pages/AdminAgregadoManagement';
import AdminConsolidatedFinancialReport from './pages/AdminConsolidatedFinancialReport';
import AdminTracking from './pages/AdminTracking';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Estado com persistência (Local como cache, Nuvem como verdade)
  const [users, setUsers] = useState<User[]>(() => JSON.parse(localStorage.getItem('prime_users') || JSON.stringify(INITIAL_USERS)));
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => JSON.parse(localStorage.getItem('prime_vehicles') || JSON.stringify(INITIAL_VEHICLES)));
  const [customers, setCustomers] = useState<Customer[]>(() => JSON.parse(localStorage.getItem('prime_customers') || JSON.stringify(INITIAL_CUSTOMERS)));
  const [agregados, setAgregados] = useState<Agregado[]>(() => JSON.parse(localStorage.getItem('prime_agregados') || '[]'));
  const [fuelings, setFuelings] = useState<Fueling[]>(() => JSON.parse(localStorage.getItem('prime_fuelings') || '[]'));
  const [maintenances, setMaintenances] = useState<MaintenanceRequest[]>(() => JSON.parse(localStorage.getItem('prime_maintenances') || '[]'));
  const [routes, setRoutes] = useState<RouteDeparture[]>(() => JSON.parse(localStorage.getItem('prime_routes') || '[]'));
  const [dailyRoutes, setDailyRoutes] = useState<DailyRoute[]>(() => JSON.parse(localStorage.getItem('prime_daily_routes') || '[]'));
  const [tolls, setTolls] = useState<Toll[]>(() => JSON.parse(localStorage.getItem('prime_tolls') || '[]'));
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => JSON.parse(localStorage.getItem('prime_fixed_expenses') || '[]'));
  const [agregadoFreights, setAgregadoFreights] = useState<AgregadoFreight[]>(() => JSON.parse(localStorage.getItem('prime_agregado_freights') || '[]'));

  // Efeito para salvar no localStorage (Backup Local / Offline-first parcial)
  useEffect(() => {
    localStorage.setItem('prime_users', JSON.stringify(users));
    localStorage.setItem('prime_vehicles', JSON.stringify(vehicles));
    localStorage.setItem('prime_customers', JSON.stringify(customers));
    localStorage.setItem('prime_agregados', JSON.stringify(agregados));
    localStorage.setItem('prime_fuelings', JSON.stringify(fuelings));
    localStorage.setItem('prime_maintenances', JSON.stringify(maintenances));
    localStorage.setItem('prime_routes', JSON.stringify(routes));
    localStorage.setItem('prime_daily_routes', JSON.stringify(dailyRoutes));
    localStorage.setItem('prime_tolls', JSON.stringify(tolls));
    localStorage.setItem('prime_fixed_expenses', JSON.stringify(fixedExpenses));
    localStorage.setItem('prime_agregado_freights', JSON.stringify(agregadoFreights));
  }, [users, vehicles, customers, agregados, fuelings, maintenances, routes, dailyRoutes, tolls, fixedExpenses, agregadoFreights]);

  // Função Real de Sincronização com Supabase
  const syncWithCloud = async () => {
    if (!supabase) return;
    setIsSyncing(true);
    try {
      console.log('Iniciando sincronização com Supabase...');
      
      // Fetching em paralelo
      const [
        { data: sUsers },
        { data: sVehicles },
        { data: sFuelings },
        { data: sMaintenances },
        { data: sRoutes }
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('vehicles').select('*'),
        supabase.from('fuelings').select('*').order('created_at', { ascending: false }),
        supabase.from('maintenance_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('route_departures').select('*').order('created_at', { ascending: false })
      ]);

      if (sUsers) setUsers(sUsers);
      if (sVehicles) setVehicles(sVehicles);
      if (sFuelings) setFuelings(sFuelings);
      if (sMaintenances) setMaintenances(sMaintenances);
      if (sRoutes) setRoutes(sRoutes);

      console.log('Sincronização concluída com sucesso.');
    } catch (error) {
      console.warn('Falha na sincronização (Babelas podem não existir no Supabase ainda):', error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const savedUserId = localStorage.getItem('prime_group_user_id');
    const savedSession = localStorage.getItem('prime_group_session');
    
    if (savedUserId) {
      const user = users.find(u => u.id === savedUserId);
      if (user && user.ativo) {
        setCurrentUser(user);
        if (savedSession) setSession(JSON.parse(savedSession));
        setCurrentPage('operation');
        syncWithCloud();
      }
    }
  }, []);

  const navigate = (page: string) => {
    if (!currentUser) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('prime_group_user_id', user.id);
    navigate('operation');
    syncWithCloud();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSession(null);
    localStorage.removeItem('prime_group_user_id');
    localStorage.removeItem('prime_group_session');
    navigate('login');
  };

  // Helper para salvar dados na nuvem e no estado local
  const saveRecord = async (table: string, record: any, setFn: any) => {
    setFn((prev: any[]) => [record, ...prev]);
    try {
      if (supabase) {
        await supabase.from(table).insert([record]);
      }
    } catch (e) {
      console.error(`Erro ao salvar em ${table}:`, e);
    }
  };

  const updateRecord = async (table: string, id: string, update: any, setFn: any) => {
    setFn((prev: any[]) => prev.map(item => item.id === id ? { ...item, ...update } : item));
    try {
      if (supabase) {
        await supabase.from(table).update(update).eq('id', id);
      }
    } catch (e) {
      console.error(`Erro ao atualizar em ${table}:`, e);
    }
  };

  const renderPage = () => {
    if (!currentUser) return <Login onLogin={handleLogin} users={users} />;

    const restrictedPages = ['fueling', 'maintenance', 'route', 'daily-route'];
    if ((currentUser.perfil === UserRole.MOTORISTA || currentUser.perfil === UserRole.AJUDANTE) && restrictedPages.includes(currentPage) && !session) {
      return <VehicleSelection vehicles={vehicles} onSelect={(vId, pl) => {
        const s = { userId: currentUser.id, vehicleId: vId, placa: pl, updatedAt: new Date().toISOString() };
        setSession(s); localStorage.setItem('prime_group_session', JSON.stringify(s)); navigate('operation');
      }} onBack={() => navigate('operation')} />;
    }

    switch (currentPage) {
      case 'select-vehicle':
        return <VehicleSelection vehicles={vehicles} onSelect={(vId, pl) => {
          const s = { userId: currentUser.id, vehicleId: vId, placa: pl, updatedAt: new Date().toISOString() };
          setSession(s); localStorage.setItem('prime_group_session', JSON.stringify(s)); navigate('operation');
        }} onBack={() => navigate('operation')} />;

      case 'fueling':
        return <FuelingForm session={session!} user={currentUser} onBack={() => navigate('operation')} onSubmit={(f) => { saveRecord('fuelings', f, setFuelings); navigate('operation'); }} />;
      
      case 'maintenance':
        return <MaintenanceForm session={session!} user={currentUser} onBack={() => navigate('operation')} onSubmit={(m) => { saveRecord('maintenance_requests', m, setMaintenances); navigate('operation'); }} />;
      
      case 'route':
        return <RouteForm session={session!} user={currentUser} drivers={users.filter(u => u.perfil === UserRole.MOTORISTA)} customers={customers} onBack={() => navigate('operation')} onSubmit={(r) => { saveRecord('route_departures', r, setRoutes); navigate('operation'); }} />;

      case 'daily-route':
        return <DriverDailyRoute session={session!} user={currentUser} customers={customers} onBack={() => navigate('operation')} onSubmit={(dr) => { saveRecord('daily_routes', dr, setDailyRoutes); navigate('operation'); }} />;

      case 'admin-pending':
        return <AdminPending 
          fuelings={fuelings} maintenances={maintenances} dailyRoutes={dailyRoutes} routes={routes} vehicles={vehicles} users={users} currentUser={currentUser}
          onUpdateFueling={(id, up) => updateRecord('fuelings', id, up, setFuelings)}
          onUpdateMaintenance={(id, up) => updateRecord('maintenance_requests', id, up, setMaintenances)}
          onUpdateDailyRoute={(id, up) => updateRecord('daily_routes', id, up, setDailyRoutes)}
          onUpdateRoute={(id, up) => updateRecord('route_departures', id, up, setRoutes)}
          onBack={() => navigate('operation')} 
        />;

      case 'user-mgmt':
        return <UserManagement users={users} setUsers={(u) => { setUsers(u as any); }} onBack={() => navigate('operation')} />;
      
      case 'vehicle-mgmt':
        return <VehicleManagement vehicles={vehicles} setVehicles={(v) => { setVehicles(v as any); }} onBack={() => navigate('operation')} />;

      case 'admin-dashboard':
        return <AdminDashboard fuelings={fuelings} maintenances={maintenances} vehicles={vehicles} fixedExpenses={fixedExpenses} onBack={() => navigate('operation')} />;

      default:
        return <OperationHome user={currentUser} session={session} onNavigate={navigate} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('operation')}>
          <Logo size="sm" showText={true} />
        </div>
        {currentUser && (
          <div className="flex items-center gap-4">
            <button onClick={syncWithCloud} disabled={isSyncing} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isSyncing ? 'text-blue-500 animate-pulse' : 'text-slate-500 hover:text-blue-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-blue-500' : 'bg-slate-700'}`}></span>
              {isSyncing ? 'Sincronizando' : 'Sincronizar'}
            </button>
            <div className="hidden md:block text-right">
              <div className="text-xs font-bold text-white uppercase">{currentUser.nome}</div>
              <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{currentUser.perfil}</div>
            </div>
            <button onClick={handleLogout} className="bg-red-900/30 text-red-400 px-3 py-1.5 rounded-lg text-xs font-black uppercase border border-red-900/20 hover:bg-red-900/50 transition-all">Sair</button>
          </div>
        )}
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
