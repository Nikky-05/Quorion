import logo from '../assets/images/logo.jpeg'
import founderJayant from '../assets/images/founder-jayant.jpeg'
import founderBina from '../assets/images/founder-bina.jpeg'
import banner1 from '../assets/images/banner1.jpeg'
import banner2 from '../assets/images/banner2.jpeg'
import teamGuards from '../assets/images/team-guards.jpeg'
import guardBack from '../assets/images/guard-back.jpeg'
import guardDuo from '../assets/images/guard-duo.jpeg'
import office from '../assets/images/office.jpeg'
import jobPatnaMetro from '../assets/images/job-patna-metro.jpeg'
import jobPatnaMetro2 from '../assets/images/job-patna-metro-2.jpeg'
import jobLtPatnaMetro from '../assets/images/job-lt-patna-metro.jpeg'

export const COMPANY = {
  name: 'SUBI ENTERPRISES',
  fullName: 'SUBI ENTERPRISES (OPC) PRIVATE LIMITED',
  brand: 'SUBI Security Services Pvt. Ltd.',
  tagline: 'Manpower Supply & Employee Management',
  reg: 'PSA/L/89/BR/2023/449t/3/168-82/23',
  gstin: '10ABICS5612G1ZP',
  email: 'manpowersubi@gmail.com',
  phone: '+91 96614 49889',
  whatsapp: '+91 70610 22228',
  address: {
    line1: 'Shop No.-03, Ground Floor, Maa Durga Market',
    line2: 'New Jakkanpur, Near Shiv Mandir',
    city: 'Patna',
    pin: '800001',
    state: 'Bihar, India',
  },
  registrationFee: 2100,
  upiId: 'manpowersubi@upi',
  payeeName: 'SUBI ENTERPRISES',
  images: {
    logo,
    banner1,
    banner2,
    teamGuards,
    guardBack,
    guardDuo,
    office,
  },
}

export const telHref = (num) => `tel:${num.replace(/\s|\+/g, '')}`
export const waHref = (num) => `https://wa.me/${num.replace(/\s|\+/g, '')}`

export const FOUNDERS = [
  {
    name: 'Bina Rani',
    role: 'Director',
    photo: founderBina,
    bio: 'Director of SUBI Enterprises. Leads company strategy, HR, recruitment and overall governance.',
  },
  {
    name: 'Sumant Kumar',
    role: 'Co-Founder & Managing Director',
    photo: founderJayant,
    bio: 'Co-Founder of SUBI Security Services Pvt. Ltd. and husband of Director Bina Rani. Drives operations, client partnerships, compliance and PSARA licensing across Bihar.',
  },
]

export const SERVICES = [
  {
    id: 'security-guard',
    title: 'Security Guards',
    icon: 'shield',
    short: 'Trained, uniformed security personnel for 24/7 site protection.',
    tags: ['Company', 'Bank', 'Hospital', 'Hotel', 'Agency'],
  },
  {
    id: 'bouncer',
    title: 'Bouncers',
    icon: 'muscle',
    short: 'Physically fit, discreet bouncers for events, clubs and VIP duty.',
    tags: ['Events', 'Clubs', 'VIP'],
  },
  {
    id: 'ex-army',
    title: 'Ex-Army Personnel',
    icon: 'star',
    short: 'Ex-servicemen for high-value assets, executive protection and audits.',
    tags: ['Executive', 'High-risk'],
  },
  {
    id: 'housekeeping',
    title: 'Housekeeping Staff',
    icon: 'broom',
    short: 'Office cleaning, carpet cleaning and antiviral disinfection teams.',
    tags: ['Office', 'Carpet', 'Disinfection'],
  },
  {
    id: 'mts',
    title: 'MTS / Multipurpose',
    icon: 'wrench',
    short: 'Multi-tasking staff for support operations across facilities.',
    tags: ['Support', 'Facility'],
  },
  {
    id: 'engineers',
    title: 'B.Tech Engineers',
    icon: 'cog',
    short: 'Civil, Electrical and Mechanical engineers for project deployment.',
    tags: ['Civil', 'Electrical', 'Mechanical'],
  },
  {
    id: 'driver',
    title: 'Drivers',
    icon: 'car',
    short: 'Verified drivers for commercial and executive use.',
    tags: ['Commercial', 'Executive'],
  },
  {
    id: 'office-staff',
    title: 'Office Staff',
    icon: 'briefcase',
    short: 'Office boys, peons, clerks, data-entry operators and accounts staff.',
    tags: ['Peon', 'Clerk', 'DEO', 'Accounts'],
  },
]

