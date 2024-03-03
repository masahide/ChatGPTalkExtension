import "../app.css";
import Options from "../components/Options.svelte";

const target = document.getElementById("app");

async function render() {
  if (target) {
    new Options({ target });
  }
}

document.addEventListener("DOMContentLoaded", render);
