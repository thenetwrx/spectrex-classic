export default interface Server {
  id: string;
  created_at: string;
  owner_id: string;
  approved_at: string | null;
  provider_id: string;
  approximate_member_count: string;
  nsfw: boolean;
  banned: boolean;
  owner_provider_id: string;
  invite_link: string | null;
  name: string;
  icon: string | null;
  approximate_presence_count: string;
  bumped_at: string | null;
  language: string | null;
  description: string | null;
  tags: string[];
  public: boolean;
  category: string | null;
  updated_at: string;
}
