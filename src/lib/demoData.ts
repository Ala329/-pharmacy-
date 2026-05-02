import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BatchStatus } from '../lib/blockchainService';
import { generateId } from '../lib/utils';

export async function seedDemoData(userId: string, userName: string) {
  const medicines = [
    { name: 'Amoxicillin 250mg', count: 45, threshold: 10 },
    { name: 'Insulin Glargine', count: 12, threshold: 20 },
    { name: 'Lipitor 20mg', count: 88, threshold: 15 },
    { name: 'Metformin 500mg', count: 5, threshold: 10 }
  ];

  // 1. Seed Inventory
  for (const med of medicines) {
    await addDoc(collection(db, 'inventory'), {
      pharmacyId: userId,
      medicineName: med.name,
      quantity: med.count,
      threshold: med.threshold,
      updatedAt: serverTimestamp()
    });
  }

  // 2. Seed some batches
  const batchNames = ['PANADOL-Z', 'VACC-99', 'COUGH-X'];
  for (const bName of batchNames) {
    const bId = generateId();
    const txHash = '0x' + generateId() + generateId();
    
    await addDoc(collection(db, 'batches'), {
      batchId: bId,
      name: bName,
      manufacturerId: userId,
      manufacturerName: userName,
      expiryDate: '2026-12-31',
      status: BatchStatus.MINTED,
      currentOwnerId: userId,
      currentOwnerName: userName,
      blockchainHash: txHash,
      createdAt: serverTimestamp()
    });

    await addDoc(collection(db, 'ledger'), {
      batchId: bId,
      action: 'MINT',
      fromId: '0x0',
      fromName: 'GENESIS',
      toId: userId,
      toName: userName,
      timestamp: serverTimestamp(),
      txHash
    });
  }

  return true;
}
