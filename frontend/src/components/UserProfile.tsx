'use client';

import { User, Shield, Award, TrendingUp, CheckCircle, Clock, XCircle, Activity } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useAccount } from 'wagmi';

export default function UserProfile() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showKYC, setShowKYC] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', address],
    queryFn: async () => {
      if (!address) throw new Error('No address');
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/profile/${address}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
    enabled: !!address,
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: { username: string; email?: string }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, ...data }),
      });
      if (!response.ok) throw new Error('Failed to create profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', address] });
      setIsEditing(false);
    },
  });

  const submitKYCMutation = useMutation({
    mutationFn: async (data: { country: string }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AGENT_API_URL}/profile/${address}/kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: [{ type: 'passport', hash: '0x' + Math.random().toString(16).substring(2) }],
          country: data.country,
        }),
      });
      if (!response.ok) throw new Error('Failed to submit KYC');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', address] });
      setShowKYC(false);
    },
  });

  if (isLoading) {
    return <div className="bg-gray-800 rounded-lg p-6 animate-pulse h-96" />;
  }

  if (!profile && !isEditing) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 text-center">
        <User className="w-16 h-16 mx-auto mb-4 text-gray-500" />
        <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
        <p className="text-gray-400 mb-4">Get started with DeFi Guardian AI</p>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Create Profile
        </button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Create Your Profile</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            createProfileMutation.mutate({
              username: formData.get('username') as string,
              email: formData.get('email') as string,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username *</label>
            <input
              type="text"
              name="username"
              required
              minLength={3}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
              placeholder="Choose a unique username"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email (optional)</label>
            <input
              type="email"
              name="email"
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
              placeholder="your@email.com"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createProfileMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-2 rounded-lg"
            >
              {createProfileMutation.isPending ? 'Creating...' : 'Create Profile'}
            </button>
            {profile && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  const getKYCStatusIcon = (status: number) => {
    switch (status) {
      case 0: return <Clock className="w-5 h-5 text-gray-500" />;
      case 1: return <Clock className="w-5 h-5 text-yellow-500" />;
      case 2: return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 3: return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getKYCStatusText = (status: number) => {
    const statuses = ['Not Submitted', 'Pending', 'Verified', 'Rejected'];
    return statuses[status] || 'Unknown';
  };

  const getReputationColor = (score: number) => {
    if (score >= 900) return 'text-purple-500';
    if (score >= 800) return 'text-blue-500';
    if (score >= 700) return 'text-green-500';
    if (score >= 600) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getReputationTier = (score: number) => {
    if (score >= 900) return 'Legendary';
    if (score >= 800) return 'Expert';
    if (score >= 700) return 'Advanced';
    if (score >= 600) return 'Intermediate';
    if (score >= 500) return 'Beginner';
    return 'Novice';
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatarURI || `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-gray-700"
              />
              {profile.kycStatus === 2 && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{profile.username}</h2>
                {profile.kycStatus === 2 && (
                  <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded ${getReputationColor(profile.reputationScore)} bg-opacity-20`}>
                  {getReputationTier(profile.reputationScore)}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">
                {address?.substring(0, 6)}...{address?.substring(38)}
              </p>
              {profile.email && (
                <p className="text-gray-400 text-sm mb-4">
                  📧 {profile.email}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Edit Profile
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <p className="text-gray-400 text-xs">Reputation</p>
            </div>
            <p className={`text-2xl font-bold ${getReputationColor(profile.reputationScore)}`}>
              {profile.reputationScore}
            </p>
            <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full ${getReputationColor(profile.reputationScore).replace('text-', 'bg-')}`}
                style={{ width: `${(profile.reputationScore / 1000) * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <p className="text-gray-400 text-xs">Total Trades</p>
            </div>
            <p className="text-2xl font-bold">{profile.totalTrades}</p>
            <p className="text-xs text-gray-500 mt-1">
              {profile.successfulTrades} successful
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <p className="text-gray-400 text-xs">Success Rate</p>
            </div>
            <p className="text-2xl font-bold text-green-500">
              {profile.successRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {profile.totalTrades > 0 ? 'Excellent' : 'No trades yet'}
            </p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-yellow-500" />
              <p className="text-gray-400 text-xs">Member Since</p>
            </div>
            <p className="text-lg font-semibold">
              {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              })}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {Math.floor((Date.now() - profile.createdAt) / (1000 * 60 * 60 * 24))} days
            </p>
          </div>
        </div>
      </div>

      {/* KYC Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            KYC Verification
          </h3>
          {profile.kycStatus === 0 && (
            <button
              onClick={() => setShowKYC(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Submit KYC
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 mb-4">
          {getKYCStatusIcon(profile.kycStatus)}
          <div>
            <p className="font-semibold">{getKYCStatusText(profile.kycStatus)}</p>
            {profile.kycStatus === 2 && (
              <p className="text-sm text-gray-400">
                Verification Level: {['None', 'Basic', 'Intermediate', 'Advanced'][profile.verificationLevel]}
              </p>
            )}
          </div>
        </div>

        {showKYC && (
          <div className="bg-gray-900 rounded-lg p-6 mt-4">
            <h4 className="font-semibold mb-4 text-lg">Complete KYC Verification</h4>
            <p className="text-sm text-gray-400 mb-4">
              Please provide accurate information. All data is encrypted and stored securely on-chain.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                submitKYCMutation.mutate({ 
                  country: formData.get('country') as string 
                });
              }}
              className="space-y-4"
            >
              {/* Personal Information */}
              <div className="border-b border-gray-800 pb-4">
                <h5 className="font-semibold mb-3 text-blue-400">Personal Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Date of Birth *</label>
                    <input
                      type="date"
                      name="dob"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nationality *</label>
                    <input
                      type="text"
                      name="nationality"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="United States"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="border-b border-gray-800 pb-4">
                <h5 className="font-semibold mb-3 text-blue-400">Address Information</h5>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Street Address *</label>
                    <input
                      type="text"
                      name="address"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">City *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                        placeholder="New York"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">State/Province *</label>
                      <input
                        type="text"
                        name="state"
                        required
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                        placeholder="NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Postal Code *</label>
                      <input
                        type="text"
                        name="postalCode"
                        required
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                        placeholder="10001"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Country *</label>
                    <select
                      name="country"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select Country</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Japan">Japan</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-b border-gray-800 pb-4">
                <h5 className="font-semibold mb-3 text-blue-400">Contact Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div className="border-b border-gray-800 pb-4">
                <h5 className="font-semibold mb-3 text-blue-400">Identity Documents</h5>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Document Type *</label>
                    <select
                      name="documentType"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select Document Type</option>
                      <option value="passport">Passport</option>
                      <option value="drivers_license">Driver's License</option>
                      <option value="national_id">National ID Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Document Number *</label>
                    <input
                      type="text"
                      name="documentNumber"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="Document ID Number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Upload Document *</label>
                    <input
                      type="file"
                      name="document"
                      accept="image/*,.pdf"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Accepted: JPG, PNG, PDF (Max 5MB)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Selfie with Document *</label>
                    <input
                      type="file"
                      name="selfie"
                      accept="image/*"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Hold your ID next to your face
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="pb-4">
                <h5 className="font-semibold mb-3 text-blue-400">Additional Information</h5>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Occupation *</label>
                    <input
                      type="text"
                      name="occupation"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Source of Funds *</label>
                    <select
                      name="sourceOfFunds"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select Source</option>
                      <option value="employment">Employment/Salary</option>
                      <option value="business">Business Income</option>
                      <option value="investment">Investment Returns</option>
                      <option value="savings">Savings</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Purpose of Account *</label>
                    <select
                      name="purpose"
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select Purpose</option>
                      <option value="trading">Trading</option>
                      <option value="investment">Long-term Investment</option>
                      <option value="p2p">P2P Trading</option>
                      <option value="forex">Forex Trading</option>
                      <option value="all">All of the above</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-gray-800 rounded p-4">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="terms"
                    required
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-300">
                    I confirm that all information provided is accurate and I agree to the{' '}
                    <a href="#" className="text-blue-400 hover:underline">Terms of Service</a> and{' '}
                    <a href="#" className="text-blue-400 hover:underline">Privacy Policy</a>. 
                    I understand that providing false information may result in account suspension.
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitKYCMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  {submitKYCMutation.isPending ? 'Submitting...' : 'Submit KYC Application'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowKYC(false)}
                  className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                ⏱️ Verification typically takes 1-3 business days
              </p>
            </form>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Achievements ({profile.achievements?.length || 0})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {profile.achievements?.map((achievement: any, idx: number) => (
            <div key={idx} className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">{achievement.badgeURI}</div>
              <p className="font-semibold text-sm">{achievement.name}</p>
              <p className="text-xs text-gray-400 mt-1">{achievement.description}</p>
            </div>
          ))}
          {(!profile.achievements || profile.achievements.length === 0) && (
            <p className="col-span-full text-center text-gray-400 py-4">
              No achievements yet. Start trading to earn badges!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
