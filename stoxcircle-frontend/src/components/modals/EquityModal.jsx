import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import Modal from "../Modal";

// --- Member Equity Modal Component ---
export default function EquityModal({ isOpen, onClose, members, totalCapital }) {
  if (!isOpen) return null;

  // Premium SaaS color palette for the chart
  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Equity Distribution">
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
        
        {/* Donut Chart */}
        <div style={{ width: '100%', height: '220px', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={members}
                dataKey="percentage_share"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                stroke="var(--bg-base)" /* Matches dark background to create gaps */
                strokeWidth={3}
                paddingAngle={2}
              >
                {members.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', color: '#fafafa' }}
                itemStyle={{ color: '#fafafa' }}
                formatter={(value) => `${value.toFixed(1)}%`}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center Label for Donut */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Cap</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatCurrency(totalCapital)}
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown List */}
      <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0 16px' }}>
        {members.map((member, idx) => {
          // Calculate their actual rupee value based on the total group capital
          const memberValue = (member.percentage_share / 100) * totalCapital;

          return (
            <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: idx !== members.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: COLORS[idx % COLORS.length] }} />
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>{member.profiles?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{member.role}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(memberValue)}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{member.percentage_share.toFixed(1)}%</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}