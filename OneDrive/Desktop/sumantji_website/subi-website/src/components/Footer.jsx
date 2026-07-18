import { Link } from 'react-router-dom'
import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi'
import { COMPANY } from '../data/company'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand">
            <img src={COMPANY.images.logo} alt="SUBI" />
            <div>
              <div className="brand-name">SUBI</div>
              <div className="brand-sub">Security Services</div>
            </div>
          </div>
          <p className="foot-p">
            {COMPANY.fullName}. Trusted manpower supply, security guards, housekeeping and
            skilled staff across Bihar.
          </p>
          <p className="reg">Reg. {COMPANY.reg}</p>
          <p className="reg">GSTIN: {COMPANY.gstin}</p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul className="links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/admin">🔒 Admin</Link></li>
          </ul>
        </div>

        <div>
          <h4>Services</h4>
          <ul className="links">
            <li>Security Guards</li>
            <li>Bouncers & Ex-Army</li>
            <li>Housekeeping</li>
            <li>Drivers & Office Staff</li>
            <li>B.Tech Engineers</li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul className="contact">
            <li><FiMapPin /> {COMPANY.address.line1}, {COMPANY.address.line2}, {COMPANY.address.city} – {COMPANY.address.pin}</li>
            <li><FiPhone /> {COMPANY.phones[0]}<br/><span style={{marginLeft: 22}}>{COMPANY.phones[1]}</span></li>
            <li><FiMail /> {COMPANY.email}</li>
          </ul>
        </div>
      </div>

      <div className="copy">
        <div className="container copy-inner">
          <span>© {new Date().getFullYear()} SUBI Enterprises (OPC) Pvt. Ltd. All rights reserved.</span>
          <span>Made with care in Patna, Bihar</span>
        </div>
      </div>
    </footer>
  )
}
