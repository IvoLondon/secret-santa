// https://github.com/marcyvillegas/random-joke-generator

import type { NextApiRequest, NextApiResponse } from "next";

async function jokeGenerator(req: NextApiRequest, res: NextApiResponse) {
  try {
    const getJoke = await fetch("https://v2.jokeapi.dev/joke/Christmas");
    const jokeRes = await getJoke.json();
    return res.status(200).json({
      statusCode: 200,
      body: jokeRes,
    });
  } catch (e) {
    console.log("Joke Generator Error: ", e);
    return res.status(500);
  }
}

export default jokeGenerator;
