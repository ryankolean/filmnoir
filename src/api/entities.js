import { supabase } from './supabaseClient';

export const Photo = {
  async list(orderBy = '-created_at') {
    const isDescending = orderBy.startsWith('-');
    const field = isDescending ? orderBy.substring(1) : orderBy;

    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order(field, { ascending: !isDescending });

    if (error) throw error;
    return data || [];
  },

  async find(options = {}) {
    let query = supabase
      .from('photos')
      .select('*');

    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options.orderBy) {
      const { field, direction = 'desc' } = options.orderBy;
      query = query.order(field, { ascending: direction === 'asc' });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async findOne(id) {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async get(id) {
    return this.findOne(id);
  },

  async create(photoData) {
    const user = await User.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('photos')
      .insert({ ...photoData, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id, photoData) {
    const { data, error } = await supabase
      .from('photos')
      .update({ ...photoData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

export const Group = {
  async list(orderBy = '-created_at') {
    const isDescending = orderBy.startsWith('-');
    const field = isDescending ? orderBy.substring(1) : orderBy;

    const { data, error } = await supabase
      .from('groups')
      .select('*, group_members(*)')
      .order(field, { ascending: !isDescending });

    if (error) throw error;
    return data || [];
  },

  async find(options = {}) {
    let query = supabase
      .from('groups')
      .select('*, group_members(*)');

    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options.orderBy) {
      const { field, direction = 'desc' } = options.orderBy;
      query = query.order(field, { ascending: direction === 'asc' });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async findOne(id) {
    const { data, error } = await supabase
      .from('groups')
      .select('*, group_members(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async get(id) {
    return this.findOne(id);
  },

  async create(groupData) {
    const user = await User.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({ ...groupData, owner_id: user.id })
      .select()
      .single();

    if (groupError) throw groupError;

    const { error: memberError } = await supabase
      .from('group_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'owner'
      });

    if (memberError) throw memberError;
    return group;
  },

  async update(id, groupData) {
    const { data, error } = await supabase
      .from('groups')
      .update({ ...groupData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async addMember(groupId, userId, role = 'member') {
    const { data, error } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, user_id: userId, role })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeMember(groupId, userId) {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  async getMembers(groupId) {
    const { data, error } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', groupId);

    if (error) throw error;
    return data || [];
  },

  async findByInviteCode(inviteCode) {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .eq('invite_code', inviteCode)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
};

export const User = {
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },

  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  },

  async logout() {
    return this.signOut();
  },

  async login() {
    throw new Error('Please use signIn(email, password) or signInWithGoogle()');
  },

  async loginWithRedirect(redirectUrl) {
    throw new Error('Please use signIn(email, password) or signInWithGoogle()');
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async me() {
    return this.getUser();
  },

  async updateUser(updates) {
    const { data, error } = await supabase.auth.updateUser(updates);
    if (error) throw error;
    return data.user;
  },

  async updateMyUserData(updates) {
    return this.updateUser({ data: updates });
  },

  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return true;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        await callback(event, session);
      })();
    });
  }
};
