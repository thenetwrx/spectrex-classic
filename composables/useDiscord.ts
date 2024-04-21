export default () => {
  const oauth_base_url = "https://discord.com/oauth2";
  const cdn_base_url = "https://cdn.discordapp.com";
  // Function to generate the user avatar URL
  const user_avatar = (user_id: string, avatar_hash: string) => {
    return `${cdn_base_url}/avatars/${user_id}/${avatar_hash}.webp`;
  };

  // Function to generate the server icon URL
  const server_icon = (server_id: string, icon_hash: string) => {
    return `${cdn_base_url}/icons/${server_id}/${icon_hash}.webp`;
  };

  const bot = () => {
    return `${oauth_base_url}/authorize?scope=bot+applications.commands&permissions=277025736769&client_id=1216792581577506826`;
  };

  const bot_to_server = (server_id: string) => {
    return `${oauth_base_url}/authorize?scope=bot+applications.commands&permissions=277025736769&client_id=1216792581577506826&guild_id=${server_id}&disable_guild_select=true`;
  };

  return {
    cdn: {
      user_avatar,
      server_icon,
    },
    invite: {
      bot,
      bot_to_server,
    },
  };
};