export const JOB_ROLES = SERVICES.map((s) => s.title)

/**
 * OPENINGS schema:
 * - salary (optional): single salary string when there's only one role
 * - positions (optional): array of { role, seats, salary, trades? } for multi-role postings
 * - poster (optional): image import; when absent, card renders text-only full-width
 * - note (optional): short text shown near the CTA (e.g. "Share resume")
 */
export const OPENINGS = [
  {
    id: 'ntpc-barh',
    title: 'NTPC Barh Super Thermal Power',
    tag: 'Urgent Requirement',
    tagType: 'urgent',
    duty: '8 Hours',
    workDays: '26 Days',
    processDays: '3 Days',
    location: 'NTPC Barh, Bihar',
    positions: [
      { role: 'ITI', seats: 18, salary: '₹22k – ₹28k', trades: 'Fitter, Electrician, Welder' },
      { role: 'Diploma', seats: 8, salary: '₹32k – ₹46k', trades: 'Civil, Electronics' },
      { role: 'Graduation', seats: 14, salary: '₹26k – ₹34k' },
    ],
    facilities: ['Lodging & Fooding', 'PF', 'ESI', 'Bonus', 'EL / CL / SL'],
    perks: 'Offer letter processed within 3 days',
  },
  {
    id: 'lt-patna-metro',
    title: 'L&T Patna Metro Project',
    tag: 'Urgent Requirement',
    tagType: 'urgent',
    duty: '8 Hours',
    workDays: '26 Days',
    processDays: '3 Days',
    location: 'Patna, Bihar',
    positions: [
      { role: 'ITI', seats: 26, salary: '₹18k – ₹22k', trades: 'Fitter, Electrician, Welder' },
      { role: 'Diploma', seats: 16, salary: '₹26k – ₹32k', trades: 'Civil, Electronics' },
      { role: 'B.Tech', seats: 8, salary: '₹34k – ₹46k', trades: 'Civil, Mechanical, Electrical' },
      { role: 'Graduation', seats: 6, salary: '₹24k – ₹28k' },
      { role: '12th Pass', seats: 4, salary: '₹16k – ₹19k' },
    ],
    facilities: ['Lodging Facility'],
    perks: 'Offer letter processed within 3 days · Share resume to apply',
    note: 'Salary as per experience',
    poster: jobLtPatnaMetro,
  },
  {
    id: 'iocl-barauni',
    title: 'Indian Oil — Barauni Refinery',
    tag: 'Immediate Joining',
    tagType: 'new',
    duty: '8 Hours',
    workDays: '26 Days',
    processDays: '3 Days',
    location: 'Barauni Refinery, Begusarai',
    positions: [
      { role: 'ITI', seats: 18, salary: '₹22k – ₹28k', trades: 'Fitter, Electrician, Welder' },
      { role: 'Diploma', seats: 8, salary: '₹32k – ₹40k', trades: 'Civil, Chemical, Electronics' },
      { role: 'Graduation', seats: 19, salary: '₹24k – ₹32k' },
    ],
    facilities: ['Lodging & Fooding', 'PF', 'ESI', 'Bonus', 'EL / CL / SL'],
    perks: 'Offer letter processed within 3 days',
  },
  {
    id: 'patna-metro',
    title: 'Patna Metro — Security Guard',
    tag: 'Urgent Requirement',
    tagType: 'urgent',
    salary: '₹15,000',
    duty: '12 Hour (Day / Night Shift)',
    workDays: '30 Days',
    processDays: '7 Days',
    facilities: ['EPF & ESI', 'Fooding (Mess)', 'Accommodation', 'Insurance 2–3 benefits'],
    perks: 'Good uniform & proper dress provided',
    location: 'Patna, Bihar',
    poster: jobPatnaMetro,
  },
  {
    id: 'patna-metro-new-batch',
    title: 'Patna Metro — Security Guard (New Batch)',
    tag: 'Immediate Joining',
    tagType: 'new',
    salary: '₹15,000',
    duty: '12 Hour Duty',
    workDays: '30 Days',
    processDays: '7 Days',
    facilities: ['EPF', 'ESI', 'Fooding', 'Mess Charge', 'Loading', 'Insurance ₹2–3 Lakh'],
    perks: 'Lodging + Mess + Insurance ₹2–3 Lakh provided',
    location: 'Gandhi Path, New Jakkanpur, Patna – 800001',
    poster: jobPatnaMetro2,
  },
]
