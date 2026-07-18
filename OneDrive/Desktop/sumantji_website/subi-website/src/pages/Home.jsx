import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiShield,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiPhone,
  FiArrowRight,
  FiStar,
  FiMapPin,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { COMPANY, SERVICES, FOUNDERS, OPENINGS, telHref, waHref } from '../data/company'
import ServiceCard from '../components/ServiceCard'
import './Home.css'

const stats = [
  { n: '500+', l: 'Trained Guards' },
  { n: '120+', l: 'Client Sites' },
  { n: '15+', l: 'Years Experience' },
  { n: '24/7', l: 'Support' },
]

const why = [
  { icon: FiShield, t: 'PSARA Licensed', p: 'Registered and compliant with statutory requirements.' },
  { icon: FiAward, t: 'Verified Personnel', p: 'Police + Aadhaar verified staff before deployment.' },
  { icon: FiClock, t: '24/7 Deployment', p: 'Round the clock supervisors & rapid response.' },
  { icon: FiCheckCircle, t: 'Trained & Uniformed', p: 'In-house training, drills and grooming standards.' },
]

const testimonials = [
  { name: 'Anil Sharma', role: 'Bank Branch Manager, Patna', text: 'SUBI’s guards have been extremely professional. Zero incidents in 3 years of service.' },
  { name: 'Dr. Priya Verma', role: 'Hospital Administrator', text: 'Their housekeeping + guard team keeps our premises spotless and secure. Highly recommended.' },
  { name: 'R. Kumar', role: 'Hotel Owner', text: 'Reliable manpower supply, prompt replacements and a very responsive team.' },
]

function getSalaryRange(job) {
  if (job.salary) return job.salary
  if (!job.positions?.length) return null
  const nums = job.positions
    .flatMap((p) => (p.salary || '').match(/\d+/g) || [])
    .map(Number)
    .filter(Boolean)
  if (!nums.length) return null
  const min = Math.min(...nums)
  const max = Math.max(...nums)
  return min === max ? `₹${min}k` : `₹${min}k – ₹${max}k`
}

