import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Avatar from './Avatar';
import EditProfile from './EditProfile';

const API = 'http://localhost:5000/api';

const BusinessApp = () => {
    const [activePage, setActivePage] = useState('dashboard');
    const [shipments, setShipments] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [services, setServices] = useState([]);
    const [showAddService, setShowAddService] = useState(false);
    const [newService, setNewService] = useState({ name: '', description: '', price: '' });
    const [newServiceLoading, setNewServiceLoading] = useState(false);
    const [trackingInput, setTrackingInput] = useState('');
    const [trackingResult, setTrackingResult] = useState(null);
    const [trackingError, setTrackingError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showProfile, setShowProfile] = useState(false);
    const [currentUser, setCurrentUser] = useState(() => {
        const s = localStorage.getItem('user');
        return s ? JSON.parse(s) : null;
    });

    const navigate = useNavigate();
    const user = currentUser;

    useEffect(() => {
        if (!user || user.role !== 'business') { navigate('/'); return; }
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [sRes, qRes, svcRes] = await Promise.all([
                axios.get(`${API}/shipments`),
                axios.get(`${API}/quotes`),
                axios.get(`${API}/services?businessId=${user.id || user._id}`)
            ]);
            setShipments(sRes.data);
            setQuotes(qRes.data);
            setServices(svcRes.data);
        } catch (err) {
            console.error('Error fetching business data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await axios.put(`${API}/shipments/${id}/status`, { status });
            fetchAll();
        } catch (err) { console.error(err); }
    };

    const handleAddService = async (e) => {
        e.preventDefault();
        setNewServiceLoading(true);
        try {
            await axios.post(`${API}/services`, { ...newService, businessId: user.id || user._id, price: Number(newService.price) });
            setShowAddService(false);
            setNewService({ name: '', description: '', price: '' });
            fetchAll();
        } catch (err) {
            console.error('Failed to add service', err);
        } finally {
            setNewServiceLoading(false);
        }
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        setTrackingError('');
        setTrackingResult(null);
        const found = shipments.find(s => s.trackingId === trackingInput.trim());
        if (found) setTrackingResult(found);
        else setTrackingError('No shipment found with that tracking ID.');
    };

    const nav = (e, page) => {
        e && e.preventDefault();
        setActivePage(page);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const totalRevenue = shipments.reduce((sum, s) => sum + (s.estimatedCost || 0), 0);

    const statusClass = (s) => {
        if (s === 'Delivered') return 'status-delivered';
        if (s === 'In Transit') return 'status-transit';
        if (s === 'Pending' || s === 'Booked') return 'status-pending';
        return 'status-transit';
    };

    if (!user) return null;

    const staticServices = [
        { name: 'Air Freight', description: 'Default System Service', price: 2.50, status: 'approved' },
        { name: 'Sea Freight', description: 'Default System Service', price: 0.80, status: 'approved' },
        { name: 'Road Freight', description: 'Default System Service', price: 1.20, status: 'approved' },
        { name: 'Warehousing', description: 'Default System Service', price: 50.00, status: 'approved' },
        { name: 'Customs Clearance', description: 'Default System Service', price: 150.00, status: 'approved' },
        { name: 'Global Logistics', description: 'Default System Service', price: 0, status: 'approved' },
    ];
    
    const allServices = [
        ...staticServices, 
        ...services
    ];

    const initial = user.name?.charAt(0).toUpperCase() || 'B';

    return (
        <div id="businessApp">
            <div className="business-container">
                {/* ── Sidebar ── */}
                <div className="sidebar">
                    <div className="sidebar-header">
                        <a href="#" className="sidebar-logo">
                            <i className="fas fa-ship"></i><span>GlobalShipp</span>
                        </a>
                    </div>
                    <div className="sidebar-user" style={{ cursor: 'pointer' }} onClick={() => setShowProfile(true)} title="Edit Profile">
                        <Avatar user={user} size={45} fontSize="1.2rem" />
                        <div className="user-info">
                            <h4>{user.name}</h4>
                            <p>{user.email}</p>
                        </div>
                        <i className="fas fa-pencil-alt" style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.7 }}></i>
                    </div>
                    <div className="sidebar-nav">
                        <ul>
                            {[
                                { page: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
                                { page: 'shipments',  icon: 'fa-ship',           label: 'All Shipments', badge: shipments.length },
                                { page: 'tracking',   icon: 'fa-map-marker-alt', label: 'Live Tracking' },
                                { page: 'quotes',     icon: 'fa-file-invoice',   label: 'Quotations',    badge: quotes.length },
                                { page: 'services',   icon: 'fa-box',            label: 'Services' },
                                { page: 'invoices',   icon: 'fa-file-invoice-dollar', label: 'Invoices' },
                                { page: 'settings',   icon: 'fa-cog',            label: 'Settings' },
                            ].map(({ page, icon, label, badge }) => (
                                <li key={page}>
                                    <a
                                        href="#"
                                        className={activePage === page ? 'active' : ''}
                                        onClick={e => nav(e, page)}
                                    >
                                        <i className={`fas ${icon}`}></i>
                                        <span>{label}</span>
                                        {badge > 0 && <span className="nav-badge">{badge}</span>}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="sidebar-footer">
                        <a href="#" className="logout-btn" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt"></i><span>Logout</span>
                        </a>
                    </div>
                </div>

                {/* ── Main Content ── */}
                <div className="main-content">
                    {/* Top Header */}
                    <div className="top-header">
                        <div className="header-search">
                            <input
                                type="text"
                                placeholder="Search by tracking ID…"
                                value={trackingInput}
                                onChange={e => setTrackingInput(e.target.value)}
                            />
                            <button onClick={e => { nav(e, 'tracking'); }}>
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                        <div className="header-actions">
                            <div className="company-badge">
                                <i className="fas fa-building"></i> Business Account
                            </div>
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

                    {/* ── DASHBOARD ── */}
                    {activePage === 'dashboard' && (
                        <div className="business-page">
                            <div className="page-header">
                                <div>
                                    <h1 className="page-title">Business Dashboard</h1>
                                    <p style={{ color: 'var(--gray)', marginTop: '0.3rem' }}>
                                        Overview of all customer shipments and quotations.
                                    </p>
                                </div>
                                <div className="page-actions">
                                    <button className="btn btn-outline" onClick={() => fetchAll()}>
                                        <i className="fas fa-sync-alt"></i> Refresh
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon primary"><i className="fas fa-ship"></i></div>
                                    <div className="stat-info"><h3>{shipments.length}</h3><p>Total Shipments</p></div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon success"><i className="fas fa-check-circle"></i></div>
                                    <div className="stat-info"><h3>{shipments.filter(s => s.status === 'Delivered').length}</h3><p>Delivered</p></div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon info"><i className="fas fa-shipping-fast"></i></div>
                                    <div className="stat-info"><h3>{shipments.filter(s => s.status === 'In Transit').length}</h3><p>In Transit</p></div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon warning"><i className="fas fa-dollar-sign"></i></div>
                                    <div className="stat-info"><h3>${totalRevenue.toFixed(0)}</h3><p>Est. Revenue</p></div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="quick-actions">
                                <div className="quick-action-card" onClick={() => setActivePage('shipments')}>
                                    <i className="fas fa-ship"></i><h4>All Shipments</h4>
                                </div>
                                <div className="quick-action-card" onClick={() => setActivePage('tracking')}>
                                    <i className="fas fa-map-marker-alt"></i><h4>Track Shipment</h4>
                                </div>
                                <div className="quick-action-card" onClick={() => setActivePage('quotes')}>
                                    <i className="fas fa-file-invoice"></i><h4>Quotations</h4>
                                </div>
                                <div className="quick-action-card" onClick={() => setActivePage('invoices')}>
                                    <i className="fas fa-file-invoice-dollar"></i><h4>Invoices</h4>
                                </div>
                            </div>

                            {/* Recent Shipments */}
                            <div className="table-container">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 className="chart-title">Recent Customer Bookings</h3>
                                    <a href="#" style={{ color: 'var(--secondary)', fontWeight: 600, fontSize: '0.9rem' }} onClick={e => nav(e, 'shipments')}>View All →</a>
                                </div>
                                {loading ? (
                                    <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>
                                        <i className="fas fa-spinner fa-spin"></i> Loading…
                                    </p>
                                ) : shipments.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                                        <i className="fas fa-inbox" style={{ fontSize: '3rem', color: 'var(--secondary)', opacity: 0.3, display: 'block', marginBottom: '0.8rem' }}></i>
                                        <p style={{ color: 'var(--gray)' }}>No customer bookings yet.</p>
                                    </div>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Tracking ID</th>
                                                <th>Customer</th>
                                                <th>Origin</th>
                                                <th>Destination</th>
                                                <th>Type</th>
                                                <th>Weight</th>
                                                <th>Status</th>
                                                <th>Est. Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {shipments.slice(0, 8).map(s => (
                                                <tr key={s._id}>
                                                    <td><strong>{s.trackingId}</strong></td>
                                                    <td>{s.customer?.name || '—'}</td>
                                                    <td>{s.origin}</td>
                                                    <td>{s.destination}</td>
                                                    <td>{s.type}</td>
                                                    <td>{s.weight} kg</td>
                                                    <td><span className={`status ${statusClass(s.status)}`}>{s.status}</span></td>
                                                    <td>${s.estimatedCost?.toFixed(2) || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── ALL SHIPMENTS ── */}
                    {activePage === 'shipments' && (
                        <div className="business-page">
                            <div className="page-header">
                                <h1 className="page-title">All Customer Shipments</h1>
                                <div className="page-actions">
                                    <button className="btn btn-outline" onClick={() => fetchAll()}>
                                        <i className="fas fa-sync-alt"></i> Refresh
                                    </button>
                                </div>
                            </div>
                            <div className="table-container">
                                {shipments.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>No shipments found.</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Tracking ID</th>
                                                <th>Customer</th>
                                                <th>Email</th>
                                                <th>Type</th>
                                                <th>Origin</th>
                                                <th>Destination</th>
                                                <th>Weight</th>
                                                <th>Est. Cost</th>
                                                <th>Status</th>
                                                <th>Est. Delivery</th>
                                                <th>Update Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {shipments.map(s => (
                                                <tr key={s._id}>
                                                    <td><strong>{s.trackingId}</strong></td>
                                                    <td>{s.customer?.name || '—'}</td>
                                                    <td style={{ fontSize: '0.8rem' }}>{s.customer?.email || '—'}</td>
                                                    <td>{s.type}</td>
                                                    <td>{s.origin}</td>
                                                    <td>{s.destination}</td>
                                                    <td>{s.weight} kg</td>
                                                    <td>${s.estimatedCost?.toFixed(2) || '—'}</td>
                                                    <td><span className={`status ${statusClass(s.status)}`}>{s.status}</span></td>
                                                    <td>{s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleDateString() : '—'}</td>
                                                    <td>
                                                        <select
                                                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                                                            defaultValue={s.status}
                                                            onChange={e => handleUpdateStatus(s._id, e.target.value)}
                                                        >
                                                            {['Booked', 'Packed', 'In Transit', 'Out for Delivery', 'Delivered', 'Pending'].map(st => (
                                                                <option key={st}>{st}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── LIVE TRACKING ── */}
                    {activePage === 'tracking' && (
                        <div className="business-page">
                            <div className="page-header">
                                <h1 className="page-title">Live Tracking</h1>
                            </div>
                            <div className="card" style={{ marginBottom: '1.5rem' }}>
                                <form onSubmit={handleTrack} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                        <label>Enter Tracking ID</label>
                                        <input
                                            type="text"
                                            value={trackingInput}
                                            onChange={e => setTrackingInput(e.target.value)}
                                            placeholder="e.g., GS123456789"
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary">
                                        <i className="fas fa-search"></i> Track
                                    </button>
                                </form>
                            </div>

                            {trackingError && (
                                <div style={{ background: '#fee9e7', color: 'var(--danger)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <i className="fas fa-exclamation-circle"></i> {trackingError}
                                </div>
                            )}

                            {trackingResult && (() => {
                                const steps = ['Booked', 'Packed', 'In Transit', 'Out for Delivery', 'Delivered'];
                                const idx = steps.indexOf(trackingResult.status);
                                const pct = idx === -1 ? 0 : (idx / (steps.length - 1)) * 80;
                                return (
                                    <div className="card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                            <div>
                                                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)' }}>{trackingResult.trackingId}</div>
                                                <p style={{ color: 'var(--gray)', marginTop: '0.2rem' }}>{trackingResult.origin} → {trackingResult.destination}</p>
                                                <p style={{ color: 'var(--gray)', fontSize: '0.88rem' }}>Customer: <strong>{trackingResult.customer?.name}</strong> ({trackingResult.customer?.email})</p>
                                            </div>
                                            <span className={`status ${statusClass(trackingResult.status)}`}>{trackingResult.status}</span>
                                        </div>
                                        <div className="progress-tracker">
                                            <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                                            {steps.map((step, i) => (
                                                <div className="progress-step" key={step}>
                                                    <div className={`step-icon ${i < idx ? 'completed' : i === idx ? 'current' : ''}`}>
                                                        <i className={`fas ${i === 0 ? 'fa-clipboard' : i === 1 ? 'fa-box' : i === 2 ? 'fa-ship' : i === 3 ? 'fa-truck' : 'fa-home'}`}></i>
                                                    </div>
                                                    <div className={`step-label ${i <= idx ? 'active' : ''}`}>{step}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="tracking-details">
                                            <div className="tracking-detail-item"><label>Type</label><p>{trackingResult.type}</p></div>
                                            <div className="tracking-detail-item"><label>Weight</label><p>{trackingResult.weight} kg</p></div>
                                            <div className="tracking-detail-item"><label>Est. Delivery</label><p>{trackingResult.estimatedDelivery ? new Date(trackingResult.estimatedDelivery).toLocaleDateString() : 'N/A'}</p></div>
                                            <div className="tracking-detail-item"><label>Est. Cost</label><p>${trackingResult.estimatedCost?.toFixed(2)}</p></div>
                                        </div>
                                        <div style={{ marginTop: '1.2rem' }}>
                                            <label style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: '0.5rem', display: 'block' }}>Update Status:</label>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {['Booked', 'Packed', 'In Transit', 'Out for Delivery', 'Delivered'].map(st => (
                                                    <button
                                                        key={st}
                                                        className={`btn ${trackingResult.status === st ? 'btn-primary' : 'btn-outline'}`}
                                                        style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}
                                                        onClick={() => { handleUpdateStatus(trackingResult._id, st); setTrackingResult({ ...trackingResult, status: st }); }}
                                                    >{st}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Active Shipments Cards */}
                            {!trackingResult && (
                                <>
                                    <h3 className="chart-title" style={{ margin: '1.5rem 0 1rem' }}>Active Shipments</h3>
                                    <div className="shipment-grid">
                                        {shipments.filter(s => s.status !== 'Delivered').map(s => (
                                            <div className="shipment-card" key={s._id}>
                                                <div className="shipment-header">
                                                    <span className="shipment-id">{s.trackingId}</span>
                                                    <span className={`status ${statusClass(s.status)}`}>{s.status}</span>
                                                </div>
                                                <div className="shipment-details" style={{ gridTemplateColumns: '1fr' }}>
                                                    <div className="shipment-detail"><i className="fas fa-user"></i> {s.customer?.name || '—'}</div>
                                                    <div className="shipment-detail"><i className="fas fa-map-marker-alt"></i> {s.origin} → {s.destination}</div>
                                                    <div className="shipment-detail"><i className="fas fa-box"></i> {s.type} | {s.weight} kg</div>
                                                    <div className="shipment-detail"><i className="fas fa-calendar"></i> ETA: {s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleDateString() : 'N/A'}</div>
                                                </div>
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ width: '100%', marginTop: '0.8rem', padding: '0.4rem', fontSize: '0.85rem' }}
                                                    onClick={() => { setTrackingInput(s.trackingId); setTrackingResult(s); setTrackingError(''); }}
                                                >
                                                    <i className="fas fa-search-location"></i> Track Details
                                                </button>
                                            </div>
                                        ))}
                                        {shipments.filter(s => s.status !== 'Delivered').length === 0 && (
                                            <p style={{ color: 'var(--gray)', gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>No active shipments.</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ── QUOTES ── */}
                    {activePage === 'quotes' && (
                        <div className="business-page">
                            <div className="page-header">
                                <h1 className="page-title">Customer Quotations</h1>
                                <div className="page-actions">
                                    <button className="btn btn-outline" onClick={() => fetchAll()}>
                                        <i className="fas fa-sync-alt"></i> Refresh
                                    </button>
                                </div>
                            </div>
                            <div className="table-container">
                                {quotes.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>No quotations yet.</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Customer</th>
                                                <th>Email</th>
                                                <th>Service Type</th>
                                                <th>Origin</th>
                                                <th>Destination</th>
                                                <th>Weight</th>
                                                <th>Est. Cost</th>
                                                <th>Status</th>
                                                <th>Requested On</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {quotes.map(q => (
                                                <tr key={q._id}>
                                                    <td>{q.customer?.name || '—'}</td>
                                                    <td style={{ fontSize: '0.82rem' }}>{q.customer?.email || '—'}</td>
                                                    <td>{q.type}</td>
                                                    <td>{q.origin}</td>
                                                    <td>{q.destination}</td>
                                                    <td>{q.weight} kg</td>
                                                    <td><strong>${q.estimatedCost?.toFixed(2)}</strong></td>
                                                    <td>
                                                        <span className={`status ${q.status === 'Approved' ? 'status-delivered' : q.status === 'Rejected' ? 'status-danger' : 'status-pending'}`}>
                                                            {q.status}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── SERVICES (My Services) ── */}
                    {activePage === 'services' && (
                        <div className="business-page">
                            <div className="page-header">
                                <h1 className="page-title">My Services</h1>
                                <div className="page-actions">
                                    <button className="btn btn-primary" onClick={() => setShowAddService(true)}>Add Service</button>
                                </div>
                            </div>
                            
                            {/* Add Service Modal */}
                            {showAddService && (
                                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                            <h2>Add New Service</h2>
                                            <button onClick={() => setShowAddService(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}><i className="fas fa-times"></i></button>
                                        </div>
                                        <form onSubmit={handleAddService}>
                                            <div className="form-group">
                                                <label>Service Name</label>
                                                <input type="text" className="form-control" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} required />
                                            </div>
                                            <div className="form-group">
                                                <label>Description</label>
                                                <textarea className="form-control" rows={3} value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} required></textarea>
                                            </div>
                                            <div className="form-group">
                                                <label>Price ($)</label>
                                                <input type="number" step="0.01" className="form-control" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} required />
                                            </div>
                                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={newServiceLoading}>
                                                {newServiceLoading ? 'Adding...' : 'Save Service'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <div className="table-container">
                                {services.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>No services yet. Click Add Service to create one.</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Service Name</th>
                                                <th>Description</th>
                                                <th>Price</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allServices.map((s, i) => (
                                                <tr key={s._id || i}>
                                                    <td><strong>{s.name}</strong>{(!s._id) && <span style={{fontSize:'0.7rem', background:'#eee', padding:'2px 5px', borderRadius:'4px', marginLeft:'8px'}}>System</span>}</td>
                                                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.description}>{s.description}</td>
                                                    <td>${s.price?.toFixed(2)}</td>
                                                    <td>
                                                        <span className={`status ${s.status === 'approved' ? 'status-delivered' : s.status === 'rejected' ? 'status-danger' : 'status-pending'}`}>
                                                            {s.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── INVOICES (Generated from Shipments) ── */}
                    {activePage === 'invoices' && (
                        <div className="business-page">
                            <div className="page-header">
                                <h1 className="page-title">Invoices</h1>
                            </div>
                            <div className="table-container">
                                {shipments.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--gray)', padding: '2rem' }}>No invoices yet.</p>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Invoice #</th>
                                                <th>Tracking ID</th>
                                                <th>Customer</th>
                                                <th>Service</th>
                                                <th>Amount</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {shipments.map((s, i) => (
                                                <tr key={s._id}>
                                                    <td>INV-{String(i + 1).padStart(4, '0')}</td>
                                                    <td><strong>{s.trackingId}</strong></td>
                                                    <td>{s.customer?.name || '—'}</td>
                                                    <td>{s.type}</td>
                                                    <td><strong>${s.estimatedCost?.toFixed(2) || '—'}</strong></td>
                                                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`status ${s.status === 'Delivered' ? 'status-delivered' : 'status-pending'}`}>
                                                            {s.status === 'Delivered' ? 'Paid' : 'Pending'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── SETTINGS ── */}
                    {activePage === 'settings' && (
                        <div className="business-page">
                            <div className="page-header"><h1 className="page-title">Account Settings</h1></div>
                            <div className="form-container">
                                <h3 className="chart-title" style={{ marginBottom: '1.5rem' }}>Profile Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input type="text" className="form-control" defaultValue={user.name} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input type="email" className="form-control" defaultValue={user.email} />
                                    </div>
                                </div>
                                <button className="btn btn-primary">Save Changes</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusinessApp;
