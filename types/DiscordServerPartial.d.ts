export default interface DiscordServerPartial {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  features: string[];
  approximate_member_count: number;
  approximate_presence_count: number;
}
