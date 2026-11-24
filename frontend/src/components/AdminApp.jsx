import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Avatar from './Avatar';
import EditProfile from './EditProfile';

const API = 'http://localhost:5000/api';

const AdminApp = () => {
    const [activePage, setActivePage] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [shipments, setShipments] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [services, setServices] = useState([]);
    const [approvedServices, setApprovedServices] = useState([]);
    const [showProfile, setShowProfile] = useState(false);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'customer' });
    const [newUserError, setNewUserError] = useState('');
    const [newUserLoading, setNewUserLoading] = useState(false);
    
    const [showAddShipment, setShowAddShipment] = useState(false);
    const [newShipment, setNewShipment] = useState({ customerId: '', origin: '', destination: '', type: 'Air Freight', weight: '', dimensions: '', estimatedCost: 150 });
    const [newShipmentError, setNewShipmentError] = useState('');
    const [newShipmentLoading, setNewShipmentLoading] = useState(false);
    
    const [currentUser, setCurrentUser] = useState(() => {
        const s = localStorage.getItem('user');
        return s ? JSON.parse(s) : null;
    });
    const navigate = useNavigate();

    const userStr = localStorage.getItem('user');
    const user = currentUser || (userStr ? JSON.parse(userStr) : null);

    useEffect(() => {
        if (!user || user.role !== 'admin') { navigate('/'); return; }
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [usersRes, shipmentsRes, quotesRes, servicesRes, approvedSvcRes] = await Promise.all([
                axios.get(`${API}/users`),
                axios.get(`${API}/shipments`),
                axios.get(`${API}/quotes`),
                axios.get(`${API}/services`),
                axios.get(`${API}/services?status=approved`)
            ]);
            setUsers(usersRes.data);
            setShipments(shipmentsRes.data);
            setQuotes(quotesRes.data);
            setServices(servicesRes.data);
            setApprovedServices(approvedSvcRes.data);
        } catch (err) {
            console.error('Error fetching admin data', err);
        }
    };

    const handleUpdateShipmentStatus = async (id, status) => {
        try {
            await axios.put(`${API}/shipments/${id}/status`, { status });
            fetchAll();
        } catch (err) { console.error(err); }
    };

    const handleUpdateQuoteStatus = async (id, status) => {
        try {
            await axios.put(`${API}/quotes/${id}/status`, { status });
            fetchAll();
        } catch (err) { console.error(err); }
    };

    const handleUpdateServiceStatus = async (id, status) => {
        try {
            await axios.put(`${API}/services/${id}/status`, { status });
            fetchAll();
        } catch (err) { console.error(err); }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await axios.delete(`${API}/users/${id}`);
            fetchAll();
        } catch (err) { console.error(err); }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setNewUserLoading(true);
        setNewUserError('');
        try {
            await axios.post(`${API}/auth/register`, newUser);
            setShowAddUser(false);
            setNewUser({ name: '', email: '', password: '', role: 'customer' });
            fetchAll();
        } catch (err) {
            setNewUserError(err.response?.data?.message || 'Failed to add user');
        } finally {
            setNewUserLoading(false);
        }
    };

    const handleAddShipment = async (e) => {
        e.preventDefault();
        setNewShipmentLoading(true);
        setNewShipmentError('');
        try {
            await axios.post(`${API}/shipments`, { ...newShipment, estimatedDelivery: new Date(Date.now() + 5*24*60*60*1000) });
            setShowAddShipment(false);
            setNewShipment({ customerId: '', origin: '', destination: '', type: 'Air Freight', weight: '', dimensions: '', estimatedCost: 150 });
            fetchAll();
        } catch (err) {
            setNewShipmentError(err.response?.data?.message || 'Failed to add shipment');
        } finally {
            setNewShipmentLoading(false);
        }
    };

    const handleNavClick = (e, page) => {
        e.preventDefault();
        setActivePage(page);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    if (!user) return null;
    
    const staticServices = [
        { title: 'Air Freight' },
        { title: 'Sea Freight' },
        { title: 'Road Freight' },
        { title: 'Warehousing' },
        { title: 'Customs Clearance' },
        { title: 'Global Logistics' },
    ];
    
    const allServices = [
        ...staticServices.map(s => ({ ...s, name: s.title, description: 'Default System Service' })), 
        ...services
    ];

    return (
        <div id="adminApp">
            <div className="admin-container">
                {/* Sidebar */}
                <div className="sidebar">
                    <div className="sidebar-header">
                        <a href="#" className="sidebar-logo">
                            <i className="fas fa-ship"></i>
                            <span>GlobalShipp</span>
                        </a>
                    </div>
                    <div
                        className="sidebar-user"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setShowProfile(true)}
                        title="Edit Profile"
                    >
                        <Avatar user={user} size={45} fontSize="1.2rem" />
                        <div className="user-info">
                            <h4>{user.name}</h4>
                            <p>{user.email}</p>
                        </div>
                        <i className="fas fa-pencil-alt" style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.7 }}></i>
                    </div>
                    <div className="sidebar-nav">
                        <ul>
                            <li><a href="#" className={`admin-nav-link ${activePage === 'dashboard' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, 'dashboard')}><i className="fas fa-home"></i><span>Dashboard</span></a></li>
                            <li><a href="#" className={`admin-nav-link ${activePage === 'users' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, 'users')}><i className="fas fa-users"></i><span>Users</span><span className="nav-badge">245</span></a></li>
                            <li><a href="#" className={`admin-nav-link ${activePage === 'shipments' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, 'shipments')}><i className="fas fa-ship"></i><span>Shipments</span><span className="nav-badge">89</span></a></li>
                            <li><a href="#" className={`admin-nav-link ${activePage === 'quotations' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, 'quotations')}><i className="fas fa-file-invoice"></i><span>Quotations</span><span className="nav-badge">12</span></a></li>
                            <li><a href="#" className={`admin-nav-link ${activePage === 'services' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, 'services')}><i className="fas fa-box"></i><span>Services</span></a></li>
                            <li><a href="#" className={`admin-nav-link ${activePage === 'invoices' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, 'invoices')}><i className="fas fa-file-invoice-dollar"></i><span>Invoices</span></a></li>
                            <li><a href="#" className={`admin-nav-link ${activePage === 'settings' ? 'active' : ''}`} onClick={(e) => handleNavClick(e, 'settings')}><i className="fas fa-cog"></i><span>Settings</span></a></li>
                        </ul>
                    </div>
                    <div className="sidebar-footer">
                        <a href="#" className="logout-btn" onClick={handleLogout}><i className="fas fa-sign-out-alt"></i><span>Logout</span></a>
                    </div>
                </div>

                {/* Main Content */}
                <div className="main-content">
                    <div className="top-header">
                        <div className="header-search">
                            <input type="text" placeholder="Search shipments, users, invoices..." />
                            <button><i className="fas fa-search"></i></button>
                        </div>
                        <div className="header-actions">
                            <div className="notification-icon"><i className="fas fa-bell"></i><span className="notification-badge">5</span></div>
                            <div
                                className="header-profile"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setShowProfile(true)}
                                title="Edit Profile"
                            >
                                <Avatar user={user} size={38} fontSize="1rem" />
                                <span>{user.name}</span>
                            </div>
                        </div>
                    </div>

                    {/* Edit Profile Modal */}
                    {showProfile && user && (
                        <EditProfile
                            user={user}
                            onClose={() => setShowProfile(false)}
                            onUpdate={u => setCurrentUser(u)}
                        />
                    )}

                    {/* Add Shipment Modal (Global) */}
                    {showAddShipment && (
                        <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && setShowAddShipment(false)}>
                            <div style={styles.modal}>
                                <div style={styles.header}>
                                    <h2 style={{margin:0}}>New Shipment</h2>
                                    <button style={styles.closeBtn} onClick={() => setShowAddShipment(false)}><i className="fas fa-times"></i></button>
                                </div>
                                {newShipmentError && <div style={{color:'red', marginBottom:'1rem'}}>{newShipmentError}</div>}
                                <form onSubmit={handleAddShipment}>
                                    <div className="form-group">
                                        <label>Customer</label>
                                        <select className="form-control" value={newShipment.customerId} onChange={e => setNewShipment({...newShipment, customerId: e.target.value})} required>
                                            <option value="">Select a customer...</option>
                                            {users.filter(u => u.role === 'customer').map(u => (
                                                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div style={{display:'flex', gap:'1rem'}}>
                                        <div className="form-group" style={{flex:1}}>
                                            <label>Origin</label>
                                            <input type="text" className="form-control" value={newShipment.origin} onChange={e => setNewShipment({...newShipment, origin: e.target.value})} required />
                                        </div>
                                        <div className="form-group" style={{flex:1}}>
                                            <label>Destination</label>
                                            <input type="text" className="form-control" value={newShipment.destination} onChange={e => setNewShipment({...newShipment, destination: e.target.value})} required />
                                        </div>
                                    </div>
                                    <div style={{display:'flex', gap:'1rem'}}>
                                        <div className="form-group" style={{flex:1}}>
                                            <label>Type</label>
                                            <select className="form-control" value={newShipment.type} onChange={e => setNewShipment({...newShipment, type: e.target.value})}>
                                                {allServices.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group" style={{flex:1}}>
                                            <label>Weight (kg)</label>
                                            <input type="number" className="form-control" value={newShipment.weight} onChange={e => setNewShipment({...newShipment, weight: e.target.value})} required />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:'1rem'}} disabled={newShipmentLoading}>
                                        {newShipmentLoading ? 'Creating...' : 'Create Shipment'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Dashboard Page */}
                    {activePage === 'dashboard' && (
                        <div className="admin-page active">
                            <div className="page-header">
                                <h1 className="page-title">Dashboard</h1>
                                <div className="page-actions">
                                    <button className="btn btn-outline">Export Report</button>
                                    <button className="btn btn-primary" onClick={() => setShowAddShipment(true)}>New Shipment</button>
                                </div>
                            </div>
                            <div className="stats-grid">
                                <div className="stat-card"><div className="stat-icon"><i className="fas fa-users"></i></div><div className="stat-info"><h3>{users.length}</h3><p>Total Users</p></div></div>
                                <div className="stat-card"><div className="stat-icon"><i className="fas fa-ship"></i></div><div className="stat-info"><h3>{shipments.length}</h3><p>Total Shipments</p></div></div>
                                <div className="stat-card"><div className="stat-icon"><i className="fas fa-file-invoice"></i></div><div className="stat-info"><h3>{quotes.length}</h3><p>Quotes</p></div></div>
                                <div className="stat-card"><div className="stat-icon"><i className="fas fa-check-circle"></i></div><div className="stat-info"><h3>{shipments.filter(s => s.status === 'Delivered').length}</h3><p>Delivered</p></div></div>
                            </div>
                            
                            <div className="table-container">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 className="chart-title">Recent Shipments</h3>
                                    <a href="#" onClick={(e) => handleNavClick(e, 'shipments')} style={{ color: 'var(--secondary)' }}>View All</a>
                                </div>
                                <table>
                                    <thead><tr><th>Shipment ID</th><th>Customer</th><th>Origin</th><th>Destination</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {shipments.slice(0, 5).map(s => (
                                            <tr key={s._id}>
                                                <td>{s.trackingId}</td>
                                                <td>{s.customer?.name || 'N/A'}</td>
                                                <td>{s.origin}</td>
                                                <td>{s.destination}</td>
                                                <td><span className="status status-active">{s.status}</span></td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <select style={{fontSize:'0.8rem', padding:'0.2rem'}} defaultValue={s.status} onChange={e => handleUpdateShipmentStatus(s._id, e.target.value)}>
                                                            {['Booked','Packed','In Transit','Out for Delivery','Delivered','Pending'].map(st => <option key={st}>{st}</option>)}
                                                        </select>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {shipments.length === 0 && <tr><td colSpan="6" style={{textAlign:'center'}}>No shipments yet.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Users Page */}
                    {activePage === 'users' && (
                        <div className="admin-page active">
                            <div className="page-header">
                                <h1 className="page-title">User Management</h1>
                                <div className="page-actions">
                                    <button className="btn btn-outline">Export</button>
                                    <button className="btn btn-primary" onClick={() => setShowAddUser(true)}>Add User</button>
                                </div>
                            </div>
                            
                            {/* Add User Modal */}
                            {showAddUser && (
                                <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && setShowAddUser(false)}>
                                    <div style={styles.modal}>
                                        <div style={styles.header}>
                                            <h2 style={{margin:0}}>Add New User</h2>
                                            <button style={styles.closeBtn} onClick={() => setShowAddUser(false)}><i className="fas fa-times"></i></button>
                                        </div>
                                        {newUserError && <div style={{color:'red', marginBottom:'1rem'}}>{newUserError}</div>}
                                        <form onSubmit={handleAddUser}>
                                            <div className="form-group">
                                                <label>Name</label>
                                                <input type="text" className="form-control" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Email</label>
                                                <input type="email" className="form-control" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Password</label>
                                                <input type="password" className="form-control" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Role</label>
                                                <select className="form-control" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                                                    <option value="customer">Customer</option>
                                                    <option value="business">Business</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                            <button type="submit" className="btn btn-primary" style={{width:'100%', marginTop:'1rem'}} disabled={newUserLoading}>
                                                {newUserLoading ? 'Adding...' : 'Add User'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <div className="table-container">
                                <table>
                                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u._id}>
                                                <td>{u.name}</td>
                                                <td>{u.email}</td>
                                                <td><span className="status status-active">{u.role}</span></td>
                                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="action-btn delete" onClick={() => handleDeleteUser(u._id)}><i className="fas fa-trash"></i></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {users.length === 0 && <tr><td colSpan="5" style={{textAlign:'center'}}>No users yet.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Shipments Page */}
                    {activePage === 'shipments' && (
                        <div className="admin-page active">
                            <div className="page-header">
                                <h1 className="page-title">Shipment Management</h1>
                                <div className="page-actions">
                                    <button className="btn btn-outline">Export</button>
                                    <button className="btn btn-primary" onClick={() => setShowAddShipment(true)}>Create Shipment</button>
                                </div>
                            </div>

                            <div className="table-container">
                                <table>
                                    <thead><tr><th>Tracking ID</th><th>Customer</th><th>Type</th><th>Origin</th><th>Destination</th><th>Status</th><th>Update Status</th></tr></thead>
                                    <tbody>
                                        {shipments.map(s => (
                                            <tr key={s._id}>
                                                <td>{s.trackingId}</td>
                                                <td>{s.customer?.name || 'N/A'}</td>
                                                <td>{s.type}</td>
                                                <td>{s.origin}</td>
                                                <td>{s.destination}</td>
                                                <td><span className="status status-active">{s.status}</span></td>
                                                <td>
                                                    <select style={{fontSize:'0.8rem', padding:'0.2rem'}} defaultValue={s.status} onChange={e => handleUpdateShipmentStatus(s._id, e.target.value)}>
                                                        {['Booked','Packed','In Transit','Out for Delivery','Delivered','Pending'].map(st => <option key={st}>{st}</option>)}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                        {shipments.length === 0 && <tr><td colSpan="7" style={{textAlign:'center'}}>No shipments yet.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Quotations Page */}
                    {activePage === 'quotations' && (
                        <div className="admin-page active">
                            <div className="page-header">
                                <h1 className="page-title">Quotations</h1>
                                <div className="page-actions"><button className="btn btn-outline">Export</button></div>
                            </div>
                            <div className="table-container">
                                <table>
                                    <thead><tr><th>Customer</th><th>Type</th><th>Origin</th><th>Destination</th><th>Est. Cost</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {quotes.map(q => (
                                            <tr key={q._id}>
                                                <td>{q.customer?.name || 'N/A'}</td>
                                                <td>{q.type}</td>
                                                <td>{q.origin}</td>
                                                <td>{q.destination}</td>
                                                <td>${q.estimatedCost?.toFixed(2)}</td>
                                                <td><span className="status status-pending">{q.status}</span></td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button className="action-btn edit" onClick={() => handleUpdateQuoteStatus(q._id, 'Approved')} title="Approve"><i className="fas fa-check"></i></button>
                                                        <button className="action-btn delete" onClick={() => handleUpdateQuoteStatus(q._id, 'Rejected')} title="Reject"><i className="fas fa-times"></i></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {quotes.length === 0 && <tr><td colSpan="7" style={{textAlign:'center'}}>No quotes yet.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Services Page */}
                    {activePage === 'services' && (
                        <div className="admin-page active">
                            <div className="page-header">
                                <h1 className="page-title">Service Approval</h1>
                            </div>
                            <div className="table-container">
                                {services.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>No services available.</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Business</th>
                                                <th>Service Name</th>
                                                <th>Price</th>
                                                <th>Status</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allServices.map((s, i) => (
                                                <tr key={s._id || i}>
                                                    <td>{s.businessId?.name || 'GlobalShipp (System)'}</td>
                                                    <td><strong>{s.name || s.title}</strong><br /><small style={{ color: 'var(--gray)' }}>{s.description?.substring(0, 30) || ''}...</small></td>
                                                    <td>${s.price?.toFixed(2) || 'N/A'}</td>
                                                    <td>
                                                        <span className={`status ${s.status === 'approved' || !s.status ? 'status-delivered' : s.status === 'rejected' ? 'status-danger' : 'status-pending'}`}>
                                                            {s.status || 'approved'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {s.status === 'pending' && (
                                                            <div className="action-buttons">
                                                                <button className="action-btn edit" onClick={() => handleUpdateServiceStatus(s._id, 'approved')} title="Approve"><i className="fas fa-check"></i></button>
                                                                <button className="action-btn delete" onClick={() => handleUpdateServiceStatus(s._id, 'rejected')} title="Reject"><i className="fas fa-times"></i></button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Pricing Page */}
                    {activePage === 'pricing' && (
                        <div className="admin-page active">
                            <div className="page-header">
                                <h1 className="page-title">Pricing Management</h1>
                                <div className="page-actions"><button className="btn btn-primary">Update All Prices</button></div>
                            </div>
                            <div className="pricing-grid">
                                <div className="pricing-card">
                                    <div className="pricing-icon"><i className="fas fa-plane"></i></div>
                                    <h3 className="pricing-title">Air Freight</h3>
                                    <div className="pricing-price">$2.50 <small>/kg</small></div>
                                    <ul className="pricing-features"><li><i className="fas fa-check"></i> Fast Delivery</li><li><i className="fas fa-check"></i> Insurance Included</li><li><i className="fas fa-check"></i> Real-time Tracking</li></ul>
                                    <button className="btn btn-outline">Edit Pricing</button>
                                </div>
                                <div className="pricing-card">
                                    <div className="pricing-icon"><i className="fas fa-ship"></i></div>
                                    <h3 className="pricing-title">Sea Freight</h3>
                                    <div className="pricing-price">$0.80 <small>/kg</small></div>
                                    <ul className="pricing-features"><li><i className="fas fa-check"></i> Container Options</li><li><i className="fas fa-check"></i> Bulk Discounts</li><li><i className="fas fa-check"></i> Port-to-Port</li></ul>
                                    <button className="btn btn-outline">Edit Pricing</button>
                                </div>
                                <div className="pricing-card">
                                    <div className="pricing-icon"><i className="fas fa-truck"></i></div>
                                    <h3 className="pricing-title">Road Freight</h3>
                                    <div className="pricing-price">$1.20 <small>/km</small></div>
                                    <ul className="pricing-features"><li><i className="fas fa-check"></i> Door-to-Door</li><li><i className="fas fa-check"></i> GPS Tracking</li><li><i className="fas fa-check"></i> Flexible Routes</li></ul>
                                    <button className="btn btn-outline">Edit Pricing</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Invoices Page */}
                    {activePage === 'invoices' && (
                        <div className="admin-page active">
                            <div className="page-header">
                                <h1 className="page-title">Invoices</h1>
                                <div className="page-actions"><button className="btn btn-outline">Export</button></div>
                            </div>
                            <div className="table-container">
                                <table>
                                    <thead><tr><th>Invoice #</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        <tr>
                                            <td>INV-2023-0876</td><td>John Smith</td><td>Oct 15, 2023</td><td>$245.50</td>
                                            <td><span className="status status-active">Paid</span></td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="action-btn view"><i className="fas fa-eye"></i></button>
                                                    <button className="action-btn edit"><i className="fas fa-download"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Settings Page */}
                    {activePage === 'settings' && (
                        <div className="admin-page active">
                            <div className="page-header"><h1 className="page-title">Settings</h1></div>
                            <div className="form-container">
                                <h3 className="chart-title" style={{ marginBottom: '1.5rem' }}>General Settings</h3>
                                <div className="form-row">
                                    <div className="form-group"><label className="form-label">Company Name</label><input type="text" className="form-control" defaultValue="GlobalShipp" /></div>
                                    <div className="form-group"><label className="form-label">Contact Email</label><input type="email" className="form-control" defaultValue="admin@globalshipp.com" /></div>
                                </div>
                                <button className="btn btn-primary">Save Settings</button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminApp;

const styles = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, backdropFilter: 'blur(3px)',
    },
    modal: {
        background: 'white', borderRadius: 16, padding: '2rem',
        width: '100%', maxWidth: 400,
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        animation: 'fadeIn 0.25s ease',
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    closeBtn: {
        background: '#f0f4f8', border: 'none', borderRadius: '50%',
        width: 36, height: 36, cursor: 'pointer', fontSize: '1rem', color: 'var(--gray)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
};
