import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/RegisterUser.module.css";
import { Formik, Form, Field, ErrorMessage } from "formik";

export default function CompleteRegistration({
  user,
  email,
  token,
  errorMessage = [],
}: {
  user: any;
  email: string;
  token: string;
  errorMessage: string[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState(errorMessage);
  const [serverMessage, setServerMessage] = useState([]);
  const [joke, setJoke] = useState<{
    body: { setup: string; delivery: string };
  }>();

  useEffect(() => {
    if (!email || !token) router.push("/");
  }, [email, token]);

  useEffect(() => {
    const fetchJoke = async () => {
      const jokeRes = await fetch("/api/joke-generator");
      if (jokeRes.status == 200) {
        setJoke(await jokeRes.json());
      }
    };
    fetchJoke();
  }, []);

  const buttonHandler = () => {
    router.push("/");
  };

  return (
    <div className={styles.container}>
      <div className={styles.overlay}></div>
      <Head>
        <title className={"asd"}>ho-ho-ho, it's almost X-mas!</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {serverError ? (
          <div
            className={`${styles["notification"]} ${styles["notification-error"]}`}
          >
            <div className="message error-message">{serverError}</div>
            <button className={styles["submit-button"]} onClick={buttonHandler}>
              Go back
            </button>
          </div>
        ) : null}

        {serverMessage.length ? (
          <div
            className={`${styles["notification"]} ${styles["notification-success"]}`}
          >
            {serverMessage.map((msg) => (
              <p>{msg}</p>
            ))}
          </div>
        ) : null}
        <div className={styles.content}>
          {joke ? (
            <div className={styles.joke}>
              <h4>{joke.body.setup}</h4>
              <div className={styles.jokeHr}></div>
              <h2>{joke.body.delivery} 😂</h2>
            </div>
          ) : null}
          <Formik
            initialValues={{
              name: user?.name || "",
              wishes: user?.wishes || "",
              address: user?.address || "",
              attending: user?.attending ?? false,
              token,
              email,
            }}
            validate={(values) => {
              const errors: { name?: string; address?: string } = {};
              if (!values.name) {
                errors.name = "Required";
              }
              if (!values.attending && !values.address) {
                errors.address =
                  "Address field is mandatory if you are not attending in person.";
              }
              return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                // Make a post request to nextjs server
                const postData = await fetch("/api/user-registration", {
                  method: "POST",
                  body: JSON.stringify(values),
                });
                // parse the result
                const postResponse = await postData.json();

                // set error message
                if (postResponse?.errorMessage) {
                  setServerError(postResponse.errorMessage);
                }
                // set data
                if (postResponse?.data?.data) {
                  setServerMessage(postResponse.data.data);
                }
              } catch (e) {
                console.log("Error with submitting: ", e);
              }
            }}
          >
            {({ values, isSubmitting }) => (
              <Form className={styles.form}>
                <Field type="hidden" name="token" />
                <Field type="hidden" name="email" />
                <Field type="text" name="name">
                  {({
                    field,
                    form: { isSubmitting },
                  }: {
                    field: any;
                    form: { isSubmitting: boolean };
                  }) => {
                    return (
                      <input
                        {...field}
                        disabled={isSubmitting || !!serverError}
                        className={styles["form-field"]}
                        placeholder="Enter your name*"
                        type="text"
                      />
                    );
                  }}
                </Field>
                <ErrorMessage
                  className={styles["form-field-message"]}
                  name="name"
                  component="div"
                />
                <Field type="text" name="wishes">
                  {({
                    field,
                    form: { isSubmitting },
                  }: {
                    field: any;
                    form: { isSubmitting: boolean };
                  }) => {
                    return (
                      <textarea
                        {...field}
                        rows={15}
                        disabled={isSubmitting || !!serverError}
                        className={styles["form-field"]}
                        placeholder="Enter items from your wish list (optional)"
                      />
                    );
                  }}
                </Field>

                <ErrorMessage
                  className={styles["form-field-message"]}
                  name="wishes"
                  component="div"
                />

                <Field type="checkbox" name="attending">
                  {({
                    field,
                    form: { isSubmitting },
                  }: {
                    field: any;
                    form: { isSubmitting: boolean };
                  }) => {
                    return (
                      <label className={styles["form-field-label"]}>
                        <input
                          {...field}
                          rows={15}
                          type="checkbox"
                          disabled={isSubmitting || !!serverError}
                          className={styles["form-field"]}
                        />
                        <span>
                          Tick if you are attending the gifts exchange in person
                          at the Speechmark. Santa will be there too!
                        </span>
                      </label>
                    );
                  }}
                </Field>
                <div
                  className={`
                    ${styles[`optional-field`]} ${
                    values.attending ? `${styles[`hidden`]}` : ""
                  }`}
                >
                  <Field type="text" name="address">
                    {({
                      field,
                      form: { isSubmitting },
                    }: {
                      field: any;
                      form: { isSubmitting: boolean };
                    }) => {
                      return (
                        <textarea
                          {...field}
                          rows={10}
                          disabled={isSubmitting || !!serverError}
                          className={styles["form-field"]}
                          placeholder="Enter your full address*"
                        />
                      );
                    }}
                  </Field>
                </div>
                <ErrorMessage
                  className={styles["form-field-message"]}
                  name="address"
                  component="div"
                />

                <button
                  type="submit"
                  className={styles["submit-button"]}
                  disabled={isSubmitting || !!serverError}
                >
                  Add to Santa's list.
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context: any) {
  // return if token or email are not present
  let user = null;
  let errorMessage = null;
  const token = context.query.token || null;
  const email = context.query.email || null;

  if (!token || !email) {
    errorMessage = ["Token or email are missing"];
    console.log(errorMessage);
    return {
      props: {
        token: null,
        email: null,
        errorMessage,
      },
    };
  }

  try {
    const validateUser = await fetch(
      "https://eutkkzff3l.execute-api.eu-west-2.amazonaws.com/default/secret-santa-validate-user",
      {
        method: "POST",
        body: JSON.stringify({
          email: email,
          token: token,
        }),
      }
    );

    const response = await validateUser.json();

    // server error
    if (response.message) {
      errorMessage = response.message;
    }
    // custom error
    if (response.errorMessage) {
      errorMessage = response.errorMessage;
    }

    if (response.data) {
      user = response.data || null;
    }
  } catch (e) {
    console.log(e);
  }
  return {
    props: {
      user,
      token,
      email,
      errorMessage,
    },
  };
}
