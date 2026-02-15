
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
  const [cloudStats, setCloudStats] = useState({ users: 0, vehicles: 0 });

  // States Principais
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

    try {
      const [resU, resV, resC, resF, resM, resR, resD] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('vehicles').select('*'),
        supabase.from('customers').select('*'),
        supabase.from('fuelings').select('*'),
        supabase.from('maintenance_requests').select('*'),
        supabase.from('route_departures').select('*'),
        supabase.from('daily_routes').select('*')
      ]);

      if (resU.error) throw resU.error;

      if (resU.data && resU.data.length > 0) setUsers(resU.data.map(mapFromDb));
      if (resV.data && resV.data.length > 0) setVehicles(resV.data.map(mapFromDb));
      if (resC.data && resC.data.length > 0) setCustomers(resC.data.map(mapFromDb));
      
      if (resF.data) setFuelings(resF.data.map(mapFromDb));
      if (resM.data) setMaintenances(resM.data.map(mapFromDb));
      if (resR.data) setRoutes(resR.data.map(mapFromDb));
      if (resD.data) setDailyRoutes(resD.data.map(mapFromDb));

      setCloudStats({ users: resU.data?.length || 0, vehicles: resV.data?.length || 0 });
    } catch (e: any) {
      setLastSyncError(e.message || "Erro de conexão");
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
        setUsers(prev => {
          const user = prev.find(u => u.id === savedUserId);
          if (user && user.ativo) {
            setCurrentUser(user);
            if (savedSession) setSession(JSON.parse(savedSession));
            setCurrentPage('operation');
          }
          return prev;
        });
      }, 1000);
    }
  }, [syncWithCloud]);

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

  // FUNÇÕES DE PERSISTÊNCIA INDIVIDUAIS (Garante Sincronização)
  const saveUser = async (user: User) => {
    setUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      return exists ? prev.map(u => u.id === user.id ? user : u) : [user, ...prev];
    });
    if (supabase) await supabase.from('users').upsert([mapToDb(user)]);
  };

  const saveVehicle = async (vehicle: Vehicle) => {
    setVehicles(prev => {
      const exists = prev.find(v => v.id === vehicle.id);
      return exists ? prev.map(v => v.id === vehicle.id ? vehicle : v) : [vehicle, ...prev];
    });
    if (supabase) await supabase.from('vehicles').upsert([mapToDb(vehicle)]);
  };

  const saveRecord = async (table: string, record: any, setFn: any) => {
    setFn((prev: any[]) => [record, ...prev]);
    if (supabase) await supabase.from(table).insert([mapToDb(record)]);
  };

  const updateRecord = async (table: string, id: string, update: any, setFn: any) => {
    setFn((prev: any[]) => prev.map(i => i.id === id ? { ...i, ...update } : i));
    if (supabase) await supabase.from(table).update(mapToDb(update)).eq('id', id);
  };

  const seedCloud = async () => {
    if (!supabase || !confirm("Enviar dados iniciais para nuvem?")) return;
    setIsSyncing(true);
    try {
      await Promise.all([
        supabase.from('users').upsert(users.map(mapToDb)),
        supabase.from('vehicles').upsert(vehicles.map(mapToDb)),
        supabase.from('customers').upsert(customers.map(mapToDb))
      ]);
      alert("Sucesso!");
      syncWithCloud();
    } catch (e: any) { alert(e.message); } finally { setIsSyncing(false); }
  };

  // Lazy Components
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

  const renderPage = () => {
    if (!currentUser) return <React.Suspense fallback={null}><Login onLogin={handleLogin} users={users} syncStatus={isSyncing ? 'syncing' : lastSyncError ? 'error' : 'ok'} syncError={lastSyncError} /></React.Suspense>;

    const isOp = currentUser.perfil === UserRole.MOTORISTA || currentUser.perfil === UserRole.AJUDANTE;
    if (isOp && ['fueling', 'maintenance', 'route', 'daily-route'].includes(currentPage) && !session) {
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
      case 'user-mgmt': return <UserManagement users={users} onSaveUser={saveUser} onBack={() => navigate('operation')} />;
      case 'vehicle-mgmt': return <VehicleManagement vehicles={vehicles} onSaveVehicle={saveVehicle} onBack={() => navigate('operation')} />;
      case 'admin-customers': return <AdminCustomerManagement customers={customers} setCustomers={(c) => { setCustomers(c); if(supabase) supabase.from('customers').upsert((c as Customer[]).map(mapToDb)); }} onBack={() => navigate('operation')} />;
      case 'admin-agregado-mgmt': return <AdminAgregadoManagement agregados={[]} onUpdateAgregados={() => {}} onBack={() => navigate('operation')} />;
      case 'admin-pending': return <AdminPending fuelings={fuelings} maintenances={maintenances} dailyRoutes={dailyRoutes} routes={routes} vehicles={vehicles} users={users} currentUser={currentUser} onUpdateFueling={(id, up) => updateRecord('fuelings', id, up, setFuelings)} onUpdateMaintenance={(id, up) => updateRecord('maintenance_requests', id, up, setMaintenances)} onUpdateDailyRoute={(id, up) => updateRecord('daily_routes', id, up, setDailyRoutes)} onUpdateRoute={(id, up) => updateRecord('route_departures', id, up, setRoutes)} onBack={() => navigate('operation')} />;
      case 'admin-dashboard': return <AdminDashboard fuelings={fuelings} maintenances={maintenances} vehicles={vehicles} fixedExpenses={fixedExpenses} onBack={() => navigate('operation')} />;
      case 'admin-tracking': return <AdminTracking vehicles={vehicles} onUpdateVehicle={(id, up) => updateRecord('vehicles', id, up, setVehicles)} onBack={() => navigate('operation')} />;
      case 'admin-checklists': return <AdminChecklistReport dailyRoutes={dailyRoutes} users={users} vehicles={vehicles} onBack={() => navigate('operation')} />;
      case 'admin-fixed-expenses': return <AdminFixedExpenses fixedExpenses={fixedExpenses} onUpdateExpenses={(e) => { setFixedExpenses(e); if(supabase) supabase.from('fixed_expenses').upsert(e.map(mapToDb)); }} onBack={() => navigate('operation')} />;
      case 'admin-consolidated-finance': return <AdminConsolidatedFinancialReport dailyRoutes={dailyRoutes} routes={routes} fuelings={fuelings} maintenances={maintenances} tolls={[]} agregadoFreights={[]} fixedExpenses={fixedExpenses} onBack={() => navigate('operation')} />;
      default: return <OperationHome user={currentUser} session={session} onNavigate={navigate} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('operation')}><Logo size="sm" showText={true} /></div>
        {currentUser && (
          <div className="flex items-center gap-4">
             <div className="hidden lg:flex flex-col items-end">
               <span className={`text-[8px] font-black uppercase ${lastSyncError ? 'text-red-500' : 'text-emerald-500'}`}>
                 {isSyncing ? 'Sincronizando...' : lastSyncError ? 'Usando Local (Offline)' : 'Nuvem OK'}
               </span>
               <span className="text-[7px] text-slate-500">{cloudStats.users} usuários em nuvem</span>
             </div>
             {currentUser.perfil === UserRole.ADMIN && cloudStats.users === 0 && (
               <button onClick={seedCloud} className="bg-blue-600 text-white px-2 py-1 rounded text-[8px] font-bold">SEMEAR NUVEM</button>
             )}
            <button onClick={syncWithCloud} className={`p-1.5 rounded-full ${isSyncing ? 'animate-spin text-blue-500' : 'text-slate-500 hover:text-white'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            <button onClick={handleLogout} className="bg-red-900/30 text-red-400 px-3 py-1.5 rounded-lg text-xs font-black uppercase border border-red-900/20">Sair</button>
          </div>
        )}
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
        <React.Suspense fallback={<div className="p-20 text-center font-bold animate-pulse text-slate-700 uppercase tracking-widest">Aguarde...</div>}>
          {renderPage()}
        </React.Suspense>
      </main>
    </div>
  );
};

export default App;
