import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          navigate('/login');
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.email) setUser(data);
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('http://localhost:8000/api/logout', { method: 'POST', credentials: 'include' });
    navigate('/login');
  };
 
  const handleCreateInvoice = async (e) => {
  e.preventDefault();
  
  if (!newTitle || !newAmount) {
    alert("Please fill in both the Title and Amount fields!");
    return;
  }

  try {
    const response = await fetch(`http://localhost:8000/invoices?title=${encodeURIComponent(newTitle)}&amount=${newAmount}&status=pending`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      alert("Invoice created successfully!");
      setNewTitle(''); 
      setNewAmount('');
      fetchInvoices();  
    } else {
      console.error("Failed to create invoice");
    }
  } catch (error) {
    console.error("Error creating invoice:", error);
  }
};

  const fetchInvoices = async () => {
    try {
      const response = await fetch('http://localhost:8000/invoices');
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  
  useEffect(() => {
    fetchInvoices();
  }, []);

  
  const handleStatusUpdate = async (invoiceId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8000/invoices/${invoiceId}/status?status=${newStatus}`, {
        method: 'PATCH',
      });
      if (response.ok) {
        alert(`Invoice successfully ${newStatus}!`);
        fetchInvoices(); 
      } else {
        console.error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };


  const handleEditInvoice = async (invoiceId, currentTitle, currentAmount) => {
    const newTitle = prompt("Enter new title:", currentTitle);
    const newAmount = prompt("Enter new amount:", currentAmount);
    
    if (!newTitle || !newAmount) return;

    try {
      const response = await fetch(`http://localhost:8000/invoices/${invoiceId}?title=${encodeURIComponent(newTitle)}&amount=${parseFloat(newAmount)}`, {
        method: 'PUT',
      });
      if (response.ok) {
        alert("Invoice updated successfully!");
        fetchInvoices(); 
      }
    } catch (error) {
      console.error("Error editing invoice:", error);
    }
  };
  

  if (!user) return <p style={{ color: '#333', fontWeight: 'bold' }}>Verifying Secure Session...</p>;

  return (
    <div className="dashboard-container">
      <h2>User Dashboard</h2>
      <div className="dashboard-card">
        <p><strong>Welcome back,</strong> {user.first_name} {user.last_name} 👋</p>
        <p><strong>Email Identity:</strong> {user.email}</p>
        <p><strong>Phone Registry:</strong> {user.phone}</p>
      </div>
      <button onClick={handleLogout} className="logout-btn">Secure Logout</button>
        
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', textAlign: 'left' }}>
          <h2 style={{ color: '#333', marginBottom: '15px' }}>Invoice Management Workflow</h2> 
         
     <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', marginBottom: '30px', maxWidth: '500px', margin: '20px auto',borderLeft: '5px solid #007bff' }}>
        <h3 style={{ marginTop: 0, color: '#333' }}>Create New Invoice</h3>
        <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '12px'}}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Invoice Title:</label>
            <input 
              type="text"  
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#555' }}>Amount ($):</label>
            <input 
              type="number" 
              step="0.01" 
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ backgroundColor:  '#0056b3', color: 'white', border: 'none', padding: '10px',
               borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}
          >
            + Add Invoice Record
          </button>
        </form>
      </div>
  
          {invoices.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No invoices found in the system.</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {invoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  style={{ 
                     backgroundColor: '#ffffff', 
                      border: '1px solid #e0e0e0',
                        padding: '15px',
                        borderRadius: '6px',
                         color: '#333',
                         borderLeft: '5px solid #007bff'}}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{invoice.title}</h3>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: invoice.status === 'approved' ? ' #0056b3' : invoice.status === 'rejected' ? '#dc3545' : '#ffc107' 
                    }}>
                      {invoice.status ? invoice.status.toUpperCase():'PENDING'}
                    </span>
                  </div>
                  
                  <p style={{ margin: '5px 0 15px 0', fontSize: '16px' }}>
                    Amount: <strong>${Number(invoice.amount).toFixed(2)}</strong>
                  </p> 

                  {invoice.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => handleStatusUpdate(invoice.id, 'approved')} 
                        style={{ backgroundColor: '#0056b3', color: 'white', border: 'none', padding: '6px 12px', 
                          cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', marginLeft:'40px',marginRight:'40px' }}
                      >
                        Approve
                      </button>
                      
                      <button 
                        onClick={() => handleStatusUpdate(invoice.id, 'rejected')} 
                        style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '6px 20px',
                           cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold',marginRight:'40px' }}
                      >
                        Reject
                      </button>

                      <button 
                        onClick={() => handleEditInvoice(invoice.id, invoice.title, invoice.amount)} 
                        style={{ backgroundColor: '#5e9fe4', color: 'white', border: 'none', padding: '6px 12px',
                           cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}
                      >
                        Edit Details      
                    </button>
                     </div>
                     )}
                   </div>
                 ))}
              </div>
            )}
         </div>
        
     </div>
  );
}

export default Dashboard;