import type { NextApiRequest, NextApiResponse } from "next";

async function getUsers(req: NextApiRequest, res: NextApiResponse) {
  try {
    const fetchUsers = await fetch(
      "https://eutkkzff3l.execute-api.eu-west-2.amazonaws.com/default/secret-santa-get-users"
    );

    return res.status(200).json(await fetchUsers.json());
  } catch (e) {
    console.log("Fetch users error: ", e);
    return res.status(500).json({
      errorMessage: ["Santa lost the list of names"],
    });
  }
}
export default getUsers;
