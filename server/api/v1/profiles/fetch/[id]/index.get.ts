// import {
//   serverSupabaseUser,
//   serverSupabaseServiceRole,
// } from "#supabase/server";
// import { type Database } from "~/database.types";

// // TODO: think about keeping bump cooldowns user specific instead of guild specific to prevent spam

// export default defineEventHandler(async (event) => {
//   // Parameters
//   const params = getRouterParams(event);
//   const user_id = params.id;

//   // 1. Get local user
//   const user = await serverSupabaseUser(event);

//   // 1. Fetch user
//   try {
//     const client = await serverSupabaseServiceRole<Database>(event);

//     if (user) {
//       const { data: profile, error: profile_error } = await client
//         .from("profiles")
//         .select("*")
//         .eq("id", user.id);

//       if (profile_error) {
//         setResponseStatus(event, 500);
//         return {
//           message: "A database error occurred when fetching your profile",
//           result: null,
//         };
//       }

//       if (!profile.length) {
//         setResponseStatus(event, 500);
//         return { message: "Your profile was not found", result: null };
//       }
//       if (profile[0].banned) {
//         setResponseStatus(event, 500);
//         return { message: "Your profile is banned", result: null };
//       }
//     }

//     const { data: data, error: error } = await client
//       .from("profiles")
//       .select("*")
//       .eq("provider_id", user_id);

//     if (error) {
//       setResponseStatus(event, 500);
//       return {
//         message: "A database error occurred when fetching the profile",
//         result: null,
//       };
//     }

//     if (!data.length) {
//       setResponseStatus(event, 500);
//       return { message: "Profile was not found", result: null };
//     }

//     if (
//       !data[0].public &&
//       data[0].provider_id !== user?.user_metadata.provider_id
//     ) {
//       setResponseStatus(event, 500);
//       return { message: "Profile was not found", result: null };
//     }
//     if (
//       data[0].banned &&
//       data[0].provider_id !== user?.user_metadata.provider_id
//     ) {
//       setResponseStatus(event, 500);
//       return { message: "Profile is banned", result: null };
//     }

//     setResponseStatus(event, 200);
//     return {
//       message: null,
//       result: data,
//     };
//   } catch (err) {
//     console.log(err);

//     setResponseStatus(event, 500);
//     return {
//       message: "An unknown error occurred, try again later",
//       result: null,
//     };
//   }
// });
