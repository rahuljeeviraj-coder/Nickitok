import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { 
  initializeFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  Timestamp,
  getDocFromServer,
  increment
} from 'firebase/firestore';

import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
console.log("Initializing Firestore with Database ID:", firebaseConfig.firestoreDatabaseId);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error handling helper
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
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ... existing code ...

// Connection test as per instructions
export async function testFirestoreConnection() {
  try {
    // Attempt to fetch from server to verify connection
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection check completed.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
    // Other errors are ignored as per instructions for connection test
  }
}

// Run test on load
testFirestoreConnection();

export async function toggleFollow(currentUserId: string, targetUserId: string) {
  if (currentUserId === targetUserId) return;
  
  const followId = `${currentUserId}_${targetUserId}`;
  const followRef = doc(db, 'following', followId);
  
  try {
    const followSnap = await getDoc(followRef);
    const currentToken = { userId: currentUserId, targetUserId, timestamp: new Date().toISOString() };
    
    if (followSnap.exists()) {
      await deleteDoc(followRef);
      // Decrease counts
      const targetUserRef = doc(db, 'users', targetUserId);
      const currentUserRef = doc(db, 'users', currentUserId);
      
      const [targetSnap, currentSnap] = await Promise.all([
        getDoc(targetUserRef),
        getDoc(currentUserRef)
      ]);
      
      if (targetSnap.exists()) {
        await updateDoc(targetUserRef, { followersCount: increment(-1) });
      }
      if (currentSnap.exists()) {
        await updateDoc(currentUserRef, { followingCount: increment(-1) });
      }
    } else {
      await setDoc(followRef, currentToken);
      
      const targetUserRef = doc(db, 'users', targetUserId);
      const currentUserRef = doc(db, 'users', currentUserId);
      
      const [targetSnap, currentSnap] = await Promise.all([
        getDoc(targetUserRef),
        getDoc(currentUserRef)
      ]);
      
      if (targetSnap.exists()) {
        await updateDoc(targetUserRef, { followersCount: increment(1) });
      }
      if (currentSnap.exists()) {
        await updateDoc(currentUserRef, { followingCount: increment(1) });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'following');
  }
}

export async function isFollowing(currentUserId: string, targetUserId: string) {
  try {
    const followId = `${currentUserId}_${targetUserId}`;
    const followSnap = await getDoc(doc(db, 'following', followId));
    return followSnap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'following');
    return false;
  }
}

// Global Interactions
export async function toggleLike(postId: string, userId: string) {
  const likeId = `${userId}_${postId}`;
  const likeRef = doc(db, 'likes', likeId);
  const postRef = doc(db, 'posts', postId);

  try {
    const likeSnap = await getDoc(likeRef);

    if (likeSnap.exists()) {
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likes: increment(-1) });
      return false;
    } else {
      await setDoc(likeRef, { userId, postId, timestamp: new Date().toISOString() });
      await updateDoc(postRef, { likes: increment(1) });
      return true;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'likes');
    return false;
  }
}

export async function addComment(postId: string, userId: string, userHandle: string, userAvatar: string, text: string) {
  const commentData = {
    postId,
    userId,
    userHandle,
    userAvatar,
    text,
    timestamp: new Date().toISOString()
  };
  try {
    await addDoc(collection(db, 'comments'), commentData);
    await updateDoc(doc(db, 'posts', postId), { comments: increment(1) });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'comments');
  }
}

export async function repost(postId: string, userId: string) {
    const repostId = `${userId}_${postId}`;
    const repostRef = doc(db, 'reposts', repostId);
    const postRef = doc(db, 'posts', postId);

    try {
      const repostSnap = await getDoc(repostRef);
      if (repostSnap.exists()) {
          return;
      }
      await setDoc(repostRef, { userId, postId, timestamp: new Date().toISOString() });
      await updateDoc(postRef, { reposts: increment(1) });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reposts');
    }
}

export async function hasLiked(postId: string, userId: string) {
  try {
    const likeId = `${userId}_${postId}`;
    const likeSnap = await getDoc(doc(db, 'likes', likeId));
    return likeSnap.exists();
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'likes');
    return false;
  }
}
