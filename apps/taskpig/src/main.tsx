import React from "react";
import ReactDOM from "react-dom/client";
import type { JSX } from "react";
import App from "./App";
import { boot } from "./boot";
import "./app.css";

function FatalError({ error }: { error: unknown }): JSX.Element {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <main className="content">
      {/* i18n:allow-literal -- boot failed before i18n existed */}
      <h1>TaskPig could not start</h1>
      <p>{message}</p>
    </main>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Missing #root element");
const root = ReactDOM.createRoot(rootElement);

boot()
  .then((loaded) => {
    root.render(
      <React.StrictMode>
        <App loaded={loaded} />
      </React.StrictMode>,
    );
  })
  .catch((error: unknown) => {
    console.error("TaskPig failed to start", error);
    root.render(
      <React.StrictMode>
        <FatalError error={error} />
      </React.StrictMode>,
    );
  });
