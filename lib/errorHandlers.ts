import { supabase } from './supabase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface DatabaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
  }
}

export async function handleDatabaseError(error: unknown, operationType: OperationType, path: string | null): Promise<never> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const errInfo: DatabaseErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: user?.id,
      email: user?.email,
    },
    operationType,
    path
  };
  
  console.error('Database Error: ', JSON.stringify(errInfo));
  
  // Mensagem amigável para o usuário
  let userMessage = 'Ocorreu um erro ao acessar os dados. Por favor, tente novamente.';
  const errorStr = errInfo.error.toLowerCase();
  
  if (errorStr.includes('permission') || errorStr.includes('policy')) {
    userMessage = 'Você não tem permissão para realizar esta ação ou acessar estes dados.';
  } else if (errorStr.includes('not found')) {
    userMessage = 'O registro solicitado não foi encontrado.';
  } else if (errorStr.includes('unavailable') || errorStr.includes('fetch')) {
    userMessage = 'O serviço está temporariamente indisponível. Verifique sua conexão.';
  }

  throw new Error(userMessage);
}
