import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  limit
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
