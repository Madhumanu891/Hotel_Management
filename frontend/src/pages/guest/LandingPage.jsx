import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Hotel, Star, Shield, Clock, Award,
  ArrowRight, CheckCircle, Wifi, Waves,
  Dumbbell, Coffee, Car, MapPin,
  Users, TrendingUp, Zap,
} from 'lucide-react';
import ThemeToggle    from '../../components/ui/ThemeToggle';
import LanguageSelector from '../../components/ui/LanguageSelector';

const features = [
  { icon: Shield,    title: 'Secure Booking',    desc: '256-bit SSL encryption on all transactions'                },
  { icon: Clock,     title: 'Free Cancellation', desc: 'Cancel up to 24 hours before check-in for a full refund'  },
  { icon: Award,     title: 'Loyalty Rewards',   desc: 'Earn points on every stay and unlock exclusive benefits'   },
  { icon: Star,      title: 'Premium Hotels',    desc: 'Curated selection of 3-5 star properties across India'     },
];

const stats = [
  { label: 'Properties',   value: '50+',    icon: Hotel     },
  { label: 'Happy Guests', value: '12,000+',icon: Users     },
  { label: 'Cities',       value: '12',     icon: MapPin    },
  { label: 'Avg Rating',   value: '4.8★',   icon: TrendingUp},
];

const amenities = [
  { icon: Wifi,    label: 'Free Wi-Fi'     },
  { icon: Waves,   label: 'Swimming Pool'  },
  { icon: Dumbbell,label: 'Fitness Center' },
  { icon: Coffee,  label: 'Restaurant'     },
  { icon: Car,     label: 'Free Parking'   },
];

const testimonials = [
  {
    name:    'Priya Sharma',
    city:    'Mumbai',
    rating:  5,
    comment: 'Absolutely wonderful experience! The booking process was seamless and the hotel exceeded all expectations.',
    avatar:  'PS',
  },
  {
    name:    'Rahul Verma',
    city:    'Hyderabad',
    rating:  5,
    comment: 'Best hotel management app I have used. Love the loyalty programme — already at Gold tier!',
    avatar:  'RV',
  },
  {
    name:    'Anitha Reddy',
    city:    'Bangalore',
    rating:  4,
    comment: 'The housekeeping service was top notch and the receptionist dashboard made check-in super fast.',
    avatar:  'AR',
  },
];

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary-700 flex items-center justify-center">
                <Hotel className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white">NexoraHotels</span>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSelector compact />
              <ThemeToggle compact />
              <Link to="/login"    className="btn-secondary text-sm py-2 px-4 hidden sm:block">Sign In</Link>
              <Link to="/register" className="btn-primary  text-sm py-2 px-4">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize:  '40px 40px',
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Zap className="h-4 w-4" />
            India's Premier Hotel Management Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Manage Hotels Like<br />
            <span className="text-yellow-300">Never Before</span>
          </h1>
          <p className="text-xl text-primary-200 max-w-2xl mx-auto mb-10">
            Complete hotel management system with microservices architecture.
            8 role-based dashboards. Real-time updates. Loyalty programme.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors text-lg shadow-lg"
            >
              Start Free Today
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:border-white/60 transition-colors text-lg"
            >
              View Demo
            </Link>
          </div>
          <p className="mt-6 text-primary-300 text-sm">
            Demo: guest → madhu@hotel.com / Test1234! &nbsp;|&nbsp; admin → admin@hotel.com / Admin1234!
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="card p-5 text-center">
              <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-3">
                <Icon className="h-5 w-5 text-primary-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-2xl mx-auto">
            Complete hotel operations management from a single platform
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-primary-700" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role dashboards */}
      <section className="bg-gray-100 dark:bg-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              8 Role-Based Dashboards
            </h2>
            <p className="text-gray-500 dark:text-slate-400">
              Every team member sees exactly what they need
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { role: 'Guest',            icon: '🏨', desc: 'Search, book & manage stays'        },
              { role: 'Receptionist',     icon: '🛎️', desc: 'Check-in queue & room map'          },
              { role: 'Hotel Manager',    icon: '📊', desc: 'Revenue charts & analytics'         },
              { role: 'Housekeeping',     icon: '🧹', desc: 'Task list with checklist'           },
              { role: 'Restaurant Staff', icon: '🍽️', desc: 'Kitchen display & orders'           },
              { role: 'HR Manager',       icon: '👥', desc: 'Shifts & leave management'          },
              { role: 'Accountant',       icon: '💰', desc: 'Revenue & occupancy reports'        },
              { role: 'Super Admin',      icon: '⚙️', desc: 'System health & all properties'    },
            ].map(({ role, icon, desc }) => (
              <div key={role} className="card p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{icon}</div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">{role}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Premium Amenities at Every Property
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {amenities.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl px-5 py-3 shadow-sm"
            >
              <Icon className="h-5 w-5 text-primary-600" />
              <span className="font-medium text-gray-700 dark:text-slate-300">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-primary-50 dark:bg-primary-900/20 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Guests Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, city, rating, comment, avatar }) => (
              <div key={name} className="card p-6">
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(i => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-slate-300 text-sm mb-4 italic">"{comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold">
                    {avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{name}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">{city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Built with Modern Tech Stack
          </h2>
          <p className="text-gray-500 dark:text-slate-400">Production-grade architecture</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'React 18',    icon: '⚛️' },
            { name: 'Node.js',     icon: '🟢' },
            { name: 'MongoDB',     icon: '🍃' },
            { name: 'Redis',       icon: '🔴' },
            { name: 'RabbitMQ',    icon: '🐰' },
            { name: 'Docker',      icon: '🐳' },
            { name: 'TanStack Q',  icon: '⚡' },
            { name: 'Tailwind',    icon: '💨' },
            { name: 'JWT Auth',    icon: '🔐' },
            { name: 'PayPal SDK',  icon: '💳' },
            { name: 'Cloudinary',  icon: '☁️' },
            { name: 'PWA Ready',   icon: '📱' },
          ].map(({ name, icon }) => (
            <div
              key={name}
              className="card p-4 text-center hover:shadow-md transition-shadow"
            >
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-xs font-semibold text-gray-700 dark:text-slate-300">{name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-900 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-200 mb-8 text-lg">
            Join thousands of hotel managers using NexoraHotels
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-xl hover:bg-primary-50 transition-colors text-lg w-full sm:w-auto justify-center"
            >
              Create Free Account
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:border-white transition-colors text-lg w-full sm:w-auto justify-center"
            >
              View Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-slate-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary-700 flex items-center justify-center">
                <Hotel className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white">NexoraHotels</div>
                <div className="text-xs text-gray-500">Premium Hotel Management System</div>
              </div>
            </div>
            <div className="text-sm text-center md:text-right">
              <div className="text-gray-300 font-medium mb-1">
                Built by Madhu Dhanaveni
              </div>
              <div className="text-gray-500 text-xs">
                Full Stack Developer — MERN + Microservices
              </div>
              <div className="flex items-center justify-center md:justify-end gap-4 mt-2">
                {['React', 'Node.js', 'MongoDB', 'Docker', 'Redis', 'RabbitMQ'].map(t => (
                  <span key={t} className="text-xs bg-gray-800 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-xs text-gray-600">
            © 2026 NexoraHotels. Built as a portfolio project demonstrating full-stack microservices architecture.
          </div>
        </div>
      </footer>
    </div>
  );
}