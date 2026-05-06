import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllUsers, manageUserRole } from '../api';

const roleLevels = {
  'user': 1,
  'admin': 2,
  'owner': 3,
  'sub-owner': 4,
  'developer': 5
};

const getAvailableRoles = (myRole, targetRole) => {
  const myLevel = roleLevels[myRole] || 0;
  const targetLevel = roleLevels[targetRole] || 0;
  if (targetLevel >= myLevel) return [];
  return Object.keys(roleLevels).filter(role => roleLevels[role] < myLevel);
};

const UserManagement = ({ isEmbedded = false }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const token = localStorage.getItem('token');
  const myRole = localStorage.getItem('role');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsers(token);
      setUsers(data);
    } catch (err) {
      console.error("IDENTITY_READ_FAILED", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await manageUserRole(userId, newRole, token);
      setMessage(`NODE_RECONFIGURED: ${newRole.toUpperCase()}`);
      fetchUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage("CLEARANCE_LEVEL_INSUFFICIENT");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className={isEmbedded ? "" : "min-h-screen bg-[#010413] pt-32 pb-20 px-8"}>
      <div className={isEmbedded ? "" : "max-w-6xl mx-auto"}>
        
        {!isEmbedded && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h1 className="text-5xl font-black italic uppercase text-white tracking-tighter">
              Authority <span className="text-indigo-400">Control</span>
            </h1>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.5em] font-bold mt-4">Node Identity Management Hub</p>
          </motion.div>
        )}

        {message && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400 text-center">
            {message}
          </motion.div>
        )}

        <div className="glass-panel rounded-[2rem] border border-white/5 bg-black/40 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[10px] font-bold uppercase tracking-widest">
              <thead>
                <tr className="bg-white/[0.02] text-slate-500 border-b border-white/5">
                  <th className="py-6 px-8 italic">Node Alias</th>
                  <th className="py-6 px-6 italic">Signal Address</th>
                  <th className="py-6 px-6 italic">Clearance Level</th>
                  <th className="py-6 px-8 text-right italic">Action Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {loading ? (
                  <tr><td colSpan="4" className="py-20 text-center animate-pulse text-indigo-500">DECRYPTING_USER_DATABASE...</td></tr>
                ) : users.map((user) => (
                  <tr key={user._id} className="hover:bg-white/[0.01] transition-all group">
                    <td className="py-6 px-8 text-white font-black">{user.name}</td>
                    <td className="py-6 px-6 text-slate-500">{user.email}</td>
                    <td className="py-6 px-6">
                      <span className={`px-3 py-1 rounded-full text-[8px] border ${
                        user.role === 'developer' ? 'bg-indigo-500 text-white border-indigo-400' :
                        user.role === 'owner' ? 'bg-purple-500 text-white border-purple-400' :
                        user.role === 'sub-owner' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                        user.role === 'admin' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-white/5 text-slate-400 border-white/10'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-6 px-8 text-right">
                      {(() => {
                        const availableRoles = getAvailableRoles(myRole, user.role);
                        if (availableRoles.length === 0) return <span className="text-[9px] text-slate-500">NO CLEARANCE</span>;
                        
                        return (
                          <select 
                            className="bg-black/50 border border-white/10 rounded-xl text-[9px] font-black uppercase text-slate-400 p-2 outline-none focus:border-indigo-500 transition-all cursor-pointer"
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          >
                            <option value={user.role} disabled>CURRENT: {user.role.toUpperCase()}</option>
                            {availableRoles.map(role => (
                              role !== user.role && <option key={role} value={role}>{role.toUpperCase()}</option>
                            ))}
                          </select>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
