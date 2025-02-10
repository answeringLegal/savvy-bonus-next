import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { UserData, userConverter } from '@/types/users';

const useFindUserByName = (name: string) => {
  return useQuery<UserData | null, Error>({
    queryKey: ['user_by_name', name],
    queryFn: async () => {
      try {
        const usersRef = collection(db, 'users').withConverter(userConverter);

        // Query where "hubspot.name" matches
        const hubspotQuery = query(usersRef, where('hubspot.name', '==', name));
        const hubspotSnapshot = await getDocs(hubspotQuery);
        if (!hubspotSnapshot.empty) {
          return hubspotSnapshot.docs[0].data(); // Return first match
        }

        // Query where "chargeover.name" matches
        const chargeoverQuery = query(
          usersRef,
          where('chargeover.name', '==', name)
        );
        const chargeoverSnapshot = await getDocs(chargeoverQuery);
        if (!chargeoverSnapshot.empty) {
          return chargeoverSnapshot.docs[0].data(); // Return first match
        }

        return null; // No user found
      } catch (error) {
        console.error('Error fetching user by name:', error);
        throw new Error('Error fetching user by name');
      }
    },
    enabled: !!name, // Only run the query if a name is provided
  });
};

const useGetAllUsers = () => {
  return useQuery<UserData[], Error>({
    queryKey: ['all_users'],
    queryFn: async () => {
      try {
        const usersRef = collection(db, 'users').withConverter(userConverter);
        const querySnapshot = await getDocs(usersRef);
        return querySnapshot.docs.map((doc) => doc.data());
      } catch (error) {
        console.error('Error fetching all users:', error);
        throw new Error('Error fetching all users');
      }
    },
  });
};

const useGetUserById = (id: string) => {
  return useQuery<UserData | null, Error>({
    queryKey: ['user_by_id', id],
    queryFn: async () => {
      if (!id) return null;

      try {
        const userRef = doc(db, 'users', id).withConverter(userConverter);
        const docSnap = await getDoc(userRef);
        return docSnap.exists() ? docSnap.data() : null;
      } catch (error) {
        console.error(`Error fetching user with ID ${id}:`, error);
        throw new Error('Error fetching user by ID');
      }
    },
    enabled: !!id, // Only fetch if ID is provided
  });
};

const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Partial<UserData>,
    Error,
    { id: string; data: Partial<UserData> }
  >({
    mutationFn: async ({ id, data }) => {
      try {
        const userRef = doc(db, 'users', id).withConverter(userConverter);
        await updateDoc(userRef, data);
        return data;
      } catch (error) {
        console.error(`Error updating user ${id}:`, error);
        throw new Error('Error updating user');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all_users'] });
    },
  });
};

const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    mutationFn: async (id) => {
      if (!id) throw new Error('User ID is required for delete');

      try {
        await deleteDoc(doc(db, 'users', id));
        return id;
      } catch (error) {
        console.error(`Error deleting user ${id}:`, error);
        throw new Error('Error deleting user');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all_users'] });
    },
  });
};

function getUsersByName(name: string, users: UserData[]) {
  const result = users.filter((user) => {
    return user.hubspot.name === name || user.chargeover.name === name;
  });

  return result[0];
}

export {
  useFindUserByName,
  useGetAllUsers,
  useGetUserById,
  useUpdateUser,
  useDeleteUser,
  getUsersByName,
};
