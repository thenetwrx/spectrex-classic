export default interface ServerReport {
  id: string;
  created_at: string;
  from_id: string;
  from_provider_id: string;
  suspect_id: string;
  suspect_provider_id: string;
  suspect_server_id: string;
  suspect_server_provider_id: string;
  type: string;
  description: string;
}
