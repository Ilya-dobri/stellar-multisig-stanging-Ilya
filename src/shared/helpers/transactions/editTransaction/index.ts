import { Transaction } from 'stellar-sdk';
import { updateTransactionByID } from '@/shared/api/firebase/firestore/Transactions';
import { Net } from '@/shared/types/store/slices';

/**
 * Updates an existing transaction in Firestore with a new XDR.
 * @param {Transaction} transaction - The Stellar transaction to update.
 * @param {string} net - The network identifier.
 * @param {string} firebaseID - The Firestore document ID.
 * @returns {Promise<any>} - The result of the update operation.
 * @throws Will throw an error if the update fails.
 */
const editTransaction = async (
  transaction: Transaction,
  net: Net,
  firebaseID: string
): Promise<any> => {
  if (!transaction) return;

  try {
    const XDR = transaction.toXDR();
    const txHash = await updateTransactionByID(net, firebaseID, {
      xdr: XDR,
      updatedAt: Date.now(),
    });
    console.log(txHash);
    return txHash;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to update transaction.');
  }
};

export default editTransaction;
