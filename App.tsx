
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserSession, UserRole, Fueling, MaintenanceRequest, RouteDeparture, Vehicle, DailyRoute, Toll, Customer, FixedExpense, AgregadoFreight, Agregado, FuelingStatus, MaintenanceStatus, RouteStatus, FinanceiroStatus } from './types';
import { INITIAL_USERS, INITIAL_VEHICLES, INITIAL_CUSTOMERS } from './constants';
import { Logo } from './components/UI';
import { supabase, mapFromDb, mapToDb } from './supabase';

// Pages
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

  // States: Começam com INITIAL_X para o app não abrir vazio/erro de login
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);

  const [fuelings, setFuelings] = useState<Fueling[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceRequest[]>([]);
  const [routes, setRoutes] = useState<RouteDeparture[]>([]);
  const [dailyRoutes, setDailyRoutes] = useState<DailyRoute[]>([]);
  const [tolls, setTolls] = useState<Toll[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [agregados, setAgregados] = useState<Agregado[]>([]);
  const [agregadoFreights, setAgregadoFreights] = useState<AgregadoFreight[]>([]);

  // Função para sincronizar dados do Banco de Dados
  const syncWithCloud = useCallback(async () => {
    if (!supabase) {
      console.warn("Supabase não configurado. Operando em modo Local.");
      return;
    }
    setIsSyncing(true);
    try {
      const [
        { data: sUsers }, 
        { data: sVehicles }, 
        { data: sFuelings }, 
        { data: sMaintenances }, 
        { data: sRoutes },
        { data: sDailyRoutes }
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('vehicles').select('*'),
        supabase.from('fuelings').select('*').order('created_at', { ascending: false }),
        supabase.from('maintenance_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('route_departures').select('*').order('created_at', { ascending: false }),
        supabase.from('daily_routes').select('*').order('created_at', { ascending: false })
      ]);

      // Atualiza states apenas se houver dados no banco
      if (sUsers && sUsers.length > 0) setUsers(sUsers.map(mapFromDb));
      if (sVehicles && sVehicles.length > 0) setVehicles(sVehicles.map(mapFromDb));
      if (sFuelings) setFuelings(sFuelings.map(mapFromDb));
      if (sMaintenances) setMaintenances(sMaintenances.map(mapFromDb));
      if (sRoutes) setRoutes(sRoutes.map(mapFromDb));
      if (sDailyRoutes) setDailyRoutes(sDailyRoutes.map(mapFromDb));

    } catch (e) {
      console.error("Erro na sincronização:", e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Ao carregar o App
  useEffect(() => {
    syncWithCloud();
    const savedUserId = localStorage.getItem('prime_group_user_id');
    const savedSession = localStorage.getItem('prime_group_session');
    
    if (savedUserId) {
      // Pequeno timeout para garantir que o syncWithCloud tentou carregar os usuários
      setTimeout(() => {
        const user = users.find(u => u.id === savedUserId);
        if (user && user.ativo) {
          setCurrentUser(user);
          if (savedSession) setSession(JSON.parse(savedSession));
          setCurrentPage('operation');
        }
      }, 500);
    }
  }, [syncWithCloud, users]);

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

  const navigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Funções de Persistência com Supabase
  const saveRecord = async (table: string, record: any, setFn: any) => {
    setFn((prev: any[]) => [record, ...prev]);
    if (!supabase) return;
    try {
      const dbRecord = mapToDb(table, record);
      await supabase.from(table).insert([dbRecord]);
    } catch (e) {
      console.error(`Erro ao salvar em ${table}:`, e);
    }
  };

  const updateRecord = async (table: string, id: string, update: any, setFn: any) => {
    setFn((prev: any[]) => prev.map(item => item.id === id ? { ...item, ...update } : item));
    if (!supabase) return;
    try {
      const dbUpdate = mapToDb(table, update);
      await supabase.from(table).update(dbUpdate).eq('id', id);
    } catch (e) {
      console.error(`Erro ao atualizar ${table}:`, e);
    }
  };

  const renderPage = () => {
    if (!currentUser) return <Login onLogin={handleLogin} users={users} />;

    const perf = currentUser.perfil?.toLowerCase();
    const isOp = perf === UserRole.MOTORISTA || perf === UserRole.AJUDANTE;
    const restricted = ['fueling', 'maintenance', 'route', 'daily-route'];

    if (isOp && restricted.includes(currentPage) && !session) {
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
      case 'my-requests':
        return <MyRequests fuelings={fuelings.filter(f => f.motoristaId === currentUser.id)} maintenances={maintenances.filter(m => m.motoristaId === currentUser.id)} onBack={() => navigate('operation')} />;
      case 'my-routes':
        return <MyRoutes routes={routes.filter(r => r.ajudanteId === currentUser.id)} onBack={() => navigate('operation')} />;
      
      // Admin
      case 'admin-dashboard':
        return <AdminDashboard fuelings={fuelings} maintenances={maintenances} vehicles={vehicles} fixedExpenses={fixedExpenses} onBack={() => navigate('operation')} />;
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
        return <UserManagement users={users} setUsers={(u) => { setUsers(u as any); if(supabase) supabase.from('users').upsert(u as any); }} onBack={() => navigate('operation')} />;
      case 'vehicle-mgmt':
        return <VehicleManagement vehicles={vehicles} setVehicles={(v) => { setVehicles(v as any); if(supabase) supabase.from('vehicles').upsert(v as any); }} onBack={() => navigate('operation')} />;
      case 'admin-tracking':
        return <AdminTracking vehicles={vehicles} onUpdateVehicle={(id, up) => updateRecord('vehicles', id, up, setVehicles)} onBack={() => navigate('operation')} />;
      case 'admin-consolidated-finance':
        return <AdminConsolidatedFinancialReport dailyRoutes={dailyRoutes} routes={routes} fuelings={fuelings} maintenances={maintenances} tolls={tolls} agregadoFreights={agregadoFreights} fixedExpenses={fixedExpenses} onBack={() => navigate('operation')} />;
      case 'admin-fixed-expenses':
        return <AdminFixedExpenses fixedExpenses={fixedExpenses} onUpdateExpenses={(e) => { setFixedExpenses(e); if(supabase) supabase.from('fixed_expenses').upsert(e as any); }} onBack={() => navigate('operation')} />;
      case 'admin-activity-report':
        return <AdminActivityReport 
          dailyRoutes={dailyRoutes} routes={routes} fuelings={fuelings} maintenances={maintenances} users={users}
          onUpdateDailyRoute={(id, up) => updateRecord('daily_routes', id, up, setDailyRoutes)}
          onUpdateRoute={(id, up) => updateRecord('route_departures', id, up, setRoutes)}
          onUpdateFueling={(id, up) => updateRecord('fuelings', id, up, setFuelings)}
          onUpdateMaintenance={(id, up) => updateRecord('maintenance_requests', id, up, setMaintenances)}
          onBack={() => navigate('operation')} 
        />;
      case 'admin-vehicle-report':
        return <AdminVehicleReport fuelings={fuelings} maintenances={maintenances} vehicles={vehicles} dailyRoutes={dailyRoutes} routes={routes} tolls={tolls} fixedExpenses={fixedExpenses} onBack={() => navigate('operation')} onUpdateDailyRoute={(id, up) => updateRecord('daily_routes', id, up, setDailyRoutes)} onUpdateRoute={(id, up) => updateRecord('route_departures', id, up, setRoutes)} />;
      case 'admin-checklists':
        return <AdminChecklistReport dailyRoutes={dailyRoutes} users={users} vehicles={vehicles} onBack={() => navigate('operation')} />;
      case 'tech-docs':
        return <TechnicalDocs onBack={() => navigate('operation')} />;
      
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
            <button onClick={syncWithCloud} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${isSyncing ? 'text-blue-500 animate-pulse' : 'text-slate-500 hover:text-blue-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-blue-500' : 'bg-slate-700'}`}></span>
              {isSyncing ? 'Sincronizando' : 'Nuvem OK'}
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
