
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { firestore } from '@/integrations/firebase/client';
import { toast } from 'sonner';
import type { UserRole, UserData } from '@/types/admin';

export async function fetchUsers(): Promise<UserData[]> {
  try {
    console.log("Fetching users from Firebase...");
    // Get all profiles
    const profilesSnapshot = await getDocs(collection(firestore, 'profiles'));
    const profiles = profilesSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        full_name: data.full_name || null,
        email: data.email || 'No email',
        mfa_enrolled: data.mfa_enrolled || false,
        mfa_required: data.mfa_required || false,
        created_at: data.created_at || new Date().toISOString()
      };
    });
    
    // Get all user roles
    const rolesSnapshot = await getDocs(collection(firestore, 'user_roles'));
    const roles = rolesSnapshot.docs.reduce((acc, doc) => {
      const data = doc.data();
      acc[doc.id] = data.role;
      return acc;
    }, {} as Record<string, UserRole>);
    
    // Combine data
    const usersWithRoles = profiles.map(profile => ({
      ...profile,
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email || 'No email',
      role: roles[profile.id] || 'user',
      mfa_enrolled: profile.mfa_enrolled || false,
      mfa_required: profile.mfa_required || false,
      created_at: profile.created_at
    })) as UserData[];
    
    return usersWithRoles;
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error('Failed to fetch users from Firebase');
    throw error;
  }
}

export async function updateUserRole(userId: string, newRole: UserRole, currentUserId?: string): Promise<void> {
  try {
    // Don't allow changing your own role if you're a superadmin
    if (userId === currentUserId && newRole !== 'superadmin') {
      toast.error("You cannot downgrade your own superadmin role");
      return;
    }

    const userRoleRef = doc(firestore, 'user_roles', userId);
    const userRoleSnap = await getDoc(userRoleRef);
    
    if (userRoleSnap.exists()) {
      // Update existing role
      await updateDoc(userRoleRef, { 
        role: newRole, 
        updated_at: new Date().toISOString() 
      });
    } else {
      // Insert new role
      await setDoc(userRoleRef, {
        user_id: userId,
        role: newRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    toast.success(`User role updated to ${newRole}`);
  } catch (error) {
    console.error('Error updating user role:', error);
    toast.error('Failed to update user role');
    throw error;
  }
}

export async function toggleMfaRequirement(userId: string, required: boolean): Promise<void> {
  try {
    const profileRef = doc(firestore, 'profiles', userId);
    
    // Update the profile
    await updateDoc(profileRef, { 
      mfa_required: required,
      updated_at: new Date().toISOString()
    });
    
    // If MFA is being disabled, also reset MFA enrollment status if needed
    if (!required) {
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists() && profileSnap.data().mfa_enrolled) {
        await updateDoc(profileRef, { 
          mfa_enrolled: false,
          updated_at: new Date().toISOString()
        });
      }
    }
    
    toast.success(`MFA requirement ${required ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.error('Error updating MFA requirement:', error);
    toast.error('Failed to update MFA requirement');
    throw error;
  }
}

// Check admin access for migration tools
export async function checkMigrationAccess(userId: string): Promise<boolean> {
  try {
    console.log(`Checking migration access for user: ${userId}`);
    const userRoleRef = doc(firestore, 'user_roles', userId);
    const userRoleSnap = await getDoc(userRoleRef);
    
    if (userRoleSnap.exists()) {
      const role = userRoleSnap.data().role;
      console.log(`User role: ${role}`);
      return role === 'admin' || role === 'superadmin';
    }
    
    console.log(`No role found for user: ${userId}`);
    return false;
  } catch (error) {
    console.error('Error checking migration access:', error);
    return false;
  }
}
