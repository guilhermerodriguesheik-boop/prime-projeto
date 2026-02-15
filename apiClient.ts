const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Request failed');
    }
    return res.json();
  } catch (e: any) {
    clearTimeout(timeout);
    throw e;
  }
}

export const api = {
  // Auth
  login: (email: string, senha: string) =>
    request<any>('/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),

  // Users
  getUsers: () => request<any[]>('/users'),
  saveUser: (user: any) =>
    request<any>('/users', { method: 'POST', body: JSON.stringify(user) }),

  // Vehicles
  getVehicles: () => request<any[]>('/vehicles'),
  saveVehicle: (vehicle: any) =>
    request<any>('/vehicles', { method: 'POST', body: JSON.stringify(vehicle) }),
  updateVehicle: (id: string, updates: any) =>
    request<any>('/vehicles', { method: 'PUT', body: JSON.stringify({ id, ...updates }) }),

  // Customers
  getCustomers: () => request<any[]>('/customers'),
  saveCustomer: (customer: any) =>
    request<any>('/customers', { method: 'POST', body: JSON.stringify(customer) }),

  // Agregados
  getAgregados: () => request<any[]>('/agregados'),
  saveAgregado: (agregado: any) =>
    request<any>('/agregados', { method: 'POST', body: JSON.stringify(agregado) }),
  replaceAgregados: (list: any[]) =>
    request<any>('/agregados', { method: 'PUT', body: JSON.stringify(list) }),

  // Fuelings
  getFuelings: () => request<any[]>('/fuelings'),
  createFueling: (f: any) =>
    request<any>('/fuelings', { method: 'POST', body: JSON.stringify(f) }),
  updateFueling: (id: string, updates: any) =>
    request<any>('/fuelings', { method: 'PUT', body: JSON.stringify({ id, ...updates }) }),

  // Maintenances
  getMaintenances: () => request<any[]>('/maintenances'),
  createMaintenance: (m: any) =>
    request<any>('/maintenances', { method: 'POST', body: JSON.stringify(m) }),
  updateMaintenance: (id: string, updates: any) =>
    request<any>('/maintenances', { method: 'PUT', body: JSON.stringify({ id, ...updates }) }),

  // Routes
  getRoutes: () => request<any[]>('/routes'),
  createRoute: (r: any) =>
    request<any>('/routes', { method: 'POST', body: JSON.stringify(r) }),
  updateRoute: (id: string, updates: any) =>
    request<any>('/routes', { method: 'PUT', body: JSON.stringify({ id, ...updates }) }),

  // Daily Routes
  getDailyRoutes: () => request<any[]>('/daily-routes'),
  createDailyRoute: (dr: any) =>
    request<any>('/daily-routes', { method: 'POST', body: JSON.stringify(dr) }),
  updateDailyRoute: (id: string, updates: any) =>
    request<any>('/daily-routes', { method: 'PUT', body: JSON.stringify({ id, ...updates }) }),

  // Fixed Expenses
  getFixedExpenses: () => request<any[]>('/fixed-expenses'),
  createFixedExpense: (fe: any) =>
    request<any>('/fixed-expenses', { method: 'POST', body: JSON.stringify(fe) }),
  replaceFixedExpenses: (list: any[]) =>
    request<any>('/fixed-expenses', { method: 'PUT', body: JSON.stringify(list) }),

  // Agregado Freights
  getAgregadoFreights: () => request<any[]>('/agregado-freights'),
  createAgregadoFreight: (af: any) =>
    request<any>('/agregado-freights', { method: 'POST', body: JSON.stringify(af) }),

  // Tolls
  getTolls: () => request<any[]>('/tolls'),
  createToll: (t: any) =>
    request<any>('/tolls', { method: 'POST', body: JSON.stringify(t) }),
  replaceTolls: (list: any[]) =>
    request<any>('/tolls', { method: 'PUT', body: JSON.stringify(list) }),
};