function JobDetailModal({ job, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const totalSeats = job.positions?.reduce((sum, p) => sum + (p.seats || 0), 0)

  return (
    <motion.div
      className="job-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`job-modal ${!job.poster ? 'no-poster' : ''}`}
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <FiX size={22} />
        </button>

        {job.poster && (
          <div className="modal-poster">
            <img src={job.poster} alt={job.title} />
            {job.tagType === 'urgent' && <span className="urgent-tag">🔥 Urgent</span>}
            {job.tagType === 'new' && <span className="urgent-tag new">✨ New</span>}
          </div>
        )}

        <div className="modal-info">
          <div className={`badge ${job.tagType === 'new' ? 'tag-new' : 'tag-urgent'}`}>{job.tag || 'Hiring Now'}</div>
          <h3>{job.title}</h3>

          {job.salary && (
            <div className="salary">
              <span>In-hand Salary</span>
              <strong>{job.salary}<small>/month</small></strong>
            </div>
          )}

          {job.positions && (
            <div className="positions">
              <div className="pos-head">
                <span className="pos-title">Vacancies</span>
                {totalSeats > 0 && <span className="pos-total">{totalSeats} Total Seats</span>}
              </div>
              <div className="pos-table">
                <div className="pos-row pos-hrow">
                  <span>Role</span>
                  <span>Seats</span>
                  <span>Salary</span>
                </div>
                {job.positions.map((p) => (
                  <div key={p.role} className="pos-row">
                    <span className="pos-role">
                      <strong>{p.role}</strong>
                      {p.trades && <em>{p.trades}</em>}
                    </span>
                    <span className="pos-seats">{p.seats}</span>
                    <span className="pos-salary">{p.salary}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="job-meta">
            <div><span>Duty</span><strong>{job.duty}</strong></div>
            <div><span>Work Days</span><strong>{job.workDays}</strong></div>
            <div><span>Process</span><strong>{job.processDays}</strong></div>
            <div><span>Location</span><strong>{job.location}</strong></div>
          </div>

          <div className="facilities">
            <div className="fac-title">Facilities Provided</div>
            <div className="fac-list">
              {job.facilities.map((f) => (
                <span key={f} className="fac-chip">✓ {f}</span>
              ))}
            </div>
          </div>

          <p className="perks">👕 {job.perks}</p>
          {job.note && <p className="job-note">ℹ️ {job.note}</p>}

          <div className="job-cta">
            <Link to="/register" className="btn btn-primary">
              Apply Now — ₹{COMPANY.registrationFee} <FiArrowRight />
            </Link>
            <a href={telHref(COMPANY.phone)} className="btn btn-outline">
              <FiPhone /> Call to Enquire
            </a>
            <a href={waHref(COMPANY.whatsapp)} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ color: '#25D366', borderColor: '#25D366' }}>
              <FaWhatsapp /> WhatsApp
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Home() {
  const [openJob, setOpenJob] = useState(null)
  const [jobs, setJobs] = useState(OPENINGS)

  useEffect(() => {
    let cancelled = false
    fetch('/api/jobs')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (cancelled) return
        if (data && Array.isArray(data.jobs) && data.jobs.length > 0) {
          setJobs(data.jobs)
        }
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-grid">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-copy"
          >
            <span className="badge">PSARA Licensed · Reg. {COMPANY.reg.split('/').slice(0, 3).join('/')}...</span>
            <h1>
              Trusted <span className="highlight">Manpower & Security</span> Services in Bihar
            </h1>
            <p className="lead">
              {COMPANY.fullName} provides trained security guards, bouncers, ex-army personnel,
              housekeeping, drivers, engineers and skilled staff — verified, uniformed and ready
              to deploy.
            </p>
            <div className="hero-cta">
              <Link to="/register" className="btn btn-primary">
                Register Now — ₹{COMPANY.registrationFee} <FiArrowRight />
              </Link>
              <a href={telHref(COMPANY.phone)} className="btn btn-outline">
                <FiPhone /> Call {COMPANY.phone}
              </a>
              <a href={waHref(COMPANY.whatsapp)} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ color: '#25D366', borderColor: '#25D366' }}>
                <FaWhatsapp /> WhatsApp
              </a>
            </div>

            <div className="hero-trust">
              <div>
                <div className="ht-n">500+</div>
                <div className="ht-l">Guards deployed</div>
              </div>
              <div>
                <div className="ht-n">120+</div>
                <div className="ht-l">Active clients</div>
              </div>
              <div>
                <div className="ht-n">4.8★</div>
                <div className="ht-l">Client rating</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="hero-visual"
          >
            <div className="hero-photo main">
              <img src={COMPANY.images.teamGuards} alt="Security team" />
            </div>
            <div className="hero-photo float">
              <img src={COMPANY.images.guardBack} alt="Security guard" />
            </div>
            <div className="hero-badge">
              <FiShield />
              <div>
                <strong>Since 2023</strong>
                <span>Govt. Registered</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section">
        <div className="container">
          <div className="badge" style={{ display: 'block', width: 'max-content', margin: '0 auto 12px' }}>
            Our Services
          </div>
          <h2 className="section-title">
            Everything you need, <span>under one roof</span>
          </h2>
          <p className="section-sub">
            From uniformed security guards to skilled engineers and housekeeping teams — we
            supply pre-verified, trained manpower to businesses across Bihar.
          </p>
          <div className="grid svc-grid">
            {SERVICES.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/services" className="btn btn-outline">
              View all services <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* CURRENT OPENINGS */}
      <section className="section openings-sec">
        <div className="container">
          <div className="badge live-badge" style={{ display: 'block', width: 'max-content', margin: '0 auto 12px' }}>
            <span className="live-dot" /> Live · Hiring Now
          </div>
          <h2 className="section-title">Current <span>Openings</span></h2>
          <p className="section-sub">
            Urgent vacancies with EPF, ESI, accommodation and insurance benefits. Apply now.
          </p>

          <div className="openings-wrap">
            <div className="jobs-compact">
              {jobs.map((job) => {
                const totalSeats = job.positions?.reduce((sum, p) => sum + (p.seats || 0), 0)
                const salaryRange = getSalaryRange(job)
                return (
                  <button
                    key={job.id}
                    type="button"
                    className="job-mini"
                    onClick={() => setOpenJob(job)}
                  >
                    <div className="jm-media">
                      {job.poster ? (
                        <img src={job.poster} alt="" />
                      ) : (
                        <div className="jm-placeholder">
                          <FiShield size={26} />
                        </div>
                      )}
                      <span className={`jm-tag ${job.tagType === 'new' ? 'new' : 'urgent'}`}>
                        {job.tagType === 'new' ? '✨ New' : '🔥 Urgent'}
                      </span>
                    </div>
                    <div className="jm-body">
                      <h4>{job.title}</h4>
                      <div className="jm-meta">
                        <span><FiMapPin size={13} /> {job.location}</span>
                        {totalSeats > 0 && <span><FiUsers size={13} /> {totalSeats} Seats</span>}
                      </div>
                      {salaryRange && <div className="jm-salary">{salaryRange}<small>/month</small></div>}
                      <span className="jm-view">View Details <FiArrowRight size={14} /></span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="section why">
        <div className="container">
          <div className="why-grid">
            <div className="why-left">
              <div className="badge">Why choose SUBI</div>
              <h2 className="why-title">
                Verified people. <br />
                <span>Uncompromised standards.</span>
              </h2>
              <p className="why-p">
                Every guard, driver and staff we supply goes through document verification,
                background check and hands-on training — so you get dependable manpower from
                day one.
              </p>
              <Link to="/about" className="btn btn-primary">
                Learn more about us <FiArrowRight />
              </Link>
            </div>
            <div className="why-right">
              {why.map((w) => (
                <div key={w.t} className="card why-card">
                  <div className="why-icon"><w.icon size={22} /></div>
                  <h4>{w.t}</h4>
                  <p>{w.p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-strip">
        <div className="container stats-grid">
          {stats.map((s) => (
            <div key={s.l} className="stat">
              <div className="stat-n">{s.n}</div>
              <div className="stat-l">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOUNDERS PREVIEW */}
      <section className="section">
        <div className="container">
          <div className="badge" style={{ display: 'block', width: 'max-content', margin: '0 auto 12px' }}>
            Leadership
          </div>
          <h2 className="section-title">Meet the <span>founders</span></h2>
          <p className="section-sub">
            A team with decades of combined experience in security, HR and operations across India.
          </p>
          <div className="grid founders">
            {FOUNDERS.map((f) => (
              <div key={f.name} className="card founder">
                <div className="founder-img">
                  <img src={f.photo} alt={f.name} />
                </div>
                <h3>{f.name}</h3>
                <div className="role">{f.role}</div>
                <p>{f.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section testi-sec">
        <div className="container">
          <h2 className="section-title">Trusted by <span>clients across Bihar</span></h2>
          <p className="section-sub">What our clients say about working with SUBI.</p>
          <div className="grid testi-grid">
            {testimonials.map((t) => (
              <div key={t.name} className="card testi">
                <div className="stars">
                  <FiStar /><FiStar /><FiStar /><FiStar /><FiStar />
                </div>
                <p>“{t.text}”</p>
                <div className="testi-who">
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-sec">
        <div className="container cta-card">
          <div>
            <div className="badge">Get started</div>
            <h2>Ready to hire trained & verified staff?</h2>
            <p>Register today for just ₹{COMPANY.registrationFee}. Instant confirmation via UPI.</p>
          </div>
          <Link to="/register" className="btn btn-primary">
            Register Now <FiArrowRight />
          </Link>
        </div>
      </section>

      <AnimatePresence>
        {openJob && <JobDetailModal job={openJob} onClose={() => setOpenJob(null)} />}
      </AnimatePresence>
    </>
  )
}
