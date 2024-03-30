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

//   // 1. Grab body
//   const body = await readBody(event);

//   // 2. Check variables on server side to prevent abuse
//   if (!body.description?.length) {
//     setResponseStatus(event, 500);
//     return { message: "Description must not be empty" };
//   }

//   if (body.description.length <= 6) {
//     setResponseStatus(event, 500);
//     return {
//       message: "Description does not have enough characters (minimum of 6)",
//     };
//   }
//   if (body.description.length >= 256) {
//     setResponseStatus(event, 500);
//     return { message: "Description has too many characters (max of 256)" };
//   }

//   // 3. Check logged in status to prevent spam
//   const user = await serverSupabaseUser(event);
//   if (!user) {
//     setResponseStatus(event, 401);
//     return { message: "You are not logged in" };
//   }

//   // 4. Fetch user and then update if applicable
//   try {
//     const client = await serverSupabaseServiceRole<Database>(event);

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
//     if (data[0].banned) {
//       setResponseStatus(event, 500);
//       return { message: "Profile is banned", result: null };
//     }

//     const { error: error1 } = await client
//       .from("profiles")
//       .update({
//         description: body.description,
//       })
//       .eq("provider_id", user_id)
//       .select();

//     if (error1) {
//       setResponseStatus(event, 500);
//       return { message: "A database error occurred when editing the profile" };
//     }

//     setResponseStatus(event, 200);
//     return { message: "Edited" };
//   } catch (err) {
//     console.log(err);

//     setResponseStatus(event, 500);
//     return { message: "An unknown error occurred, try again later" };
//   }
// });
