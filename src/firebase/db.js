import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  limit,
  deleteDoc,
  updateDoc,
  doc
} from "firebase/firestore";
import { db } from "./config";

export const addHealthRecord = async (userId, data) => {
  try {
    const docRef = await addDoc(collection(db, "health_records"), {
      userId,
      ...data,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const subscribeToHealthRecords = (userId, callback) => {
  const q = query(
    collection(db, "health_records"),
    where("userId", "==", userId),
    orderBy("timestamp", "desc"),
    limit(30)
  );

  return onSnapshot(q, (querySnapshot) => {
    const records = [];
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });
    callback(records);
  });
};

export const deleteHealthRecord = async (recordId) => {
  try {
    await deleteDoc(doc(db, "health_records", recordId));
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw e;
  }
};

export const updateHealthRecord = async (recordId, data) => {
  try {
    const docRef = doc(db, "health_records", recordId);
    await updateDoc(docRef, {
      ...data,
      lastUpdated: serverTimestamp()
    });
  } catch (e) {
    console.error("Error updating document: ", e);
    throw e;
  }
};
