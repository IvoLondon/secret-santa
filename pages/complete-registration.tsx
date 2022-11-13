import React, { useEffect } from "react";
import { useRouter } from "next/router";

export default function CompleteRegistration({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!email || !token) router.push("/");
    console.log("Email ", email);
    console.log("Token ", token);
  }, [email, token]);
  return <div>complete registration page</div>;
}

export async function getServerSideProps(context: any) {
  const token = context.query.token || null;
  const email = context.query.email || null;
  return {
    props: {
      token,
      email,
    },
  };
}
