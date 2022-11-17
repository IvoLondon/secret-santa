import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";

import styles from "../styles/Home.module.css";

export default function Home() {
  const [serverError, setServerError] = useState([]);
  const [serverMessage, setServerMessage] = useState([]);
  const [isCompleted, setCompleted] = useState(false);
  const [users, setUsers] = useState<
    Array<{ name?: string; attending: boolean }>
  >([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch("/api/get-users");
      const users = await res.json();
      setUsers(users.data);
    };
    fetchUsers();
  }, []);

  return (
    <div className="container">
      <div className="overlay"></div>
      <Head>
        <title>ho-ho-ho, it's X-mas!</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Mountains+of+Christmas&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main className="main">
        <h1 className={styles.title}>Ho-ho-ho, it's time for Secret Santa!</h1>
        {serverError.length ? (
          <div className={"notification notification-error"}>
            {serverError.map((msg) => (
              <p>{msg}</p>
            ))}
          </div>
        ) : null}
        {serverMessage.length ? (
          <div className={"notification notification-success"}>
            {serverMessage.map((msg) => (
              <p>{msg}</p>
            ))}
          </div>
        ) : null}

        <div className="content">
          <div className={styles.scroll}>
            <div className={styles.list}>
              {users?.map((p) => {
                if (!p?.name) return;
                return (
                  <span>
                    {p?.name}{" "}
                    {p?.attending ? (
                      <Image
                        src="/vodafone.png"
                        width="16"
                        height="16"
                        alt="Will attend in person"
                      />
                    ) : (
                      <Image
                        src="/teams.png"
                        width="16"
                        height="16"
                        alt="Will connect from home"
                      />
                    )}
                  </span>
                );
              })}
            </div>
            <Image
              src="/scroll.png"
              width="500"
              height="464"
              alt="list of signed up people"
            />
          </div>
          <div className={styles.signup}>
            <p>Enter your email to signup:</p>
            <Formik
              initialValues={{ email: "" }}
              validate={(values) => {
                const errors: { email?: string } = {};
                if (!values.email) {
                  errors.email = "Required";
                } else if (
                  !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                ) {
                  errors.email = "Invalid email address";
                }
                return errors;
              }}
              onSubmit={async (values, { setSubmitting }) => {
                // Make a post request to nextjs server
                const postData = await fetch("/api/email-registration", {
                  method: "POST",
                  body: JSON.stringify(values),
                });
                // parse the result
                const postResponse = await postData.json();
                console.log(postResponse);
                // set error message
                if (postResponse?.errorMessage) {
                  console.log("SERVER ERROR", postResponse?.errorMessage);
                  setServerError(postResponse?.errorMessage);
                }

                // set data
                if (postResponse?.data?.data) {
                  setServerError([]);
                  setServerMessage(postResponse?.data?.data);
                  setCompleted(true);
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form className={styles.form}>
                  <Field type="email" name="email">
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
                          disabled={isSubmitting || isCompleted}
                          className="form-field"
                          placeholder="Your Vodafone email address*"
                          type="text"
                        />
                      );
                    }}
                  </Field>
                  <ErrorMessage
                    className="form-field-message"
                    name="email"
                    component="div"
                  />

                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting || isCompleted}
                  >
                    Signup
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </main>
    </div>
  );
}
