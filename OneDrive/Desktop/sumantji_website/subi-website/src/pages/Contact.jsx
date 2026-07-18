import { useState } from 'react'
import { FiMapPin, FiPhone, FiMail, FiSend, FiClock } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { COMPANY, telHref, waHref } from '../data/company'
import './Page.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    // TODO: wire to backend/email service
    setSent(true)
  }

  const fullAddress = `${COMPANY.address.line1}, ${COMPANY.address.line2}, ${COMPANY.address.city} - ${COMPANY.address.pin}, ${COMPANY.address.state}`
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="badge">Get in touch</span>
          <h1>Let’s talk about your <span>manpower needs</span></h1>
          <p>Our team responds within a few hours on business days.</p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <div className="contact-info">
            <div className="card">
              <div className="ci-icon"><FiMapPin /></div>
              <h4>Office Address</h4>
              <p>{COMPANY.address.line1}<br/>{COMPANY.address.line2}<br/>{COMPANY.address.city} – {COMPANY.address.pin}, {COMPANY.address.state}</p>
            </div>
            <div className="card">
              <div className="ci-icon"><FiPhone /></div>
              <h4>Call Us</h4>
              <p><a href={telHref(COMPANY.phone)}>{COMPANY.phone}</a></p>
            </div>
            <div className="card">
              <div className="ci-icon" style={{ color: '#25D366' }}><FaWhatsapp /></div>
              <h4>WhatsApp</h4>
              <p><a href={waHref(COMPANY.whatsapp)} target="_blank" rel="noreferrer">{COMPANY.whatsapp}</a></p>
            </div>
            <div className="card">
              <div className="ci-icon"><FiMail /></div>
              <h4>Email</h4>
              <p><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></p>
            </div>
            <div className="card">
              <div className="ci-icon"><FiClock /></div>
              <h4>Working Hours</h4>
              <p>Mon – Sat · 9:00 AM to 8:00 PM<br/>Sunday · On appointment</p>
            </div>
          </div>

          <form className="card contact-form" onSubmit={submit}>
            <h3>Send us a message</h3>
            <p style={{ color: 'var(--muted)', marginBottom: 22 }}>We usually respond within a few hours.</p>

            {sent ? (
              <div className="ok">✅ Thanks! Your message has been received. Our team will reach out shortly.</div>
            ) : (
              <>
                <div className="row-2">
                  <div>
                    <label>Full Name</label>
                    <input required value={form.name} onChange={set('name')} placeholder="Your name" />
                  </div>
                  <div>
                    <label>Phone</label>
                    <input required value={form.phone} onChange={set('phone')} placeholder="+91 ..." />
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" />
                </div>
                <div style={{ marginTop: 14 }}>
                  <label>Message</label>
                  <textarea required value={form.message} onChange={set('message')} placeholder="Tell us your requirement..." />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: 20 }}>
                  Send Message <FiSend />
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="map-wrap">
            <iframe
              title="SUBI office location"
              src={mapSrc}
              width="100%"
              height="380"
              style={{ border: 0, borderRadius: 16 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  )
}
