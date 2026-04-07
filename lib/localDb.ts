import { v4 as uuidv4 } from 'uuid';

const getDb = () => {
    try {
        const data = localStorage.getItem('app_local_db');
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
};

const saveDb = (data: any) => {
    localStorage.setItem('app_local_db', JSON.stringify(data));
};

export const collection = (db: any, path: string) => {
    return { path };
};

export const doc = (dbOrCollectionRef: any, pathOrId?: string, id?: string) => {
    if (dbOrCollectionRef.path) {
        // It's a collectionRef
        const collectionPath = dbOrCollectionRef.path;
        const docId = pathOrId || uuidv4();
        return { path: `${collectionPath}/${docId}`, id: docId };
    }
    
    // It's db and path
    const path = pathOrId as string;
    if (id) {
        return { path: `${path}/${id}`, id };
    }
    return { path, id: path.split('/').pop() };
};

export const getDocs = async (queryObj: any) => {
    const dbData = getDb();
    const path = queryObj.path;
    const collectionData = dbData[path] || {};
    
    let docs = Object.entries(collectionData).map(([id, data]) => ({
        id,
        data: () => data as any,
        exists: () => true,
        ref: { path: `${path}/${id}`, id }
    }));

    if (queryObj.wheres) {
        for (const w of queryObj.wheres) {
            docs = docs.filter(d => {
                const val = (d.data() as any)[w.field];
                if (w.op === '==') return val === w.value;
                if (w.op === '!=') return val !== w.value;
                if (w.op === '>') return val > w.value;
                if (w.op === '<') return val < w.value;
                if (w.op === '>=') return val >= w.value;
                if (w.op === '<=') return val <= w.value;
                if (w.op === 'in') return w.value.includes(val);
                if (w.op === 'array-contains') return Array.isArray(val) && val.includes(w.value);
                return true;
            });
        }
    }

    if (queryObj.orderBys) {
        for (const o of queryObj.orderBys) {
            docs.sort((a, b) => {
                const valA = (a.data() as any)[o.field];
                const valB = (b.data() as any)[o.field];
                if (valA < valB) return o.dir === 'desc' ? 1 : -1;
                if (valA > valB) return o.dir === 'desc' ? -1 : 1;
                return 0;
            });
        }
    }

    return {
        docs,
        empty: docs.length === 0,
        forEach: (cb: any) => docs.forEach(cb)
    };
};

export const getDoc = async (docRef: any) => {
    const dbData = getDb();
    const parts = docRef.path.split('/');
    const id = parts.pop();
    const path = parts.join('/');
    
    const collectionData = dbData[path] || {};
    const data = collectionData[id as string];
    
    return {
        id,
        data: () => data as any,
        exists: () => !!data,
        ref: { path: docRef.path, id }
    };
};

export const addDoc = async (collectionRef: any, data: any) => {
    const dbData = getDb();
    const path = collectionRef.path;
    if (!dbData[path]) dbData[path] = {};
    
    const id = uuidv4();
    dbData[path][id] = { ...data, id };
    saveDb(dbData);
    
    return { id, path: `${path}/${id}` };
};

export const setDoc = async (docRef: any, data: any, options?: any) => {
    const dbData = getDb();
    const parts = docRef.path.split('/');
    const id = parts.pop() as string;
    const path = parts.join('/');
    
    if (!dbData[path]) dbData[path] = {};
    
    if (options?.merge) {
        dbData[path][id] = { ...(dbData[path][id] || {}), ...data };
    } else {
        dbData[path][id] = data;
    }
    
    saveDb(dbData);
};

export const updateDoc = async (docRef: any, data: any) => {
    const dbData = getDb();
    const parts = docRef.path.split('/');
    const id = parts.pop() as string;
    const path = parts.join('/');
    
    if (!dbData[path]) dbData[path] = {};
    if (!dbData[path][id]) throw new Error("Document not found");
    
    dbData[path][id] = { ...dbData[path][id], ...data };
    saveDb(dbData);
};

export const deleteDoc = async (docRef: any) => {
    const dbData = getDb();
    const parts = docRef.path.split('/');
    const id = parts.pop() as string;
    const path = parts.join('/');
    
    if (dbData[path] && dbData[path][id]) {
        delete dbData[path][id];
        saveDb(dbData);
    }
};

export const query = (collectionRef: any, ...constraints: any[]) => {
    const q = { path: collectionRef.path, wheres: [] as any[], orderBys: [] as any[] };
    for (const c of constraints) {
        if (c.type === 'where') q.wheres.push(c);
        if (c.type === 'orderBy') q.orderBys.push(c);
    }
    return q;
};

export const where = (field: string, op: string, value: any) => {
    return { type: 'where', field, op, value };
};

export const orderBy = (field: string, dir: string = 'asc') => {
    return { type: 'orderBy', field, dir };
};

export const onSnapshot = (queryOrDocRef: any, onNext: any, onError?: any) => {
    // Immediate execution for local storage
    setTimeout(async () => {
        try {
            if (queryOrDocRef.wheres || queryOrDocRef.orderBys || !queryOrDocRef.id) {
                // It's a query or collection
                const snapshot = await getDocs(queryOrDocRef);
                onNext(snapshot);
            } else {
                // It's a doc
                const snapshot = await getDoc(queryOrDocRef);
                onNext(snapshot);
            }
        } catch (e) {
            if (onError) onError(e);
        }
    }, 0);
    
    // Polling to simulate real-time updates (simple approach)
    const interval = setInterval(async () => {
        try {
            if (queryOrDocRef.wheres || queryOrDocRef.orderBys || !queryOrDocRef.id) {
                const snapshot = await getDocs(queryOrDocRef);
                onNext(snapshot);
            } else {
                const snapshot = await getDoc(queryOrDocRef);
                onNext(snapshot);
            }
        } catch (e) {
            if (onError) onError(e);
        }
    }, 2000);
    
    return () => clearInterval(interval);
};

export const writeBatch = (db: any) => {
    const operations: any[] = [];
    return {
        set: (docRef: any, data: any, options?: any) => {
            operations.push({ type: 'set', docRef, data, options });
        },
        update: (docRef: any, data: any) => {
            operations.push({ type: 'update', docRef, data });
        },
        delete: (docRef: any) => {
            operations.push({ type: 'delete', docRef });
        },
        commit: async () => {
            for (const op of operations) {
                if (op.type === 'set') await setDoc(op.docRef, op.data, op.options);
                if (op.type === 'update') await updateDoc(op.docRef, op.data);
                if (op.type === 'delete') await deleteDoc(op.docRef);
            }
        }
    };
};

export const serverTimestamp = () => {
    return new Date().toISOString();
};
