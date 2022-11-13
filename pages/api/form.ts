// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
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
  if (!body.email) {
    const errorMessage = ["No email provided"];
    console.log(errorMessage);
    return res.status(200).json({
      errorMessage: errorMessage,
    });
  }

  // ERROR IF EMAIL IS NOT VALID
  console.log(typeof body);
  const validEmail = body.email.match(
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  );
  const emailMatch = body.email.match(/.*@(\S+)/);

  if (!validEmail || !emailMatch || emailMatch[1] !== "vodafone.com") {
    const errorMessage = ["Please provide your vodafone address."];
    console.log(errorMessage);
    return res.status(200).json({
      errorMessage: errorMessage,
    });
  }

  // POST DATA TO DB
  try {
    const lambdaResponse = await fetch(
      "https://eutkkzff3l.execute-api.eu-west-2.amazonaws.com/default/secret-santa-registerNewUser",
      {
        method: "POST",
        body: JSON.stringify({ email: body.email }),
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
