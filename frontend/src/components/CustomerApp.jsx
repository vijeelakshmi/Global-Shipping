import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Avatar from './Avatar';
import EditProfile from './EditProfile';

const API = 'http://localhost:5000/api';

const CustomerApp = () => {
    const [activePage, setActivePage] = useState('home');
    const [shipments, setShipments] = useState([]);
    const [quotes, setQuotes] = useState([]);
    const [dynamicServices, setDynamicServices] = useState([]);
    const [trackingInput, setTrackingInput] = useState('');
    const [trackingResult, setTrackingResult] = useState(null);
    const [trackingError, setTrackingError] = useState('');
    const [showProfile, setShowProfile] = useState(false);
    const [currentUser, setCurrentUser] = useState(() => {
        const s = localStorage.getItem('user');
        return s ? JSON.parse(s) : null;
    });

    // Booking form
    const [booking, setBooking] = useState({ origin: '', destination: '', type: 'Air Freight', weight: '', dimensions: '', pickupDate: '', notes: '' });
    // Quote form
    const [quote, setQuote] = useState({ origin: '', destination: '', type: 'Air Freight', weight: '', notes: '' });
    const [quoteResult, setQuoteResult] = useState(null);

    const navigate = useNavigate();
    const userStr = localStorage.getItem('user');
    const user = currentUser || (userStr ? JSON.parse(userStr) : null);

    useEffect(() => {
        if (!user) { navigate('/'); return; }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [sRes, qRes, svcRes] = await Promise.all([
                axios.get(`${API}/shipments/user/${user.id}`),
                axios.get(`${API}/quotes/user/${user.id}`),
                axios.get(`${API}/services?status=approved`),
            ]);
            setShipments(sRes.data);
            setQuotes(qRes.data);
            setDynamicServices(svcRes.data);
        } catch (err) { console.error(err); }
    };

    const nav = (e, page) => {
        e && e.preventDefault();
        setActivePage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        setTrackingError('');
        setTrackingResult(null);
        if (!trackingInput.trim()) return;
        try {
            const res = await axios.get(`${API}/shipments`);
            const found = res.data.find(s => s.trackingId === trackingInput.trim());
            if (found) {
                setTrackingResult(found);
            } else {
                setTrackingError('No shipment found with that tracking ID.');
            }
        } catch (err) { setTrackingError('Error fetching tracking info.'); }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API}/shipments`, {
                customerId: user.id,
                origin: booking.origin,
                destination: booking.destination,
                type: booking.type,
                weight: Number(booking.weight),
                dimensions: booking.dimensions,
                estimatedCost: Number(booking.weight) * (booking.type === 'Air Freight' ? 2.5 : booking.type === 'Sea Freight' ? 0.8 : 1.2),
                estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });
            alert('Booking submitted successfully! Your tracking ID will be emailed to you.');
            setBooking({ origin: '', destination: '', type: 'Air Freight', weight: '', dimensions: '', pickupDate: '', notes: '' });
            fetchData();
            nav(null, 'dashboard');
        } catch (err) { alert('Error submitting booking. Please try again.'); }
    };

    const handleQuoteSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API}/quotes`, {
                customerId: user.id,
                origin: quote.origin,
                destination: quote.destination,
                type: quote.type,
                weight: Number(quote.weight),
                notes: quote.notes,
            });
            setQuoteResult(res.data);
            fetchData();
        } catch (err) { alert('Error submitting quote request.'); }
    };

    const getStatusStep = (status) => {
        const steps = ['Booked', 'Packed', 'In Transit', 'Out for Delivery', 'Delivered'];
        return steps.indexOf(status);
    };

    if (!user) return null;

    const navLinks = [
        { page: 'home', label: 'Home' },
        { page: 'services', label: 'Services' },
        { page: 'tracking', label: 'Tracking' },
        { page: 'booking', label: 'Book Shipment' },
        { page: 'quotation', label: 'Get Quote' },
        { page: 'dashboard', label: 'Dashboard' },
    ];

    const staticServices = [
        { icon: 'fa-plane', title: 'Air Freight', desc: 'Fast international shipping with guaranteed delivery times for time-sensitive cargo.', price: '$2.50/kg', features: ['Express delivery options', 'Door-to-door service', 'Real-time tracking', 'Insurance included', 'Customs clearance'] },
        { icon: 'fa-ship', title: 'Sea Freight', desc: 'Cost-effective ocean freight solutions for large volume shipments worldwide.', price: '$0.80/kg', features: ['FCL & LCL options', 'Port-to-port or door-to-door', 'Container tracking', 'Bulk discounts', 'Hazmat certified'] },
        { icon: 'fa-truck', title: 'Road Freight', desc: 'Reliable and flexible land transportation across the continent.', price: '$1.20/km', features: ['GPS tracked vehicles', 'Temperature controlled', 'Overnight options', 'Flexible pickup', 'Multi-stop routes'] },
        { icon: 'fa-warehouse', title: 'Warehousing', desc: 'Secure storage solutions with inventory management and fulfilment.', price: 'From $50/month', features: ['24/7 security', 'Climate controlled', 'Inventory management', 'Pick & pack services', 'Flexible leasing'] },
        { icon: 'fa-box-open', title: 'Customs Clearance', desc: 'Expert customs brokerage and documentation for hassle-free border crossings.', price: 'From $150', features: ['All countries supported', 'HS code classification', 'Duty calculation', 'Document prep', 'Compliance consulting'] },
        { icon: 'fa-globe', title: 'Global Logistics', desc: 'End-to-end supply chain solutions including planning, sourcing, and delivery.', price: 'Custom Pricing', features: ['Supply chain consulting', 'Vendor management', 'Demand forecasting', 'Cost optimisation', 'Dedicated account manager'] },
    ];
    
    const allServices = [
        ...staticServices, 
        ...dynamicServices.map(s => ({
            icon: 'fa-box',
            title: s.name,
            desc: s.description,
            price: `$${s.price?.toFixed(2)}`,
            features: ['Business Provided Service']
        }))
    ];

    return (
        <div id="customerApp">
            {/* HEADER */}
            <header>
                <div className="container">
                    <div className="header-content">
                        <a href="#" className="logo" onClick={e => nav(e, 'home')}>
                            <i className="fas fa-ship"></i>
                            <span>GlobalShipp</span>
                        </a>
                        <nav>
                            <ul>
                                {navLinks.map(l => (
                                    <li key={l.page}>
                                        <a href="#" className={`nav-link ${activePage === l.page ? 'active' : ''}`} onClick={e => nav(e, l.page)}>{l.label}</a>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <div className="auth-buttons">
                            <span
                                className="user-chip"
                                style={{ cursor: 'pointer' }}
                                onClick={() => setShowProfile(true)}
                                title="Edit Profile"
                            >
                                <Avatar user={user} size={30} fontSize="0.9rem" />
                                <span>{user.name}</span>
                                <i className="fas fa-pencil-alt" style={{ fontSize: '0.7rem', color: 'var(--secondary)' }}></i>
                            </span>
                            <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
                        </div>
                    </div>
                </div>
            </header>

            {showProfile && user && (
                <EditProfile
                    user={user}
                    onClose={() => setShowProfile(false)}
                    onUpdate={(u) => setCurrentUser(u)}
                />
            )}
            <main>
                <div className="container">

                    {/* ====== HOME PAGE ====== */}
                    {activePage === 'home' && (
                        <div className="page">
                            {/* Hero */}
                            <div className="hero-section">
                                <div className="hero-content">
                                    <h1>Global Shipping Made Simple</h1>
                                    <p>Reliable, fast, and affordable shipping solutions for businesses and individuals worldwide. Track, book, and manage your shipments effortlessly.</p>
                                    <div className="hero-actions">
                                        <button className="btn btn-white" onClick={e => nav(e, 'booking')}>Book a Shipment</button>
                                        <button className="btn btn-transparent" onClick={e => nav(e, 'tracking')}>Track Package</button>
                                    </div>
                                </div>
                                <div className="hero-image"><i className="fas fa-ship"></i></div>
                            </div>

                            {/* Quick Track */}
                            <div className="card">
                                <div className="card-header"><h2 className="card-title"><i className="fas fa-search-location" style={{color:'var(--secondary)',marginRight:'0.5rem'}}></i>Quick Tracking</h2></div>
                                <form onSubmit={e => { nav(e, 'tracking'); }}>
                                    <div className="quick-track-bar">
                                        <div className="form-group" style={{flex:1}}>
                                            <label>Enter Tracking ID</label>
                                            <input type="text" value={trackingInput} onChange={e => setTrackingInput(e.target.value)} placeholder="e.g., GS123456789" />
                                        </div>
                                        <button type="submit" className="btn btn-primary" style={{marginBottom:'0'}}>Track Now</button>
                                    </div>
                                </form>
                            </div>

                            {/* Stats */}
                            <div className="stats-container">
                                <div className="stat-card"><div className="stat-icon primary"><i className="fas fa-shipping-fast"></i></div><div className="stat-info"><h3>15,247</h3><p>Shipments Delivered</p></div></div>
                                <div className="stat-card"><div className="stat-icon success"><i className="fas fa-globe-americas"></i></div><div className="stat-info"><h3>128</h3><p>Countries Served</p></div></div>
                                <div className="stat-card"><div className="stat-icon warning"><i className="fas fa-users"></i></div><div className="stat-info"><h3>8,452</h3><p>Happy Customers</p></div></div>
                                <div className="stat-card"><div className="stat-icon danger"><i className="fas fa-clock"></i></div><div className="stat-info"><h3>98.7%</h3><p>On-Time Delivery</p></div></div>
                            </div>

                            {/* Why Choose Us */}
                            <div className="page-header"><h2 className="page-title">Why Choose GlobalShipp?</h2></div>
                            <div className="features-grid">
                                <div className="feature-card"><div className="feature-icon"><i className="fas fa-tachometer-alt"></i></div><h3>Lightning Fast</h3><p>Same-day dispatch and express delivery options available in 180+ countries.</p></div>
                                <div className="feature-card"><div className="feature-icon"><i className="fas fa-shield-alt"></i></div><h3>Fully Insured</h3><p>Every shipment is covered with comprehensive insurance from pickup to delivery.</p></div>
                                <div className="feature-card"><div className="feature-icon"><i className="fas fa-map-marked-alt"></i></div><h3>Real-time Tracking</h3><p>Monitor your shipment live with GPS tracking and instant status updates.</p></div>
                                <div className="feature-card"><div className="feature-icon"><i className="fas fa-headset"></i></div><h3>24/7 Support</h3><p>Our dedicated team is available around the clock to assist with any query.</p></div>
                                <div className="feature-card"><div className="feature-icon"><i className="fas fa-dollar-sign"></i></div><h3>Best Rates</h3><p>Competitive pricing with no hidden fees and volume discounts for businesses.</p></div>
                                <div className="feature-card"><div className="feature-icon"><i className="fas fa-leaf"></i></div><h3>Eco-Friendly</h3><p>Carbon-neutral shipping options and sustainable packaging solutions.</p></div>
                            </div>

                            {/* Services Overview */}
                            <div className="page-header" style={{marginTop:'1rem'}}><h2 className="page-title">Our Services</h2></div>
                            <div className="services-grid">
                                {allServices.slice(0, 3).map(s => (
                                    <div className="service-card" key={s.title} onClick={e => nav(e, 'services')}>
                                        <div className="service-icon"><i className={`fas ${s.icon}`}></i></div>
                                        <h3>{s.title}</h3>
                                        <p>{s.desc}</p>
                                        <div className="service-price">{s.price} <span>starting from</span></div>
                                    </div>
                                ))}
                            </div>
                            <div style={{textAlign:'center',marginBottom:'2rem'}}>
                                <button className="btn btn-outline" onClick={e => nav(e, 'services')}>View All Services</button>
                            </div>
                        </div>
                    )}

                    {/* ====== SERVICES PAGE ====== */}
                    {activePage === 'services' && (
                        <div className="page">
                            <div className="page-header">
                                <h1 className="page-title">Our Services</h1>
                                <p className="page-description">Comprehensive shipping solutions tailored for every need — from express parcels to bulk freight.</p>
                            </div>
                            <div className="services-grid">
                                {allServices.map(s => (
                                    <div className="service-card" key={s.title}>
                                        <div className="service-icon"><i className={`fas ${s.icon}`}></i></div>
                                        <h3>{s.title}</h3>
                                        <p>{s.desc}</p>
                                        <ul className="service-features">
                                            {s.features.map(f => <li key={f}><i className="fas fa-check-circle"></i>{f}</li>)}
                                        </ul>
                                        <div className="service-price">{s.price} <span>starting from</span></div>
                                        <button className="btn btn-primary" style={{width:'100%',marginTop:'1rem'}} onClick={e => nav(e, 'quotation')}>Get Quote</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ====== TRACKING PAGE ====== */}
                    {activePage === 'tracking' && (
                        <div className="page">
                            <div className="page-header">
                                <h1 className="page-title">Track Your Shipment</h1>
                                <p className="page-description">Enter your tracking ID to get real-time status and location of your package.</p>
                            </div>
                            <div className="tracking-form">
                                <form onSubmit={handleTrack}>
                                    <div className="tracking-input-group">
                                        <input type="text" value={trackingInput} onChange={e => setTrackingInput(e.target.value)} placeholder="Enter your tracking ID e.g., GS123456789" />
                                        <button type="submit" className="btn btn-primary">Track Shipment</button>
                                    </div>
                                </form>
                            </div>

                            {trackingError && <div style={{background:'#fee9e7',color:'var(--danger)',padding:'1rem',borderRadius:'8px',marginBottom:'1rem'}}><i className="fas fa-exclamation-circle"></i> {trackingError}</div>}

                            {trackingResult && (() => {
                                const steps = ['Booked', 'Packed', 'In Transit', 'Out for Delivery', 'Delivered'];
                                const currentIdx = steps.indexOf(trackingResult.status);
                                const fillPct = currentIdx === -1 ? 0 : (currentIdx / (steps.length - 1)) * 80;
                                return (
                                    <div className="tracking-result">
                                        <div className="tracking-header">
                                            <div>
                                                <div className="tracking-id">{trackingResult.trackingId}</div>
                                                <p style={{color:'var(--gray)',fontSize:'0.9rem'}}>{trackingResult.origin} → {trackingResult.destination}</p>
                                            </div>
                                            <span className="status status-transit">{trackingResult.status}</span>
                                        </div>
                                        <div className="progress-tracker">
                                            <div className="progress-fill" style={{width: `${fillPct}%`}}></div>
                                            {steps.map((step, i) => (
                                                <div className="progress-step" key={step}>
                                                    <div className={`step-icon ${i < currentIdx ? 'completed' : i === currentIdx ? 'current' : ''}`}>
                                                        <i className={`fas ${i < currentIdx ? 'fa-check' : i === 0 ? 'fa-clipboard' : i === 1 ? 'fa-box' : i === 2 ? 'fa-ship' : i === 3 ? 'fa-truck' : 'fa-home'}`}></i>
                                                    </div>
                                                    <div className={`step-label ${i <= currentIdx ? 'active' : ''}`}>{step}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="tracking-details">
                                            <div className="tracking-detail-item"><label>Service Type</label><p>{trackingResult.type}</p></div>
                                            <div className="tracking-detail-item"><label>Weight</label><p>{trackingResult.weight} kg</p></div>
                                            <div className="tracking-detail-item"><label>Est. Delivery</label><p>{trackingResult.estimatedDelivery ? new Date(trackingResult.estimatedDelivery).toLocaleDateString() : 'N/A'}</p></div>
                                            <div className="tracking-detail-item"><label>Est. Cost</label><p>${trackingResult.estimatedCost?.toFixed(2) || 'N/A'}</p></div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {!trackingResult && !trackingError && (
                                <div className="card" style={{textAlign:'center',padding:'3rem'}}>
                                    <i className="fas fa-search-location" style={{fontSize:'4rem',color:'var(--secondary)',opacity:0.3,marginBottom:'1rem',display:'block'}}></i>
                                    <h3 style={{color:'var(--gray)'}}>Enter a tracking ID to see shipment status</h3>
                                    <p style={{color:'var(--gray)',marginTop:'0.5rem'}}>Your tracking ID was sent to your email when your shipment was booked.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ====== BOOKING PAGE ====== */}
                    {activePage === 'booking' && (
                        <div className="page">
                            <div className="page-header">
                                <h1 className="page-title">Book a Shipment</h1>
                                <p className="page-description">Fill in the details below to schedule your shipment. Our team will confirm your booking within 2 hours.</p>
                            </div>
                            <div className="card">
                                <form onSubmit={handleBookingSubmit}>
                                    <div className="form-section-title"><i className="fas fa-map-marker-alt" style={{color:'var(--secondary)',marginRight:'0.5rem'}}></i>Shipment Details</div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Origin (City, Country)</label>
                                            <input type="text" value={booking.origin} onChange={e => setBooking({...booking, origin: e.target.value})} placeholder="e.g., New York, USA" required />
                                        </div>
                                        <div className="form-group">
                                            <label>Destination (City, Country)</label>
                                            <input type="text" value={booking.destination} onChange={e => setBooking({...booking, destination: e.target.value})} placeholder="e.g., London, UK" required />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Service Type</label>
                                            <select value={booking.type} onChange={e => setBooking({...booking, type: e.target.value})}>
                                                {allServices.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Weight (kg)</label>
                                            <input type="number" min="0.1" step="0.1" value={booking.weight} onChange={e => setBooking({...booking, weight: e.target.value})} placeholder="e.g., 50" required />
                                        </div>
                                        <div className="form-group">
                                            <label>Dimensions (L×W×H cm)</label>
                                            <input type="text" value={booking.dimensions} onChange={e => setBooking({...booking, dimensions: e.target.value})} placeholder="e.g., 60×40×30" />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Preferred Pickup Date</label>
                                            <input type="date" value={booking.pickupDate} onChange={e => setBooking({...booking, pickupDate: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="form-section-title"><i className="fas fa-sticky-note" style={{color:'var(--secondary)',marginRight:'0.5rem'}}></i>Additional Notes</div>
                                    <div className="form-group">
                                        <label>Special Instructions</label>
                                        <textarea rows="3" value={booking.notes} onChange={e => setBooking({...booking, notes: e.target.value})} placeholder="e.g., Fragile items, requires refrigeration, etc."></textarea>
                                    </div>
                                    {booking.weight && (
                                        <div style={{background:'rgba(44,140,153,0.08)',borderRadius:'8px',padding:'1rem',marginBottom:'1rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                                            <span style={{color:'var(--primary)',fontWeight:600}}>Estimated Cost:</span>
                                            <span style={{fontSize:'1.4rem',fontWeight:700,color:'var(--secondary)'}}>
                                                ${(Number(booking.weight) * (booking.type === 'Air Freight' ? 2.5 : booking.type === 'Sea Freight' ? 0.8 : 1.2)).toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                    <button type="submit" className="btn btn-primary" style={{width:'100%',padding:'1rem'}}>
                                        <i className="fas fa-paper-plane" style={{marginRight:'0.5rem'}}></i>Submit Booking
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ====== QUOTATION PAGE ====== */}
                    {activePage === 'quotation' && (
                        <div className="page">
                            <div className="page-header">
                                <h1 className="page-title">Get a Quote</h1>
                                <p className="page-description">Enter your shipment details and we'll calculate an instant estimate for you.</p>
                            </div>
                            <div className="form-row" style={{alignItems:'flex-start'}}>
                                <div className="card" style={{flex:1}}>
                                    <form onSubmit={handleQuoteSubmit}>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Origin</label>
                                                <input type="text" value={quote.origin} onChange={e => setQuote({...quote, origin: e.target.value})} placeholder="e.g., Mumbai, India" required />
                                            </div>
                                            <div className="form-group">
                                                <label>Destination</label>
                                                <input type="text" value={quote.destination} onChange={e => setQuote({...quote, destination: e.target.value})} placeholder="e.g., Dubai, UAE" required />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Service Type</label>
                                                <select value={quote.type} onChange={e => setQuote({...quote, type: e.target.value})}>
                                                    {allServices.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Weight (kg)</label>
                                                <input type="number" min="0.1" step="0.1" value={quote.weight} onChange={e => setQuote({...quote, weight: e.target.value})} placeholder="e.g., 100" required />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Notes (Optional)</label>
                                            <textarea rows="2" value={quote.notes} onChange={e => setQuote({...quote, notes: e.target.value})} placeholder="Any special requirements..."></textarea>
                                        </div>
                                        <button type="submit" className="btn btn-primary" style={{width:'100%',padding:'1rem'}}>
                                            <i className="fas fa-calculator" style={{marginRight:'0.5rem'}}></i>Calculate Quote
                                        </button>
                                    </form>
                                </div>

                                {quoteResult && (
                                    <div style={{flex:1,minWidth:'280px'}}>
                                        <div className="quote-summary">
                                            <h3><i className="fas fa-file-invoice-dollar"></i> Your Estimate</h3>
                                            <div className="quote-amount">${quoteResult.estimatedCost?.toFixed(2)}</div>
                                            <p style={{opacity:0.8,fontSize:'0.9rem'}}>This is an estimated quote. Final price may vary based on actual dimensions and route.</p>
                                            <div className="quote-breakdown">
                                                <div className="quote-item"><label>Service</label><p>{quoteResult.type}</p></div>
                                                <div className="quote-item"><label>Weight</label><p>{quoteResult.weight} kg</p></div>
                                                <div className="quote-item"><label>Route</label><p>{quoteResult.origin} → {quoteResult.destination}</p></div>
                                                <div className="quote-item"><label>Status</label><p>{quoteResult.status}</p></div>
                                            </div>
                                            <button className="btn btn-white" style={{marginTop:'1.5rem',width:'100%'}} onClick={e => nav(e, 'booking')}>Book This Shipment</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Rate Guide */}
                            <div className="card" style={{marginTop:'1.5rem'}}>
                                <div className="card-header"><h2 className="card-title">Rate Guide</h2></div>
                                <table>
                                    <thead><tr><th>Service</th><th>Rate</th><th>Transit Time</th><th>Coverage</th><th>Best For</th></tr></thead>
                                    <tbody>
                                        <tr><td><i className="fas fa-plane" style={{color:'var(--secondary)',marginRight:'0.5rem'}}></i>Air Freight</td><td>$2.50/kg</td><td>2–5 days</td><td>Worldwide</td><td>Time-sensitive cargo</td></tr>
                                        <tr><td><i className="fas fa-ship" style={{color:'var(--secondary)',marginRight:'0.5rem'}}></i>Sea Freight</td><td>$0.80/kg</td><td>15–35 days</td><td>Worldwide</td><td>Bulk/heavy cargo</td></tr>
                                        <tr><td><i className="fas fa-truck" style={{color:'var(--secondary)',marginRight:'0.5rem'}}></i>Road Freight</td><td>$1.20/km</td><td>3–10 days</td><td>Continental</td><td>Regional shipments</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ====== DASHBOARD PAGE ====== */}
                    {activePage === 'dashboard' && (
                        <div className="page">
                            <div className="page-header">
                                <div>
                                    <h1 className="page-title">Dashboard</h1>
                                    <p className="page-description">Welcome back, <strong>{user.name}</strong> — manage your shipments, quotes, and account in one place.</p>
                                </div>
                                <div className="page-actions">
                                    <button className="btn btn-outline" onClick={e => nav(e, 'quotation')}>Get Quote</button>
                                    <button className="btn btn-primary" onClick={e => nav(e, 'booking')}>New Shipment</button>
                                </div>
                            </div>

                            <div className="stats-container">
                                <div className="stat-card"><div className="stat-icon primary"><i className="fas fa-box"></i></div><div className="stat-info"><h3>{shipments.length}</h3><p>Total Shipments</p></div></div>
                                <div className="stat-card"><div className="stat-icon success"><i className="fas fa-check-circle"></i></div><div className="stat-info"><h3>{shipments.filter(s => s.status === 'Delivered').length}</h3><p>Delivered</p></div></div>
                                <div className="stat-card"><div className="stat-icon info"><i className="fas fa-shipping-fast"></i></div><div className="stat-info"><h3>{shipments.filter(s => s.status === 'In Transit').length}</h3><p>In Transit</p></div></div>
                                <div className="stat-card"><div className="stat-icon warning"><i className="fas fa-file-invoice"></i></div><div className="stat-info"><h3>{quotes.length}</h3><p>Quotes Requested</p></div></div>
                            </div>

                            {/* Shipments Table */}
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title">My Shipments</h2>
                                    <button className="btn btn-primary" style={{padding:'0.5rem 1rem',fontSize:'0.85rem'}} onClick={e => nav(e, 'booking')}>+ New Booking</button>
                                </div>
                                {shipments.length === 0 ? (
                                    <div style={{textAlign:'center',padding:'2.5rem'}}>
                                        <i className="fas fa-box-open" style={{fontSize:'3.5rem',color:'var(--secondary)',opacity:0.3,display:'block',marginBottom:'1rem'}}></i>
                                        <h3 style={{color:'var(--gray)'}}>No shipments yet</h3>
                                        <p style={{color:'var(--gray)',marginBottom:'1rem'}}>Book your first shipment to get started.</p>
                                        <button className="btn btn-primary" onClick={e => nav(e, 'booking')}>Book Shipment</button>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table>
                                            <thead><tr><th>Tracking ID</th><th>Origin</th><th>Destination</th><th>Type</th><th>Weight</th><th>Status</th><th>Est. Delivery</th><th>Actions</th></tr></thead>
                                            <tbody>
                                                {shipments.map(s => (
                                                    <tr key={s._id}>
                                                        <td><strong>{s.trackingId}</strong></td>
                                                        <td>{s.origin}</td>
                                                        <td>{s.destination}</td>
                                                        <td>{s.type}</td>
                                                        <td>{s.weight} kg</td>
                                                        <td><span className={`status ${s.status === 'Delivered' ? 'status-delivered' : s.status === 'In Transit' ? 'status-transit' : 'status-pending'}`}>{s.status}</span></td>
                                                        <td>{s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleDateString() : 'N/A'}</td>
                                                        <td>
                                                            <button className="btn btn-outline" style={{padding:'0.3rem 0.8rem',fontSize:'0.8rem'}} onClick={() => { setTrackingInput(s.trackingId); nav(null, 'tracking'); }}>
                                                                <i className="fas fa-search-location"></i> Track
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Quotes Table */}
                            {quotes.length > 0 && (
                                <div className="card">
                                    <div className="card-header"><h2 className="card-title">My Quotes</h2></div>
                                    <div className="table-responsive">
                                        <table>
                                            <thead><tr><th>Route</th><th>Type</th><th>Weight</th><th>Est. Cost</th><th>Status</th><th>Date</th></tr></thead>
                                            <tbody>
                                                {quotes.map(q => (
                                                    <tr key={q._id}>
                                                        <td>{q.origin} → {q.destination}</td>
                                                        <td>{q.type}</td>
                                                        <td>{q.weight} kg</td>
                                                        <td><strong>${q.estimatedCost?.toFixed(2)}</strong></td>
                                                        <td><span className={`status ${q.status === 'Approved' ? 'status-active' : q.status === 'Rejected' ? 'status-danger' : 'status-pending'}`}>{q.status}</span></td>
                                                        <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

export default CustomerApp;
