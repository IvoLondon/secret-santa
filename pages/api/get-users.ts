import type { NextApiRequest, NextApiResponse } from "next";

async function getUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const fetchUsers = await fetch(
      "https://eutkkzff3l.execute-api.eu-west-2.amazonaws.com/default/secret-santa-get-users"
    );
    console.log(await fetchUsers.json());
    return res.status(200);
  } catch (e) {
    console.log("Fetch users error: ", e);
    return res.status(500);
  }
}
export default getUsers;
