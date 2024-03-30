export default () => {
  const base_url = "https://cdn.discordapp.com/";
  // Function to generate the user avatar URL
  const user_avatar = (user_id: string, avatar_hash: string) => {
    return `${base_url}/avatars/${user_id}/${avatar_hash}.webp`;
  };

  // Function to generate the server icon URL
  const server_icon = (server_id: string, icon_hash: string) => {
    return `${base_url}/icons/${server_id}/${icon_hash}.webp`;
  };

  return {
    user_avatar,
    server_icon,
  };
};
