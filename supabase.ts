
// O app está operando em modo OFFLINE (localStorage).
// Este arquivo foi mantido como um stub para não quebrar imports existentes.

export const supabase = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ error: null }),
    update: () => ({ eq: () => Promise.resolve({ error: null }) }),
  })
} as any;

export const mapFromDb = (item: any) => item;
export const mapToDb = (item: any) => item;
