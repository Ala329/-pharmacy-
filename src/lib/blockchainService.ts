import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { generateId } from './utils';

export enum BatchStatus {
  MINTED = 'minted',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  DISPENSED = 'dispensed'
}

export interface Batch {
  id?: string;
  batchId: string;
  name: string;
  manufacturerId: string;
  manufacturerName: string;
  createdAt: any;
  expiryDate: string;
  status: BatchStatus;
  currentOwnerId: string;
  currentOwnerName: string;
  blockchainHash: string;
}

export interface LedgerEntry {
  batchId: string;
  action: string;
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  timestamp: any;
  txHash: string;
}

// Simulating Blockchain transactions with Firestore
export const blockchainService = {
  async registerBatch(data: Omit<Batch, 'createdAt' | 'blockchainHash' | 'status' | 'id'>) {
    const txHash = '0x' + generateId() + generateId() + generateId();
    const batchData: Batch = {
      ...data,
      status: BatchStatus.MINTED,
      createdAt: serverTimestamp(),
      blockchainHash: txHash
    };

    const batchRef = await addDoc(collection(db, 'batches'), batchData);
    
    // Add to ledger
    await addDoc(collection(db, 'ledger'), {
      batchId: data.batchId,
      action: 'MINT',
      fromId: '0x0',
      fromName: 'GENESIS',
      toId: data.manufacturerId,
      toName: data.manufacturerName,
      timestamp: serverTimestamp(),
      txHash
    });

    return batchRef.id;
  },

  async transferBatch(batchId: string, docId: string, toId: string, toName: string, fromId: string, fromName: string, newStatus: BatchStatus) {
    const txHash = '0x' + generateId() + generateId() + generateId();
    
    const batchRef = doc(db, 'batches', docId);
    await updateDoc(batchRef, {
      currentOwnerId: toId,
      currentOwnerName: toName,
      status: newStatus,
      blockchainHash: txHash
    });

    // Add to ledger
    await addDoc(collection(db, 'ledger'), {
      batchId: batchId,
      action: 'TRANSFER',
      fromId,
      fromName,
      toId,
      toName,
      timestamp: serverTimestamp(),
      txHash
    });
  },

  async getBatchByBatchId(batchId: string) {
    const q = query(collection(db, 'batches'), where('batchId', '==', batchId.toUpperCase()));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Batch;
  },

  async getBatchHistory(batchId: string) {
    const q = query(
      collection(db, 'ledger'), 
      where('batchId', '==', batchId.toUpperCase()),
      orderBy('timestamp', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as LedgerEntry);
  }
};
