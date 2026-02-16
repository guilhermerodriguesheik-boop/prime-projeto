
import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, UserSession, UserRole, Fueling, MaintenanceRequest, 
  RouteDeparture, Vehicle, DailyRoute, Toll, Customer, 
  FixedExpense, AgregadoFreight, Agregado, 
  FuelingStatus, MaintenanceStatus, RouteStatus, FinanceiroStatus 
} from './types';
import { INITIAL_USERS, INITIAL_VEHICLES, INITIAL_CUSTOMERS } from './constants';
import { Logo } from './components/UI';
import { api } from './apiClient';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  // Estados dos Dados (carregados da API)
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [fuelings, setFuelings] = useState<Fueling[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceRequest[]>([]);
  const [routes, setRoutes] = useState<RouteDeparture[]>([]);
  const [dailyRoutes, setDailyRoutes] = useState<DailyRoute[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [agregados, setAgregados] = useState<Agregado[]>([]);
  const [agregadoFreights, setAgregadoFreights] = useState<AgregadoFreight[]>([]);
  const [tolls, setTolls] = useState<Toll[]>([]);

  // Carregar todos os dados da API
  const loadAllData = useCallback(async () => {
    try {
      setSyncStatus('loading');
      const [u, v, c, f, m, r, dr, fe, ag, af, t] = await Promise.all([
        api.getUsers(),
        api.getVehicles(),
        api.getCustomers(),
        api.getFuelings(),
        api.getMaintenances(),
        api.getRoutes(),
        api.getDailyRoutes(),
        api.getFixedExpenses(),
        api.getAgregados(),
        api.getAgregadoFreights(),
        api.getTolls(),
      ]);
      setUsers(u);
      setVehicles(v);
      setCustomers(c);
      setFuelings(f);
      setMaintenances(m);
      setRoutes(r);
      setDailyRoutes(dr);
      setFixedExpenses(fe);
      setAgregados(ag);
      setAgregadoFreights(af);
      setTolls(t);
      setSyncStatus('ok');
    } catch (err) {
      // Fallback: usar dados locais quando API nao esta disponivel
      setUsers(INITIAL_USERS as User[]);
      setVehicles(INITIAL_VEHICLES as Vehicle[]);
      setCustomers(INITIAL_CUSTOMERS as Customer[]);
      setSyncStatus('error');
    }
  }, []);

  // Carregar dados ao iniciar
  useEffect(() => {
    (async () => {
      await loadAllData();
      setLoading(false);
    })();
  }, [loadAllData]);

  // Polling: recarregar dados a cada 15 segundos para sincronizar entre aparelhos
  useEffect(() => {
    if (loading) return;
    const interval = setInterval(async () => {
      try {
        const [f, m, r, dr, u, v, c, ag, af, fe, t] = await Promise.all([
          api.getFuelings(),
          api.getMaintenances(),
          api.getRoutes(),
          api.getDailyRoutes(),
          api.getUsers(),
          api.getVehicles(),
          api.getCustomers(),
          api.getAgregados(),
          api.getAgregadoFreights(),
          api.getFixedExpenses(),
          api.getTolls(),
        ]);
        setFuelings(f);
        setMaintenances(m);
        setRoutes(r);
        setDailyRoutes(dr);
        setUsers(u);
        setVehicles(v);
        setCustomers(c);
        setAgregados(ag);
        setAgregadoFreights(af);
        setFixedExpenses(fe);
        setTolls(t);
        setSyncStatus('ok');
      } catch {
        // Falha silenciosa no polling - nao muda status
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [loading]);

  // Restaurar sessao do usuario apos carregar dados
  useEffect(() => {
    if (loading || users.length === 0) return;
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
  }, [loading, users]);

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

  // Salvar novo registro: atualiza estado local + envia para API
  const saveRecord = (setFn: any, record: any, apiCall: (r: any) => Promise<any>) => {
    setFn((prev: any) => [record, ...prev]);
    apiCall(record).catch(err => console.error('[v0] saveRecord API error:', err));
  };

  // Atualizar registro existente: atualiza estado local + envia para API
  const updateRecord = (setFn: any, id: string, update: any, apiCall?: (id: string, u: any) => Promise<any>) => {
    setFn((prev: any[]) => prev.map(i => i.id === id ? { ...i, ...update } : i));
    if (apiCall) {
      apiCall(id, update).catch(err => console.error('[v0] updateRecord API error:', err));
    }
  };

  const onSaveUser = async (u: User) => {
    const exists = users.find(x => x.id === u.id);
    setUsers(prev => exists ? prev.map(x => x.id === u.id ? u : x) : [u, ...prev]);
    await api.saveUser(u).catch(err => console.error('API saveUser error:', err));
  };

  const onSaveVehicle = async (v: Vehicle) => {
    setVehicles(prev => [...prev, v]);
    await api.saveVehicle(v).catch(err => console.error('API saveVehicle error:', err));
  };

  // Wrappers que sincronizam listas inteiras com a API
  const syncCustomers = (newList: Customer[] | ((prev: Customer[]) => Customer[])) => {
    setCustomers(prev => {
      const resolved = typeof newList === 'function' ? newList(prev) : newList;
      // Encontrar novos clientes e salvar na API
      const prevIds = new Set(prev.map(c => c.id));
      resolved.forEach(c => {
        if (!prevIds.has(c.id)) {
          api.saveCustomer(c).catch(err => console.error('API saveCustomer error:', err));
        }
      });
      // Para toggling de status, enviar update via save (upsert)
      resolved.forEach(c => {
        const old = prev.find(o => o.id === c.id);
        if (old && old.ativo !== c.ativo) {
          api.saveCustomer(c).catch(err => console.error('API updateCustomer error:', err));
        }
      });
      return resolved;
    });
  };

  const syncAgregados = (newList: Agregado[]) => {
    const prevIds = new Set(agregados.map(a => a.id));
    newList.forEach(a => {
      if (!prevIds.has(a.id)) {
        api.saveAgregado(a).catch(err => console.error('API saveAgregado error:', err));
      } else {
        const old = agregados.find(o => o.id === a.id);
        if (old && old.ativo !== a.ativo) {
          api.saveAgregado(a).catch(err => console.error('API updateAgregado error:', err));
        }
      }
    });
    setAgregados(newList);
  };

  const syncTolls = (newList: Toll[]) => {
    const prevIds = new Set(tolls.map(t => t.id));
    newList.forEach(t => {
      if (!prevIds.has(t.id)) {
        api.createToll(t).catch(err => console.error('API createToll error:', err));
      }
    });
    // Handle deletions via replace
    api.replaceTolls(newList).catch(err => console.error('API replaceTolls error:', err));
    setTolls(newList);
  };

  const syncFixedExpenses = (newList: FixedExpense[]) => {
    const prevIds = new Set(fixedExpenses.map(e => e.id));
    newList.forEach(e => {
      if (!prevIds.has(e.id)) {
        api.createFixedExpense(e).catch(err => console.error('API createFixedExpense error:', err));
      }
    });
    // Handle deletions via replace
    api.replaceFixedExpenses(newList).catch(err => console.error('API replaceFixedExpenses error:', err));
    setFixedExpenses(newList);
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
    if (!currentUser) return <React.Suspense fallback={null}><Login onLogin={handleLogin} users={users} syncStatus={syncStatus} /></React.Suspense>;

    const isOp = currentUser.perfil === UserRole.MOTORISTA || currentUser.perfil === UserRole.AJUDANTE;
    if (isOp && ['fueling', 'maintenance', 'route', 'daily-route', 'helper-binding'].includes(currentPage) && !session) {
      return <React.Suspense fallback={null}><VehicleSelection vehicles={vehicles} onSelect={(vId, pl) => {
        const s = { userId: currentUser.id, vehicleId: vId, placa: pl, updatedAt: new Date().toISOString() };
        setSession(s); localStorage.setItem('prime_group_session', JSON.stringify(s)); navigate('operation');
      }} onBack={() => navigate('operation')} /></React.Suspense>;
    }

    switch (currentPage) {
      case 'fueling': return <FuelingForm session={session!} user={currentUser} onBack={() => navigate('operation')} onSubmit={(f) => { saveRecord(setFuelings, f, api.createFueling); navigate('operation'); }} />;
      case 'maintenance': return <MaintenanceForm session={session!} user={currentUser} onBack={() => navigate('operation')} onSubmit={(m) => { saveRecord(setMaintenances, m, api.createMaintenance); navigate('operation'); }} />;
      case 'route': return <RouteForm session={session!} user={currentUser} drivers={users.filter(u => u.perfil === UserRole.MOTORISTA)} customers={customers} onBack={() => navigate('operation')} onSubmit={(r) => { saveRecord(setRoutes, r, api.createRoute); navigate('operation'); }} />;
      case 'daily-route': return <DriverDailyRoute session={session!} user={currentUser} customers={customers} onBack={() => navigate('operation')} onSubmit={(dr) => { saveRecord(setDailyRoutes, dr, api.createDailyRoute); navigate('operation'); }} />;
      case 'helper-binding': return <HelperRouteBinding session={session!} user={currentUser} dailyRoutes={dailyRoutes} users={users} onBack={() => navigate('operation')} onBind={(rId) => { updateRecord(setDailyRoutes, rId, { ajudanteId: currentUser.id, ajudanteNome: currentUser.nome }, api.updateDailyRoute); navigate('operation'); }} />;
      case 'select-vehicle': return <VehicleSelection vehicles={vehicles} onSelect={(vId, pl) => { const s = { userId: currentUser.id, vehicleId: vId, placa: pl, updatedAt: new Date().toISOString() }; setSession(s); localStorage.setItem('prime_group_session', JSON.stringify(s)); navigate('operation'); }} onBack={() => navigate('operation')} />;
      case 'my-requests': return <MyRequests fuelings={fuelings.filter(f => f.motoristaId === currentUser.id)} maintenances={maintenances.filter(m => m.motoristaId === currentUser.id)} onBack={() => navigate('operation')} />;
      case 'my-routes': return <MyRoutes routes={dailyRoutes.filter(r => r.ajudanteId === currentUser.id)} onBack={() => navigate('operation')} />;
      
      // Admin
      case 'admin-dashboard': return <AdminDashboard fuelings={fuelings} maintenances={maintenances} vehicles={vehicles} fixedExpenses={fixedExpenses} onBack={() => navigate('operation')} />;
      case 'admin-pending': return <AdminPending fuelings={fuelings} maintenances={maintenances} dailyRoutes={dailyRoutes} routes={routes} vehicles={vehicles} users={users} currentUser={currentUser} onUpdateFueling={(id, up) => updateRecord(setFuelings, id, up, api.updateFueling)} onUpdateMaintenance={(id, up) => updateRecord(setMaintenances, id, up, api.updateMaintenance)} onUpdateDailyRoute={(id, up) => updateRecord(setDailyRoutes, id, up, api.updateDailyRoute)} onUpdateRoute={(id, up) => updateRecord(setRoutes, id, up, api.updateRoute)} onBack={() => navigate('operation')} />;
      case 'user-mgmt': return <UserManagement users={users} onSaveUser={onSaveUser} onBack={() => navigate('operation')} />;
      case 'vehicle-mgmt': return <VehicleManagement vehicles={vehicles} onSaveVehicle={onSaveVehicle} onBack={() => navigate('operation')} />;
      case 'admin-customers': return <AdminCustomerManagement customers={customers} setCustomers={syncCustomers} onBack={() => navigate('operation')} />;
      case 'admin-agregado-mgmt': return <AdminAgregadoManagement agregados={agregados} onUpdateAgregados={syncAgregados} onBack={() => navigate('operation')} />;
      case 'admin-agregado-freight': return <AdminAgregadoFreight agregados={agregados} onSubmit={(f) => saveRecord(setAgregadoFreights, f, api.createAgregadoFreight)} onBack={() => navigate('operation')} />;
      case 'admin-agregado-report': return <AdminAgregadoReport freights={agregadoFreights} onBack={() => navigate('operation')} />;
      case 'admin-tolls': return <AdminTollManagement tolls={tolls} vehicles={vehicles} onUpdateTolls={syncTolls} onBack={() => navigate('operation')} />;
      case 'admin-fixed-expenses': return <AdminFixedExpenses fixedExpenses={fixedExpenses} onUpdateExpenses={syncFixedExpenses} onBack={() => navigate('operation')} />;
      case 'admin-create-route': return <AdminCreateDailyRoute users={users} vehicles={vehicles} customers={customers} onSubmit={(r) => { saveRecord(setDailyRoutes, r, api.createDailyRoute); navigate('operation'); }} onBack={() => navigate('operation')} />;
      case 'admin-preventive': return <AdminPreventiveMaintenance vehicles={vehicles} onUpdateVehicle={(id, up) => updateRecord(setVehicles, id, up, api.updateVehicle)} onBack={() => navigate('operation')} />;
      case 'admin-maintenance-history': return <AdminMaintenanceHistory maintenances={maintenances} users={users} onBack={() => navigate('operation')} />;
      case 'admin-tracking': return <AdminTracking vehicles={vehicles} onUpdateVehicle={(id, up) => updateRecord(setVehicles, id, up, api.updateVehicle)} onBack={() => navigate('operation')} />;
      case 'admin-checklists': return <AdminChecklistReport dailyRoutes={dailyRoutes} users={users} vehicles={vehicles} onBack={() => navigate('operation')} />;
      case 'admin-consolidated-finance': return <AdminConsolidatedFinancialReport dailyRoutes={dailyRoutes} routes={routes} fuelings={fuelings} maintenances={maintenances} tolls={tolls} agregadoFreights={agregadoFreights} fixedExpenses={fixedExpenses} onBack={() => navigate('operation')} />;
      case 'admin-vehicle-report': return <AdminVehicleReport fuelings={fuelings} maintenances={maintenances} vehicles={vehicles} dailyRoutes={dailyRoutes} routes={routes} tolls={tolls} fixedExpenses={fixedExpenses} onBack={() => navigate('operation')} onUpdateDailyRoute={(id, up) => updateRecord(setDailyRoutes, id, up, api.updateDailyRoute)} onUpdateRoute={(id, up) => updateRecord(setRoutes, id, up, api.updateRoute)} />;
      case 'admin-activity-report': return <AdminActivityReport dailyRoutes={dailyRoutes} routes={routes} fuelings={fuelings} maintenances={maintenances} users={users} onUpdateDailyRoute={(id, up) => updateRecord(setDailyRoutes, id, up, api.updateDailyRoute)} onUpdateRoute={(id, up) => updateRecord(setRoutes, id, up, api.updateRoute)} onUpdateFueling={(id, up) => updateRecord(setFuelings, id, up, api.updateFueling)} onUpdateMaintenance={(id, up) => updateRecord(setMaintenances, id, up, api.updateMaintenance)} onBack={() => navigate('operation')} />;

      default: return <OperationHome user={currentUser} session={session} onNavigate={navigate} onLogout={handleLogout} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-50 gap-4">
        <Logo size="lg" showText={true} />
        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Conectando ao banco de dados...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('operation')}>
          <Logo size="sm" showText={true} />
          <div className="flex items-center gap-1.5 ml-2">
            <span className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'ok' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : syncStatus === 'loading' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">
              {syncStatus === 'ok' ? 'Conectado' : syncStatus === 'loading' ? 'Sincronizando...' : 'Offline'}
            </span>
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
