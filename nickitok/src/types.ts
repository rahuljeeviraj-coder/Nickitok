export type PostType = 'thought' | 'note' | 'post' | 'nick' | 'video' | 'app' | 'story' | 'highlight' | 'nick_profile' | 'tunes';

export interface User {
  id: string;
  username: string;
  nickName: string;
  bio?: string;
  profileIcons: string[];
  followersCount: number;
  followingCount: number;
  dob?: string;
}

export interface Post {
  id: string;
  userId: string;
  userHandle: string;
  userAvatar: string;
  type: PostType;
  title?: string;
  description?: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  appName?: string;
  appIcon?: string;
  appFileUrl?: string;
  timestamp: string;
  likes: number;
  dislikes: number;
  comments: number;
  reposts: number;
  saves: number;
  views: number;
  is18Plus: boolean;
  isPrivate: boolean;
  backgroundColor?: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  userHandle: string;
  userAvatar: string;
  targetUserId: string;
  content: string;
  type: string;
  timestamp: string;
}

export type Language = 'en' | 'ta';

export interface Translation {
  home: string;
  explore: string;
  nicks: string;
  inbox: string;
  profile: string;
  addPost: string;
  thoughts: string;
  notes: string;
  apps: string;
  community: string;
  analyzeImage: string;
  settings: string;
  logout: string;
  login: string;
  follow: string;
  following: string;
}
