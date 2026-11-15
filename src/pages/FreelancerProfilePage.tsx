import React, { useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Calendar,
  Briefcase,
  GraduationCap,
  ExternalLink,
  MessageSquare,
  DollarSign,
  Heart,
  Star,
  Edit3,
  Save,
  X,
  Share2,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { formatBDT, calculateProfileCompletion } from '../utils/formatters';
import { RatingStars } from '../components/RatingStars';
import { EscrowPaymentModal } from '../components/EscrowPaymentModal';

export const FreelancerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profiles, reviews, services, isFreelancerSaved, toggleSaveFreelancer, createOrGetConversation } = useData();
  const { currentUser, updateProfile } = useAuth();

  const profile = profiles.find((p) => p.uid === id) || (currentUser?.uid === id ? profiles[0] : null);
  const isOwner = currentUser && profile && currentUser.uid === profile.uid;

  const [isEditing, setIsEditing] = useState(false);
  const [editedHeadline, setEditedHeadline] = useState(profile?.headline || '');
  const [editedBio, setEditedBio] = useState(profile?.bio || '');
  const [editedLocation, setEditedLocation] = useState(profile?.location || '');
  const [editedHourlyRate, setEditedHourlyRate] = useState(profile?.hourlyRate || 1500);
  const [editedSkills, setEditedSkills] = useState(profile?.skills?.join(', ') || '');
  const [editedAvailability, setEditedAvailability] = useState(profile?.availability || 'Available');

  const [hireModalOpen, setHireModalOpen] = useState(searchParams.get('hire') === '1');
  const [hireAmount, setHireAmount] = useState((profile?.hourlyRate || 1500) * 10);
  const [hireTitle, setHireTitle] = useState('Direct Project Contract');

  if (!profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile not found</h2>
        <Link to="/freelancers" className="mt-3 text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          &larr; Browse Freelancers
        </Link>
      </div>
    );
  }

  const profileReviews = reviews.filter((r) => r.revieweeId === profile.uid);
  const freelancerServices = services.filter((s) => s.freelancerId === profile.uid);
  const isSaved = isFreelancerSaved(profile.uid);
  const completion = profile.completionPercentage || calculateProfileCompletion(profile);

  const handleSaveProfile = async () => {
    const skillsArray = editedSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await updateProfile({
      headline: editedHeadline,
      bio: editedBio,
      location: editedLocation,
      hourlyRate: Number(editedHourlyRate),
      skills: skillsArray,
      availability: editedAvailability as any,
    });
    setIsEditing(false);
  };

  const handleStartChat = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const convId = createOrGetConversation(profile.uid, profile.name);
    navigate(`/chat?conv=${convId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-colors">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8">
        {/* Profile Card Header */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="h-36 sm:h-48 bg-gradient-to-r from-indigo-600 via-indigo-700 to-emerald-600 relative">
            <div className="absolute right-4 top-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleSaveFreelancer(profile.uid)}
                className="p-2.5 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors cursor-pointer"
                title="Save Freelancer"
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-16 sm:-mt-22">
              {/* Avatar + Main Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
                <img
                  src={
                    profile.uid === 'freelancer-001'
                      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
                      : profile.uid === 'freelancer-002'
                      ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
                      : profile.uid === 'freelancer-003'
                      ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'
                      : 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={profile.name}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-xl shrink-0 bg-white dark:bg-slate-900"
                />
                <div className="space-y-1 pt-1 sm:pt-4">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                      {profile.name}
                    </h1>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verified Pro</span>
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {profile.headline}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {profile.location}
                    </span>
                    <span>&bull;</span>
                    <RatingStars rating={profile.rating} reviewsCount={profile.reviewCount} size="sm" />
                    <span>&bull;</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {profile.completedJobs} Jobs Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions & Rate */}
              <div className="flex flex-col sm:items-end gap-3">
                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400">Hourly Rate</span>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {formatBDT(profile.hourlyRate)}/hr
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${
                    profile.availability === 'Available'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                  }`}>
                    ● {profile.availability} for work
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isOwner ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleStartChat}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setHireModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>Hire Me</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Completion Indicator */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Profile Completeness: {completion}%
                </span>
                <span className="text-slate-400 hidden sm:inline">&bull; 100% complete profiles get 3x more hirer views</span>
              </div>
              <div className="w-36 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form Modal/Card */}
        {isEditing && (
          <div className="p-6 rounded-3xl bg-indigo-50/60 dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Edit Your Skill Profile</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Headline</label>
                <input
                  type="text"
                  value={editedHeadline}
                  onChange={(e) => setEditedHeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  value={editedLocation}
                  onChange={(e) => setEditedLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hourly Rate (৳)</label>
                <input
                  type="number"
                  value={editedHourlyRate}
                  onChange={(e) => setEditedHourlyRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={editedSkills}
                  onChange={(e) => setEditedSkills(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 text-xs">Bio</label>
              <textarea
                rows={3}
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveProfile}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20"
            >
              Save Profile Changes
            </button>
          </div>
        )}

        {/* Content Tabs / Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column: Bio, Skills, Portfolio */}
          <div className="md:col-span-2 space-y-6">
            {/* Bio */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                About Me
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            </div>

            {/* Skills */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                Skills & Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Portfolio */}
            {profile.portfolio && profile.portfolio.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Featured Portfolio Works
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 group"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="p-4">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.title}</h4>
                        {item.description && <p className="text-[11px] text-slate-500 mt-1">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services Offered */}
            {freelancerServices.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Services Offered
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {freelancerServices.map((srv) => (
                    <Link
                      key={srv.id}
                      to={`/services/${srv.id}`}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                          {srv.title}
                        </h4>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Delivery in {srv.deliveryTimeDays} days
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                        <RatingStars rating={srv.rating} size="sm" />
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                          {formatBDT(srv.price)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Client Reviews */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Client Reviews ({profileReviews.length})
                </h3>
                <RatingStars rating={profile.rating} reviewsCount={profile.reviewCount} />
              </div>

              {profileReviews.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No public reviews written yet for this profile.
                </div>
              ) : (
                profileReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.reviewerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                          alt={rev.reviewerName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {rev.reviewerName}
                        </span>
                      </div>
                      <RatingStars rating={rev.rating} size="sm" showNumber={false} />
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Experience, Education, Contact */}
          <div className="md:col-span-1 space-y-6">
            {/* Experience */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" /> Experience
              </h3>

              <div className="space-y-3">
                {profile.experience?.map((exp) => (
                  <div key={exp.id} className="text-xs space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white">{exp.role}</div>
                    <div className="text-indigo-600 dark:text-indigo-400 font-semibold">{exp.company}</div>
                    <div className="text-[11px] text-slate-400">{exp.period}</div>
                    {exp.description && <p className="text-slate-500 text-[11px] leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" /> Education
              </h3>

              <div className="space-y-3">
                {profile.education?.map((edu) => (
                  <div key={edu.id} className="text-xs space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white">{edu.degree}</div>
                    <div className="text-slate-600 dark:text-slate-300">{edu.institution}</div>
                    <div className="text-[11px] text-slate-400">Class of {edu.year}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Hire Escrow Modal */}
      {hireModalOpen && (
        <EscrowPaymentModal
          isOpen={hireModalOpen}
          onClose={() => setHireModalOpen(false)}
          title={`Direct Project with ${profile.name}`}
          amount={hireAmount}
          freelancerName={profile.name}
          onConfirmPayment={() => {
            setHireModalOpen(false);
            navigate('/dashboard');
          }}
        />
      )}
    </div>
  );
};
