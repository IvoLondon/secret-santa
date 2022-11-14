import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  data?: string[];
  errorMessage?: string[];
};

async function registrationHandler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body = JSON.parse(req.body);
  if (!body.name) {
    const errorMessage = ["No name provided"];
    console.log(errorMessage);
    return res.status(200).json({
      errorMessage: errorMessage,
    });
  }

  // POST DATA TO DB
  try {
    const lambdaResponse = await fetch(
      "https://eutkkzff3l.execute-api.eu-west-2.amazonaws.com/default/secret-santa-register-user",
      {
        method: "POST",
        body: JSON.stringify({
          name: body.name,
          wishes: body.wishes,
          token: body.token,
          email: body.email,
          attending: body.attending,
          address: body.address,
        }),
        mode: "cors",
      }
    );
    const data = await lambdaResponse.json();

    return res.status(200).json({
      data: data,
    });
  } catch (e) {
    return res.status(403).json({
      errorMessage: ["Santa got stuck up the chimney"],
    });
  }
}

export default registrationHandler;
