
import { createClient } from '@supabase/supabase-js';
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserSession, UserRole, Fueling, MaintenanceRequest, RouteDeparture, Vehicle, DailyRoute, Toll, Customer, FixedExpense, AgregadoFreight, Agregado, FuelingStatus, MaintenanceStatus, RouteStatus, FinanceiroStatus } from './types';
import { INITIAL_USERS, INITIAL_VEHICLES, INITIAL_CUSTOMERS } from './constants';
import { Logo } from './components/UI';
import { supabase, mapFromDb, mapToDb } from './supabase';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const [syncDetails, setSyncDetails] = useState<string>('');

  // States
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [fuelings, setFuelings] = useState<Fueling[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceRequest[]>([]);
  const [routes, setRoutes] = useState<RouteDeparture[]>([]);
  const [dailyRoutes, setDailyRoutes] = useState<DailyRoute[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);

  const syncWithCloud = useCallback(async () => {
    if (!supabase) return;
    setIsSyncing(true);
    setLastSyncError(null);
    console.log("Sincronizando...");

    try {
      const fetchTable = async (table: string) => {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        return data || [];
      };

      const dbUsers = await fetchTable('users');
      const dbVehicles = await fetchTable('vehicles');
      const dbCustomers = await fetchTable('customers');
      const dbFuelings = await fetchTable('fuelings');
      const dbMaintenances = await fetchTable('maintenance_requests');
      const dbRoutes = await fetchTable('route_departures');
      const dbDaily = await fetchTable('daily_routes');

      if (dbUsers.length > 0) setUsers(dbUsers.map(mapFromDb));
      if (dbVehicles.length > 0) setVehicles(dbVehicles.map(mapFromDb));
      if (dbCustomers.length > 0) setCustomers(dbCustomers.map(mapFromDb));
      
      setFuelings(dbFuelings.map(mapFromDb));
      setMaintenances(dbMaintenances.map(mapFromDb));
      setRoutes(dbRoutes.map(mapFromDb));
      setDailyRoutes(dbDaily.map(mapFromDb));

      setSyncDetails(`${dbUsers.length} usuários, ${dbVehicles.length} veículos`);
    } catch (e: any) {
      console.error("Erro de sincronização:", e);
      setLastSyncError(e.message || "Erro desconhecido");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    syncWithCloud();
    const savedUserId = localStorage.getItem('prime_group_user_id');
    const savedSession = localStorage.getItem('prime_group_session');
    
    if (savedUserId) {
      setTimeout(() => {
        setUsers(prevUsers => {
          const user = prevUsers.find(u => u.id === savedUserId);
          if (user && user.ativo) {
            setCurrentUser(user);
            if (savedSession) setSession(JSON.parse(savedSession));
            setCurrentPage('operation');
          }
          return prevUsers;
        });
      }, 800);
    }
  }, [syncWithCloud]);

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

  const saveRecord = async (table: string, record: any, setFn: any) => {
    // Adiciona localmente primeiro
    setFn((prev: any[]) => [record, ...prev]);
    
    if (!supabase) return;
    try {
      const dbRecord = mapToDb(record);
      const { error } = await supabase.from(table).insert([dbRecord]);
      if (error) {
        alert(`Erro na Nuvem: ${error.message}`);
        console.error("Erro insert:", error);
      } else {
        console.log(`Sucesso ao salvar em ${table}`);
      }
    } catch (e: any) {
      console.error("Exceção ao salvar:", e);
    }
  };

  const updateRecord = async (table: string, id: string, update: any, setFn: any) => {
    setFn((prev: any[]) => prev.map(item => item.id === id ? { ...item, ...update } : item));
    if (!supabase) return;
    try {
      const dbUpdate = mapToDb(update);
      const { error } = await supabase.from(table).update(dbUpdate).eq('id', id);
      if (error) console.error("Erro update:", error.message);
    } catch (e) {
      console.error(e);
    }
  };

  // Lazy components
  const Login = React.lazy(() => import('./pages/Login'));
  const VehicleSelection = React.lazy(() => import('./pages/VehicleSelection'));
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
  const TechnicalDocs = React.lazy(() => import('./pages/TechnicalDocs'));
  const DriverDailyRoute = React.lazy(() => import('./pages/DriverDailyRoute'));
  const AdminVehicleReport = React.lazy(() => import('./pages/AdminVehicleReport'));
  const AdminActivityReport = React.lazy(() => import('./pages/AdminActivityReport'));
  const AdminChecklistReport = React.lazy(() => import('./pages/AdminChecklistReport'));
  const AdminFixedExpenses = React.lazy(() => import('./pages/AdminFixedExpenses'));
  const AdminTracking = React.lazy(() => import('./pages/AdminTracking'));
  const AdminConsolidatedFinancialReport = React.lazy(() => import('./pages/AdminConsolidatedFinancialReport'));

  const renderPage = () => {
    if (!currentUser) return (
      <React.Suspense fallback={null}>
        <Login 
          onLogin={handleLogin} 
          users={users} 
          syncStatus={isSyncing ? 'syncing' : lastSyncError ? 'error' : 'ok'}
          syncError={lastSyncError}
        />
      </React.Suspense>
    );

    const perf = currentUser.perfil?.toLowerCase();
    const isOp = perf === UserRole.MOTORISTA || perf === UserRole.AJUDANTE;
    const restricted = ['fueling', 'maintenance', 'route', 'daily-route'];

    if (isOp && restricted.includes(currentPage) && !session) {
      return <React.Suspense fallback={null}><VehicleSelection vehicles={vehicles} onSelect={(vId, pl) => {
        const s = { userId: currentUser.id, vehicleId: vId, placa: pl, updatedAt: new Date().toISOString() };
        setSession(s); localStorage.setItem('prime_group_session', JSON.stringify(s)); navigate('operation');
      }} onBack={() => navigate('operation')} /></React.Suspense>;
    }

    switch (currentPage) {
      case 'fueling': return <FuelingForm session={session!} user={currentUser} onBack={() => navigate('operation')} onSubmit={(f) => { saveRecord('fuelings', f, setFuelings); navigate('operation'); }} />;
      case 'maintenance': return <MaintenanceForm session={session!} user={currentUser} onBack={() => navigate('operation')} onSubmit={(m) => { saveRecord('maintenance_requests', m, setMaintenances); navigate('operation'); }} />;
      case 'route': return <RouteForm session={session!} user={currentUser} drivers={users.filter(u => u.perfil === UserRole.MOTORISTA)} customers={customers} onBack={() => navigate('operation')} onSubmit={(r) => { saveRecord('route_departures', r, setRoutes); navigate('operation'); }} />;
      case 'daily-route': return <DriverDailyRoute session={session!} user={currentUser} customers={customers} onBack={() => navigate('operation')} onSubmit={(dr) => { saveRecord('daily_routes', dr, setDailyRoutes); navigate('operation'); }} />;
      case 'my-requests': return <MyRequests fuelings={fuelings.filter(f => f.motoristaId === currentUser.id)} maintenances={maintenances.filter(m => m.motoristaId === currentUser.id)} onBack={() => navigate('operation')} />;
      case 'my-routes': return <MyRoutes routes={routes.filter(r => r.ajudanteId === currentUser.id)} onBack={() => navigate('operation')} />;
      case 'admin-dashboard': return <AdminDashboard fuelings={fuelings} maintenances={maintenances} vehicles={vehicles} fixedExpenses={fixedExpenses} onBack={() => navigate('operation')} />;
      case 'admin-pending': return <AdminPending fuelings={fuelings} maintenances={maintenances} dailyRoutes={dailyRoutes} routes={routes} vehicles={vehicles} users={users} currentUser={currentUser} onUpdateFueling={(id, up) => updateRecord('fuelings', id, up, setFuelings)} onUpdateMaintenance={(id, up) => updateRecord('maintenance_requests', id, up, setMaintenances)} onUpdateDailyRoute={(id, up) => updateRecord('daily_routes', id, up, setDailyRoutes)} onUpdateRoute={(id, up) => updateRecord('route_departures', id, up, setRoutes)} onBack={() => navigate('operation')} />;
      case 'user-mgmt': return <UserManagement users={users} setUsers={(action) => { setUsers((prev) => { const next = typeof action === 'function' ? action(prev) : action; if (supabase) supabase.from('users').upsert(next.map(mapToDb) as any); return next; }); }} onBack={() => navigate('operation')} />;
      case 'vehicle-mgmt': return <VehicleManagement vehicles={vehicles} setVehicles={(action) => { setVehicles((prev) => { const next = typeof action === 'function' ? action(prev) : action; if (supabase) supabase.from('vehicles').upsert(next.map(mapToDb) as any); return next; }); }} onBack={() => navigate('operation')} />;
      case 'admin-tracking': return <AdminTracking vehicles={vehicles} onUpdateVehicle={(id, up) => updateRecord('vehicles', id, up, setVehicles)} onBack={() => navigate('operation')} />;
      case 'admin-consolidated-finance': return <AdminConsolidatedFinancialReport dailyRoutes={dailyRoutes} routes={routes} fuelings={fuelings} maintenances={maintenances} tolls={[]} agregadoFreights={[]} fixedExpenses={fixedExpenses} onBack={() => navigate('operation')} />;
      case 'admin-fixed-expenses': return <AdminFixedExpenses fixedExpenses={fixedExpenses} onUpdateExpenses={(e) => { setFixedExpenses(e); if(supabase) supabase.from('fixed_expenses').upsert(e.map(mapToDb) as any); }} onBack={() => navigate('operation')} />;
      case 'admin-activity-report': return <AdminActivityReport dailyRoutes={dailyRoutes} routes={routes} fuelings={fuelings} maintenances={maintenances} users={users} onUpdateDailyRoute={(id, up) => updateRecord('daily_routes', id, up, setDailyRoutes)} onUpdateRoute={(id, up) => updateRecord('route_departures', id, up, setRoutes)} onUpdateFueling={(id, up) => updateRecord('fuelings', id, up, setFuelings)} onUpdateMaintenance={(id, up) => updateRecord('maintenance_requests', id, up, setMaintenances)} onBack={() => navigate('operation')} />;
      case 'admin-vehicle-report': return <AdminVehicleReport fuelings={fuelings} maintenances={maintenances} vehicles={vehicles} dailyRoutes={dailyRoutes} routes={routes} tolls={[]} fixedExpenses={fixedExpenses} onBack={() => navigate('operation')} onUpdateDailyRoute={(id, up) => updateRecord('daily_routes', id, up, setDailyRoutes)} onUpdateRoute={(id, up) => updateRecord('route_departures', id, up, setRoutes)} />;
      case 'admin-checklists': return <AdminChecklistReport dailyRoutes={dailyRoutes} users={users} vehicles={vehicles} onBack={() => navigate('operation')} />;
      case 'tech-docs': return <TechnicalDocs onBack={() => navigate('operation')} />;
      case 'select-vehicle': return <VehicleSelection vehicles={vehicles} onSelect={(vId, pl) => { const s = { userId: currentUser.id, vehicleId: vId, placa: pl, updatedAt: new Date().toISOString() }; setSession(s); localStorage.setItem('prime_group_session', JSON.stringify(s)); navigate('operation'); }} onBack={() => navigate('operation')} />;
      default: return <OperationHome user={currentUser} session={session} onNavigate={navigate} onLogout={handleLogout} />;
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
            <div className="hidden lg:flex flex-col items-end mr-2">
               <span className={`text-[8px] font-black uppercase tracking-widest ${lastSyncError ? 'text-red-500' : 'text-emerald-500'}`}>
                 {isSyncing ? 'Sincronizando...' : lastSyncError ? 'Erro de Sync' : 'Dados Sincronizados'}
               </span>
               <span className="text-[7px] text-slate-500 uppercase">{syncDetails}</span>
            </div>
            <button 
              onClick={syncWithCloud} 
              className={`p-2 rounded-full transition-all ${isSyncing ? 'bg-blue-600 animate-spin' : 'hover:bg-slate-800'}`}
              title="Sincronizar agora"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
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
        <React.Suspense fallback={<div className="flex items-center justify-center p-20 text-slate-500 font-bold animate-pulse uppercase tracking-[0.3em]">Carregando Sistema...</div>}>
          {renderPage()}
        </React.Suspense>
      </main>
    </div>
  );
};

export default App;
