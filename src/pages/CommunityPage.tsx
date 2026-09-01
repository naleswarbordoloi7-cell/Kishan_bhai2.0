import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  MessageSquare,
  ThumbsUp,
  Share2,
  Plus,
  Sparkles,
  Award,
  CheckCircle2,
  Tag,
  Send,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import { CommunityPostItem } from '../../shared/types';

export const CommunityPage: React.FC = () => {
  const { communityPosts, addCommunityPost, likeCommunityPost, language, farmerProfile, addToast } = useApp();

  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [newContent, setNewContent] = useState('');
  const [newPostTag, setNewPostTag] = useState('Crop Protection');
  const [newImage, setNewImage] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const availableTags = [
    'All',
    'Crop Protection',
    'Soil Regeneration',
    'Organic Farming',
    'Drip Irrigation',
    'Market Intelligence',
  ];

  const filteredPosts = communityPosts.filter((post) => {
    if (selectedTag === 'All') return true;
    return post.tags?.includes(selectedTag) || post.category === selectedTag || post.cropTag === selectedTag;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    addCommunityPost({
      title: newContent.slice(0, 45) + (newContent.length > 45 ? '...' : ''),
      authorName: farmerProfile.name,
      authorVillage: farmerProfile.village,
      authorDistrict: farmerProfile.district,
      authorState: farmerProfile.state,
      authorRole: 'Farmer',
      authorBadge: 'Progressive Farmer',
      category: 'Crop Advice',
      cropTag: farmerProfile.mainCrop,
      content: newContent,
      imageUrl: newImage || undefined,
      tags: [newPostTag],
    });

    setNewContent('');
    setNewImage('');
    setIsNewPostModalOpen(false);
  };

  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId];
    if (!text?.trim()) return;

    addToast('Comment Posted', 'Your reply has been shared with the community.', 'success');
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B3B11] to-[#2D4F1E] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>{language === 'hi' ? 'किसान समुदाय और ज्ञान मंच' : 'Farmer Community & Peer Agronomy Network'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {language === 'hi' ? 'किसान चौपाल (समुदाय)' : 'Kisan Community & Discussion Forum'}
          </h1>
          <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
            {language === 'hi'
              ? 'प्रगतिशील किसानों, कृषि वैज्ञानिकों और पड़ोस के गांव के किसानों से सलाह लें और अपने अनुभव साझा करें।'
              : 'Connect with progressive growers across India. Discuss field experiments, organic recipes, and practical breakthroughs.'}
          </p>
        </div>

        <button
          onClick={() => setIsNewPostModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold px-5 py-3 rounded-2xl shadow-lg transition-all cursor-pointer text-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'hi' ? 'नई पोस्ट लिखें' : 'Create New Post'}</span>
        </button>
      </div>

      {/* Tag Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedTag === tag
                ? 'bg-[#2D4F1E] text-white shadow-xs'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Main Grid: Feed + Community Champions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Community Posts Feed */}
        <div className="lg:col-span-8 space-y-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 sm:p-7 space-y-4"
            >
              {/* Author Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorAvatar || 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=120&auto=format&fit=crop&q=80'}
                    alt={post.authorName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-emerald-600/30"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-900 text-sm">{post.authorName}</h3>
                      {post.authorBadge && (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-700" />
                          <span>{post.authorBadge}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500">{post.authorDistrict || `${post.authorVillage}, ${post.authorState}`} • {post.createdAt}</p>
                  </div>
                </div>

                <div className="flex gap-1.5 flex-wrap">
                  {(post.tags || [post.category, post.cropTag]).filter(Boolean).map((tag, i) => (
                    <span key={i} className="text-[10px] font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Content Body */}
              <p className="text-xs text-stone-800 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              {/* Post Attached Image */}
              {post.imageUrl && (
                <div className="rounded-2xl overflow-hidden max-h-80 w-full bg-stone-100 border border-stone-200">
                  <img
                    src={post.imageUrl}
                    alt="Post media"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Engagement Bar */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => likeCommunityPost(post.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-4 h-4 text-emerald-700" />
                    <span>{post.likesCount} Helpful</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.commentsCount || post.comments?.length || 0} Responses</span>
                  </div>
                </div>

                <button
                  onClick={() => addToast('Link Copied', 'Community discussion link copied to clipboard.', 'info')}
                  className="p-2 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Reply Box */}
              <div className="pt-2 flex gap-2">
                <input
                  type="text"
                  placeholder={language === 'hi' ? 'अपनी राय या सुझाव लिखें...' : 'Write an agronomic reply or question...'}
                  value={commentInputs[post.id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                  className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  onClick={() => handleCommentSubmit(post.id)}
                  className="p-2 bg-[#2D4F1E] hover:bg-[#223d16] text-white rounded-xl transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Community Champions & Advisory Topics */}
        <div className="lg:col-span-4 space-y-6">
          {/* Champions Card */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Village Cluster Champions</span>
            </h3>

            <div className="space-y-3">
              {[
                { name: 'Dr. R.K. Meena', role: 'KVK Soil Scientist', score: '482 Verified Solves' },
                { name: 'Sardar Gurdeep Singh', role: 'Organic Wheat Pioneer', score: '320 Helpful Votes' },
                { name: 'Kisan Ramesh Patel', role: 'Solar Micro-Drip Lead', score: '245 Helpful Votes' },
              ].map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-100">
                  <div>
                    <div className="text-xs font-bold text-stone-900">{c.name}</div>
                    <div className="text-[11px] text-stone-500">{c.role}</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {c.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Discussion Guideline */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 space-y-2 text-xs">
            <div className="text-emerald-950 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Community Code of Honor</span>
            </div>
            <p className="text-emerald-900 leading-relaxed">
              Share real farm data and genuine photos. Every chemical recommendation is cross-checked with ICAR guidelines for farmer safety.
            </p>
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {isNewPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-[#2D4F1E] font-bold text-lg">
                <Users className="w-5 h-5" />
                <span>Create Community Post</span>
              </div>
              <button
                onClick={() => setIsNewPostModalOpen(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Topic / Category</label>
                <select
                  value={newPostTag}
                  onChange={(e) => setNewPostTag(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                >
                  <option value="Crop Protection">Crop Protection & Disease</option>
                  <option value="Soil Regeneration">Soil Regeneration & Manure</option>
                  <option value="Organic Farming">Organic & Bio-fertility</option>
                  <option value="Drip Irrigation">Drip Irrigation & Water</option>
                  <option value="Market Intelligence">Market Rates & Mandi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Your Post / Experience</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                  placeholder="Describe the crop problem, solution, or experience you want to share with fellow farmers..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Image URL (Optional photo)</label>
                <input
                  type="url"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                  placeholder="https://..."
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewPostModalOpen(false)}
                  className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#2D4F1E] hover:bg-[#223d16] text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
