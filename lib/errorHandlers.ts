import { auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  // Mensagem amigável para o usuário
  let userMessage = 'Ocorreu um erro ao acessar os dados. Por favor, tente novamente.';
  if (errInfo.error.includes('permission-denied') || errInfo.error.includes('insufficient permissions')) {
    userMessage = 'Você não tem permissão para realizar esta ação ou acessar estes dados.';
  } else if (errInfo.error.includes('not-found')) {
    userMessage = 'O registro solicitado não foi encontrado.';
  } else if (errInfo.error.includes('unavailable')) {
    userMessage = 'O serviço está temporariamente indisponível. Verifique sua conexão.';
  }

  throw new Error(userMessage);
}
