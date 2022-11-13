import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";

export default function Home() {
  const [serverError, setServerError] = useState([""]);
  const [serverMessage, setServerMessage] = useState([""]);
  const [isCompleted, setCompleted] = useState(false);
  return (
    <div className={styles.container}>
      <div className={styles.overlay}></div>
      <Head>
        <title className={"asd"}>ho-ho-ho, it's almost X-mas!</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Ho-ho-ho, it's time for Secret Santa!</h1>
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
              setServerMessage(postResponse?.data?.data);
              setCompleted(true);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className={styles.form}>
              <Field
                type="email"
                name="email"
                render={({
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
                      className={styles["form-field"]}
                      placeHolder="Your Vodafone email address*"
                      type="text"
                    />
                  );
                }}
              />
              <ErrorMessage
                className={styles["form-field-message"]}
                name="email"
                component="div"
              />

              <button
                type="submit"
                className={styles["submit-button"]}
                disabled={isSubmitting || isCompleted}
              >
                Signup
              </button>
            </Form>
          )}
        </Formik>

        {serverError.length ? (
          <>
            {serverError.map((msg) => (
              <p>{msg}</p>
            ))}
          </>
        ) : null}
        {serverMessage ? (
          <>
            {serverMessage.map((msg) => (
              <p>{msg}</p>
            ))}
          </>
        ) : null}
      </main>
    </div>
  );
}
