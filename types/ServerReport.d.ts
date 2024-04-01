export default interface ServerReport {
  id: string;
  created_at: string;
  from_id: string;
  from_discord_id: string;
  suspect_id: string;
  suspect_discord_id: string;
  suspect_server_id: string;
  suspect_server_discord_id: string;
  type: string;
  description: string;
}
