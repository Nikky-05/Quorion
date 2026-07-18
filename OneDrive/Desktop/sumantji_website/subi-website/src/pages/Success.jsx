import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiCheckCircle, FiDownload, FiHome, FiPhone } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { COMPANY, telHref, waHref } from '../data/company'
import './Register.css'
import './Payment.css'
import './Success.css'

export default function Success() {
  const navigate = useNavigate()
  const [receipt] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('subi_receipt')) || null
    } catch { return null }
  })

  useEffect(() => {
    if (!receipt) navigate('/')
  }, [receipt, navigate])

  const printReceipt = () => window.print()

  if (!receipt) return null

  const paidOn = new Date(receipt.paidAt).toLocaleString('en-IN')

  return (
    <section className="reg-wrap">
      <div className="container">
        <div className="success-card card">
          <div className="check-anim">
            <FiCheckCircle />
          </div>
          <h1>Payment Successful!</h1>
          <p className="s-sub">
            Your registration with <strong>{COMPANY.name}</strong> has been confirmed.
            Our team will contact you within 24 hours for verification.
          </p>

          <div className="receipt">
            <div className="rec-head">
              <div>
                <div className="rec-brand">SUBI ENTERPRISES</div>
                <div className="rec-sub">Official Payment Receipt</div>
              </div>
              <div className="rec-amount">
                <span>Amount Paid</span>
                <strong>₹{receipt.amount}</strong>
              </div>
            </div>

            <div className="rec-grid">
              <div><span>Application ID</span><strong>{receipt.applicationId}</strong></div>
              <div><span>Applicant</span><strong>{receipt.name}</strong></div>
              <div><span>Payment Method</span><strong>{receipt.method === 'upi' ? 'UPI' : 'Card / Netbanking'}</strong></div>
              <div><span>Transaction ID</span><strong>{receipt.txn}</strong></div>
              <div><span>Paid On</span><strong>{paidOn}</strong></div>
              <div><span>Status</span><strong className="ok">✓ Success</strong></div>
            </div>

            <div className="rec-foot">
              <div>
                <div className="rec-brand" style={{ fontSize: 14 }}>{COMPANY.fullName}</div>
                <div className="rec-sub">{COMPANY.address.line1}, {COMPANY.address.line2}, {COMPANY.address.city} – {COMPANY.address.pin}</div>
                <div className="rec-sub">GSTIN: {COMPANY.gstin} · Reg. {COMPANY.reg}</div>
              </div>
              <div className="stamp">PAID</div>
            </div>
          </div>

          <div className="s-actions">
            <button className="btn btn-primary" onClick={printReceipt}>
              <FiDownload /> Download Receipt
            </button>
            <a href={telHref(COMPANY.phone)} className="btn btn-outline">
              <FiPhone /> Call Us
            </a>
            <a href={waHref(COMPANY.whatsapp)} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ color: '#25D366', borderColor: '#25D366' }}>
              <FaWhatsapp /> WhatsApp
            </a>
            <Link to="/" className="btn btn-outline">
              <FiHome /> Back to Home
            </Link>
          </div>

          <div className="s-note">
            📩 A confirmation SMS & email will be sent to your registered contact shortly.
          </div>
        </div>
      </div>
    </section>
  )
}
